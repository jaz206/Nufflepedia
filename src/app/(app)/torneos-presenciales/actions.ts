"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/server/db/prisma";
import { requireUser } from "@/server/auth/requireUser";
import { pairSwissRound, buildPlayedPairs } from "@/lib/swissPairing";
import { computeStandings } from "@/lib/presentialStandings";

export type ActionResult = { ok: true } | { ok: false; error: string };

async function requireOwnedTournament(tournamentId: string) {
  const dbUser = await requireUser();
  const tournament = await prisma.presentialTournament.findUnique({
    where: { id: tournamentId },
    include: { entrants: true, rounds: { include: { matches: true }, orderBy: { number: "asc" } } },
  });
  if (!tournament || tournament.commissionerId !== dbUser.id) return null;
  return tournament;
}

const createSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres").max(80, "Máximo 80 caracteres"),
  totalRounds: z.number().int().min(1, "Al menos 1 ronda").max(20, "Máximo 20 rondas"),
  pointsWin: z.number().int().min(0).max(10),
  pointsDraw: z.number().int().min(0).max(10),
  pointsLoss: z.number().int().min(0).max(10),
});

export async function createPresentialTournament(input: z.infer<typeof createSchema>): Promise<ActionResult> {
  const dbUser = await requireUser();
  const parsed = createSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues.map((i) => i.message).join(" · ") };

  const tournament = await prisma.presentialTournament.create({
    data: { ...parsed.data, commissionerId: dbUser.id },
  });

  revalidatePath("/torneos-presenciales");
  redirect(`/torneos-presenciales/${tournament.id}`);
}

const entrantSchema = z.object({
  displayName: z.string().min(1, "Falta el nombre del entrenador").max(60),
  teamName: z.string().min(1, "Falta el nombre del equipo").max(60),
  raceName: z.string().min(1, "Falta la raza").max(60),
});

export async function addEntrant(tournamentId: string, input: z.infer<typeof entrantSchema>): Promise<ActionResult> {
  const tournament = await requireOwnedTournament(tournamentId);
  if (!tournament) return { ok: false, error: "No autorizado" };
  if (tournament.status !== "SETUP") return { ok: false, error: "El torneo ya ha empezado, no se pueden añadir más inscritos" };

  const parsed = entrantSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues.map((i) => i.message).join(" · ") };

  await prisma.presentialEntrant.create({ data: { tournamentId, ...parsed.data } });
  revalidatePath(`/torneos-presenciales/${tournamentId}`);
  return { ok: true };
}

export async function removeEntrant(tournamentId: string, entrantId: string): Promise<ActionResult> {
  const tournament = await requireOwnedTournament(tournamentId);
  if (!tournament) return { ok: false, error: "No autorizado" };
  if (tournament.status !== "SETUP") return { ok: false, error: "El torneo ya ha empezado, no se puede quitar a nadie" };

  await prisma.presentialEntrant.delete({ where: { id: entrantId } });
  revalidatePath(`/torneos-presenciales/${tournamentId}`);
  return { ok: true };
}

/** Marca a un inscrito como retirado: no se le vuelve a emparejar, pero conserva lo ya jugado. */
export async function dropEntrant(tournamentId: string, entrantId: string): Promise<ActionResult> {
  const tournament = await requireOwnedTournament(tournamentId);
  if (!tournament) return { ok: false, error: "No autorizado" };

  await prisma.presentialEntrant.update({ where: { id: entrantId }, data: { dropped: true } });
  revalidatePath(`/torneos-presenciales/${tournamentId}`);
  return { ok: true };
}

function scoringOf(t: { pointsWin: number; pointsDraw: number; pointsLoss: number }) {
  return { pointsWin: t.pointsWin, pointsDraw: t.pointsDraw, pointsLoss: t.pointsLoss };
}

/** Empareja la siguiente ronda (la 1ª si el torneo aún no ha arrancado). Exige que la ronda anterior esté completa. */
export async function pairNextRound(tournamentId: string): Promise<ActionResult> {
  const tournament = await requireOwnedTournament(tournamentId);
  if (!tournament) return { ok: false, error: "No autorizado" };
  if (tournament.status === "FINISHED") return { ok: false, error: "El torneo ya ha terminado" };
  if (tournament.currentRound >= tournament.totalRounds) return { ok: false, error: "Ya se han jugado todas las rondas" };

  const activeEntrants = tournament.entrants.filter((e) => !e.dropped);
  if (activeEntrants.length < 2) return { ok: false, error: "Hacen falta al menos 2 inscritos activos" };

  const allMatches = tournament.rounds.flatMap((r) => r.matches);
  const currentRoundData = tournament.rounds.find((r) => r.number === tournament.currentRound);
  if (currentRoundData && currentRoundData.matches.some((m) => !m.reported)) {
    return { ok: false, error: "Todavía faltan resultados por registrar en la ronda actual" };
  }

  const standings = computeStandings(
    tournament.entrants.map((e) => e.id),
    allMatches,
    scoringOf(tournament)
  );
  const standingsById = new Map(standings.map((s) => [s.entrantId, s]));

  const swissEntrants = activeEntrants.map((e) => {
    const s = standingsById.get(e.id)!;
    return { id: e.id, points: s.points, tdFor: s.tdFor, tdAgainst: s.tdAgainst, byes: s.byes, dropped: e.dropped };
  });

  const nextRoundNumber = tournament.currentRound + 1;
  const played = buildPlayedPairs(allMatches);
  const pairings = pairSwissRound(swissEntrants, played, nextRoundNumber);

  await prisma.$transaction(async (tx) => {
    const round = await tx.presentialRound.create({ data: { tournamentId, number: nextRoundNumber } });
    let table = 1;
    for (const p of pairings) {
      await tx.presentialMatch.create({
        data: {
          roundId: round.id,
          tableNumber: table++,
          entrantAId: p.entrantAId,
          entrantBId: p.entrantBId,
          // Un bye no necesita que nadie teclee nada: se da por jugado con marcador simbólico.
          reported: p.entrantBId === null,
          scoreA: p.entrantBId === null ? 0 : null,
          scoreB: p.entrantBId === null ? 0 : null,
        },
      });
    }
    await tx.presentialTournament.update({
      where: { id: tournamentId },
      data: { currentRound: nextRoundNumber, status: "IN_PROGRESS" },
    });
  });

  revalidatePath(`/torneos-presenciales/${tournamentId}`);
  return { ok: true };
}

const resultSchema = z.object({
  scoreA: z.number().int().min(0).max(30),
  scoreB: z.number().int().min(0).max(30),
  casA: z.number().int().min(0).max(20),
  casB: z.number().int().min(0).max(20),
});

export async function reportMatchResult(
  tournamentId: string,
  matchId: string,
  input: z.infer<typeof resultSchema>
): Promise<ActionResult> {
  const tournament = await requireOwnedTournament(tournamentId);
  if (!tournament) return { ok: false, error: "No autorizado" };

  const parsed = resultSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues.map((i) => i.message).join(" · ") };

  const match = tournament.rounds.flatMap((r) => r.matches).find((m) => m.id === matchId);
  if (!match) return { ok: false, error: "Partido no encontrado" };
  if (match.entrantBId === null) return { ok: false, error: "Ese hueco es un bye, no tiene resultado que registrar" };

  await prisma.presentialMatch.update({
    where: { id: matchId },
    data: { ...parsed.data, reported: true },
  });

  revalidatePath(`/torneos-presenciales/${tournamentId}`);
  return { ok: true };
}

/** Cierra el torneo tras la última ronda. */
export async function finishTournament(tournamentId: string): Promise<ActionResult> {
  const tournament = await requireOwnedTournament(tournamentId);
  if (!tournament) return { ok: false, error: "No autorizado" };
  if (tournament.currentRound < tournament.totalRounds) return { ok: false, error: "Todavía quedan rondas por jugar" };
  const lastRound = tournament.rounds.find((r) => r.number === tournament.currentRound);
  if (lastRound && lastRound.matches.some((m) => !m.reported)) {
    return { ok: false, error: "Todavía faltan resultados por registrar en la última ronda" };
  }

  await prisma.presentialTournament.update({ where: { id: tournamentId }, data: { status: "FINISHED" } });
  revalidatePath(`/torneos-presenciales/${tournamentId}`);
  return { ok: true };
}
