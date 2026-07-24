/**
 * Reglas especiales de equipo (Compendio 2025 Third Season, pág. 154-155).
 * Cada raza puede tener una o varias (ver MasterRace.specialRules, hoy solo
 * nombres sueltos); esta tabla es el catálogo con el texto completo de cada
 * una, y determina qué Incentivos/Jugadores Estrella puede adquirir un equipo.
 */
export interface SpecialRuleEntry {
  key: string;
  name: string;
  description: string;
}

export const SPECIAL_RULES_TABLE: SpecialRuleEntry[] = [
  {
    key: "brutos_brutales",
    name: "Brutos Brutales",
    description:
      "Durante una liga, un equipo con esta regla especial gana PE de manera distinta: sus jugadores ganan 3 PE por causar una Lesión (en vez de 2) pero solo 2 PE por anotar un touchdown (en vez de 3).",
  },
  {
    key: "sobornos_y_corrupcion",
    name: "Sobornos y Corrupción",
    description:
      "Una vez por partido, cuando un equipo con esta regla especial saque un 1 al Protestar al árbitro, puede repetir la tirada. Además, da acceso a más Sobornos y a un Árbitro Amañafaltas más barato.",
  },
  {
    key: "elegidos_de",
    name: "Elegidos de…",
    description:
      "El equipo jura culto a uno o varios Dioses del Caos. Algunos equipos tienen un alineamiento fijo (p. ej. \"Elegidos de Khorne\"); otros eligen entre varias opciones al crear la Hoja de plantilla, y ya no pueden cambiarlo. Algunos Jugadores Estrella e Incentivos solo están disponibles para un alineamiento concreto.",
  },
  {
    key: "lineas_prescindibles",
    name: "Líneas Prescindibles",
    description:
      "Al calcular la Valoración de equipo en una liga, el coste de fichaje de los jugadores Línea de este equipo se considera 0 M.O. (los incrementos de Valoración que hayan acumulado sí cuentan). Da acceso al Incentivo Novatos embravecidos.",
  },
  {
    key: "senores_de_los_no_muertos",
    name: "Señores de los No Muertos",
    description:
      "Una vez por partido, si un jugador rival con FU 4 o menos y sin el rasgo Escurridizo sufre un resultado de Muerto en la tabla de Lesiones, el equipo puede Levantar a los muertos: añade de inmediato un jugador Línea a su zona de Reservas (puede superar temporalmente los 16 jugadores). En la Secuencia posterior al partido puede ficharlo gratis si la plantilla no llega a 16, y si no lo ficha se pierde. Da acceso al Incentivo Ayudante de la morgue.",
  },
  {
    key: "colar_jugadores",
    name: "Colar Jugadores",
    description:
      "Durante la Secuencia de inicio de entrada, tras desplegar ambos equipos, un equipo con esta regla especial puede desplegar 1D3 jugadores Línea adicionales desde su zona de Reservas, superando temporalmente el máximo de 11 en el campo.",
  },
  {
    key: "capitan_del_equipo",
    name: "Capitán del Equipo",
    description:
      "Al crear la Hoja de plantilla se designa un Capitán (que no puede ser un Grandullón); gana la habilidad Profesional gratis. Mientras esté en el campo, al gastar una Segunda oportunidad se tira 1D6: con un 6 natural, no se gasta. Debe desplegarse siempre que sea posible; si muere durante el partido, se puede nombrar un nuevo Capitán al finalizar.",
  },
];
