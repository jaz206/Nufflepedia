import type { Prisma } from "@prisma/client";
import { prisma } from "@/server/db/prisma";
import { generateText } from "@/lib/gemini";

/**
 * Balonazo Sangriento: revista generada con IA a partir de datos reales de
 * una jornada de liguilla terminada o una fase de torneo completada. Ver
 * MagazineIssue en schema.prisma. Todo fallo de generación se traga aquí
 * (best-effort) — nunca debe romper el registro del resultado que la
 * dispara, ver los llamadores en actions.ts.
 */

const STYLE_PRIMER = `
Eres uno de los redactores de "Balonazo Sangriento", una revista de fans de Blood Bowl
escrita por y para un grupo de amigos que juega su propia liga casera. El tono es
gamberro, exagerado, con mucho cachondeo y sin piedad con los propios jugadores/equipos
(en broma, nunca en serio de verdad) — al estilo de la prensa deportiva sensacionalista,
ambientado en el universo Blood Bowl (sangre, faltas, apuestas, Nuffle, etc).
Escribe SIEMPRE en español, con la terminología oficial de Blood Bowl (touchdown,
placaje, esquive, MO para monedas de oro, etc). No inventes resultados, marcadores,
jugadores ni datos que no aparezcan en la información real proporcionada a
continuación — puedes exagerar el tono y añadir color, pero los HECHOS (quién ganó,
quién marcó, quién lesionó a quién) deben ser exactamente los que se te dan. No uses
markdown ni asteriscos, solo texto plano con párrafos separados por líneas en blanco.
`.trim();

interface EntryStanding {
  id: string;
  teamName: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  tdFor: number;
  tdAgainst: number;
  casFor: number;
  casAgainst: number;
  points: number;
}

function sortEntries(entries: EntryStanding[]): EntryStanding[] {
  return [...entries].sort(
    (a, b) => b.points - a.points || b.tdFor - b.tdAgainst - (a.tdFor - a.tdAgainst) || b.tdFor - a.tdFor
  );
}

/** Todos los partidos de una jornada de liguilla ya tienen resultado: devuelve sus MatchReport.id, o null si aún falta alguno. */
export async function leagueRoundReportIdsIfComplete(competitionId: string, round: number): Promise<string[] | null> {
  const fixtures = await prisma.competitionFixture.findMany({ where: { competitionId, round } });
  if (fixtures.length === 0 || fixtures.some((f) => !f.matchReportId)) return null;
  return fixtures.map((f) => f.matchReportId).filter((id): id is string => !!id);
}

/**
 * Resuelve los MatchReport (source BRACKET) de los partidos ya jugados de
 * una ronda del cuadro. El cuadro no guarda el id del MatchReport de cada
 * partido, pero en eliminatoria simple cada pareja de inscripciones solo se
 * enfrenta una vez en todo el torneo, así que empareja por (home, away) en
 * cualquier orden. Los "bye" (sin rival) se ignoran, no generan MatchReport.
 */
export async function bracketRoundReportIds(
  competitionId: string,
  matches: { homeEntryId: string | null; awayEntryId: string | null }[]
): Promise<string[]> {
  const pairs = matches.filter((m) => m.homeEntryId && m.awayEntryId);
  if (pairs.length === 0) return [];
  const reports = await prisma.matchReport.findMany({
    where: { competitionId, source: "BRACKET" },
    select: { id: true, homeEntryId: true, awayEntryId: true },
  });
  const ids: string[] = [];
  for (const m of pairs) {
    const found = reports.find(
      (r) =>
        (r.homeEntryId === m.homeEntryId && r.awayEntryId === m.awayEntryId) ||
        (r.homeEntryId === m.awayEntryId && r.awayEntryId === m.homeEntryId)
    );
    if (found) ids.push(found.id);
  }
  return ids;
}

/** "Final" / "Semifinal" / "Cuartos de final"... según lo cerca que esté esta ronda del final del cuadro. */
export function bracketRoundLabel(roundIndex: number, totalRounds: number): string {
  const fromEnd = totalRounds - roundIndex + 1;
  if (fromEnd === 1) return "Final";
  if (fromEnd === 2) return "Semifinal";
  if (fromEnd === 3) return "Cuartos de final";
  if (fromEnd === 4) return "Octavos de final";
  return `Ronda ${roundIndex} de eliminatoria`;
}

async function pickNextTarget(competitionId: string): Promise<{ name: string; teamName: string; statLine: string } | null> {
  const topAttacker = await prisma.matchInjury.groupBy({
    by: ["attackerPlayerId"],
    where: { attackerPlayerId: { not: null }, matchReport: { competitionId } },
    _count: { attackerPlayerId: true },
    orderBy: { _count: { attackerPlayerId: "desc" } },
    take: 1,
  });
  if (topAttacker.length && topAttacker[0].attackerPlayerId) {
    const player = await prisma.competitionPlayer.findUnique({
      where: { id: topAttacker[0].attackerPlayerId },
      include: { entry: true },
    });
    if (player) {
      return { name: player.customName, teamName: player.entry.teamName, statLine: `${topAttacker[0]._count.attackerPlayerId} bajas causadas en lo que va de competición` };
    }
  }

  const topScorer = await prisma.matchScorer.groupBy({
    by: ["playerId"],
    where: { playerId: { not: null }, matchReport: { competitionId } },
    _count: { playerId: true },
    orderBy: { _count: { playerId: "desc" } },
    take: 1,
  });
  if (topScorer.length && topScorer[0].playerId) {
    const player = await prisma.competitionPlayer.findUnique({
      where: { id: topScorer[0].playerId },
      include: { entry: true },
    });
    if (player) {
      return { name: player.customName, teamName: player.entry.teamName, statLine: `${topScorer[0]._count.playerId} touchdowns en lo que va de competición` };
    }
  }
  return null;
}

/** Estrella fichada por algún inscrito, o si nadie ha fichado ninguna, una elegible para las razas presentes — rota de forma determinista por número de revista. */
async function pickLegendStarKey(competitionId: string, issueNumber: number): Promise<string | null> {
  const hired = await prisma.competitionPlayer.findMany({
    where: { starKey: { not: null }, entry: { competitionId } },
    select: { starKey: true },
    distinct: ["starKey"],
  });
  const hiredKeys = hired.map((h) => h.starKey).filter((k): k is string => !!k);
  if (hiredKeys.length > 0) return hiredKeys[issueNumber % hiredKeys.length];

  const entries = await prisma.competitionEntry.findMany({ where: { competitionId }, select: { rosterKey: true } });
  const rosterKeys = [...new Set(entries.map((e) => e.rosterKey))];
  if (rosterKeys.length === 0) return null;
  const races = await prisma.masterRace.findMany({ where: { key: { in: rosterKeys } } });
  const raceLeagues = [...new Set(races.flatMap((r) => r.leagues))];
  const stars = await prisma.masterStarPlayer.findMany({
    where: { OR: [{ playsForAny: true }, { leagues: { hasSome: raceLeagues } }] },
  });
  if (stars.length === 0) return null;
  return stars[issueNumber % stars.length].key;
}

/** Devuelve el lore guardado de la estrella, o lo genera una vez con IA y lo persiste si todavía no existe. */
async function ensureStarLore(starKey: string): Promise<string> {
  const star = await prisma.masterStarPlayer.findUnique({ where: { key: starKey } });
  if (!star) return "";
  if (star.lore) return star.lore;

  const prompt = `${STYLE_PRIMER}

Escribe la biografía y trasfondo (2-3 párrafos) de este Jugador Estrella de Blood Bowl
para la sección "Leyendas vivas", a partir de su ficha real:
Nombre: ${star.name}
Coste: ${star.cost} MO
Movimiento ${star.ma} / Fuerza ${star.st} / Agilidad ${star.ag}+ / Pase ${star.pa ?? "—"} / Armadura ${star.av}+
Habilidades: ${star.skillKeys.join(", ") || "ninguna registrada"}
${star.specialRuleName ? `Regla especial: ${star.specialRuleName} — ${star.specialRuleText ?? ""}` : ""}
No repitas el nombre del jugador como título ni empieces con un encabezado — empieza directamente por el primer párrafo.`;

  try {
    const lore = await generateText(prompt);
    await prisma.masterStarPlayer.update({ where: { key: starKey }, data: { lore } });
    return lore;
  } catch (err) {
    console.error("[Balonazo Sangriento] fallo generando lore de estrella:", err);
    return `${star.name} es una leyenda de los campos de Blood Bowl, tan temida como respetada.`;
  }
}

async function generateNewsRoundup(label: string, matchLines: string[]): Promise<string> {
  try {
    const prompt = `${STYLE_PRIMER}

Escribe el cuerpo de la sección "Ronda de noticias": un resumen en 2-3 párrafos de
todos los resultados de "${label}", con estos datos reales:
${matchLines.join("\n")}
No repitas el título de la sección ni empieces con un encabezado — empieza directamente por el párrafo.`;
    return await generateText(prompt);
  } catch (err) {
    console.error("[Balonazo Sangriento] fallo generando ronda de noticias:", err);
    return matchLines.join("\n");
  }
}

async function generateNextTargetText(competitionId: string): Promise<string> {
  const target = await pickNextTarget(competitionId);
  if (!target) return "Todavía nadie se ha ganado el título de objetivo de la próxima jornada. ¡Que tiemblen los tranquilos!";
  try {
    const prompt = `${STYLE_PRIMER}

Escribe el cuerpo de la sección "El próximo objetivo": un párrafo de cachondeo
señalando a este jugador como el enemigo público número uno de la competición, en
base a este dato real:
${target.name} (${target.teamName}) — ${target.statLine}
No repitas el título de la sección ni empieces con un encabezado — empieza directamente por el párrafo.`;
    return await generateText(prompt);
  } catch (err) {
    console.error("[Balonazo Sangriento] fallo generando próximo objetivo:", err);
    return `${target.name} (${target.teamName}) es el objetivo de esta semana: ${target.statLine}.`;
  }
}

async function generateFeaturedMatch(
  matchLine: string,
  home: string,
  away: string,
  homeScore: number,
  awayScore: number
): Promise<{ title: string; body: string }> {
  try {
    const prompt = `${STYLE_PRIMER}

Escribe la crónica destacada ("El ojo del Contemplador") del partido más intenso de
esta jornada, con estos datos reales:
${matchLine}

Formato de tu respuesta (exactamente):
Línea 1: un titular corto y gamberro (máximo 12 palabras), sin comillas.
A partir de la línea 3: el cuerpo de la crónica, 3-5 párrafos en prosa, fiel a los datos.`;
    const raw = await generateText(prompt);
    const [firstLine, ...rest] = raw.split("\n");
    const title = firstLine.replace(/^#+\s*/, "").trim() || `${home} ${homeScore}-${awayScore} ${away}`;
    const body = rest.join("\n").trim() || raw;
    return { title, body };
  } catch (err) {
    console.error("[Balonazo Sangriento] fallo generando crónica destacada:", err);
    return { title: `${home} ${homeScore}-${awayScore} ${away}`, body: matchLine };
  }
}

export interface GenerateIssueInput {
  competitionId: string;
  kind: "ROUND" | "GROUP_STAGE" | "KNOCKOUT_ROUND";
  label: string;
  matchReportIds: string[];
}

/** Genera y guarda un número de Balonazo Sangriento. Best-effort: cualquier fallo se registra en consola y no se propaga. */
export async function generateMagazineIssue(input: GenerateIssueInput): Promise<void> {
  try {
    const { competitionId, kind, label, matchReportIds } = input;
    if (matchReportIds.length === 0) return;

    const [reports, entries] = await Promise.all([
      prisma.matchReport.findMany({
        where: { id: { in: matchReportIds } },
        include: { scorers: true, injuries: true },
      }),
      prisma.competitionEntry.findMany({ where: { competitionId } }),
    ]);
    if (reports.length === 0) return;

    const issueNumber = (await prisma.magazineIssue.count({ where: { competitionId } })) + 1;

    const entryName = new Map(entries.map((e) => [e.id, e.teamName]));
    const playerIds = [
      ...new Set(
        reports
          .flatMap((r) => [...r.scorers.map((s) => s.playerId), ...r.injuries.flatMap((i) => [i.attackerPlayerId, i.victimPlayerId])])
          .filter((id): id is string => !!id)
      ),
    ];
    const players = playerIds.length ? await prisma.competitionPlayer.findMany({ where: { id: { in: playerIds } } }) : [];
    const playerName = new Map(players.map((p) => [p.id, p.customName]));

    const matchLines = reports.map((r) => {
      const home = r.homeEntryId ? (entryName.get(r.homeEntryId) ?? "?") : "?";
      const away = r.awayEntryId ? (entryName.get(r.awayEntryId) ?? "?") : "?";
      const scorerLines = r.scorers.map(
        (s) => `${entryName.get(s.entryId) ?? "?"} (${s.playerId ? (playerName.get(s.playerId) ?? "jugador sin nombre") : "anotador sin especificar"})`
      );
      const injuryLines = r.injuries.map((i) => {
        const attacker = i.attackerPlayerId ? playerName.get(i.attackerPlayerId) : null;
        const victim = i.victimPlayerId ? playerName.get(i.victimPlayerId) : null;
        return `${attacker ?? `alguien de ${entryName.get(i.attackerEntryId) ?? "?"}`} dejó fuera de combate a ${victim ?? `un jugador de ${entryName.get(i.victimEntryId) ?? "?"}`}`;
      });
      const text =
        `${home} ${r.homeScore} - ${r.awayScore} ${away}` +
        (scorerLines.length ? `\n  Anotadores: ${scorerLines.join("; ")}` : "") +
        (injuryLines.length ? `\n  Bajas: ${injuryLines.join("; ")}` : "");
      return { home, away, homeScore: r.homeScore, awayScore: r.awayScore, text, eventfulness: r.scorers.length + r.injuries.length * 2 };
    });

    const featured = [...matchLines].sort((a, b) => b.eventfulness - a.eventfulness)[0];

    const [newsRoundup, featuredMatch, nextTargetText, legendStarKey] = await Promise.all([
      generateNewsRoundup(label, matchLines.map((m) => m.text)),
      generateFeaturedMatch(featured.text, featured.home, featured.away, featured.homeScore, featured.awayScore),
      generateNextTargetText(competitionId),
      pickLegendStarKey(competitionId, issueNumber),
    ]);

    const legendText = legendStarKey
      ? await ensureStarLore(legendStarKey)
      : "Esta jornada no hay ninguna Leyenda que destacar en el mercado.";

    const standings = sortEntries(
      entries.map((e) => ({
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
      }))
    );

    await prisma.magazineIssue.create({
      data: {
        competitionId,
        issueNumber,
        kind,
        label,
        newsRoundup,
        featuredMatchTitle: featuredMatch.title,
        featuredMatchBody: featuredMatch.body,
        nextTargetText,
        legendStarKey,
        legendText,
        standings: standings as unknown as Prisma.InputJsonValue,
      },
    });
  } catch (err) {
    console.error("[Balonazo Sangriento] fallo generando número:", err);
  }
}
