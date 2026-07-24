/**
 * Calendario de Liguilla por el método del círculo (round-robin), a doble
 * vuelta: cada pareja juega dos veces, con local y visitante invertidos.
 * Con un número impar de equipos, cada ronda uno descansa (bye) — no se
 * genera partido para él ese turno. Lógica pura, sin dependencias — vive
 * en `lib` (no es contenido de reglas oficial, es mecánica de competición).
 */

export interface ScheduledFixture {
  round: number;
  homeEntryId: string;
  awayEntryId: string;
}

export function generateRoundRobinSchedule(entryIds: string[], double = true): ScheduledFixture[] {
  if (entryIds.length < 2) return [];

  const ids: (string | null)[] = [...entryIds];
  if (ids.length % 2 !== 0) ids.push(null); // hueco de descanso si es impar
  const n = ids.length;
  const roundsPerLeg = n - 1;

  const fixtures: ScheduledFixture[] = [];
  const arr = [...ids];

  for (let r = 0; r < roundsPerLeg; r++) {
    for (let i = 0; i < n / 2; i++) {
      const home = arr[i];
      const away = arr[n - 1 - i];
      if (home !== null && away !== null) {
        // Alterna qué lado es local en el primer emparejamiento de cada
        // ronda para no dar siempre "de casa" al mismo equipo en la ida.
        const swap = i === 0 && r % 2 === 1;
        fixtures.push({
          round: r + 1,
          homeEntryId: swap ? away : home,
          awayEntryId: swap ? home : away,
        });
      }
    }
    // Rotación del círculo: el primero se queda fijo, el resto rota.
    const fixed = arr[0];
    const rest = arr.slice(1);
    const last = rest.pop();
    if (last !== undefined) rest.unshift(last);
    arr.splice(0, arr.length, fixed, ...rest);
  }

  if (double) {
    const secondLeg = fixtures.map((f) => ({
      round: f.round + roundsPerLeg,
      homeEntryId: f.awayEntryId,
      awayEntryId: f.homeEntryId,
    }));
    fixtures.push(...secondLeg);
  }

  return fixtures;
}
