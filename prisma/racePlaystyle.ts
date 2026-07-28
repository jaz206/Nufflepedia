/**
 * Guía propia (no del reglamento oficial) para elegir raza al fundar
 * equipo: dificultad recomendada + resumen del estilo de juego. Vive
 * aparte de racesData.ts a propósito — ese archivo es una transcripción
 * fiel del roster oficial, esto es opinión nuestra para ayudar a decidir.
 * prisma/seedRaces.ts los une por `key` al sembrar MasterRace.
 */

export interface RacePlaystyle {
  /** 1 (fácil, buena primera raza) a 5 (difícil, exige ya conocer el juego). No es un tier competitivo oficial. */
  difficulty: number;
  playstyle: string;
}

export const RACE_PLAYSTYLE: Record<string, RacePlaystyle> = {
  amazonas: {
    difficulty: 2,
    playstyle: "Equipo equilibrado y sin puntos débiles graves: pega razonablemente, corre razonablemente y no es frágil. Muy recomendable para empezar.",
  },
  "orcos-negros": {
    difficulty: 3,
    playstyle: "Bloqueo puro y lento con Trol incluido: pega muy fuerte pero corre poco y casi no pasa. Fácil de jugar, se queda corto si el rival juega a la defensiva.",
  },
  bretonianos: {
    difficulty: 4,
    playstyle: "Equipo humano sin especialistas destacados — bastante flojo sobre el papel y exige mucha táctica para sacarle partido. No recomendado como primer equipo.",
  },
  "elegidos-del-caos": {
    difficulty: 3,
    playstyle: "Pegan muy fuerte (con Minotauro/Trol opcional) pero son lentos y torpes con el balón. Divertidos, premian la paciencia.",
  },
  "enanos-del-caos": {
    difficulty: 2,
    playstyle: "Línea muy dura reforzada por Toros Centauro rápidos y fuertes a la vez — de los equipos más completos y sencillos de llevar.",
  },
  "renegados-del-caos": {
    difficulty: 3,
    playstyle: "Mezcla de razas dispares (un Ogro, un Skaven suelto...) sin identidad de equipo clara — divertido por la variedad, pero difícil de planificar.",
  },
  "elfos-oscuros": {
    difficulty: 2,
    playstyle: "Rápidos y versátiles, con buen equilibrio entre ataque y pase — de los elfos más fáciles de aprender, menos frágiles que otros.",
  },
  enanos: {
    difficulty: 1,
    playstyle: "El equipo más defensivo y resistente del juego: casi no se lesiona y ahoga al rival poco a poco. Perdona errores de novato — muy recomendable para empezar.",
  },
  "union-elfica": {
    difficulty: 2,
    playstyle: "Elfos generalistas, buenos pasando y corriendo, pero frágiles como todos los elfos — cada baja duele. Buena introducción al estilo élfico.",
  },
  gnomos: {
    difficulty: 5,
    playstyle: "Equipo Stunty pequeño y débil, pensado para quien ya conoce bien el juego y busca un reto. No para el primer equipo.",
  },
  goblins: {
    difficulty: 5,
    playstyle: "Caótico y muy débil sobre el papel — brilla por las armas secretas y los líos, no por ganar con solvencia. Muy divertido, muy difícil de ganar con él.",
  },
  halflings: {
    difficulty: 5,
    playstyle: "El equipo más débil en combate del juego — sobrevive gracias a los Hombres Árbol prestados y a mucha suerte. Solo para quien ya sepa lo que hace.",
  },
  humanos: {
    difficulty: 2,
    playstyle: "El equipo de manual: un poco de todo, sin sorpresas. Ideal para aprender las bases antes de especializarte en otra raza.",
  },
  "nobles-imperiales": {
    difficulty: 2,
    playstyle: "Variante humana con más golpeo gracias a los Ogros del roster — sigue siendo equilibrado y fácil de entender.",
  },
  khorne: {
    difficulty: 3,
    playstyle: "Todo pegada y sed de sangre, poco balón — directo y agresivo, pero se queda corto si el rival juega a no dejarle el balón.",
  },
  "hombres-lagarto": {
    difficulty: 2,
    playstyle: "Los Kroxigor pegan durísimo y los Eslizones corren muchísimo — combinación potente, aunque los Saurios son algo torpes con el balón.",
  },
  "horrores-nigromanticos": {
    difficulty: 3,
    playstyle: "Buena mezcla de velocidad (Fantasmas) y pegada (Momias), pero los Zombis de línea son flojos — exige saber compensar sus huecos.",
  },
  norses: {
    difficulty: 2,
    playstyle: "Agresivos y con Furia en varias posiciones — pegan fuerte y se mueven bien; divertidos y no demasiado difíciles.",
  },
  nurgle: {
    difficulty: 3,
    playstyle: "Muy resistente entre lesiones gracias a Regeneración, pero lento — gana por desgaste a largo plazo más que por explosividad.",
  },
  ogros: {
    difficulty: 4,
    playstyle: "Casi todo el equipo son Ogros Torpes: pegan brutal pero fallan mucho y corren poco. Exige paciencia — no es buena primera raza.",
  },
  "alianza-viejo-mundo": {
    difficulty: 3,
    playstyle: "Combina Humanos, Enanos y un Trol prestado — versátil pero sin la identidad clara de un equipo puro; toca aprender a repartir bien los roles.",
  },
  orcos: {
    difficulty: 1,
    playstyle: "El equipo de bloqueo por excelencia: fuerte, resistente y sin puntos débiles graves. Perdona errores de novato — de los más recomendados para empezar.",
  },
  "no-muertos": {
    difficulty: 3,
    playstyle: "Momias que pegan fuerte y Zombis que aguantan de más gracias a Regeneración — lento pero muy difícil de romper del todo.",
  },
  skaven: {
    difficulty: 2,
    playstyle: "El equipo más rápido del juego, ideal para jugar de carrera y anotación — pero es frágil, así que hay que evitar los golpes, no encajarlos.",
  },
  snotlings: {
    difficulty: 5,
    playstyle: "16 Snotlings diminutos y débiles con el truco del Barrilete Rodante — el equipo más extremo y menos recomendable para empezar.",
  },
  "reyes-tumularios": {
    difficulty: 3,
    playstyle: "Muy resistentes (Regeneración e inmunidades) pero lentísimos y sin pase — un equipo de desgaste puro.",
  },
  "moradores-del-inframundo": {
    difficulty: 3,
    playstyle: "Skaven con Goblins de apoyo — rápido y con trampas, pero frágil como el resto de la familia Skaven.",
  },
  vampiros: {
    difficulty: 4,
    playstyle: "Los Vampiros son letales en ataque pero Sed de Sangre les hace fallar en el peor momento, y los Escoltas Zombis son flojos. Potente pero inconsistente — no recomendado como primer equipo.",
  },
  "elfos-silvanos": {
    difficulty: 3,
    playstyle: "El equipo más rápido y ágil para anotar, pero también de los más frágiles — cada baja duele mucho. Para quien ya domine el juego rápido.",
  },
  "altos-elfos": {
    difficulty: 2,
    playstyle: "Elfos centrados en el juego de pase, con Príncipes Dragón que también pegan lo suyo — buen punto medio entre velocidad élfica y algo de físico.",
  },
  slann: {
    difficulty: 3,
    playstyle: "Hombres-rana con el útil truco del Pogo para saltar placajes, y un Kroxigor de apoyo — divertidos pero poco convencionales, mejor si ya tienes experiencia.",
  },
};
