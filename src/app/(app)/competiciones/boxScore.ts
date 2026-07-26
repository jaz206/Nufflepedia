import type { Prisma } from "@prisma/client";
import { buildMatchArticle } from "@/lib/matchArticle";

/**
 * Aplica el detalle de un partido (quién anotó, quién causó/recibió cada
 * lesión) dentro de una transacción ya abierta: crea las filas de detalle
 * y reparte SPP real (tabla MasterSppValue) al anotador y al agresor, y
 * cambia el estado del jugador lesionado si el resultado es grave (tabla
 * MasterInjuryEntry). Todo el detalle es opcional — si no se asigna
 * jugador a un tanto o una lesión, solo queda constancia del equipo. Al
 * terminar, genera la crónica del partido (MatchReport.headline/article).
 */

export interface ScorerInput {
  entryId: string;
  playerId: string | null;
}

export type StatLoss = "MA" | "ST" | "AG" | "PA" | "AV";

export interface InjuryInput {
  attackerEntryId: string;
  attackerPlayerId: string | null;
  victimEntryId: string;
  victimPlayerId: string | null;
  injuryCode: string | null;
  /// Solo relevante si el código de lesión implica pérdida de atributo
  /// (MasterInjuryEntry.permanentStatLoss). Opcional.
  statLoss: StatLoss | null;
}

export interface MatchTeams {
  /// null = amistoso suelto (LiveMatch), sin "temporada" de la que sacar contexto.
  competitionId: string | null;
  homeEntryId: string;
  homeTeamName: string;
  awayEntryId: string;
  awayTeamName: string;
  homeScore: number;
  awayScore: number;
}

type Tx = Prisma.TransactionClient;

/** Nº de bajas causadas por `entryId` según el detalle de lesiones — sustituye al contador manual. */
export function countCasualtiesBy(injuries: InjuryInput[], attackerEntryId: string): number {
  return injuries.filter((i) => i.attackerEntryId === attackerEntryId).length;
}

export async function applyBoxScore(
  tx: Tx,
  matchReportId: string,
  match: MatchTeams,
  scorers: ScorerInput[],
  injuries: InjuryInput[]
): Promise<void> {
  const [tdValue, casValue] = await Promise.all([
    tx.masterSppValue.findUnique({ where: { actionKey: "TOUCHDOWN" } }),
    tx.masterSppValue.findUnique({ where: { actionKey: "CASUALTY" } }),
  ]);

  for (const s of scorers) {
    await tx.matchScorer.create({ data: { matchReportId, entryId: s.entryId, playerId: s.playerId } });
    if (s.playerId && tdValue) {
      await tx.competitionPlayer.update({ where: { id: s.playerId }, data: { spp: { increment: tdValue.standardValue } } });
    }
  }

  const injuryCodes = [...new Set(injuries.map((i) => i.injuryCode).filter((c): c is string => !!c))];
  const injuryEntries = injuryCodes.length
    ? await tx.masterInjuryEntry.findMany({ where: { code: { in: injuryCodes } } })
    : [];
  const injuryByCode = new Map(injuryEntries.map((e) => [e.code, e]));

  for (const inj of injuries) {
    await tx.matchInjury.create({
      data: {
        matchReportId,
        attackerEntryId: inj.attackerEntryId,
        attackerPlayerId: inj.attackerPlayerId,
        victimEntryId: inj.victimEntryId,
        victimPlayerId: inj.victimPlayerId,
        injuryCode: inj.injuryCode,
        statLoss: inj.statLoss,
      },
    });
    if (inj.attackerPlayerId && casValue) {
      await tx.competitionPlayer.update({
        where: { id: inj.attackerPlayerId },
        data: { spp: { increment: casValue.standardValue } },
      });
    }
    if (inj.victimPlayerId && inj.injuryCode) {
      const entry = injuryByCode.get(inj.injuryCode);
      if (entry) {
        const status = entry.isDeath
          ? ("DEAD" as const)
          : entry.missesNextGame
            ? ("MISS_NEXT_GAME" as const)
            : entry.permanentStatLoss
              ? ("NIGGLING_INJURY" as const)
              : null;
        if (status) {
          await tx.competitionPlayer.update({ where: { id: inj.victimPlayerId }, data: { status } });
        }
        // Pérdida de atributo real: decrementar el mismo contador que usa la
        // subida de nivel (effectiveStats ya sabe restar en vez de sumar
        // para AG/PA), así que un valor negativo aquí representa "empeoró".
        if (entry.permanentStatLoss && inj.statLoss) {
          const statData =
            inj.statLoss === "MA"
              ? { maIncreases: { decrement: 1 } }
              : inj.statLoss === "ST"
                ? { stIncreases: { decrement: 1 } }
                : inj.statLoss === "AG"
                  ? { agIncreases: { decrement: 1 } }
                  : inj.statLoss === "PA"
                    ? { paIncreases: { decrement: 1 } }
                    : { avIncreases: { decrement: 1 } };
          await tx.competitionPlayer.update({ where: { id: inj.victimPlayerId }, data: statData });
        }
      }
    }
  }

  const playerIds = [
    ...new Set(
      [
        ...scorers.map((s) => s.playerId),
        ...injuries.flatMap((i) => [i.attackerPlayerId, i.victimPlayerId]),
      ].filter((id): id is string => !!id)
    ),
  ];
  const players = playerIds.length
    ? await tx.competitionPlayer.findMany({ where: { id: { in: playerIds } }, select: { id: true, customName: true } })
    : [];
  const nameById = new Map(players.map((p) => [p.id, p.customName]));
  const teamNameByEntry = (entryId: string) => (entryId === match.homeEntryId ? match.homeTeamName : match.awayTeamName);

  // Tabla de máximos anotadores de la competición, DESPUÉS de este partido
  // (ya incluye los MatchScorer recién creados arriba) — le da a la crónica
  // contexto de temporada en vez de narrar cada partido en el vacío. Un
  // amistoso suelto (competitionId null) no tiene "temporada", se omite.
  let seasonTopScorers: { name: string; teamName: string; count: number }[] = [];
  if (match.competitionId) {
    const topScorersRaw = await tx.matchScorer.groupBy({
      by: ["playerId"],
      where: { playerId: { not: null }, matchReport: { competitionId: match.competitionId } },
      _count: { playerId: true },
      orderBy: { _count: { playerId: "desc" } },
      take: 3,
    });
    const topScorerIds = topScorersRaw.map((r) => r.playerId).filter((id): id is string => !!id);
    const topScorerPlayers = topScorerIds.length
      ? await tx.competitionPlayer.findMany({
          where: { id: { in: topScorerIds } },
          include: { entry: true },
        })
      : [];
    const topScorerById = new Map(topScorerPlayers.map((p) => [p.id, p]));
    seasonTopScorers = topScorersRaw
      .map((r) => {
        const p = r.playerId ? topScorerById.get(r.playerId) : undefined;
        if (!p) return null;
        return { name: p.customName, teamName: p.entry.teamName, count: r._count.playerId };
      })
      .filter((x): x is { name: string; teamName: string; count: number } => !!x);
  }

  const { headline, article } = buildMatchArticle({
    homeTeamName: match.homeTeamName,
    awayTeamName: match.awayTeamName,
    homeScore: match.homeScore,
    awayScore: match.awayScore,
    scorers: scorers.map((s) => ({ teamName: teamNameByEntry(s.entryId), playerName: s.playerId ? (nameById.get(s.playerId) ?? null) : null })),
    injuries: injuries.map((i) => ({
      attackerTeamName: teamNameByEntry(i.attackerEntryId),
      attackerPlayerName: i.attackerPlayerId ? (nameById.get(i.attackerPlayerId) ?? null) : null,
      victimTeamName: teamNameByEntry(i.victimEntryId),
      victimPlayerName: i.victimPlayerId ? (nameById.get(i.victimPlayerId) ?? null) : null,
      injuryName: i.injuryCode ? (injuryByCode.get(i.injuryCode)?.name ?? null) : null,
    })),
    seasonTopScorers,
  });

  await tx.matchReport.update({ where: { id: matchReportId }, data: { headline, article } });
}
