/**
 * Incentivos comunes (Compendio 2025 Third Season, pág. 140-149). Se
 * adquieren gastando M.O. de la tesorería (ligas) o del presupuesto de
 * fichajes (partidos equilibrados/exhibición), durante la secuencia previa
 * al partido. `cost: null` = precio variable (depende del propio Incentivo
 * concreto, p. ej. el Jugador Estrella elegido) — el coste de referencia se
 * indica en el propio texto del efecto.
 */
export interface InducementEntry {
  key: string;
  name: string;
  cost: number | null;
  maxCount: number;
  /// Regla especial de equipo requerida para poder adquirirlo, o null si
  /// está disponible para cualquier equipo.
  restriction: string | null;
  effect: string;
}

export const INDUCEMENTS_TABLE: InducementEntry[] = [
  {
    key: "plegarias_a_nuffle",
    name: "Plegarias a Nuffle",
    cost: 10_000,
    maxCount: 3,
    restriction: null,
    effect:
      "Por cada Plegaria a Nuffle que adquieras, tira 1D16 (repitiendo cualquier resultado que ya hayas obtenido) y consulta la Tabla de Plegarias a Nuffle. La bendición dura hasta el final del partido. Si requiere elegir jugadores, nunca se puede elegir a Jugadores Estrella.",
  },
  {
    key: "ayudantes_a_tiempo_parcial",
    name: "Ayudantes a tiempo parcial",
    cost: 20_000,
    maxCount: 5,
    restriction: null,
    effect: "Hasta el final del partido, aumenta en 1 tu número de Ayudantes del entrenador por cada uno que adquieras.",
  },
  {
    key: "animadoras_temporales",
    name: "Animadoras temporales",
    cost: 5_000,
    maxCount: 5,
    restriction: null,
    effect: "Hasta el final del partido, aumenta en 1 tu número de Animadoras por cada una que adquieras.",
  },
  {
    key: "mascota_del_equipo",
    name: "Mascota del equipo",
    cost: 25_000,
    maxCount: 1,
    restriction: null,
    effect:
      "Ganas una Segunda oportunidad adicional por cada parte del partido; al usarla, tira 1D6 (con 4+ funciona normal, con 1-3 se pierde para esa parte). Además, puedes repetir los resultados de 1 natural del efecto \"Los hinchas animan\" de la tabla de Eventos de Patada inicial.",
  },
  {
    key: "cambiaclimas",
    name: "Cambiaclimas",
    cost: 25_000,
    maxCount: 1,
    restriction: null,
    effect:
      "Una vez por partido, al inicio de cualquiera de tus turnos, puedes tirar de inmediato en la tabla de Clima aplicando un modificador de hasta +2 o -2. El resultado dura hasta la siguiente vez que salga Clima cambiante en la tabla de Eventos de Patada inicial.",
  },
  {
    key: "barriles_cerveza_estrella_blitzer",
    name: "Barriles de cerveza Estrella Blitzer",
    cost: 50_000,
    maxCount: 2,
    restriction: null,
    effect: "Hasta el final del partido, aplica un modificador de +1 (acumulable) a todas tus tiradas para recuperar jugadores Inconscientes.",
  },
  {
    key: "sobornos",
    name: "Sobornos",
    cost: 100_000,
    maxCount: 3,
    restriction: null,
    effect:
      "0-6 para equipos con la regla especial Sobornos y Corrupción, a 50 000 M.O. cada uno. Cuando uno de tus jugadores sea Expulsado tras Protestar al árbitro, puedes gastar un Soborno: tira 1D6, con 2+ el jugador no es Expulsado; con un 1 natural, el árbitro se queda el dinero y el jugador es Expulsado igualmente.",
  },
  {
    key: "entrenamientos_adicionales",
    name: "Entrenamientos adicionales",
    cost: 100_000,
    maxCount: 8,
    restriction: null,
    effect: "Cada Entrenamiento adicional otorga al equipo una Segunda oportunidad adicional para este partido.",
  },
  {
    key: "ayudante_de_la_morgue",
    name: "Ayudante de la morgue",
    cost: 100_000,
    maxCount: 1,
    restriction: "Señores de los No Muertos",
    effect: "Una vez por partido, puedes usarlo para repetir una tirada de Regeneración fallida de un jugador de tu equipo.",
  },
  {
    key: "medico_de_la_peste",
    name: "Médico de la peste",
    cost: 100_000,
    maxCount: 1,
    restriction: "Elegidos de Nurgle",
    effect:
      "Una vez por partido, puedes usarlo para repetir una tirada de Regeneración fallida de un jugador de tu equipo. Como alternativa, puedes usarlo del mismo modo que un Apotecario.",
  },
  {
    key: "novatos_embravecidos",
    name: "Novatos embravecidos",
    cost: 150_000,
    maxCount: 1,
    restriction: "Líneas Prescindibles",
    effect:
      "Tras añadir los Sustitutos necesarios para tener al menos 11 jugadores disponibles, el equipo obtiene 2D3+1 Sustitutos adicionales para ese partido (pueden superar temporalmente el límite de 16 en la Hoja de plantilla). Se pierden al acabar el partido salvo que se fichen de forma permanente.",
  },
  {
    key: "apotecarios_errantes",
    name: "Apotecarios errantes",
    cost: 100_000,
    maxCount: 2,
    restriction: "Solo equipos que puedan tener Apotecario",
    effect: "Puedes usarlo una vez por partido del mismo modo que un Apotecario normal.",
  },
  {
    key: "chef_maestro_halfling",
    name: "Chef Maestro Halfling",
    cost: 300_000,
    maxCount: 1,
    restriction: null,
    effect:
      "100 000 M.O. para equipos Halfling. Al inicio de cada parte, antes de la Patada inicial, tira 3D6: por cada 4+ tu equipo gana una Segunda oportunidad adicional para esa parte y el rival pierde una (las otorgadas por habilidades/rasgos no pueden perderse así).",
  },
  {
    key: "arbitro_amanafaltas",
    name: "Árbitro poco imparcial: Amañafaltas",
    cost: 120_000,
    maxCount: 1,
    restriction: null,
    effect:
      "80 000 M.O. para equipos con la regla especial Sobornos y Corrupción. Escrutinio estricto: cuando un rival haga una acción de Falta sin ser Expulsado, tira 1D6 — con 5+ es Expulsado igualmente. \"No he visto nada\": al Protestar al árbitro aplicas +1 a la tirada (un 1 natural sigue siendo expulsión).",
  },
  {
    key: "josef_bugman",
    name: "Miembro del cuadro técnico famoso: Josef Bugman",
    cost: 100_000,
    maxCount: 1,
    restriction: null,
    effect:
      "Cerveza XXXXX de Bugman: +1 a las tiradas para recuperar jugadores Inconscientes durante el partido. Sabiduría Dwarf: una vez por partido, tras desplegar ambos equipos y antes de la Patada inicial, puedes retirar 1D3 de tus jugadores y volver a desplegarlos.",
  },
  {
    key: "jugadores_mercenarios",
    name: "Jugadores mercenarios",
    cost: null,
    maxCount: 3,
    restriction: null,
    effect:
      "Cuestan 30 000 M.O. más de lo habitual para ese tipo de jugador. Tienen el rasgo Solitario (4+) además de sus habilidades normales; se les puede dar una habilidad Primaria extra por 50 000 M.O. No se pueden fichar de forma permanente tras el partido.",
  },
  {
    key: "jugadores_estrella_incentivo",
    name: "Jugadores Estrella",
    cost: null,
    maxCount: 2,
    restriction: null,
    effect:
      "Cada equipo puede adquirir hasta dos Jugadores Estrella para un partido (coste según su ficha, págs. 193-205). No ganan PE, no pueden recibir mejoras, y las Lesiones que sufran se ignoran tras el partido.",
  },
  {
    key: "mago_deportivo",
    name: "Mago: Mago Deportivo",
    cost: 150_000,
    maxCount: 1,
    restriction: null,
    effect:
      "Una vez por partido, al final de cualquier turno, puede lanzar Bola de fuego (Derriba y aplica +1 a la tirada de Armadura a los jugadores de una casilla y las adyacentes) o ¡Zap! (convierte a un jugador en Rana hasta el final de la entrada).",
  },
];
