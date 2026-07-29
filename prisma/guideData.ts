/**
 * Contenido semilla de /guia (qué es y para qué sirve cada apartado del
 * menú lateral) — no es contenido de reglas oficiales, así que vive aquí
 * y no en src/rules-engine/, pero sigue el mismo patrón: semilla versionada
 * → tabla Master* editable desde /admin. Los títulos deben coincidir
 * EXACTAMENTE con las etiquetas reales del menú (editables en
 * /admin/menu) — si se renombra una entrada del menú, actualizar aquí
 * también para no reabrir la confusión de nombres ya vivida antes.
 */

export interface GuideSectionSeed {
  key: string;
  emoji: string;
  title: string;
  href: string;
  color: string;
  description: string;
  sortOrder: number;
}

export const GUIDE_SECTIONS: GuideSectionSeed[] = [
  {
    key: "biblioteca",
    emoji: "📖",
    title: "Biblioteca de Reglas",
    href: "/nufflepedia",
    color: "#8a5cf6",
    description:
      "Consulta rápida de reglas: 72 habilidades, 40 rasgos, las 31 razas oficiales y los 68 Jugadores Estrella. Es pública — puedes compartir el enlace con quien no tenga cuenta.",
    sortOrder: 0,
  },
  {
    key: "tablas",
    emoji: "🎲",
    title: "Tablas de Tiradas",
    href: "/nufflepedia/tablas",
    color: "#2f9e44",
    description:
      "Todas las tablas de dados en un solo sitio (Clima, Patada Inicial, Lesiones, Plegarias a Nuffle, Incentivos, Reglas especiales) — para consultarlas rápido en mesa sin bucear entre habilidades.",
    sortOrder: 1,
  },
  {
    key: "secuencia_partido",
    emoji: "🧾",
    title: "Secuencia de Partido",
    href: "/nufflepedia/partido",
    color: "#1971c2",
    description:
      "Chuleta paso a paso de un partido oficial: preparación, secuencia previa, inicio de entrada, turnos, final de entrada y final del partido. Para no saltarte nada mientras juegas.",
    sortOrder: 2,
  },
  {
    key: "equipos",
    emoji: "🏰",
    title: "Mis Equipos",
    href: "/equipos",
    color: "#e8590c",
    description:
      "Aquí fundas y gestionas tus equipos: eliges raza (con ficha completa y guía de dificultad para decidir), fichas jugadores, compras personal de banquillo (relanzamientos, animadoras, apotecario...) y subes de nivel gastando PE.",
    sortOrder: 3,
  },
  {
    key: "competiciones",
    emoji: "🏟️",
    title: "Torneos y Ligas Locales",
    href: "/competiciones",
    color: "#c92a2a",
    description:
      "Crea o únete a ligas y torneos con tu grupo habitual. Las ligas generan calendario automático a doble vuelta; los torneos, cuadro de eliminatoria (con fase de grupos opcional). Cada equipo juega con una copia de su plantilla aislada solo para esa competición, y cada jornada/fase terminada genera un número de Balonazo Sangriento, la revista de la competición.",
    sortOrder: 4,
  },
  {
    key: "torneos_naf",
    emoji: "🏆",
    title: "Torneos NAF",
    href: "/torneos-presenciales",
    color: "#0c8599",
    description:
      "Para un evento de un día con muchas mesas a la vez: inscripción sin necesidad de cuenta, emparejamiento suizo automático (evita repetir rival, reparte los descansos), resultados centralizados por el organizador, y una pantalla pública sin login para proyectar los emparejamientos y la clasificación.",
    sortOrder: 5,
  },
  {
    key: "pizarra",
    emoji: "🗺️",
    title: "Pizarra Táctica",
    href: "/pizarra",
    color: "#495057",
    description:
      "Elige un equipo y dibuja formaciones con tus jugadores reales sobre un tablero de 26×15, con imán a la cuadrícula. Guarda jugadas con nombre para consultarlas luego — la ficha nunca pierde la referencia al jugador real.",
    sortOrder: 6,
  },
  {
    key: "arena",
    emoji: "⚔️",
    title: "Asistente de Partido",
    href: "/arena",
    color: "#ae3ec9",
    description:
      "Para amistosos sueltos: elige tu equipo y el rival (otro tuyo, el de un amigo con cuenta, o uno creado al vuelo) y lleva el partido en directo — marcador, turnos, Touchdowns, bajas y más, cada botón con una explicación para ir aprendiendo el reglamento.",
    sortOrder: 7,
  },
];

export interface GuideFaqSeed {
  key: string;
  question: string;
  answer: string;
  sortOrder: number;
}

export const GUIDE_FAQ: GuideFaqSeed[] = [
  {
    key: "amistoso_sin_liga",
    question: "¿Necesito crear una liga para jugar un partido suelto?",
    answer:
      "No — para eso está el Asistente de Partido (/arena). Sirve para amistosos sin tener que montar una liga o torneo entero.",
    sortOrder: 0,
  },
  {
    key: "amigo_sin_cuenta",
    question: "¿Qué pasa si mi amigo no tiene cuenta?",
    answer:
      'Puedes crear un equipo "invitado" para él al vuelo desde /arena/nuevo — eliges raza y nombre, montas su plantilla, y ya podéis jugar.',
    sortOrder: 1,
  },
  {
    key: "amistoso_afecta_equipo",
    question: "¿Los resultados de un amistoso afectan a mi equipo real?",
    answer:
      "Sí — a diferencia de una competición (que usa una copia aislada de la plantilla), un amistoso terminado aplica los PE, lesiones y demás cambios directamente a tu equipo de Mis Equipos.",
    sortOrder: 2,
  },
  {
    key: "partido_a_medias",
    question: "¿Puedo dejar un partido a medias y seguir otro día?",
    answer:
      "Sí. Todo se va guardando mientras juegas, así que puedes cerrar la pestaña y retomarlo más tarde desde el Dashboard o desde /arena.",
    sortOrder: 3,
  },
  {
    key: "dados_fisicos",
    question: "¿Por qué la app no tira los dados por mí?",
    answer:
      "Es a propósito: sigues jugando con tus dados físicos en la mesa. La app te dice qué tirada toca y solo registra el resultado que tú ya has decidido.",
    sortOrder: 4,
  },
  {
    key: "sin_tablero",
    question: "¿Sirve para jugar sin tablero ni miniaturas?",
    answer: "Hoy no — está pensada como ayudante mientras juegas en mesa con miniaturas, no como sustituto del tablero.",
    sortOrder: 5,
  },
  {
    key: "torneos_naf_vs_locales",
    question: "¿En qué se diferencian «Torneos y Ligas Locales» de «Torneos NAF»?",
    answer:
      "Torneos y Ligas Locales es vuestra liga habitual de la peña, con temporada larga y equipos guardados. Torneos NAF es para un evento grande de un solo día, con inscripción rápida (sin cuenta) y emparejamiento suizo — no está certificado por la NAF, el nombre es solo por el estilo de reglamento en el que se inspira.",
    sortOrder: 6,
  },
];
