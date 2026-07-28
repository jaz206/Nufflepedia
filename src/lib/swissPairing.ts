/**
 * Emparejamiento suizo para el Torneo Presencial: empareja a los inscritos
 * activos según su clasificación actual, evitando repetir rival siempre que
 * sea posible, y da un bye (con puntos de victoria) a quien sobre si el
 * número de activos es impar — nunca dos veces al mismo si hay alternativa,
 * tal como exige el Reglamento NAF para Torneos (5.3.1). Lógica pura, sin
 * dependencias — vive en `lib` (no es contenido de reglas oficial de Blood
 * Bowl, es mecánica de torneo genérica).
 */

export interface SwissEntrant {
  id: string;
  points: number;
  tdFor: number;
  tdAgainst: number;
  byes: number;
  dropped: boolean;
}

export interface SwissPairing {
  entrantAId: string;
  /** null = bye: entrantA descansa esta ronda. */
  entrantBId: string | null;
}

export function pairKey(a: string, b: string): string {
  return [a, b].sort().join("|");
}

/** Construye el set de emparejamientos ya jugados a partir del historial de partidos. */
export function buildPlayedPairs(matches: { entrantAId: string; entrantBId: string | null }[]): Set<string> {
  const played = new Set<string>();
  for (const m of matches) {
    if (m.entrantBId) played.add(pairKey(m.entrantAId, m.entrantBId));
  }
  return played;
}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function pairSwissRound(entrants: SwissEntrant[], playedPairs: Set<string>, roundNumber: number): SwissPairing[] {
  const active = entrants.filter((e) => !e.dropped);
  if (active.length < 2) return [];

  // Ronda 1: nadie tiene puntos todavía, así que el orden es al azar. En
  // rondas siguientes, se ordena por puntos y luego por diferencia de TD
  // (mismo criterio de desempate que el resto de la app), barajando dentro
  // de cada empate exacto para no favorecer siempre al mismo por casualidad
  // del orden de inscripción.
  const ranked =
    roundNumber === 1
      ? shuffle(active)
      : shuffle(active).sort((a, b) => b.points - a.points || b.tdFor - b.tdAgainst - (a.tdFor - a.tdAgainst));

  const pool = [...ranked];
  const pairings: SwissPairing[] = [];

  // Bye si el número de activos es impar: para el de más abajo en la tabla
  // que todavía no haya descansado; si todos ya tuvieron uno, para el
  // último de la clasificación sin más vueltas.
  if (pool.length % 2 !== 0) {
    let byeIndex = -1;
    for (let i = pool.length - 1; i >= 0; i--) {
      if (pool[i].byes === 0) {
        byeIndex = i;
        break;
      }
    }
    if (byeIndex === -1) byeIndex = pool.length - 1;
    const [byeEntrant] = pool.splice(byeIndex, 1);
    pairings.push({ entrantAId: byeEntrant.id, entrantBId: null });
  }

  // Emparejamiento voraz: para cada jugador sin pareja (de arriba a abajo),
  // busca el rival no jugado más cercano en la clasificación; si no queda
  // ninguno sin repetir, empareja con el primero disponible antes que
  // dejarlo sin partido.
  const unpaired = [...pool];
  while (unpaired.length > 0) {
    const a = unpaired.shift()!;
    let matchIndex = unpaired.findIndex((b) => !playedPairs.has(pairKey(a.id, b.id)));
    if (matchIndex === -1) matchIndex = 0;
    const [b] = unpaired.splice(matchIndex, 1);
    pairings.push({ entrantAId: a.id, entrantBId: b.id });
  }

  return pairings;
}
