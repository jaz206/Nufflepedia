/**
 * Secuencia completa de un partido — Pre-Partido, Durante el Partido y
 * Post-Partido — como referencia consultable (no motor de juego). El
 * contenido combina dos fuentes ya investigadas del prototipo anterior
 * (`data/gameSequence.ts` y `pages/Oracle/RulesPage.tsx`), reconciliadas
 * contra el orden oficial del reglamento.
 *
 * El futuro Asistente de Partido en vivo (Fase 4, `/arena`) SÍ llevará
 * estado real (marcador, turnos, log de eventos); esto es solo la chuleta
 * de "qué toca ahora y qué significa", para no perder pasos en mesa.
 */

export interface MatchSequenceStep {
  order: number;
  title: string;
  description: string;
  /** Notación de dados, si aplica (p. ej. "2D6", "1D8 + 1D6"). */
  dice?: string;
}

export interface MatchSequenceSection {
  key: string;
  title: string;
  intro: string;
  steps: MatchSequenceStep[];
  /** Nota final de la sección (p. ej. el cambio de roles en el descanso). */
  note?: string;
}

export const MATCH_SEQUENCE: MatchSequenceSection[] = [
  {
    key: "pre-partido",
    title: "Pre-Partido",
    intro: "Se resuelve una sola vez, antes del primer saque, en este orden.",
    steps: [
      {
        order: 1,
        title: "Factor de Hinchas",
        description:
          "Cada entrenador tira 1D3 y suma los aficionados ocasionales de su hoja de equipo. El total es el Factor de Hinchas para todo el partido — determina la Afluencia final y también entra en juego en el evento de Patada Inicial «Invasión de Campo».",
        dice: "1D3",
      },
      {
        order: 2,
        title: "El Clima",
        description:
          "Ambos entrenadores tiran 2D6 y consultan la Tabla de Clima. El resultado afecta pases, recogidas y carreras (GFI) durante todo el partido, salvo que un evento de Patada Inicial («Clima Cambiante») lo cambie a mitad de partido.",
        dice: "2D6",
      },
      {
        order: 3,
        title: "Sustitutos (Jornaleros)",
        description:
          "Si un equipo tiene menos de 11 jugadores disponibles, se rellena gratis con Linieros Sustitutos (con Solitario 4+) hasta llegar a 11.",
      },
      {
        order: 4,
        title: "Adquirir Incentivos",
        description:
          "El equipo con menor Valor de Equipo (VAE) recibe la diferencia en monedas de oro para gastar en Jugadores Estrella, sobornos, apotecarios extra, etc. Puede sumar hasta 50.000 MO más de su propia tesorería para gastar también en incentivos.",
      },
      {
        order: 5,
        title: "Rezos a Nuffle",
        description:
          "Si tras comprar incentivos sigue habiendo diferencia de VAE, el equipo inferior tira en la Tabla de Rezos a Nuffle — efectos aleatorios a su favor para compensar la diferencia de nivel.",
      },
      {
        order: 6,
        title: "Lanzamiento de Moneda",
        description:
          "Tirada enfrentada de 1D6 contra 1D6. El entrenador ganador elige patear o recibir en la primera mitad.",
        dice: "1D6 vs 1D6",
      },
    ],
  },
  {
    key: "durante-el-partido",
    title: "Durante el Partido",
    intro:
      "Esta secuencia se repite en cada entrada (drive) — cada vez que se saca de centro. Un partido normal tiene 16 turnos por equipo (8 por parte).",
    steps: [
      {
        order: 1,
        title: "Despliegue",
        description:
          "El equipo que patea despliega primero: mínimo 3 jugadores en el corredor central, máximo 2 por banda. Después despliega el equipo receptor con las mismas reglas.",
      },
      {
        order: 2,
        title: "La Patada Inicial",
        description:
          "El equipo que patea designa a su jugador pateador y elige la casilla objetivo en el campo rival.",
      },
      {
        order: 3,
        title: "Evento de Patada Inicial",
        description:
          "Mientras el balón vuela, se tira 2D6 y se consulta la Tabla de Eventos de Patada Inicial (Árbitro Intimidado, Clima Cambiante, ¡A la Carga!...).",
        dice: "2D6",
      },
      {
        order: 4,
        title: "Desvío del Balón",
        description:
          "El balón se desvía: 1D8 para la dirección y 1D6 para la distancia. La habilidad Patada del jugador pateador reduce la distancia a 1D3.",
        dice: "1D8 + 1D6",
      },
      {
        order: 5,
        title: "Recepción",
        description:
          "Si el balón cae en una casilla ocupada, ese jugador intenta atraparlo. Si cae en una casilla vacía, rebota una vez. Si sale del campo, es Touchback: el equipo receptor elige quién lo recibe.",
        dice: "1D8 (rebote)",
      },
      {
        order: 6,
        title: "Turnos de Equipo",
        description:
          "Los entrenadores alternan turnos. En su turno, cada jugador puede activarse una vez: Mover, Placar, Blitz (mover+placar, 1 por turno), Pase (1 por turno), Entrega en Mano, Lanzar Compañero (1 por turno) o Falta. El turno termina en Cambio de Turno (Turnover): un jugador propio es derribado, falla una recogida/atrapada con el balón en juego, o se anota un touchdown.",
      },
      {
        order: 7,
        title: "Entre Entradas: Recuperación",
        description:
          "Antes de la siguiente Patada Inicial, cada jugador Inconsciente tira para recuperarse (4+) y volver al banquillo de Reservas.",
        dice: "1D6",
      },
    ],
    note: "Al completar los 8 turnos de cada equipo (16 turnos totales) termina la primera mitad: se intercambian los roles de patear/recibir y se repite toda esta secuencia para la segunda mitad.",
  },
  {
    key: "post-partido",
    title: "Post-Partido",
    intro: "Se resuelve una sola vez, al terminar el partido, en este orden.",
    steps: [
      {
        order: 1,
        title: "Ganancias",
        description:
          "La Afluencia es la suma de los Factores de Hinchas de ambos equipos. Ganancias (MO) = ((Afluencia / 2) + Touchdowns propios + 1 si no retuviste el balón) × 10.000.",
      },
      {
        order: 2,
        title: "Actualizar Hinchas",
        description:
          "Tira 1D6: si iguala o supera tu Factor de Hinchas actual, ganas +1. Si queda muy por debajo, pierdes -1. Empate cercano no cambia nada.",
        dice: "1D6",
      },
      {
        order: 3,
        title: "Jugador Más Valioso (MVP)",
        description:
          "Se eligen 6 candidatos (o se sortean) y se tira 1D6 para repartir los 4 Puntos de Estrellato del MVP a uno de ellos.",
        dice: "1D6",
      },
      {
        order: 4,
        title: "Gestión de Plantilla",
        description:
          "Fichar nuevos jugadores, despedir a los que sobren, o confirmar como fijo a un Sustituto que jugó bien.",
      },
      {
        order: 5,
        title: "Errores Costosos",
        description:
          "Si la tesorería del club llega o supera 100.000 MO, tira para comprobar si sufres una pérdida por indisciplina, fiestas imprevistas u otras crisis.",
        dice: "1D6",
      },
      {
        order: 6,
        title: "Actualizar el Valor de Equipo (VAE)",
        description:
          "Recalcula el VAE total con los cambios de plantilla y de nivel. Los jugadores con lesión duradera (MNG) no cuentan para el VAE del próximo partido.",
      },
    ],
  },
];
