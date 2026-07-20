/**
 * Tabla de Plegarias a Nuffle (1D16). Transcrita desde COMPENDIO 2025 Third
 * Season + NAF.pdf.
 */
export interface PrayerEntry {
  roll: number;
  name: string;
  effect: string;
}

export const PRAYERS_TO_NUFFLE_TABLE: PrayerEntry[] = [
  {
    roll: 1,
    name: "Trampilla Traicionera",
    effect:
      "Cada vez que un jugador, sea del equipo que sea, entre por cualquier motivo en una casilla que contiene una trampilla, tira 1D6. Con un 1, la trampilla se abre y el jugador cae por ella. Haz una tirada de Lesiones contra ese jugador como si hubiera sido empujado fuera del campo. Si el jugador era el portador del balón, éste rebota desde la casilla de la trampilla.",
  },
  {
    roll: 2,
    name: "Amigo del Árbitro",
    effect: "Cuando Protestes al árbitro, trata cualquier resultado de 5 o 6 como un resultado de \"Ahora que lo dices...\".",
  },
  {
    roll: 3,
    name: "Puñal",
    effect: "Elige un jugador de tu equipo que esté jugando este partido. Hasta el final del partido, dicho jugador obtiene el rasgo Apuñalar.",
  },
  {
    roll: 4,
    name: "Músculos de Hierro",
    effect: "Elige un jugador de tu equipo que esté jugando este partido. Hasta el final del partido, dicho jugador aumenta en 1 su atributo AR, hasta un máximo de 11+.",
  },
  {
    roll: 5,
    name: "Nudilleras",
    effect: "Elige un jugador de tu equipo que esté jugando este partido. Hasta el final del partido, dicho jugador obtiene la habilidad Golpe mortífero.",
  },
  {
    roll: 6,
    name: "Malas Costumbres",
    effect: "Elige al azar a 1D3 jugadores rivales que estén jugando este partido. Hasta el final del partido, esos jugadores obtienen el rasgo Solitario (2+).",
  },
  {
    roll: 7,
    name: "Tacos Engrasados",
    effect: "Elige al azar a un jugador rival que esté jugando este partido. Hasta el final del partido, el atributo MV de ese jugador se reduce en 1 (hasta un mínimo de 1).",
  },
  {
    roll: 8,
    name: "Bendición de Nuffle",
    effect: "Elige al azar a un jugador de tu equipo que esté jugando este partido. Hasta el final del partido, dicho jugador obtiene la habilidad Profesional.",
  },
  {
    roll: 9,
    name: "Topos Bajo el Campo",
    effect: "Los jugadores rivales aplican un modificador de -1 a sus intentos de forzar la marcha.",
  },
  {
    roll: 10,
    name: "Pase Perfecto",
    effect: "Cualquier jugador de tu equipo que logre realizar un Pase completo ganará 2 PE en lugar de 1.",
  },
  {
    roll: 11,
    name: "Recepciones Deslumbrantes",
    effect: "Cualquier jugador de tu equipo que atrape con éxito el balón como resultado de una acción de Pase obtiene 1 PE.",
  },
  {
    roll: 12,
    name: "Apoyo del Público",
    effect: "Si un jugador rival resulta Lesionado al ser empujado fuera del campo, el jugador que lo ha empujado gana 2 PE.",
  },
  {
    roll: 13,
    name: "Con Faltas y a lo Loco",
    effect: "Cualquier jugador de tu equipo que provoque una Lesión como resultado de una acción de Falta gana 2 PE.",
  },
  {
    roll: 14,
    name: "Pedrada",
    effect:
      "Una vez por partido, al inicio de cualquiera de tus turnos (antes de empezar a activar jugadores), puedes elegir al azar un jugador rival que esté en el campo y tirar 1D6. Con 4+, un hincha enfurecido le lanza una piedra, y ese jugador rival es inmediatamente Derribado.",
  },
  {
    roll: 15,
    name: "Escrutinio Arbitral",
    effect: "Cualquier jugador rival que realice una acción de Falta será automáticamente Expulsado si rompe la armadura, aunque no saque un doble natural.",
  },
  {
    roll: 16,
    name: "Entrenamiento Intensivo",
    effect: "Elige al azar a un jugador de tu equipo que esté jugando este partido. Hasta el final del partido, dicho jugador obtiene una habilidad Primaria a tu elección.",
  },
];

export function resolvePrayerToNuffle(roll1to16: number): PrayerEntry {
  const entry = PRAYERS_TO_NUFFLE_TABLE.find((e) => e.roll === roll1to16);
  if (!entry) {
    throw new Error(`Tirada de Plegaria a Nuffle fuera de rango (1-16): ${roll1to16}`);
  }
  return entry;
}
