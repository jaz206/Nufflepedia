"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/server/db/prisma";
import { requireUser } from "@/server/auth/requireUser";
import { buildSkillNameIndex, resolveSkillKey } from "@/lib/resolveSkillName";
import { generatePlayerName } from "@/rules-engine/data/playerNames";
import { LEVEL_UP_SPP_COST_TABLE } from "@/rules-engine/data/tables/levelUp";

export type ActionResult = { ok: true } | { ok: false; error: string };

const STARTING_BUDGET = 1_000_000;
const MAX_ROSTER = 16;
const MAX_COPIES_PER_STAR = 2;

function nextJerseyNumber(players: { number: number }[]): number | null {
  const used = new Set(players.map((p) => p.number));
  let n = 1;
  while (used.has(n) && n <= MAX_ROSTER) n++;
  return n <= MAX_ROSTER ? n : null;
}

const createTeamSchema = z.object({
  raceKey: z.string().min(1, "Elige una raza"),
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres").max(40, "Máximo 40 caracteres"),
});

/** Funda un equipo nuevo con el presupuesto inicial completo (1.000.000 MO) y redirige a su ficha. */
export async function createTeam(input: { raceKey: string; name: string }): Promise<ActionResult> {
  const dbUser = await requireUser();
  const parsed = createTeamSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues.map((i) => i.message).join(" · ") };
  }

  const race = await prisma.masterRace.findUnique({ where: { key: parsed.data.raceKey } });
  if (!race) return { ok: false, error: "Raza no encontrada" };

  const team = await prisma.managedTeam.create({
    data: {
      ownerId: dbUser.id,
      name: parsed.data.name,
      rosterKey: race.key,
      treasury: STARTING_BUDGET,
    },
  });

  revalidatePath("/equipos");
  revalidatePath("/dashboard");
  redirect(`/equipos/${team.id}`);
}

/**
 * Ficha a un jugador de un puesto del roster oficial. `positionId` es el id
 * de MasterPosition — no hay una "key" de texto en posiciones (a diferencia
 * de habilidades/rasgos), así que el id hace ese papel en ManagedPlayer.positionKey.
 */
export async function addPlayer(teamId: string, positionId: string): Promise<ActionResult> {
  const dbUser = await requireUser();

  const team = await prisma.managedTeam.findUnique({ where: { id: teamId }, include: { players: true } });
  if (!team || team.ownerId !== dbUser.id) return { ok: false, error: "No autorizado" };

  if (team.players.length >= MAX_ROSTER) {
    return { ok: false, error: `Plantilla al máximo de ${MAX_ROSTER} jugadores` };
  }

  // En paralelo: no dependen entre sí, solo del team que ya tenemos.
  const [race, position, skills, traits] = await Promise.all([
    prisma.masterRace.findUnique({ where: { key: team.rosterKey } }),
    prisma.masterPosition.findUnique({ where: { id: positionId } }),
    prisma.masterSkill.findMany({ select: { key: true, name: true } }),
    prisma.masterTrait.findMany({ select: { key: true, name: true } }),
  ]);
  if (!race || !position || position.raceId !== race.id) {
    return { ok: false, error: "Puesto inválido para este equipo" };
  }

  const countInPosition = team.players.filter((p) => p.positionKey === position.id).length;
  if (countInPosition >= position.quantityMax) {
    return { ok: false, error: `Máximo ${position.quantityMax} en el puesto ${position.name}` };
  }
  if (team.treasury < position.cost) {
    return { ok: false, error: "Presupuesto insuficiente" };
  }

  const number = nextJerseyNumber(team.players);
  if (number === null) return { ok: false, error: `Plantilla al máximo de ${MAX_ROSTER} jugadores` };

  // startingSkillKeys guarda nombres tal como aparecen en el roster (p.ej.
  // "Solitario (4+)"), no keys — se resuelven contra el catálogo aquí mismo.
  // Si algún nombre no resuelve (no debería, el seed ya validó el 100%), se
  // omite en vez de bloquear el fichaje.
  const skillIndex = buildSkillNameIndex([...skills, ...traits]);
  const startingSkillKeys = position.startingSkillKeys
    .map((display) => resolveSkillKey(display, skillIndex))
    .filter((key): key is string => key !== null);

  const customName = generatePlayerName(
    position.playerTags,
    team.players.map((p) => p.customName)
  );

  await prisma.$transaction(async (tx) => {
    const player = await tx.managedPlayer.create({
      data: {
        teamId,
        number,
        customName,
        positionKey: position.id,
      },
    });
    if (startingSkillKeys.length > 0) {
      await tx.playerSkillAssignment.createMany({
        data: startingSkillKeys.map((skillKey) => ({ playerId: player.id, skillKey, source: "ROSTER" as const })),
        skipDuplicates: true,
      });
    }
    await tx.managedTeam.update({ where: { id: teamId }, data: { treasury: { decrement: position.cost } } });
  });

  revalidatePath(`/equipos/${teamId}`);
  revalidatePath("/dashboard");
  return { ok: true };
}

/** Da de baja a un jugador (de roster o Estrella) y devuelve su coste a la tesorería. */
export async function removePlayer(playerId: string): Promise<ActionResult> {
  const dbUser = await requireUser();

  const player = await prisma.managedPlayer.findUnique({ where: { id: playerId }, include: { team: true } });
  if (!player || player.team.ownerId !== dbUser.id) return { ok: false, error: "No autorizado" };

  let refund = 0;
  if (player.starKey) {
    const star = await prisma.masterStarPlayer.findUnique({ where: { key: player.starKey } });
    refund = star?.cost ?? 0;
  } else if (player.positionKey) {
    const position = await prisma.masterPosition.findUnique({ where: { id: player.positionKey } });
    refund = position?.cost ?? 0;
  }

  await prisma.$transaction([
    prisma.managedPlayer.delete({ where: { id: playerId } }),
    prisma.managedTeam.update({ where: { id: player.teamId }, data: { treasury: { increment: refund } } }),
  ]);

  revalidatePath(`/equipos/${player.teamId}`);
  revalidatePath("/dashboard");
  return { ok: true };
}

const updatePlayerSchema = z.object({
  customName: z.string().trim().min(1, "El nombre no puede estar vacío").max(30, "Máximo 30 caracteres").optional(),
  number: z.number().int().min(1, "El dorsal mínimo es 1").max(MAX_ROSTER, `El dorsal máximo es ${MAX_ROSTER}`).optional(),
});

/** Cambia el nombre y/o el dorsal de un jugador ya fichado. */
export async function updatePlayer(
  playerId: string,
  input: { customName?: string; number?: number }
): Promise<ActionResult> {
  const dbUser = await requireUser();
  const parsed = updatePlayerSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues.map((i) => i.message).join(" · ") };

  const player = await prisma.managedPlayer.findUnique({ where: { id: playerId }, include: { team: true } });
  if (!player || player.team.ownerId !== dbUser.id) return { ok: false, error: "No autorizado" };

  if (parsed.data.number !== undefined) {
    const taken = await prisma.managedPlayer.findFirst({
      where: { teamId: player.teamId, number: parsed.data.number, id: { not: playerId } },
    });
    if (taken) return { ok: false, error: `El dorsal ${parsed.data.number} ya lo lleva ${taken.customName}` };
  }

  await prisma.managedPlayer.update({ where: { id: playerId }, data: parsed.data });

  revalidatePath(`/equipos/${player.teamId}`);
  revalidatePath("/dashboard");
  return { ok: true };
}

const STAT_KEYS = ["MA", "ST", "AG", "PA", "AV"] as const;
export type StatKey = (typeof STAT_KEYS)[number];

const levelUpSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("PRIMARY_RANDOM") }),
  z.object({ kind: z.literal("PRIMARY_CHOSEN"), skillKey: z.string().min(1) }),
  z.object({ kind: z.literal("SECONDARY_CHOSEN"), skillKey: z.string().min(1) }),
  z.object({ kind: z.literal("ATTRIBUTE"), stat: z.enum(STAT_KEYS) }),
]);

/**
 * Sube de nivel a un jugador de roster (los Jugadores Estrella no suben de
 * nivel: llegan con sus habilidades y estadísticas fijas). El coste en PE
 * depende de cuántas mejoras ya tiene (tabla oficial LEVEL_UP_SPP_COST_TABLE).
 * Para "mejora de atributo" no tiramos el dado por el usuario — el reglamento
 * exige tirada física 1D8 según la tabla oficial; aquí solo se registra qué
 * característica subió, igual que ya hacemos con los resultados de partido.
 */
export async function levelUpPlayer(playerId: string, input: z.infer<typeof levelUpSchema>): Promise<ActionResult> {
  const dbUser = await requireUser();
  const parsed = levelUpSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues.map((i) => i.message).join(" · ") };
  const data = parsed.data;

  const player = await prisma.managedPlayer.findUnique({
    where: { id: playerId },
    include: { team: true, skills: true },
  });
  if (!player || player.team.ownerId !== dbUser.id) return { ok: false, error: "No autorizado" };
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
    await prisma.managedPlayer.update({ where: { id: playerId }, data: { spp: { decrement: cost }, ...statData } });
    revalidatePath(`/equipos/${player.teamId}`);
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
    prisma.playerSkillAssignment.create({ data: { playerId, skillKey, source: "LEVEL_UP" } }),
    prisma.managedPlayer.update({ where: { id: playerId }, data: { spp: { decrement: cost } } }),
  ]);

  revalidatePath(`/equipos/${player.teamId}`);
  return { ok: true };
}

/**
 * Ficha a un Jugador Estrella del mercado. Elegible si `playsForAny` o si
 * comparte alguna liga con la raza del equipo (regla "plays for"). Máximo
 * 2 copias del mismo Jugador Estrella por equipo, como en el reglamento.
 */
export async function hireStar(teamId: string, starKey: string): Promise<ActionResult> {
  const dbUser = await requireUser();

  const team = await prisma.managedTeam.findUnique({ where: { id: teamId }, include: { players: true } });
  if (!team || team.ownerId !== dbUser.id) return { ok: false, error: "No autorizado" };

  const number = nextJerseyNumber(team.players);
  if (number === null) return { ok: false, error: `Plantilla al máximo de ${MAX_ROSTER} jugadores` };

  const [race, star, skills, traits] = await Promise.all([
    prisma.masterRace.findUnique({ where: { key: team.rosterKey } }),
    prisma.masterStarPlayer.findUnique({ where: { key: starKey } }),
    prisma.masterSkill.findMany({ select: { key: true, name: true } }),
    prisma.masterTrait.findMany({ select: { key: true, name: true } }),
  ]);
  if (!race || !star) return { ok: false, error: "Jugador Estrella no encontrado" };

  const eligible = star.playsForAny || star.leagues.some((l) => race.leagues.includes(l));
  if (!eligible) return { ok: false, error: `${star.name} no juega para esta liga` };

  const copies = team.players.filter((p) => p.starKey === star.key).length;
  if (copies >= MAX_COPIES_PER_STAR) {
    return { ok: false, error: `Ya tienes el máximo de ${MAX_COPIES_PER_STAR} copias de ${star.name}` };
  }
  if (team.treasury < star.cost) return { ok: false, error: "Presupuesto insuficiente" };

  const skillIndex = buildSkillNameIndex([...skills, ...traits]);
  const starSkillKeys = star.skillKeys
    .map((display) => resolveSkillKey(display, skillIndex))
    .filter((key): key is string => key !== null);

  await prisma.$transaction(async (tx) => {
    const player = await tx.managedPlayer.create({
      data: {
        teamId,
        number,
        customName: copies > 0 ? `${star.name} (${copies + 1})` : star.name,
        starKey: star.key,
      },
    });
    if (starSkillKeys.length > 0) {
      await tx.playerSkillAssignment.createMany({
        data: starSkillKeys.map((skillKey) => ({ playerId: player.id, skillKey, source: "STAR_PLAYER" as const })),
        skipDuplicates: true,
      });
    }
    await tx.managedTeam.update({ where: { id: teamId }, data: { treasury: { decrement: star.cost } } });
  });

  revalidatePath(`/equipos/${teamId}`);
  revalidatePath("/dashboard");
  return { ok: true };
}

export type AssetType = "reroll" | "cheerleader" | "coach" | "fan";
const FIXED_ASSET_COST: Record<Exclude<AssetType, "reroll">, number> = {
  cheerleader: 10_000,
  coach: 10_000,
  fan: 10_000,
};
// No exportamos esta constante: un módulo "use server" solo puede exportar
// funciones async. El cliente que necesite este valor lo repite (ver TeamBuilder.tsx).
const APOTHECARY_COST = 50_000;

/**
 * Compra (delta 1) o vende (delta -1) una unidad de personal de banquillo.
 * El coste del relanzamiento depende de la raza; el resto son fijos.
 */
export async function adjustAsset(teamId: string, asset: AssetType, delta: 1 | -1): Promise<ActionResult> {
  const dbUser = await requireUser();
  const team = await prisma.managedTeam.findUnique({ where: { id: teamId } });
  if (!team || team.ownerId !== dbUser.id) return { ok: false, error: "No autorizado" };

  let cost: number;
  let max = Infinity;
  let floor = 0;
  let current: number;

  if (asset === "reroll") {
    const race = await prisma.masterRace.findUnique({ where: { key: team.rosterKey } });
    cost = race?.rerollCost ?? 0;
    max = race?.rerollMax ?? 8;
    current = team.rerolls;
  } else if (asset === "cheerleader") {
    cost = FIXED_ASSET_COST.cheerleader;
    current = team.cheerleaders;
  } else if (asset === "coach") {
    cost = FIXED_ASSET_COST.coach;
    current = team.assistantCoaches;
  } else {
    cost = FIXED_ASSET_COST.fan;
    current = team.fanFactor;
    floor = 1; // siempre hay al menos 1 dado de aficionados dedicados
  }

  if (delta > 0) {
    if (current >= max) return { ok: false, error: "Límite alcanzado" };
    if (team.treasury < cost) return { ok: false, error: "Presupuesto insuficiente" };
  } else if (current <= floor) {
    return { ok: false, error: "Ya está al mínimo" };
  }

  const treasuryDelta = delta > 0 ? -cost : cost;

  if (asset === "reroll") {
    await prisma.managedTeam.update({
      where: { id: teamId },
      data: { rerolls: { increment: delta }, treasury: { increment: treasuryDelta } },
    });
  } else if (asset === "cheerleader") {
    await prisma.managedTeam.update({
      where: { id: teamId },
      data: { cheerleaders: { increment: delta }, treasury: { increment: treasuryDelta } },
    });
  } else if (asset === "coach") {
    await prisma.managedTeam.update({
      where: { id: teamId },
      data: { assistantCoaches: { increment: delta }, treasury: { increment: treasuryDelta } },
    });
  } else {
    await prisma.managedTeam.update({
      where: { id: teamId },
      data: { fanFactor: { increment: delta }, treasury: { increment: treasuryDelta } },
    });
  }

  revalidatePath(`/equipos/${teamId}`);
  revalidatePath("/dashboard");
  return { ok: true };
}

/** Activa o desactiva el apotecario (solo si la raza tiene acceso). */
export async function toggleApothecary(teamId: string): Promise<ActionResult> {
  const dbUser = await requireUser();
  const team = await prisma.managedTeam.findUnique({ where: { id: teamId } });
  if (!team || team.ownerId !== dbUser.id) return { ok: false, error: "No autorizado" };

  const race = await prisma.masterRace.findUnique({ where: { key: team.rosterKey } });
  if (!race?.allowsApothecary) return { ok: false, error: "Esta raza no tiene acceso a apotecario" };

  if (!team.hasApothecary) {
    if (team.treasury < APOTHECARY_COST) return { ok: false, error: "Presupuesto insuficiente" };
    await prisma.managedTeam.update({
      where: { id: teamId },
      data: { hasApothecary: true, treasury: { decrement: APOTHECARY_COST } },
    });
  } else {
    await prisma.managedTeam.update({
      where: { id: teamId },
      data: { hasApothecary: false, treasury: { increment: APOTHECARY_COST } },
    });
  }

  revalidatePath(`/equipos/${teamId}`);
  revalidatePath("/dashboard");
  return { ok: true };
}

/** Disuelve el equipo (los jugadores se borran en cascada). */
export async function deleteTeam(teamId: string): Promise<ActionResult> {
  const dbUser = await requireUser();

  const team = await prisma.managedTeam.findUnique({ where: { id: teamId } });
  if (!team || team.ownerId !== dbUser.id) return { ok: false, error: "No autorizado" };

  await prisma.managedTeam.delete({ where: { id: teamId } });

  revalidatePath("/equipos");
  revalidatePath("/dashboard");
  redirect("/equipos");
}
