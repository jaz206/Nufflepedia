/**
 * Estado de un jugador durante el partido (Compendio 2025 Third Season,
 * pág. 38-39, "Estado de un jugador"). Cuatro estados posibles: En pie,
 * Distraído, Tumbado boca arriba y Aturdido — no son ni habilidades ni
 * rasgos, así que tienen su propia tabla de referencia aquí.
 */
export interface PlayerStateEntry {
  key: string;
  name: string;
  description: string;
  sortOrder: number;
}

export const PLAYER_STATES_TABLE: PlayerStateEntry[] = [
  {
    key: "en_pie",
    name: "En pie",
    description:
      "Un jugador En pie ejerce control sobre las ocho casillas adyacentes a él, su «zona de defensa»: cualquier jugador rival que esté ahí es Marcado por él (y él, a su vez, queda Marcado por ese rival). Un jugador nunca Marca a sus propios compañeros de equipo. Un jugador sin ningún rival en su zona de defensa está Desmarcado, y puede actuar con más libertad, sin interferencia de los rivales. Si un jugador En pie pierde su zona de defensa por cualquier motivo, pasa a estar Distraído.",
    sortOrder: 0,
  },
  {
    key: "distraido",
    name: "Distraído",
    description:
      "Un jugador En pie puede quedar Distraído por una habilidad o un rasgo (propio o de un rival), una regla especial, u otros efectos. Un jugador Distraído no tiene zona de defensa (no Marca a nadie) — debe colocarse una ficha de Distraído junto a él para indicarlo. Mientras está Distraído no puede usar habilidades activas ni rasgos activos, no puede intentar interceptar una acción de Pase, ni tampoco intentar atrapar el balón. Si un jugador queda Distraído durante su propia activación, esa activación termina de inmediato. Cuando un jugador queda Distraído, permanece así hasta la siguiente vez que sea activado, a menos que se indique lo contrario.",
    sortOrder: 1,
  },
  {
    key: "tumbado_boca_arriba",
    name: "Tumbado boca arriba",
    description:
      "Un jugador que no está En pie está Tumbado boca arriba o Aturdido — normalmente por haber tropezado al moverse o por un placaje rival. Un jugador Tumbado boca arriba pierde automáticamente su zona de defensa y no puede hacer nada hasta que se levante. Si es colocado Tumbado boca arriba durante su propia activación, esta termina de inmediato; si portaba el balón, este rebota desde su casilla. Cuando un jugador es simplemente «colocado» Tumbado boca arriba (a diferencia de Caerse o Ser Derribado) no se le hace tirada de Armadura.",
    sortOrder: 2,
  },
  {
    key: "aturdido",
    name: "Aturdido",
    description:
      "Un jugador Aturdido pierde automáticamente su zona de defensa y no puede ser activado durante el turno de su equipo. Cuando acaba el turno de un equipo, todos los jugadores de ese equipo que estaban Aturdidos cuando empezó dicho turno se dan la vuelta y pasan a Tumbado boca arriba. Si un jugador queda Aturdido durante el turno de su propio equipo, no se le da la vuelta todavía — debe esperar hasta el final del siguiente turno de su equipo.",
    sortOrder: 3,
  },
];
