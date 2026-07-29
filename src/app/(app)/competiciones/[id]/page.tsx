import { notFound } from "next/navigation";
import { requireUser } from "@/server/auth/requireUser";
import { prisma } from "@/server/db/prisma";
import { cloneRosterIntoEntry } from "../rosterSnapshot";
import CompetitionDetail from "./CompetitionDetail";

export default async function CompetitionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const dbUser = await requireUser();

  const competition = await prisma.competition.findUnique({
    where: { id },
    include: {
      entries: {
        include: {
          managedTeam: { include: { players: { include: { skills: true } } } },
          players: { include: { skills: true } },
        },
        orderBy: { points: "desc" },
      },
      matchReports: {
        include: {
          homeEntry: true,
          awayEntry: true,
          editedBy: { select: { displayName: true } },
        },
        orderBy: { playedAt: "desc" },
        take: 20,
      },
      commissioner: { select: { displayName: true } },
      fixtures: { include: { matchReport: true }, orderBy: { round: "asc" } },
    },
  });
  if (!competition) notFound();

  // Inscripciones creadas antes de que existiera la plantilla-copia por
  // competición: se rellenan aquí mismo, una sola vez, clonando la
  // plantilla real tal como está hoy.
  // Si el equipo real ya se disolvió (managedTeam null), no hay de dónde
  // clonar — se deja como plantilla vacía en vez de romper la página.
  const needsBackfill = competition.entries.filter((e) => e.players.length === 0 && e.managedTeam);
  if (needsBackfill.length > 0) {
    await prisma.$transaction(async (tx) => {
      for (const e of needsBackfill) {
        await cloneRosterIntoEntry(tx, e.id, e.managedTeam!.treasury, e.managedTeam!.players);
      }
    });
    const refreshed = await prisma.competitionPlayer.findMany({
      where: { entryId: { in: needsBackfill.map((e) => e.id) } },
      include: { skills: true },
    });
    const byEntry = new Map<string, typeof refreshed>();
    for (const p of refreshed) byEntry.set(p.entryId, [...(byEntry.get(p.entryId) ?? []), p]);
    for (const e of competition.entries) {
      const backfilled = byEntry.get(e.id);
      if (backfilled) e.players = backfilled;
    }
  }

  const rosterKeys = [...new Set(competition.entries.map((e) => e.rosterKey))];

  const [injuryCatalog, scorers, injuries, races, inducementCatalog] = await Promise.all([
    prisma.masterInjuryEntry.findMany({ select: { code: true, name: true, permanentStatLoss: true }, orderBy: { name: "asc" } }),
    prisma.matchScorer.findMany({
      where: { matchReport: { competitionId: id } },
      include: { player: true, entry: true },
    }),
    prisma.matchInjury.findMany({
      where: { matchReport: { competitionId: id } },
      include: {
        attackerPlayer: true,
        victimPlayer: true,
        attackerEntry: true,
        victimEntry: true,
      },
    }),
    prisma.masterRace.findMany({ where: { key: { in: rosterKeys } }, select: { key: true, specialRules: true } }),
    prisma.masterInducement.findMany({ where: { cost: { not: null } }, orderBy: { sortOrder: "asc" } }),
  ]);

  const specialRulesByRosterKey = new Map(races.map((r) => [r.key, r.specialRules]));
  const entryMeta = Object.fromEntries(
    competition.entries.map((e) => [
      e.id,
      { snapshotTreasury: e.snapshotTreasury, specialRules: specialRulesByRosterKey.get(e.rosterKey) ?? [] },
    ])
  );

  const injuryNameByCode = Object.fromEntries(injuryCatalog.map((i) => [i.code, i.name]));

  const tdTally = new Map<string, { name: string; teamName: string; count: number }>();
  for (const s of scorers) {
    if (!s.player) continue;
    const cur = tdTally.get(s.player.id) ?? { name: s.player.customName, teamName: s.entry.teamName, count: 0 };
    cur.count += 1;
    tdTally.set(s.player.id, cur);
  }
  const casTally = new Map<string, { name: string; teamName: string; count: number }>();
  for (const inj of injuries) {
    if (!inj.attackerPlayer) continue;
    const cur = casTally.get(inj.attackerPlayer.id) ?? {
      name: inj.attackerPlayer.customName,
      teamName: inj.attackerEntry.teamName,
      count: 0,
    };
    cur.count += 1;
    casTally.set(inj.attackerPlayer.id, cur);
  }

  const stats = {
    topScorers: [...tdTally.values()].sort((a, b) => b.count - a.count).slice(0, 5),
    topBashers: [...casTally.values()].sort((a, b) => b.count - a.count).slice(0, 5),
    injuryLog: injuries
      .slice()
      .reverse()
      .slice(0, 10)
      .map((inj) => ({
        id: inj.id,
        victimName: inj.victimPlayer?.customName ?? null,
        victimTeamName: inj.victimEntry.teamName,
        attackerName: inj.attackerPlayer?.customName ?? null,
        attackerTeamName: inj.attackerEntry.teamName,
        injuryName: inj.injuryCode ? (injuryNameByCode[inj.injuryCode] ?? inj.injuryCode) : null,
      })),
  };

  // Un mismo usuario puede tener varios de sus equipos inscritos en la
  // misma competición (ej. un torneo casero con varios equipos propios,
  // uno por hijo/a, todos desde una sola cuenta) — nada en el modelo lo
  // impide, así que aquí se maneja como una lista, no un único "mi equipo".
  const myEntries = competition.entries.filter((e) => e.ownerId === dbUser.id);
  const isCommissioner = competition.commissionerId === dbUser.id;

  // Privadas: solo visibles para el comisario o un equipo ya inscrito.
  if (competition.visibility === "PRIVATE" && !isCommissioner && myEntries.length === 0) notFound();

  const enteredTeamIds = competition.entries.map((e) => e.managedTeamId).filter((tid): tid is string => tid !== null);
  const myJoinableTeams = await prisma.managedTeam.findMany({
    where: { ownerId: dbUser.id, isGuest: false, id: { notIn: enteredTeamIds } },
    select: { id: true, name: true },
  });

  const entryNameById = Object.fromEntries(competition.entries.map((e) => [e.id, e.teamName]));
  const rosterByEntry = Object.fromEntries(
    competition.entries.map((e) => [e.id, e.players.map((p) => ({ id: p.id, name: `#${p.number} ${p.customName}` }))])
  );

  // Datos de "Mi plantilla de esta competición" para CADA equipo propio
  // inscrito — mismos catálogos que usa Mis Equipos, cacheados por raza para
  // no repetir la consulta si varios equipos propios comparten raza.
  const rosterDataByRaceKey = new Map<string, Awaited<ReturnType<typeof loadMyRosterData>>>();
  const myRosters: {
    entryId: string;
    teamName: string;
    snapshotTreasury: number;
    players: (typeof myEntries)[number]["players"];
    roster: Awaited<ReturnType<typeof loadMyRosterData>>;
  }[] = [];
  for (const entry of myEntries) {
    const raceKey = entry.rosterKey;
    if (!rosterDataByRaceKey.has(raceKey)) {
      rosterDataByRaceKey.set(raceKey, await loadMyRosterData(raceKey));
    }
    myRosters.push({
      entryId: entry.id,
      teamName: entry.teamName,
      snapshotTreasury: entry.snapshotTreasury,
      players: entry.players,
      roster: rosterDataByRaceKey.get(raceKey)!,
    });
  }

  return (
    <CompetitionDetail
      competition={{
        id: competition.id,
        name: competition.name,
        format: competition.format,
        status: competition.status,
        visibility: competition.visibility,
        maxTeams: competition.maxTeams,
        commissionerName: competition.commissioner.displayName,
        hasGroupStage: competition.hasGroupStage,
        phase: competition.phase as "GROUPS" | "KNOCKOUT" | null,
        groups: competition.groups as unknown as { name: string; entryIds: string[] }[],
        bracket: competition.bracket as unknown as never,
      }}
      entries={competition.entries.map((e) => ({
        id: e.id,
        teamName: e.teamName,
        played: e.played,
        won: e.won,
        drawn: e.drawn,
        lost: e.lost,
        tdFor: e.tdFor,
        tdAgainst: e.tdAgainst,
        casFor: e.casFor,
        casAgainst: e.casAgainst,
        points: e.points,
      }))}
      entryNameById={entryNameById}
      matchReports={competition.matchReports.map((m) => ({
        id: m.id,
        homeEntryId: m.homeEntryId,
        awayEntryId: m.awayEntryId,
        homeTeamName: m.homeEntry?.teamName ?? "?",
        awayTeamName: m.awayEntry?.teamName ?? "?",
        homeScore: m.homeScore,
        awayScore: m.awayScore,
        playedAt: m.playedAt.toISOString(),
        headline: m.headline,
        article: m.article,
        source: m.source,
        editedAt: m.editedAt ? m.editedAt.toISOString() : null,
        editedByName: m.editedBy?.displayName ?? null,
      }))}
      isCommissioner={isCommissioner}
      canRecordResult={isCommissioner || myEntries.length > 0}
      myJoinableTeams={myJoinableTeams}
      fixtures={competition.fixtures.map((f) => ({
        id: f.id,
        round: f.round,
        homeEntryId: f.homeEntryId,
        awayEntryId: f.awayEntryId,
        homeTeamName: entryNameById[f.homeEntryId] ?? "?",
        awayTeamName: entryNameById[f.awayEntryId] ?? "?",
        scheduledAt: f.scheduledAt ? f.scheduledAt.toISOString() : null,
        proposedByEntryId: f.proposedByEntryId,
        confirmedAt: f.confirmedAt ? f.confirmedAt.toISOString() : null,
        homeScore: f.matchReport?.homeScore ?? null,
        awayScore: f.matchReport?.awayScore ?? null,
      }))}
      rosterByEntry={rosterByEntry}
      entryMeta={entryMeta}
      injuryCatalog={injuryCatalog}
      inducementCatalog={inducementCatalog.map((i) => ({
        key: i.key,
        name: i.name,
        cost: i.cost!,
        maxCount: i.maxCount,
        restriction: i.restriction,
      }))}
      stats={stats}
      myEntryIds={myEntries.map((e) => e.id)}
      myRosters={myRosters.map((m) => ({
        entryId: m.entryId,
        teamName: m.teamName,
        snapshotTreasury: m.snapshotTreasury,
        players: m.players.map((p) => ({
          id: p.id,
          number: p.number,
          customName: p.customName,
          positionKey: p.positionKey,
          starKey: p.starKey,
          spp: p.spp,
          status: p.status,
          maIncreases: p.maIncreases,
          stIncreases: p.stIncreases,
          agIncreases: p.agIncreases,
          paIncreases: p.paIncreases,
          avIncreases: p.avIncreases,
          skills: p.skills.map((s) => ({ skillKey: s.skillKey, source: s.source })),
        })),
        race: m.roster.race,
        stars: m.roster.stars,
        skills: m.roster.skills,
        traits: m.roster.traits,
      }))}
    />
  );
}

async function loadMyRosterData(rosterKey: string) {
  const [race, allStars, skills, traits] = await Promise.all([
    prisma.masterRace.findUnique({
      where: { key: rosterKey },
      include: { positions: { orderBy: { sortOrder: "asc" } } },
    }),
    prisma.masterStarPlayer.findMany({ orderBy: { name: "asc" } }),
    prisma.masterSkill.findMany({ select: { key: true, name: true, description: true, isElite: true, category: true } }),
    prisma.masterTrait.findMany({ select: { name: true, description: true } }),
  ]);
  const stars = race ? allStars.filter((s) => s.playsForAny || s.leagues.some((l) => race.leagues.includes(l))) : [];
  return { race, stars, skills, traits };
}
