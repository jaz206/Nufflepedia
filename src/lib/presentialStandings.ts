/**
 * Clasificación del Torneo Presencial, calculada en vivo a partir del
 * historial de PresentialMatch — ver la nota en el modelo PresentialEntrant
 * de schema.prisma sobre por qué no se guardan puntos/TD/bajas ahí. Mismo
 * criterio de desempate que Competiciones: puntos, luego diferencia de TD,
 * luego TD a favor. Lógica pura, sin dependencias.
 */

export interface StandingsMatchInput {
  entrantAId: string;
  entrantBId: string | null;
  scoreA: number | null;
  scoreB: number | null;
  casA: number;
  casB: number;
  reported: boolean;
}

export interface ScoringConfig {
  pointsWin: number;
  pointsDraw: number;
  pointsLoss: number;
}

export interface StandingsRow {
  entrantId: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  byes: number;
  tdFor: number;
  tdAgainst: number;
  casFor: number;
  casAgainst: number;
  points: number;
}

function emptyRow(entrantId: string): StandingsRow {
  return { entrantId, played: 0, won: 0, drawn: 0, lost: 0, byes: 0, tdFor: 0, tdAgainst: 0, casFor: 0, casAgainst: 0, points: 0 };
}

export function computeStandings(
  entrantIds: string[],
  matches: StandingsMatchInput[],
  scoring: ScoringConfig
): StandingsRow[] {
  const rows = new Map(entrantIds.map((id) => [id, emptyRow(id)]));

  for (const m of matches) {
    if (!m.reported) continue;
    const a = rows.get(m.entrantAId);
    if (!a) continue;

    if (m.entrantBId === null) {
      a.byes += 1;
      a.points += scoring.pointsWin;
      continue;
    }
    const b = rows.get(m.entrantBId);
    if (!b) continue;

    const scoreA = m.scoreA ?? 0;
    const scoreB = m.scoreB ?? 0;
    a.played += 1;
    b.played += 1;
    a.tdFor += scoreA;
    a.tdAgainst += scoreB;
    b.tdFor += scoreB;
    b.tdAgainst += scoreA;
    a.casFor += m.casA;
    a.casAgainst += m.casB;
    b.casFor += m.casB;
    b.casAgainst += m.casA;

    if (scoreA > scoreB) {
      a.won += 1;
      b.lost += 1;
      a.points += scoring.pointsWin;
      b.points += scoring.pointsLoss;
    } else if (scoreB > scoreA) {
      b.won += 1;
      a.lost += 1;
      b.points += scoring.pointsWin;
      a.points += scoring.pointsLoss;
    } else {
      a.drawn += 1;
      b.drawn += 1;
      a.points += scoring.pointsDraw;
      b.points += scoring.pointsDraw;
    }
  }

  return sortStandings([...rows.values()]);
}

export function sortStandings(rows: StandingsRow[]): StandingsRow[] {
  return [...rows].sort(
    (a, b) => b.points - a.points || b.tdFor - b.tdAgainst - (a.tdFor - a.tdAgainst) || b.tdFor - a.tdFor
  );
}
