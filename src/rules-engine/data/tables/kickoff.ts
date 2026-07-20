/**
 * Tabla de Eventos de Patada Inicial (2D6). Portada desde CODEX_REGLAS_S3.md.
 */
export interface KickoffEntry {
  roll: number;
  name: string;
  effect: string;
}

export const KICKOFF_TABLE: KickoffEntry[] = [
  { roll: 2, name: "Árbitro Intimidado", effect: "+1 Soborno a ambos equipos." },
  { roll: 3, name: "Tiempo Muerto", effect: "TurnCounter ± 1." },
  { roll: 4, name: "Defensa Sólida", effect: "El equipo que patea redespliega 1D3+3 jugadores." },
  { roll: 5, name: "Patada Alta", effect: "El equipo que recibe coloca un jugador bajo el balón." },
  { roll: 6, name: "Hinchas Animan", effect: "Tirada enfrentada. El ganador recibe apoyo en el primer placaje." },
  { roll: 7, name: "Entrenador Brillante", effect: "Tirada enfrentada. El ganador gana +1 RR para el drive." },
  { roll: 8, name: "Clima Cambiante", effect: "Se realiza una nueva tirada de clima." },
  { roll: 9, name: "Anticipación", effect: "El equipo que recibe mueve 1D3+3 jugadores (1 casilla)." },
  { roll: 10, name: "¡A la Carga!", effect: "El equipo que patea activa 1D3+3 jugadores para un Blitz." },
  { roll: 11, name: "Indigestion", effect: "Tirada enfrentada. El perdedor aplica -1 MV/AR a un jugador." },
  { roll: 12, name: "Invasión de Campo", effect: "El perdedor tiene 1D3 jugadores Aturdidos." },
];

export function resolveKickoff(sum2d6: number): KickoffEntry {
  const entry = KICKOFF_TABLE.find((e) => e.roll === sum2d6);
  if (!entry) {
    throw new Error(`Resultado de patada inicial fuera de rango: ${sum2d6}`);
  }
  return entry;
}
