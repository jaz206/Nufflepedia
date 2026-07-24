"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/server/db/prisma";
import { requireUser } from "@/server/auth/requireUser";
import { buildSkillNameIndex, resolveSkillKey } from "@/lib/resolveSkillName";
import { LEVEL_UP_SPP_COST_TABLE } from "@/rules-engine/data/tables/levelUp";
import type { ActionResult } from "./actions";

const MAX_COPIES_PER_STAR = 2;
const MAX_ROSTER = 16;

const STAT_KEYS = ["MA", "ST", "AG", "PA", "AV"] as const;
export type StatKey = (typeof STAT_KEYS)[number];

const levelUpSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("PRIMARY_RANDOM") }),
  z.object({ kind: z.literal("PRIMARY_CHOSEN"), skillKey: z.string().min(1) }),
  z.object({ kind: z.literal("SECONDARY_CHOSEN"), skillKey: z.string().min(1) }),
  z.object({ kind: z.literal("ATTRIBUTE"), stat: z.enum(STAT_KEYS) }),
]);

/**
 * Igual que levelUpPlayer en El Cuartel, pero sobre la copia de trabajo de
 * la competición (CompetitionPlayer): las mejoras aquí no tocan la
 * plantilla real. Ver rosterSnapshot.ts para cómo se clona al inscribirse.
 */
export async function levelUpCompetitionPlayer(playerId: string, input: z.infer<typeof levelUpSchema>): Promise<ActionResult> {
  const dbUser = await requireUser();
  const parsed = levelUpSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues.map((i) => i.message).join(" · ") };
  const data = parsed.data;

  const player = await prisma.competitionPlayer.findUnique({
    where: { id: playerId },
    include: { entry: true, skills: true },
  });
  if (!player || player.entry.ownerId !== dbUser.id) return { ok: false, error: "No autorizado" };
  if (!player.positionKey) return { ok: false, error: "Los Jugadores Estrella no suben de nivel" };

  const position = await prisma.masterPosition.findUnique({ where: { id: player.positionKey } });
  if (!position) return { ok: false, error: "Puesto no encontrado" };

  const levelUpsTaken =
    player.skills.filter((s) => s.source === "LEVEL_UP").length +
    player.maIncreases +
    player.stIncreases +
    player.agIncreases +
    player.paIncreases +
    player.avIncreases;
  const levelRow = LEVEL_UP_SPP_COST_TABLE[Math.min(levelUpsTaken, LEVEL_UP_SPP_COST_TABLE.length - 1)];

  const cost =
    data.kind === "PRIMARY_RANDOM"
      ? levelRow.primaryRandom
      : data.kind === "PRIMARY_CHOSEN"
        ? levelRow.primaryChosen
        : data.kind === "SECONDARY_CHOSEN"
          ? levelRow.secondaryChosen
          : levelRow.attribute;

  if (player.spp < cost) return { ok: false, error: `Necesita ${cost} PE y solo tiene ${player.spp}` };

  if (data.kind === "ATTRIBUTE") {
    if (data.stat === "PA" && position.pa === null) {
      return { ok: false, error: "Este jugador no tiene característica de Pase" };
    }
    const statData =
      data.stat === "MA"
        ? { maIncreases: { increment: 1 } }
        : data.stat === "ST"
          ? { stIncreases: { increment: 1 } }
          : data.stat === "AG"
            ? { agIncreases: { increment: 1 } }
            : data.stat === "PA"
              ? { paIncreases: { increment: 1 } }
              : { avIncreases: { increment: 1 } };
    await prisma.competitionPlayer.update({ where: { id: playerId }, data: { spp: { decrement: cost }, ...statData } });
    revalidatePath(`/competiciones/${player.entry.competitionId}`);
    return { ok: true };
  }

  const categories = data.kind === "SECONDARY_CHOSEN" ? position.secondaryCategories : position.primaryCategories;
  if (categories.length === 0) return { ok: false, error: "Este puesto no tiene categorías disponibles para esa mejora" };

  const knownKeys = new Set(player.skills.map((s) => s.skillKey));
  const eligible = await prisma.masterSkill.findMany({ where: { category: { in: categories } } });
  const available = eligible.filter((s) => !knownKeys.has(s.key));
  if (available.length === 0) return { ok: false, error: "No quedan habilidades disponibles en esa categoría" };

  let skillKey: string;
  if (data.kind === "PRIMARY_RANDOM") {
    skillKey = available[Math.floor(Math.random() * available.length)].key;
  } else {
    const chosen = available.find((s) => s.key === data.skillKey);
    if (!chosen) return { ok: false, error: "Esa habilidad no está disponible para este jugador" };
    skillKey = chosen.key;
  }

  await prisma.$transaction([
    prisma.competitionPlayerSkill.create({ data: { playerId, skillKey, source: "LEVEL_UP" } }),
    prisma.competitionPlayer.update({ where: { id: playerId }, data: { spp: { decrement: cost } } }),
  ]);

  revalidatePath(`/competiciones/${player.entry.competitionId}`);
  return { ok: true };
}

/**
 * Ficha un Jugador Estrella SOLO para esta competición: descuenta de la
 * tesorería clonada de la inscripción (snapshotTreasury), nunca de la
 * tesorería real del equipo en El Cuartel.
 */
export async function hireCompetitionStar(entryId: string, starKey: string): Promise<ActionResult> {
  const dbUser = await requireUser();

  const entry = await prisma.competitionEntry.findUnique({
    where: { id: entryId },
    include: { players: true, competition: true },
  });
  if (!entry || entry.ownerId !== dbUser.id) return { ok: false, error: "No autorizado" };
  if (entry.competition.status === "FINISHED") return { ok: false, error: "La competición ya ha finalizado" };
  if (entry.players.length >= MAX_ROSTER) return { ok: false, error: `Plantilla al máximo de ${MAX_ROSTER} jugadores` };

  const [race, star, skills, traits] = await Promise.all([
    prisma.masterRace.findUnique({ where: { key: entry.rosterKey } }),
    prisma.masterStarPlayer.findUnique({ where: { key: starKey } }),
    prisma.masterSkill.findMany({ select: { key: true, name: true } }),
    prisma.masterTrait.findMany({ select: { key: true, name: true } }),
  ]);
  if (!race || !star) return { ok: false, error: "Jugador Estrella no encontrado" };

  const eligible = star.playsForAny || star.leagues.some((l) => race.leagues.includes(l));
  if (!eligible) return { ok: false, error: `${star.name} no juega para esta liga` };

  const copies = entry.players.filter((p) => p.starKey === star.key).length;
  if (copies >= MAX_COPIES_PER_STAR) {
    return { ok: false, error: `Ya tienes el máximo de ${MAX_COPIES_PER_STAR} copias de ${star.name}` };
  }
  if (entry.snapshotTreasury < star.cost) return { ok: false, error: "Presupuesto de la competición insuficiente" };

  const used = new Set(entry.players.map((p) => p.number));
  let number = 1;
  while (used.has(number) && number <= MAX_ROSTER) number++;
  if (number > MAX_ROSTER) return { ok: false, error: `Plantilla al máximo de ${MAX_ROSTER} jugadores` };

  const skillIndex = buildSkillNameIndex([...skills, ...traits]);
  const starSkillKeys = star.skillKeys.map((display) => resolveSkillKey(display, skillIndex)).filter((key): key is string => key !== null);

  await prisma.$transaction(async (tx) => {
    const player = await tx.competitionPlayer.create({
      data: {
        entryId,
        number,
        customName: copies > 0 ? `${star.name} (${copies + 1})` : star.name,
        starKey: star.key,
      },
    });
    if (starSkillKeys.length > 0) {
      await tx.competitionPlayerSkill.createMany({
        data: starSkillKeys.map((skillKey) => ({ playerId: player.id, skillKey, source: "STAR_PLAYER" as const })),
      });
    }
    await tx.competitionEntry.update({ where: { id: entryId }, data: { snapshotTreasury: { decrement: star.cost } } });
  });

  revalidatePath(`/competiciones/${entry.competitionId}`);
  return { ok: true };
}
