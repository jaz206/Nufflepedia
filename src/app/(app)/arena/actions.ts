"use server";

import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/server/db/prisma";
import { requireUser } from "@/server/auth/requireUser";
import { cloneRosterIntoEntry } from "../competiciones/rosterSnapshot";
import { applyBoxScore, type ScorerInput, type InjuryInput } from "../competiciones/boxScore";

export type ActionResult = { ok: true } | { ok: false; error: string };

/**
 * Amistoso suelto llevado por el Asistente de Partido en vivo. Reutiliza la
 * misma plantilla-copia (CompetitionEntry/CompetitionPlayer) y box score que
 * las competiciones, con competitionId a null — ver docs/DATA_MODEL.md.
 */

async function loadTeamForClone(teamId: string) {
  return prisma.managedTeam.findUnique({
    where: { id: teamId },
    include: { players: { include: { skills: true } } },
  });
}

/**
 * Busca equipos de OTROS entrenadores para jugar contra el de un amigo
 * registrado — por nombre de equipo, o por el email (parcial vale, no hace
 * falta escribirlo entero) con el que entra en la app.
 */
export async function searchOpponentTeams(query: string) {
  const dbUser = await requireUser();
  const q = query.trim();
  if (q.length < 2) return [];
  const isEmail = q.includes("@");
  const teams = await prisma.managedTeam.findMany({
    where: {
      isGuest: false,
      ownerId: { not: dbUser.id },
      ...(isEmail ? { owner: { email: { contains: q, mode: "insensitive" } } } : { name: { contains: q, mode: "insensitive" } }),
    },
    select: { id: true, name: true, rosterKey: true, owner: { select: { displayName: true } } },
    take: 20,
  });
  return teams;
}

/** Crea un amistoso entre dos equipos (propios, de un amigo registrado, o invitados) y arranca el Asistente. */
export async function createFriendlyMatch(input: { homeTeamId: string; awayTeamId: string }): Promise<ActionResult> {
  const dbUser = await requireUser();
  if (input.homeTeamId === input.awayTeamId) return { ok: false, error: "Elige dos equipos distintos" };

  const [homeTeam, awayTeam] = await Promise.all([
    loadTeamForClone(input.homeTeamId),
    loadTeamForClone(input.awayTeamId),
  ]);
  if (!homeTeam || homeTeam.ownerId !== dbUser.id) return { ok: false, error: "Ese no es uno de tus equipos" };
  if (!awayTeam) return { ok: false, error: "Equipo rival no encontrado" };

  let liveMatchId = "";
  await prisma.$transaction(
    async (tx) => {
      const homeEntry = await tx.competitionEntry.create({
        data: {
          ownerId: homeTeam.ownerId,
          managedTeamId: homeTeam.id,
          teamName: homeTeam.name,
          rosterKey: homeTeam.rosterKey,
        },
      });
      const awayEntry = await tx.competitionEntry.create({
        data: {
          ownerId: awayTeam.ownerId,
          managedTeamId: awayTeam.id,
          teamName: awayTeam.name,
          rosterKey: awayTeam.rosterKey,
        },
      });
      await cloneRosterIntoEntry(tx, homeEntry.id, homeTeam.treasury, homeTeam.players);
      await cloneRosterIntoEntry(tx, awayEntry.id, awayTeam.treasury, awayTeam.players);

      const liveMatch = await tx.liveMatch.create({
        data: { createdById: dbUser.id, homeEntryId: homeEntry.id, awayEntryId: awayEntry.id },
      });
      liveMatchId = liveMatch.id;
    },
    // Clonar DOS plantillas completas (jugadores + habilidades) en una sola
    // transacción es el doble de idas y vueltas que un joinCompetition normal
    // (que solo clona una) — el timeout por defecto de Prisma (5s) se queda
    // corto contra el pooler de Supabase desde una función serverless fría.
    { timeout: 20_000 }
  );

  revalidatePath("/arena");
  redirect(`/arena/${liveMatchId}`);
}

async function requireOwnedLiveMatch(liveMatchId: string) {
  const dbUser = await requireUser();
  const liveMatch = await prisma.liveMatch.findUnique({ where: { id: liveMatchId } });
  if (!liveMatch || liveMatch.createdById !== dbUser.id) return null;
  return liveMatch;
}

const fanFactorSchema = z.object({ home: z.number().int().min(0).max(30), away: z.number().int().min(0).max(30) });

export async function setFanFactor(liveMatchId: string, input: z.infer<typeof fanFactorSchema>): Promise<ActionResult> {
  const liveMatch = await requireOwnedLiveMatch(liveMatchId);
  if (!liveMatch) return { ok: false, error: "No autorizado" };
  const parsed = fanFactorSchema.parse(input);
  await prisma.$transaction([
    prisma.liveMatch.update({ where: { id: liveMatchId }, data: { fanFactorHome: parsed.home, fanFactorAway: parsed.away } }),
    prisma.liveMatchEvent.create({
      data: { liveMatchId, type: "FAN_FACTOR", half: liveMatch.half, turn: liveMatch.turn, payload: parsed },
    }),
  ]);
  revalidatePath(`/arena/${liveMatchId}`);
  return { ok: true };
}

export async function setWeather(liveMatchId: string, weatherEntryId: string): Promise<ActionResult> {
  const liveMatch = await requireOwnedLiveMatch(liveMatchId);
  if (!liveMatch) return { ok: false, error: "No autorizado" };
  const weather = await prisma.masterWeatherEntry.findUnique({ where: { id: weatherEntryId } });
  if (!weather) return { ok: false, error: "Clima no encontrado" };
  await prisma.$transaction([
    prisma.liveMatch.update({ where: { id: liveMatchId }, data: { weatherCode: weather.id } }),
    prisma.liveMatchEvent.create({
      data: {
        liveMatchId,
        type: "WEATHER_ROLL",
        half: liveMatch.half,
        turn: liveMatch.turn,
        payload: { id: weather.id, name: weather.name, effect: weather.effect },
      },
    }),
  ]);
  revalidatePath(`/arena/${liveMatchId}`);
  return { ok: true };
}

export async function setKickingTeam(liveMatchId: string, kickingEntryId: string): Promise<ActionResult> {
  const liveMatch = await requireOwnedLiveMatch(liveMatchId);
  if (!liveMatch) return { ok: false, error: "No autorizado" };
  if (kickingEntryId !== liveMatch.homeEntryId && kickingEntryId !== liveMatch.awayEntryId) {
    return { ok: false, error: "Equipo no válido" };
  }
  await prisma.$transaction([
    prisma.liveMatch.update({ where: { id: liveMatchId }, data: { kickingEntryId } }),
    prisma.liveMatchEvent.create({
      data: { liveMatchId, type: "KICKING_TEAM_ROLL", half: liveMatch.half, turn: liveMatch.turn, entryId: kickingEntryId },
    }),
  ]);
  revalidatePath(`/arena/${liveMatchId}`);
  return { ok: true };
}

export async function startLiveMatch(liveMatchId: string): Promise<ActionResult> {
  const liveMatch = await requireOwnedLiveMatch(liveMatchId);
  if (!liveMatch) return { ok: false, error: "No autorizado" };
  if (!liveMatch.weatherCode || !liveMatch.kickingEntryId) {
    return { ok: false, error: "Completa el Clima y el equipo pateador antes de empezar" };
  }
  await prisma.liveMatch.update({ where: { id: liveMatchId }, data: { status: "IN_PROGRESS" } });
  revalidatePath(`/arena/${liveMatchId}`);
  return { ok: true };
}

const eventTypeSchema = z.enum([
  "KICKOFF_EVENT",
  "TURNOVER",
  "TOUCHDOWN",
  "COMPLETED_PASS",
  "INTERCEPTION",
  "CASUALTY",
  "SENT_OFF",
  "APOTHECARY_USED",
  "SUBSTITUTION",
  "PRAYER_TO_NUFFLE",
  "KO_RECOVERY",
  "HALF_END",
  "NOTE",
]);

const logEventSchema = z.object({
  type: eventTypeSchema,
  entryId: z.string().optional(),
  playerId: z.string().optional(),
  opponentEntryId: z.string().optional(),
  opponentPlayerId: z.string().optional(),
  payload: z.record(z.string(), z.unknown()).optional(),
});

/** Registra un evento del partido en vivo. Es el "botón" genérico detrás de todos los botones de la pantalla. */
export async function logLiveMatchEvent(liveMatchId: string, input: z.infer<typeof logEventSchema>): Promise<ActionResult> {
  const liveMatch = await requireOwnedLiveMatch(liveMatchId);
  if (!liveMatch) return { ok: false, error: "No autorizado" };
  if (liveMatch.status !== "IN_PROGRESS") return { ok: false, error: "El partido no está en curso" };
  const parsed = logEventSchema.parse(input);

  if (parsed.type === "CASUALTY" && parsed.entryId && parsed.opponentEntryId && parsed.entryId === parsed.opponentEntryId) {
    return { ok: false, error: "Una baja no puede ser del mismo equipo" };
  }

  await prisma.$transaction(async (tx) => {
    await tx.liveMatchEvent.create({
      data: {
        liveMatchId,
        type: parsed.type,
        half: liveMatch.half,
        turn: liveMatch.turn,
        entryId: parsed.entryId,
        playerId: parsed.playerId,
        opponentEntryId: parsed.opponentEntryId,
        opponentPlayerId: parsed.opponentPlayerId,
        payload: (parsed.payload ?? {}) as Prisma.InputJsonObject,
      },
    });
    if (parsed.type === "TOUCHDOWN" && parsed.entryId) {
      const field = parsed.entryId === liveMatch.homeEntryId ? "homeScore" : "awayScore";
      await tx.liveMatch.update({ where: { id: liveMatchId }, data: { [field]: { increment: 1 } } });
    }
  });

  revalidatePath(`/arena/${liveMatchId}`);
  return { ok: true };
}

export async function advanceTurn(liveMatchId: string): Promise<ActionResult> {
  const liveMatch = await requireOwnedLiveMatch(liveMatchId);
  if (!liveMatch) return { ok: false, error: "No autorizado" };
  await prisma.$transaction([
    prisma.liveMatch.update({ where: { id: liveMatchId }, data: { turn: { increment: 1 } } }),
    prisma.liveMatchEvent.create({
      data: { liveMatchId, type: "TURNOVER", half: liveMatch.half, turn: liveMatch.turn },
    }),
  ]);
  revalidatePath(`/arena/${liveMatchId}`);
  return { ok: true };
}

export async function startSecondHalf(liveMatchId: string): Promise<ActionResult> {
  const liveMatch = await requireOwnedLiveMatch(liveMatchId);
  if (!liveMatch) return { ok: false, error: "No autorizado" };
  await prisma.$transaction([
    prisma.liveMatch.update({ where: { id: liveMatchId }, data: { half: 2, turn: 1 } }),
    prisma.liveMatchEvent.create({
      data: { liveMatchId, type: "HALF_END", half: liveMatch.half, turn: liveMatch.turn },
    }),
  ]);
  revalidatePath(`/arena/${liveMatchId}`);
  return { ok: true };
}

/**
 * Cierra el partido: reconstruye el resultado a partir del registro de
 * eventos (nadie tiene que volver a teclear nada), genera el MatchReport
 * reutilizando el mismo box score que las competiciones, y sincroniza PE/
 * estado/atributos de vuelta a la plantilla real de cada equipo — un
 * amistoso SÍ hace progresar a los jugadores, a diferencia de una
 * competición (que vive aislada en su propia copia).
 */
export async function finishLiveMatch(liveMatchId: string): Promise<{ ok: true; matchReportId: string } | { ok: false; error: string }> {
  const dbUser = await requireUser();
  const liveMatch = await prisma.liveMatch.findUnique({
    where: { id: liveMatchId },
    include: {
      events: true,
      homeEntry: { include: { players: true } },
      awayEntry: { include: { players: true } },
    },
  });
  if (!liveMatch || liveMatch.createdById !== dbUser.id) return { ok: false, error: "No autorizado" };
  if (liveMatch.status === "FINISHED") return { ok: false, error: "Este partido ya está finalizado" };

  const scorers: ScorerInput[] = liveMatch.events
    .filter((e) => e.type === "TOUCHDOWN" && e.entryId)
    .map((e) => ({ entryId: e.entryId!, playerId: e.playerId ?? null }));

  const injuries: InjuryInput[] = liveMatch.events
    .filter((e) => e.type === "CASUALTY" && e.entryId && e.opponentEntryId)
    .map((e) => {
      const payload = e.payload as { injuryCode?: string; statLoss?: InjuryInput["statLoss"] };
      return {
        attackerEntryId: e.entryId!,
        attackerPlayerId: e.playerId ?? null,
        victimEntryId: e.opponentEntryId!,
        victimPlayerId: e.opponentPlayerId ?? null,
        injuryCode: payload.injuryCode ?? null,
        statLoss: payload.statLoss ?? null,
      };
    });

  let matchReportId = "";
  await prisma.$transaction(async (tx) => {
    const report = await tx.matchReport.create({
      data: {
        competitionId: null,
        homeEntryId: liveMatch.homeEntryId,
        awayEntryId: liveMatch.awayEntryId,
        homeScore: liveMatch.homeScore,
        awayScore: liveMatch.awayScore,
        source: "FRIENDLY",
      },
    });
    matchReportId = report.id;

    await applyBoxScore(
      tx,
      report.id,
      {
        competitionId: null,
        homeEntryId: liveMatch.homeEntryId,
        homeTeamName: liveMatch.homeEntry.teamName,
        awayEntryId: liveMatch.awayEntryId,
        awayTeamName: liveMatch.awayEntry.teamName,
        homeScore: liveMatch.homeScore,
        awayScore: liveMatch.awayScore,
      },
      scorers,
      injuries
    );

    // Pase completado / Intercepción: reparten PE pero no forman parte del
    // box score de competiciones (que solo conoce goles y bajas) — se
    // aplican aquí directamente sobre la misma tabla de PE.
    const passValue = await tx.masterSppValue.findUnique({ where: { actionKey: "PASS_COMPLETE" } });
    const interceptionValue = await tx.masterSppValue.findUnique({ where: { actionKey: "INTERCEPTION" } });
    for (const e of liveMatch.events) {
      if (e.type === "COMPLETED_PASS" && e.playerId && passValue) {
        await tx.competitionPlayer.update({ where: { id: e.playerId }, data: { spp: { increment: passValue.standardValue } } });
      }
      if (e.type === "INTERCEPTION" && e.playerId && interceptionValue) {
        await tx.competitionPlayer.update({ where: { id: e.playerId }, data: { spp: { increment: interceptionValue.standardValue } } });
      }
    }

    // Sincroniza la copia de trabajo de vuelta a la plantilla real — un
    // amistoso sí hace progresar al equipo, a diferencia de una competición.
    const allCompPlayers = await tx.competitionPlayer.findMany({
      where: { entryId: { in: [liveMatch.homeEntryId, liveMatch.awayEntryId] } },
    });
    for (const cp of allCompPlayers) {
      if (!cp.sourcePlayerId) continue;
      await tx.managedPlayer.update({
        where: { id: cp.sourcePlayerId },
        data: {
          spp: cp.spp,
          status: cp.status,
          maIncreases: cp.maIncreases,
          stIncreases: cp.stIncreases,
          agIncreases: cp.agIncreases,
          paIncreases: cp.paIncreases,
          avIncreases: cp.avIncreases,
        },
      });
    }

    await tx.liveMatch.update({ where: { id: liveMatchId }, data: { status: "FINISHED", matchReportId: report.id } });
  });

  revalidatePath("/arena");
  revalidatePath("/dashboard");
  revalidatePath("/equipos");
  return { ok: true, matchReportId };
}
