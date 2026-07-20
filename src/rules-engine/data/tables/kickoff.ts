/**
 * Tabla de Eventos de Patada Inicial (2D6). Transcrita desde COMPENDIO 2025
 * Third Season + NAF.pdf.
 */
export interface KickoffEntry {
  roll: number;
  name: string;
  effect: string;
}

export const KICKOFF_TABLE: KickoffEntry[] = [
  {
    roll: 2,
    name: "Árbitro Intimidado",
    effect: "Cada equipo recibe un Incentivo de Soborno gratuito. Este Incentivo debe usarse antes del final del partido o se pierde.",
  },
  {
    roll: 3,
    name: "Tiempo Muerto",
    effect:
      "Si la ficha de turno del equipo pateador está en el turno 6, 7 u 8, ambos equipos mueven su ficha de turno un espacio hacia atrás. Si no es así, ambos equipos mueven su ficha de turno un espacio hacia delante.",
  },
  {
    roll: 4,
    name: "Defensa Sólida",
    effect:
      "El Entrenador del equipo pateador elige hasta 1D3+3 jugadores Desmarcados de su equipo. Dichos jugadores son retirados del campo y desplegados de nuevo siguiendo todas las restricciones normales de despliegue.",
  },
  {
    roll: 5,
    name: "Patada Alta",
    effect: "Un Jugador Desmarcado del equipo receptor puede ser colocado inmediatamente en la casilla en la que va a caer el balón.",
  },
  {
    roll: 6,
    name: "Los Hinchas Animan",
    effect:
      "Cada entrenador tira 1D6 y le suma el número de Animadoras de su Hoja de plantilla. La primera acción de Placaje realizada en el siguiente turno del Entrenador que haya sacado un total más alto en esta tirada recibe un apoyo ofensivo adicional. Si la tirada ha sido un empate, ambos Entrenadores reciben este beneficio durante su siguiente turno.",
  },
  {
    roll: 7,
    name: "Entrenador Brillante",
    effect:
      "Cada entrenador tira 1D6 y le suma el número de Ayudantes del Entrenador de su Hoja de plantilla. El Entrenador que haya sacado un total más alto en esta tirada, o ambos Entrenadores en caso de empate, obtiene una Segunda oportunidad gratuita para la entrada que va a jugarse. Si esa Segunda oportunidad no se usa antes del final de esa entrada, se pierde.",
  },
  {
    roll: 8,
    name: "Clima Cambiante",
    effect:
      "Haz inmediatamente una nueva tirada en la tabla de Clima. Si el nuevo resultado es \"Clima perfecto\", el balón se escora (3) antes de caer al suelo.",
  },
  {
    roll: 9,
    name: "Anticipación",
    effect:
      "El Entrenador del equipo receptor elige hasta 1D3+3 jugadores Desmarcados de su equipo. Dichos jugadores pueden moverse inmediatamente una casilla en cualquier dirección, incluso entrando en la mitad contraria del campo.",
  },
  {
    roll: 10,
    name: "¡A la Carga!",
    effect:
      "El Entrenador del equipo pateador elige hasta 1D3+3 jugadores Desmarcados de su equipo. Dichos jugadores se pueden activar uno tras otro, como si fuera el turno de su equipo, y realizar una acción de Movimiento gratuita. Uno de ellos puede realizar en su lugar una acción de Penetración gratuita, otro puede realizar en su lugar una acción de Lanzar compañero gratuita, y otro puede realizar en su lugar una acción de Chutar compañero gratuita. Si uno de los jugadores elegidos se Cae o es Derribado durante su activación, ya no se pueden activar más jugadores y la Carga termina.",
  },
  {
    roll: 11,
    name: "Indigestión",
    effect:
      "Ambos Entrenadores tiran 1D6. El Entrenador con el total más bajo, o ambos en caso de empate, determina al azar a uno de sus jugadores sobre el campo y tira 1D6. Con 2+, el aperitivo que ha tomado el jugador antes de la entrada no le ha sentado bien, por lo que, mientras dure esa entrada, dicho jugador reduce en 1 su MV y su AR. Con un 1, el aperitivo le ha provocado una evacuación forzosa; coloca al jugador en la zona de Reservas de su equipo, para reflejar que se pasa el resto de la entrada encerrado en la letrina.",
  },
  {
    roll: 12,
    name: "Invasión de Campo",
    effect:
      "Cada Entrenador tira 1D6 y le suma su Factor de Hinchas. El Entrenador que saque un total más bajo, o ambos Entrenadores en caso de empate, selecciona al azar 1D3 jugadores de su equipo que estén sobre el campo. Dichos jugadores son colocados Tumbados boca arriba y quedan Aturdidos.",
  },
];

export function resolveKickoff(sum2d6: number): KickoffEntry {
  const entry = KICKOFF_TABLE.find((e) => e.roll === sum2d6);
  if (!entry) {
    throw new Error(`Resultado de patada inicial fuera de rango: ${sum2d6}`);
  }
  return entry;
}
