"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/server/db/prisma";
import { requireUser } from "@/server/auth/requireUser";
import { GRID_COLS, GRID_ROWS } from "@/lib/tacticalFormations";

export type ActionResult = { ok: true; playId: string } | { ok: false; error: string };

const tokenSchema = z
  .object({
    playerId: z.string().nullable(),
    side: z.enum(["mine", "opponent"]),
    x: z.number().int().min(0).max(GRID_COLS - 1),
    y: z.number().int().min(0).max(GRID_ROWS - 1),
    label: z.string().max(30).nullable(),
  })
  .refine((t) => t.playerId !== null || t.label !== null, {
    message: "Una ficha sin jugador real necesita una etiqueta",
  });

const savePlaySchema = z.object({
  playId: z.string().nullable(),
  teamId: z.string().min(1),
  name: z.string().min(1, "Ponle un nombre a la jugada").max(60),
  description: z.string().max(500).nullable(),
  tokens: z.array(tokenSchema).max(22),
});

/** Crea o sustituye por completo una jugada (nombre + fichas) de un equipo. */
export async function savePlay(input: z.infer<typeof savePlaySchema>): Promise<ActionResult> {
  const dbUser = await requireUser();
  const parsed = savePlaySchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues.map((i) => i.message).join(" · ") };

  const team = await prisma.managedTeam.findUnique({ where: { id: parsed.data.teamId } });
  if (!team || team.ownerId !== dbUser.id) return { ok: false, error: "No autorizado" };

  if (parsed.data.tokens.some((t) => t.playerId)) {
    const playerIds = parsed.data.tokens.map((t) => t.playerId).filter((id): id is string => !!id);
    const validCount = await prisma.managedPlayer.count({ where: { id: { in: playerIds }, teamId: team.id } });
    if (validCount !== new Set(playerIds).size) {
      return { ok: false, error: "Alguna ficha no corresponde a un jugador de este equipo" };
    }
  }

  const playId = await prisma.$transaction(async (tx) => {
    let play;
    if (parsed.data.playId) {
      const existing = await tx.tacticalPlay.findUnique({ where: { id: parsed.data.playId } });
      if (!existing || existing.teamId !== team.id) throw new Error("Jugada no encontrada");
      play = await tx.tacticalPlay.update({
        where: { id: parsed.data.playId },
        data: { name: parsed.data.name, description: parsed.data.description },
      });
      await tx.tacticalToken.deleteMany({ where: { playId: play.id } });
    } else {
      play = await tx.tacticalPlay.create({
        data: { teamId: team.id, name: parsed.data.name, description: parsed.data.description },
      });
    }
    if (parsed.data.tokens.length > 0) {
      await tx.tacticalToken.createMany({
        data: parsed.data.tokens.map((t) => ({ ...t, playId: play.id })),
      });
    }
    return play.id;
  });

  revalidatePath(`/pizarra/${team.id}`);
  return { ok: true, playId };
}

export async function deletePlay(playId: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const dbUser = await requireUser();
  const play = await prisma.tacticalPlay.findUnique({ where: { id: playId }, include: { team: true } });
  if (!play || play.team.ownerId !== dbUser.id) return { ok: false, error: "No autorizado" };

  await prisma.tacticalPlay.delete({ where: { id: playId } });
  revalidatePath(`/pizarra/${play.teamId}`);
  return { ok: true };
}
