"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/server/db/prisma";
import { requireUser } from "@/server/auth/requireUser";
import { generateRoundRobinSchedule } from "@/lib/roundRobinSchedule";
import {
  generateBracket,
  recordBracketMatch,
  findBracketMatch,
  isBracketComplete,
  type BracketRound,
} from "@/lib/tournamentBracket";
import { applyBoxScore, countCasualtiesBy } from "./boxScore";
import { cloneRosterIntoEntry } from "./rosterSnapshot";
import { validateInducementPurchases, createInducementPurchases, type EntryForInducements } from "./inducements";
import { generateMagazineIssue, leagueRoundReportIdsIfComplete, bracketRoundLabel, bracketRoundReportIds } from "./magazine";

export type ActionResult = { ok: true } | { ok: false; error: string };

interface Group {
  name: string;
  entryIds: string[];
}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

const scorerSchema = z.object({ entryId: z.string().min(1), playerId: z.string().nullable() });
const injurySchema = z.object({
  attackerEntryId: z.string().min(1),
  attackerPlayerId: z.string().nullable(),
  victimEntryId: z.string().min(1),
  victimPlayerId: z.string().nullable(),
  injuryCode: z.string().nullable(),
  statLoss: z.enum(["MA", "ST", "AG", "PA", "AV"]).nullable(),
});
const inducementSchema = z.object({
  entryId: z.string().min(1),
  inducementKey: z.string().min(1),
  quantity: z.number().int().min(1),
});

/** Trae las reglas especiales de la raza de cada inscripción, para validar Incentivos restringidos. */
async function loadEntriesForInducements(
  entries: { id: string; snapshotTreasury: number; rosterKey: string }[]
): Promise<EntryForInducements[]> {
  const rosterKeys = [...new Set(entries.map((e) => e.rosterKey))];
  const races = await prisma.masterRace.findMany({ where: { key: { in: rosterKeys } }, select: { key: true, specialRules: true } });
  const specialRulesByKey = new Map(races.map((r) => [r.key, r.specialRules]));
  return entries.map((e) => ({
    id: e.id,
    snapshotTreasury: e.snapshotTreasury,
    specialRules: specialRulesByKey.get(e.rosterKey) ?? [],
  }));
}

const createCompetitionSchema = z
  .object({
    name: z.string().min(2, "El nombre debe tener al menos 2 caracteres").max(60, "Máximo 60 caracteres"),
    format: z.enum(["LEAGUE", "TOURNAMENT"]),
    visibility: z.enum(["PUBLIC", "PRIVATE"]),
    maxTeams: z.number().int().min(2, "Mínimo 2 equipos").max(32, "Máximo 32 equipos"),
    hasGroupStage: z.boolean(),
    groupCount: z.number().int().min(2, "Mínimo 2 grupos").max(8, "Máximo 8 grupos").nullable(),
  })
  .refine((v) => v.format === "LEAGUE" || !v.hasGroupStage || v.groupCount !== null, {
    message: "Indica el número de grupos",
    path: ["groupCount"],
  });

/** Crea una liga o un torneo (con o sin fase de grupos) y redirige a su ficha. El creador es el comisario. */
export async function createCompetition(input: {
  name: string;
  format: "LEAGUE" | "TOURNAMENT";
  visibility: "PUBLIC" | "PRIVATE";
  maxTeams: number;
  hasGroupStage: boolean;
  groupCount: number | null;
}): Promise<ActionResult> {
  const dbUser = await requireUser();
  const parsed = createCompetitionSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues.map((i) => i.message).join(" · ") };

  const isTournament = parsed.data.format === "TOURNAMENT";
  const competition = await prisma.competition.create({
    data: {
      name: parsed.data.name,
      format: parsed.data.format,
      commissionerId: dbUser.id,
      visibility: parsed.data.visibility,
      maxTeams: parsed.data.maxTeams,
      hasGroupStage: isTournament && parsed.data.hasGroupStage,
      groupCount: isTournament && parsed.data.hasGroupStage ? parsed.data.groupCount : null,
    },
  });

  revalidatePath("/competiciones");
  revalidatePath("/dashboard");
  redirect(`/competiciones/${competition.id}`);
}

/** Inscribe uno de mis equipos en la competición, si hay hueco y sigue abierta. */
export async function joinCompetition(competitionId: string, managedTeamId: string): Promise<ActionResult> {
  const dbUser = await requireUser();

  const [competition, team] = await Promise.all([
    prisma.competition.findUnique({ where: { id: competitionId }, include: { entries: true } }),
    prisma.managedTeam.findUnique({ where: { id: managedTeamId }, include: { players: { include: { skills: true } } } }),
  ]);
  if (!competition) return { ok: false, error: "Competición no encontrada" };
  if (!team || team.ownerId !== dbUser.id) return { ok: false, error: "No autorizado" };
  if (competition.status !== "OPEN") return { ok: false, error: "La competición ya no acepta inscripciones" };
  if (competition.entries.length >= competition.maxTeams) return { ok: false, error: "La competición está completa" };
  if (competition.entries.some((e) => e.managedTeamId === managedTeamId)) {
    return { ok: false, error: "Ese equipo ya está inscrito" };
  }

  await prisma.$transaction(async (tx) => {
    const entry = await tx.competitionEntry.create({
      data: { competitionId, managedTeamId, ownerId: dbUser.id, teamName: team.name, rosterKey: team.rosterKey },
    });
    await cloneRosterIntoEntry(tx, entry.id, team.treasury, team.players);
  });

  revalidatePath(`/competiciones/${competitionId}`);
  revalidatePath("/competiciones");
  revalidatePath("/dashboard");
  return { ok: true };
}

/**
 * El comisario marca la liga en curso (genera el calendario a doble vuelta
 * y cierra inscripciones) o la finaliza.
 */
export async function setCompetitionStatus(
  competitionId: string,
  status: "IN_PROGRESS" | "FINISHED"
): Promise<ActionResult> {
  const dbUser = await requireUser();
  const competition = await prisma.competition.findUnique({ where: { id: competitionId }, include: { entries: true } });
  if (!competition || competition.commissionerId !== dbUser.id) return { ok: false, error: "No autorizado" };

  if (status === "IN_PROGRESS" && competition.format === "LEAGUE" && competition.status === "OPEN") {
    if (competition.entries.length < 2) return { ok: false, error: "Hacen falta al menos 2 equipos inscritos" };
    const schedule = generateRoundRobinSchedule(competition.entries.map((e) => e.id));
    await prisma.$transaction([
      prisma.competitionFixture.createMany({
        data: schedule.map((f) => ({
          competitionId,
          round: f.round,
          homeEntryId: f.homeEntryId,
          awayEntryId: f.awayEntryId,
        })),
      }),
      prisma.competition.update({ where: { id: competitionId }, data: { status } }),
    ]);
  } else {
    await prisma.competition.update({ where: { id: competitionId }, data: { status } });
  }

  revalidatePath(`/competiciones/${competitionId}`);
  revalidatePath("/competiciones");
  revalidatePath("/dashboard");
  return { ok: true };
}

/**
 * Propone (o borra) la fecha de una jornada. Cualquiera de los dos equipos,
 * o el comisario. Proponer una fecha nueva reinicia la confirmación del
 * rival — hace falta que la otra parte la confirme para darla por acordada.
 */
export async function proposeFixtureSchedule(fixtureId: string, scheduledAt: string | null): Promise<ActionResult> {
  const dbUser = await requireUser();
  const fixture = await prisma.competitionFixture.findUnique({
    where: { id: fixtureId },
    include: { homeEntry: true, awayEntry: true, competition: true },
  });
  if (!fixture) return { ok: false, error: "Partido no encontrado" };
  const isCommissioner = dbUser.id === fixture.competition.commissionerId;
  const myEntryId =
    dbUser.id === fixture.homeEntry.ownerId ? fixture.homeEntryId : dbUser.id === fixture.awayEntry.ownerId ? fixture.awayEntryId : null;
  if (myEntryId === null && !isCommissioner) return { ok: false, error: "No autorizado" };

  await prisma.competitionFixture.update({
    where: { id: fixtureId },
    data: scheduledAt
      ? { scheduledAt: new Date(scheduledAt), proposedByEntryId: myEntryId, confirmedAt: null }
      : { scheduledAt: null, proposedByEntryId: null, confirmedAt: null },
  });

  revalidatePath(`/competiciones/${fixture.competitionId}`);
  return { ok: true };
}

/** El otro equipo (o el comisario) confirma la fecha propuesta para la jornada. */
export async function confirmFixtureSchedule(fixtureId: string): Promise<ActionResult> {
  const dbUser = await requireUser();
  const fixture = await prisma.competitionFixture.findUnique({
    where: { id: fixtureId },
    include: { homeEntry: true, awayEntry: true, competition: true },
  });
  if (!fixture) return { ok: false, error: "Partido no encontrado" };
  if (!fixture.scheduledAt) return { ok: false, error: "Todavía no hay ninguna fecha propuesta" };
  if (fixture.confirmedAt) return { ok: false, error: "Esa fecha ya está confirmada" };

  const isCommissioner = dbUser.id === fixture.competition.commissionerId;
  const myEntryId =
    dbUser.id === fixture.homeEntry.ownerId ? fixture.homeEntryId : dbUser.id === fixture.awayEntry.ownerId ? fixture.awayEntryId : null;
  if (myEntryId === null && !isCommissioner) return { ok: false, error: "No autorizado" };
  if (myEntryId !== null && myEntryId === fixture.proposedByEntryId) {
    return { ok: false, error: "Tiene que confirmarla el rival, no quien la propuso" };
  }

  await prisma.competitionFixture.update({ where: { id: fixtureId }, data: { confirmedAt: new Date() } });

  revalidatePath(`/competiciones/${fixture.competitionId}`);
  return { ok: true };
}

/**
 * El comisario arranca el torneo: si tiene fase de grupos, reparte a los
 * inscritos en grupos al azar (fase "GROUPS"); si no, genera directamente
 * el cuadro de eliminatoria (fase "KNOCKOUT").
 */
export async function startTournament(competitionId: string): Promise<ActionResult> {
  const dbUser = await requireUser();
  const competition = await prisma.competition.findUnique({ where: { id: competitionId }, include: { entries: true } });
  if (!competition || competition.commissionerId !== dbUser.id) return { ok: false, error: "No autorizado" };
  if (competition.format !== "TOURNAMENT") return { ok: false, error: "Esto no es un torneo" };
  if (competition.status !== "OPEN") return { ok: false, error: "El torneo ya se ha iniciado" };
  if (competition.entries.length < 2) return { ok: false, error: "Hacen falta al menos 2 equipos inscritos" };
  if (competition.hasGroupStage && competition.groupCount && competition.entries.length < competition.groupCount * 2) {
    return {
      ok: false,
      error: `Con ${competition.groupCount} grupos hacen falta al menos ${competition.groupCount * 2} equipos inscritos (hay ${competition.entries.length}) — hay grupos que se quedarían sin rivales`,
    };
  }

  if (competition.hasGroupStage && competition.groupCount) {
    const shuffled = shuffle(competition.entries.map((e) => e.id));
    const groups: Group[] = Array.from({ length: competition.groupCount }, (_, i) => ({
      name: `Grupo ${String.fromCharCode(65 + i)}`,
      entryIds: [],
    }));
    shuffled.forEach((entryId, i) => {
      groups[i % groups.length].entryIds.push(entryId);
    });

    await prisma.competition.update({
      where: { id: competitionId },
      data: { status: "IN_PROGRESS", phase: "GROUPS", groups: groups as never },
    });
  } else {
    const bracket = generateBracket(competition.entries.map((e) => e.id));
    await prisma.competition.update({
      where: { id: competitionId },
      data: { status: "IN_PROGRESS", phase: "KNOCKOUT", bracket: bracket as never },
    });
  }

  revalidatePath(`/competiciones/${competitionId}`);
  revalidatePath("/dashboard");
  return { ok: true };
}

/**
 * El comisario cierra la fase de grupos: clasifica a los 2 primeros de cada
 * grupo (por puntos, luego diferencia de touchdowns) y genera el cuadro de
 * eliminatoria con ellos.
 */
export async function closeGroupStage(competitionId: string): Promise<ActionResult> {
  const dbUser = await requireUser();
  const competition = await prisma.competition.findUnique({ where: { id: competitionId }, include: { entries: true } });
  if (!competition || competition.commissionerId !== dbUser.id) return { ok: false, error: "No autorizado" };
  if (competition.phase !== "GROUPS") return { ok: false, error: "Esta competición no está en fase de grupos" };

  const groups = competition.groups as unknown as Group[];
  const entryById = new Map(competition.entries.map((e) => [e.id, e]));

  const qualifiers: string[] = [];
  for (const group of groups) {
    const ranked = [...group.entryIds]
      .map((id) => entryById.get(id))
      .filter((e): e is NonNullable<typeof e> => !!e)
      .sort((a, b) => b.points - a.points || b.tdFor - b.tdAgainst - (a.tdFor - a.tdAgainst));
    qualifiers.push(...ranked.slice(0, 2).map((e) => e.id));
  }

  if (qualifiers.length < 2) return { ok: false, error: "No hay suficientes clasificados para generar el cuadro" };

  const bracket = generateBracket(qualifiers);
  await prisma.competition.update({
    where: { id: competitionId },
    data: { phase: "KNOCKOUT", bracket: bracket as never },
  });

  const groupReports = await prisma.matchReport.findMany({
    where: { competitionId, source: "GROUP" },
    select: { id: true },
  });
  if (groupReports.length > 0) {
    await generateMagazineIssue({
      competitionId,
      kind: "GROUP_STAGE",
      label: "Fase de grupos",
      matchReportIds: groupReports.map((r) => r.id),
    });
  }

  revalidatePath(`/competiciones/${competitionId}`);
  revalidatePath(`/competiciones/${competitionId}/balonazo`);
  revalidatePath("/dashboard");
  return { ok: true };
}

const resultDetailSchema = z.object({
  homeScore: z.number().int().min(0).max(30),
  awayScore: z.number().int().min(0).max(30),
  scorers: z.array(scorerSchema).max(60),
  injuries: z.array(injurySchema).max(32),
  inducements: z.array(inducementSchema).max(20).optional(),
});

/**
 * Registra el resultado de la jornada de calendario indicada (Liguilla con
 * calendario fijo). El detalle de anotadores/lesiones es opcional.
 */
export async function recordFixtureResult(
  fixtureId: string,
  input: z.infer<typeof resultDetailSchema>
): Promise<ActionResult> {
  const dbUser = await requireUser();
  const parsed = resultDetailSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues.map((i) => i.message).join(" · ") };

  const fixture = await prisma.competitionFixture.findUnique({
    where: { id: fixtureId },
    include: {
      homeEntry: true,
      awayEntry: true,
      competition: true,
    },
  });
  if (!fixture) return { ok: false, error: "Partido no encontrado" };
  if (fixture.matchReportId) return { ok: false, error: "Ese partido ya tiene resultado" };

  const isParticipant = dbUser.id === fixture.homeEntry.ownerId || dbUser.id === fixture.awayEntry.ownerId;
  const isCommissioner = dbUser.id === fixture.competition.commissionerId;
  if (!isParticipant && !isCommissioner) return { ok: false, error: "No autorizado" };

  const { homeScore, awayScore, scorers, injuries, inducements = [] } = parsed.data;
  const casFor = countCasualtiesBy(injuries, fixture.homeEntryId);
  const casAgainst = countCasualtiesBy(injuries, fixture.awayEntryId);
  const homePoints = homeScore > awayScore ? 3 : homeScore === awayScore ? 1 : 0;
  const awayPoints = awayScore > homeScore ? 3 : awayScore === homeScore ? 1 : 0;

  const inducementEntries = await loadEntriesForInducements([fixture.homeEntry, fixture.awayEntry]);
  const priced = await validateInducementPurchases(inducements, inducementEntries);
  if (!priced.ok) return { ok: false, error: priced.error };

  await prisma.$transaction(async (tx) => {
    const report = await tx.matchReport.create({
      data: {
        competitionId: fixture.competitionId,
        homeEntryId: fixture.homeEntryId,
        awayEntryId: fixture.awayEntryId,
        homeScore,
        awayScore,
        source: "FIXTURE",
      },
    });
    await createInducementPurchases(tx, report.id, priced.priced);
    await tx.competitionFixture.update({ where: { id: fixtureId }, data: { matchReportId: report.id } });
    await tx.competitionEntry.update({
      where: { id: fixture.homeEntryId },
      data: {
        played: { increment: 1 },
        won: { increment: homeScore > awayScore ? 1 : 0 },
        drawn: { increment: homeScore === awayScore ? 1 : 0 },
        lost: { increment: homeScore < awayScore ? 1 : 0 },
        tdFor: { increment: homeScore },
        tdAgainst: { increment: awayScore },
        casFor: { increment: casFor },
        casAgainst: { increment: casAgainst },
        points: { increment: homePoints },
      },
    });
    await tx.competitionEntry.update({
      where: { id: fixture.awayEntryId },
      data: {
        played: { increment: 1 },
        won: { increment: awayScore > homeScore ? 1 : 0 },
        drawn: { increment: awayScore === homeScore ? 1 : 0 },
        lost: { increment: awayScore < homeScore ? 1 : 0 },
        tdFor: { increment: awayScore },
        tdAgainst: { increment: homeScore },
        casFor: { increment: casAgainst },
        casAgainst: { increment: casFor },
        points: { increment: awayPoints },
      },
    });
    await applyBoxScore(
      tx,
      report.id,
      {
        competitionId: fixture.competitionId,
        homeEntryId: fixture.homeEntryId,
        homeTeamName: fixture.homeEntry.teamName,
        awayEntryId: fixture.awayEntryId,
        awayTeamName: fixture.awayEntry.teamName,
        homeScore,
        awayScore,
      },
      scorers,
      injuries
    );
  });

  const reportIds = await leagueRoundReportIdsIfComplete(fixture.competitionId, fixture.round);
  if (reportIds) {
    await generateMagazineIssue({
      competitionId: fixture.competitionId,
      kind: "ROUND",
      label: `Jornada ${fixture.round}`,
      matchReportIds: reportIds,
    });
  }

  revalidatePath(`/competiciones/${fixture.competitionId}`);
  revalidatePath(`/competiciones/${fixture.competitionId}/balonazo`);
  revalidatePath("/dashboard");
  return { ok: true };
}

const groupResultSchema = resultDetailSchema.extend({
  homeEntryId: z.string().min(1),
  awayEntryId: z.string().min(1),
});

/**
 * Registra el resultado de un partido de fase de grupos (torneo) entre dos
 * equipos del mismo grupo. Cualquiera de los dos entrenadores, o el
 * comisario, puede registrarlo. Fórmula oficial de puntos: 3/1/0.
 */
export async function recordMatchResult(
  competitionId: string,
  input: z.infer<typeof groupResultSchema>
): Promise<ActionResult> {
  const dbUser = await requireUser();
  const parsed = groupResultSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues.map((i) => i.message).join(" · ") };
  if (parsed.data.homeEntryId === parsed.data.awayEntryId) {
    return { ok: false, error: "Un equipo no puede jugar contra sí mismo" };
  }

  const competition = await prisma.competition.findUnique({ where: { id: competitionId } });
  if (!competition) return { ok: false, error: "Competición no encontrada" };
  if (competition.format !== "TOURNAMENT" || competition.phase !== "GROUPS") {
    return { ok: false, error: "Esta acción es solo para la fase de grupos de un torneo" };
  }

  const [homeEntry, awayEntry] = await Promise.all([
    prisma.competitionEntry.findUnique({ where: { id: parsed.data.homeEntryId } }),
    prisma.competitionEntry.findUnique({ where: { id: parsed.data.awayEntryId } }),
  ]);
  if (!homeEntry || !awayEntry || homeEntry.competitionId !== competitionId || awayEntry.competitionId !== competitionId) {
    return { ok: false, error: "Equipos inválidos para esta competición" };
  }

  const groups = competition.groups as unknown as Group[];
  const sameGroup = groups.some((g) => g.entryIds.includes(homeEntry.id) && g.entryIds.includes(awayEntry.id));
  if (!sameGroup) return { ok: false, error: "Esos dos equipos no están en el mismo grupo" };

  const isParticipant = dbUser.id === homeEntry.ownerId || dbUser.id === awayEntry.ownerId;
  const isCommissioner = dbUser.id === competition.commissionerId;
  if (!isParticipant && !isCommissioner) return { ok: false, error: "No autorizado" };

  const { homeScore, awayScore, scorers, injuries, inducements = [] } = parsed.data;
  const casFor = countCasualtiesBy(injuries, homeEntry.id);
  const casAgainst = countCasualtiesBy(injuries, awayEntry.id);
  const homePoints = homeScore > awayScore ? 3 : homeScore === awayScore ? 1 : 0;
  const awayPoints = awayScore > homeScore ? 3 : awayScore === homeScore ? 1 : 0;

  const inducementEntries = await loadEntriesForInducements([homeEntry, awayEntry]);
  const priced = await validateInducementPurchases(inducements, inducementEntries);
  if (!priced.ok) return { ok: false, error: priced.error };

  await prisma.$transaction(async (tx) => {
    const report = await tx.matchReport.create({
      data: { competitionId, homeEntryId: homeEntry.id, awayEntryId: awayEntry.id, homeScore, awayScore, source: "GROUP" },
    });
    await createInducementPurchases(tx, report.id, priced.priced);
    await tx.competitionEntry.update({
      where: { id: homeEntry.id },
      data: {
        played: { increment: 1 },
        won: { increment: homeScore > awayScore ? 1 : 0 },
        drawn: { increment: homeScore === awayScore ? 1 : 0 },
        lost: { increment: homeScore < awayScore ? 1 : 0 },
        tdFor: { increment: homeScore },
        tdAgainst: { increment: awayScore },
        casFor: { increment: casFor },
        casAgainst: { increment: casAgainst },
        points: { increment: homePoints },
      },
    });
    await tx.competitionEntry.update({
      where: { id: awayEntry.id },
      data: {
        played: { increment: 1 },
        won: { increment: awayScore > homeScore ? 1 : 0 },
        drawn: { increment: awayScore === homeScore ? 1 : 0 },
        lost: { increment: awayScore < homeScore ? 1 : 0 },
        tdFor: { increment: awayScore },
        tdAgainst: { increment: homeScore },
        casFor: { increment: casAgainst },
        casAgainst: { increment: casFor },
        points: { increment: awayPoints },
      },
    });
    await applyBoxScore(
      tx,
      report.id,
      {
        competitionId,
        homeEntryId: homeEntry.id,
        homeTeamName: homeEntry.teamName,
        awayEntryId: awayEntry.id,
        awayTeamName: awayEntry.teamName,
        homeScore,
        awayScore,
      },
      scorers,
      injuries
    );
  });

  revalidatePath(`/competiciones/${competitionId}`);
  revalidatePath("/dashboard");
  return { ok: true };
}

const bracketResultSchema = z.object({
  matchId: z.string().min(1),
  homeScore: z.number().int().min(0).max(30),
  awayScore: z.number().int().min(0).max(30),
  scorers: z.array(scorerSchema).max(60),
  injuries: z.array(injurySchema).max(32),
  inducements: z.array(inducementSchema).max(20).optional(),
});

/** Registra el resultado de un partido del cuadro de eliminatoria y avanza al ganador. */
export async function recordBracketResult(
  competitionId: string,
  input: z.infer<typeof bracketResultSchema>
): Promise<ActionResult> {
  const dbUser = await requireUser();
  const parsed = bracketResultSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues.map((i) => i.message).join(" · ") };
  if (parsed.data.homeScore === parsed.data.awayScore) {
    return { ok: false, error: "No hay empates en eliminatoria — un equipo debe ganar" };
  }

  const competition = await prisma.competition.findUnique({ where: { id: competitionId } });
  if (!competition) return { ok: false, error: "Competición no encontrada" };
  if (competition.phase !== "KNOCKOUT") return { ok: false, error: "El cuadro todavía no está generado" };

  const rounds = competition.bracket as unknown as BracketRound[];
  const match = findBracketMatch(rounds, parsed.data.matchId);
  if (!match) return { ok: false, error: "Partido no encontrado en el cuadro" };
  if (match.winnerEntryId) return { ok: false, error: "Ese partido ya tiene resultado" };
  if (!match.homeEntryId || !match.awayEntryId) {
    return { ok: false, error: "Todavía faltan equipos por clasificar a este partido" };
  }

  const [homeEntry, awayEntry] = await Promise.all([
    prisma.competitionEntry.findUnique({ where: { id: match.homeEntryId } }),
    prisma.competitionEntry.findUnique({ where: { id: match.awayEntryId } }),
  ]);
  if (!homeEntry || !awayEntry) return { ok: false, error: "Equipos inválidos" };

  const isParticipant = dbUser.id === homeEntry.ownerId || dbUser.id === awayEntry.ownerId;
  const isCommissioner = dbUser.id === competition.commissionerId;
  if (!isParticipant && !isCommissioner) return { ok: false, error: "No autorizado" };

  const { homeScore, awayScore, scorers, injuries, inducements = [] } = parsed.data;
  const casFor = countCasualtiesBy(injuries, homeEntry.id);
  const casAgainst = countCasualtiesBy(injuries, awayEntry.id);
  const updatedBracket = recordBracketMatch(rounds, parsed.data.matchId, homeScore, awayScore);
  const finished = isBracketComplete(updatedBracket);

  const inducementEntries = await loadEntriesForInducements([homeEntry, awayEntry]);
  const priced = await validateInducementPurchases(inducements, inducementEntries);
  if (!priced.ok) return { ok: false, error: priced.error };

  await prisma.$transaction(async (tx) => {
    const report = await tx.matchReport.create({
      data: { competitionId, homeEntryId: homeEntry.id, awayEntryId: awayEntry.id, homeScore, awayScore, source: "BRACKET" },
    });
    await createInducementPurchases(tx, report.id, priced.priced);
    await tx.competitionEntry.update({
      where: { id: homeEntry.id },
      data: {
        played: { increment: 1 },
        tdFor: { increment: homeScore },
        tdAgainst: { increment: awayScore },
        casFor: { increment: casFor },
        casAgainst: { increment: casAgainst },
      },
    });
    await tx.competitionEntry.update({
      where: { id: awayEntry.id },
      data: {
        played: { increment: 1 },
        tdFor: { increment: awayScore },
        tdAgainst: { increment: homeScore },
        casFor: { increment: casAgainst },
        casAgainst: { increment: casFor },
      },
    });
    await tx.competition.update({
      where: { id: competitionId },
      data: { bracket: updatedBracket as never, ...(finished ? { status: "FINISHED" as const } : {}) },
    });
    await applyBoxScore(
      tx,
      report.id,
      {
        competitionId,
        homeEntryId: homeEntry.id,
        homeTeamName: homeEntry.teamName,
        awayEntryId: awayEntry.id,
        awayTeamName: awayEntry.teamName,
        homeScore,
        awayScore,
      },
      scorers,
      injuries
    );
  });

  const playedRound = rounds.find((r) => r.matches.some((m) => m.id === parsed.data.matchId));
  const updatedRound = updatedBracket.find((r) => r.round === playedRound?.round);
  if (updatedRound && updatedRound.matches.every((m) => m.winnerEntryId !== null)) {
    const reportIds = await bracketRoundReportIds(competitionId, updatedRound.matches);
    if (reportIds.length > 0) {
      await generateMagazineIssue({
        competitionId,
        kind: "KNOCKOUT_ROUND",
        label: bracketRoundLabel(updatedRound.round, updatedBracket.length),
        matchReportIds: reportIds,
      });
    }
  }

  revalidatePath(`/competiciones/${competitionId}`);
  revalidatePath(`/competiciones/${competitionId}/balonazo`);
  revalidatePath("/dashboard");
  return { ok: true };
}

const editResultSchema = z.object({
  homeScore: z.number().int().min(0).max(30),
  awayScore: z.number().int().min(0).max(30),
});

/**
 * El comisario corrige el marcador de un resultado ya registrado (errores de
 * tecleo, etc.) y recalcula la clasificación en consecuencia. Deja rastro
 * de auditoría (quién y cuándo). Solo cubre el marcador — no permite tocar
 * ya anotadores/lesiones, porque los PE que hayan repartido pueden haberse
 * gastado ya en subidas de nivel y no son seguros de deshacer. Los
 * resultados de cuadro de eliminatoria (BRACKET) tampoco son editables
 * todavía: el cuadro guarda su propio marcador en Competition.bracket y
 * no está sincronizado con MatchReport.
 */
export async function editMatchResult(matchReportId: string, input: z.infer<typeof editResultSchema>): Promise<ActionResult> {
  const dbUser = await requireUser();
  const parsed = editResultSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues.map((i) => i.message).join(" · ") };

  const report = await prisma.matchReport.findUnique({
    where: { id: matchReportId },
    include: { competition: true },
  });
  if (!report || !report.competition || !report.homeEntryId || !report.awayEntryId) {
    return { ok: false, error: "Partido no encontrado" };
  }
  if (dbUser.id !== report.competition.commissionerId) return { ok: false, error: "Solo el comisario puede editar un resultado" };
  if (report.source === "BRACKET") {
    return { ok: false, error: "Los resultados del cuadro de eliminatoria no se pueden editar todavía" };
  }

  const { homeScore: newHome, awayScore: newAway } = parsed.data;
  const oldHome = report.homeScore;
  const oldAway = report.awayScore;
  const pointsOf = (forScore: number, againstScore: number) => (forScore > againstScore ? 3 : forScore === againstScore ? 1 : 0);

  await prisma.$transaction([
    prisma.matchReport.update({
      where: { id: matchReportId },
      data: { homeScore: newHome, awayScore: newAway, editedAt: new Date(), editedById: dbUser.id },
    }),
    prisma.competitionEntry.update({
      where: { id: report.homeEntryId },
      data: {
        won: { increment: (newHome > newAway ? 1 : 0) - (oldHome > oldAway ? 1 : 0) },
        drawn: { increment: (newHome === newAway ? 1 : 0) - (oldHome === oldAway ? 1 : 0) },
        lost: { increment: (newHome < newAway ? 1 : 0) - (oldHome < oldAway ? 1 : 0) },
        tdFor: { increment: newHome - oldHome },
        tdAgainst: { increment: newAway - oldAway },
        points: { increment: pointsOf(newHome, newAway) - pointsOf(oldHome, oldAway) },
      },
    }),
    prisma.competitionEntry.update({
      where: { id: report.awayEntryId },
      data: {
        won: { increment: (newAway > newHome ? 1 : 0) - (oldAway > oldHome ? 1 : 0) },
        drawn: { increment: (newAway === newHome ? 1 : 0) - (oldAway === oldHome ? 1 : 0) },
        lost: { increment: (newAway < newHome ? 1 : 0) - (oldAway < oldHome ? 1 : 0) },
        tdFor: { increment: newAway - oldAway },
        tdAgainst: { increment: newHome - oldHome },
        points: { increment: pointsOf(newAway, newHome) - pointsOf(oldAway, oldHome) },
      },
    }),
  ]);

  revalidatePath(`/competiciones/${report.competitionId}`);
  revalidatePath("/dashboard");
  return { ok: true };
}
