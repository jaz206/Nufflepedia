import { notFound } from "next/navigation";
import { requireUser } from "@/server/auth/requireUser";
import { prisma } from "@/server/db/prisma";
import LiveMatchBoard from "./LiveMatchBoard";

export default async function LiveMatchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const dbUser = await requireUser();

  const liveMatch = await prisma.liveMatch.findUnique({
    where: { id },
    include: {
      homeEntry: { include: { players: true } },
      awayEntry: { include: { players: true } },
      events: { orderBy: { createdAt: "asc" } },
    },
  });
  if (!liveMatch || liveMatch.createdById !== dbUser.id) notFound();

  const [weather, kickoffEvents, prayers, injuryCatalog] = await Promise.all([
    prisma.masterWeatherEntry.findMany({ orderBy: { minRoll: "asc" } }),
    prisma.masterKickoffEntry.findMany({ orderBy: { roll: "asc" } }),
    prisma.masterPrayerEntry.findMany({ orderBy: { roll: "asc" } }),
    prisma.masterInjuryEntry.findMany({ select: { code: true, name: true, permanentStatLoss: true }, orderBy: { name: "asc" } }),
  ]);

  return (
    <LiveMatchBoard
      liveMatch={{
        id: liveMatch.id,
        status: liveMatch.status,
        half: liveMatch.half,
        turn: liveMatch.turn,
        homeScore: liveMatch.homeScore,
        awayScore: liveMatch.awayScore,
        fanFactorHome: liveMatch.fanFactorHome,
        fanFactorAway: liveMatch.fanFactorAway,
        weatherCode: liveMatch.weatherCode,
        kickingEntryId: liveMatch.kickingEntryId,
        matchReportId: liveMatch.matchReportId,
        homeEntryId: liveMatch.homeEntryId,
        awayEntryId: liveMatch.awayEntryId,
      }}
      homeTeam={{
        entryId: liveMatch.homeEntry.id,
        teamName: liveMatch.homeEntry.teamName,
        players: liveMatch.homeEntry.players.map((p) => ({
          id: p.id,
          number: p.number,
          customName: p.customName,
          status: p.status,
          spp: p.spp,
        })),
      }}
      awayTeam={{
        entryId: liveMatch.awayEntry.id,
        teamName: liveMatch.awayEntry.teamName,
        players: liveMatch.awayEntry.players.map((p) => ({
          id: p.id,
          number: p.number,
          customName: p.customName,
          status: p.status,
          spp: p.spp,
        })),
      }}
      events={liveMatch.events.map((e) => ({
        id: e.id,
        type: e.type,
        half: e.half,
        turn: e.turn,
        entryId: e.entryId,
        playerId: e.playerId,
        opponentEntryId: e.opponentEntryId,
        opponentPlayerId: e.opponentPlayerId,
        payload: e.payload as Record<string, unknown>,
        createdAt: e.createdAt.toISOString(),
      }))}
      weather={weather.map((w) => ({ id: w.id, name: w.name, effect: w.effect }))}
      kickoffEvents={kickoffEvents.map((k) => ({ id: k.id, name: k.name, effect: k.effect }))}
      prayers={prayers.map((p) => ({ id: p.id, name: p.name, effect: p.effect }))}
      injuryCatalog={injuryCatalog}
    />
  );
}
