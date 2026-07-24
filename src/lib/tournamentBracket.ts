/**
 * Lógica pura de un cuadro de eliminatoria simple (single elimination).
 * No es contenido de reglas oficial de Blood Bowl (por eso vive en `lib`,
 * no en `rules-engine`) — es la mecánica de torneo genérica que usa
 * `/competiciones`. Serializable a JSON tal cual (campo `Competition.bracket`).
 */

export interface BracketMatch {
  id: string;
  homeEntryId: string | null;
  awayEntryId: string | null;
  homeScore: number | null;
  awayScore: number | null;
  winnerEntryId: string | null;
}

export interface BracketRound {
  round: number;
  matches: BracketMatch[];
}

function nextPowerOfTwo(n: number): number {
  let size = 1;
  while (size < n) size *= 2;
  return size;
}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

let matchCounter = 0;
function nextMatchId(): string {
  matchCounter += 1;
  return `m${Date.now().toString(36)}${matchCounter}`;
}

/**
 * Genera el cuadro completo (todas las rondas) a partir de los equipos
 * inscritos, sembrados al azar. Si el número de equipos no es potencia de
 * 2, rellena con "bye" (pase directo) — esos partidos se resuelven solos
 * y su ganador ya aparece sembrado en la ronda siguiente.
 */
export function generateBracket(entryIds: string[]): BracketRound[] {
  if (entryIds.length < 2) return [];

  const size = nextPowerOfTwo(entryIds.length);
  const n = entryIds.length;
  const byes = size - n;
  const reals = shuffle(entryIds);

  const numRounds = Math.log2(size);
  const rounds: BracketRound[] = [];

  // Ronda 1: un bye por partido como mucho — nunca se empareja un bye
  // contra otro bye (si no, ese partido quedaría sin forma de resolverse).
  // Los primeros `byes` equipos sembrados pasan directos; el resto se
  // empareja real contra real.
  const firstMatches: BracketMatch[] = [];
  for (let i = 0; i < byes; i++) {
    const home = reals[i];
    firstMatches.push({ id: nextMatchId(), homeEntryId: home, awayEntryId: null, homeScore: null, awayScore: null, winnerEntryId: home });
  }
  for (let i = byes; i < n; i += 2) {
    firstMatches.push({
      id: nextMatchId(),
      homeEntryId: reals[i],
      awayEntryId: reals[i + 1],
      homeScore: null,
      awayScore: null,
      winnerEntryId: null,
    });
  }
  rounds.push({ round: 1, matches: shuffle(firstMatches) });

  // Rondas siguientes: vacías por ahora, se rellenan al propagar ganadores.
  for (let r = 2; r <= numRounds; r++) {
    const matchCount = size / 2 ** r;
    const matches: BracketMatch[] = Array.from({ length: matchCount }, () => ({
      id: nextMatchId(),
      homeEntryId: null,
      awayEntryId: null,
      homeScore: null,
      awayScore: null,
      winnerEntryId: null,
    }));
    rounds.push({ round: r, matches });
  }

  return propagateWinners(rounds);
}

/** Coloca cada ganador conocido en su hueco de la ronda siguiente. */
function propagateWinners(rounds: BracketRound[]): BracketRound[] {
  const next = rounds.map((r) => ({ round: r.round, matches: r.matches.map((m) => ({ ...m })) }));

  for (let r = 0; r < next.length - 1; r++) {
    next[r].matches.forEach((match, i) => {
      if (!match.winnerEntryId) return;
      const nextMatch = next[r + 1].matches[Math.floor(i / 2)];
      if (i % 2 === 0) nextMatch.homeEntryId = match.winnerEntryId;
      else nextMatch.awayEntryId = match.winnerEntryId;
    });
  }

  return next;
}

/**
 * Registra el resultado de un partido del cuadro y avanza al ganador a la
 * siguiente ronda. Devuelve el cuadro actualizado (no muta el original).
 * `homeScore`/`awayScore` deben ser distintos: no hay empates en eliminatoria.
 */
export function recordBracketMatch(
  rounds: BracketRound[],
  matchId: string,
  homeScore: number,
  awayScore: number
): BracketRound[] {
  const winnerSide = homeScore > awayScore ? "home" : "away";
  const next = rounds.map((r) => ({ round: r.round, matches: r.matches.map((m) => ({ ...m })) }));

  for (const round of next) {
    const match = round.matches.find((m) => m.id === matchId);
    if (!match) continue;
    match.homeScore = homeScore;
    match.awayScore = awayScore;
    match.winnerEntryId = winnerSide === "home" ? match.homeEntryId : match.awayEntryId;
    return propagateWinners(next);
  }

  return next;
}

export function findBracketMatch(rounds: BracketRound[], matchId: string): BracketMatch | null {
  for (const round of rounds) {
    const match = round.matches.find((m) => m.id === matchId);
    if (match) return match;
  }
  return null;
}

/** El torneo ha terminado si la última ronda tiene un ganador. */
export function isBracketComplete(rounds: BracketRound[]): boolean {
  if (rounds.length === 0) return false;
  const final = rounds[rounds.length - 1];
  return final.matches.length === 1 && final.matches[0].winnerEntryId !== null;
}

export function bracketChampion(rounds: BracketRound[]): string | null {
  if (!isBracketComplete(rounds)) return null;
  return rounds[rounds.length - 1].matches[0].winnerEntryId;
}
