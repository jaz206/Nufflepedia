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
      homeEntry: { include: { players: { include: { skills: true } } } },
      awayEntry: { include: { players: { include: { skills: true } } } },
      events: { orderBy: { createdAt: "asc" } },
    },
  });
  if (!liveMatch || liveMatch.createdById !== dbUser.id) notFound();

  const rosterKeys = [...new Set([liveMatch.homeEntry.rosterKey, liveMatch.awayEntry.rosterKey])];

  const [weather, kickoffEvents, prayers, injuryCatalog, races, stars, skills, traits] = await Promise.all([
    prisma.masterWeatherEntry.findMany({ orderBy: { minRoll: "asc" } }),
    prisma.masterKickoffEntry.findMany({ orderBy: { roll: "asc" } }),
    prisma.masterPrayerEntry.findMany({ orderBy: { roll: "asc" } }),
    prisma.masterInjuryEntry.findMany({ select: { code: true, name: true, permanentStatLoss: true }, orderBy: { name: "asc" } }),
    prisma.masterRace.findMany({
      where: { key: { in: rosterKeys } },
      include: { positions: { orderBy: { sortOrder: "asc" } } },
    }),
    prisma.masterStarPlayer.findMany(),
    prisma.masterSkill.findMany({ select: { key: true, name: true, description: true, isElite: true, category: true } }),
    prisma.masterTrait.findMany({ select: { key: true, name: true, description: true, category: true } }),
  ]);
  const positionByRosterKey = new Map(
    races.map((r) => [
      r.key,
      r.positions.map((p) => ({
        id: p.id,
        name: p.name,
        ma: p.ma,
        st: p.st,
        ag: p.ag,
        pa: p.pa,
        av: p.av,
        startingSkillKeys: p.startingSkillKeys,
      })),
    ])
  );
  const starMap = new Map(stars.map((s) => [s.key, { key: s.key, name: s.name, ma: s.ma, st: s.st, ag: s.ag, pa: s.pa, av: s.av, skillKeys: s.skillKeys }]));

  type PlayerRow = NonNullable<typeof liveMatch>["homeEntry"]["players"][number];
  function mapPlayers(rosterKey: string, players: PlayerRow[]) {
    const positions = positionByRosterKey.get(rosterKey) ?? [];
    return players.map((p) => ({
      id: p.id,
      number: p.number,
      customName: p.customName,
      status: p.status,
      spp: p.spp,
      maIncreases: p.maIncreases,
      stIncreases: p.stIncreases,
      agIncreases: p.agIncreases,
      paIncreases: p.paIncreases,
      avIncreases: p.avIncreases,
      skills: p.skills.map((s) => ({ skillKey: s.skillKey, source: s.source })),
      position: p.positionKey ? (positions.find((x) => x.id === p.positionKey) ?? null) : null,
      star: p.starKey ? (starMap.get(p.starKey) ?? null) : null,
    }));
  }

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
        players: mapPlayers(liveMatch.homeEntry.rosterKey, liveMatch.homeEntry.players),
      }}
      awayTeam={{
        entryId: liveMatch.awayEntry.id,
        teamName: liveMatch.awayEntry.teamName,
        players: mapPlayers(liveMatch.awayEntry.rosterKey, liveMatch.awayEntry.players),
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
      skillCatalog={[...skills, ...traits]}
    />
  );
}
