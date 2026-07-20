import type { SkillDefinition } from "../types";

/**
 * Catálogo de habilidades Season 3, portado desde la investigación previa del
 * proyecto (Skills.md) como CONTENIDO, no como código heredado.
 *
 * Estado: primera pasada. El objetivo del manual es 72+ habilidades en las 6
 * categorías oficiales; este catálogo cubre el núcleo ya documentado y debe
 * ampliarse hasta cubrir el listado completo del manual S3.
 *
 * TODO(verify contra el manual oficial): el documento fuente listaba
 * "Dump-off" tanto en Agilidad ("Pase precipitado") como en Triquiñuelas
 * ("Dejada"), y "Shadowing" tanto en General ("Marcaje de Sombra", éxito 6+)
 * como en Triquiñuelas ("Perseguir", éxito 4+). Se han mantenido como
 * entradas separadas por categoría porque así estaban documentadas, pero el
 * umbral de éxito distinto (6+ vs 4+) debe confirmarse contra el manual.
 */
export const SKILLS: SkillDefinition[] = [
  // ── General ──────────────────────────────────────────────────────────
  {
    key: "grab",
    name: "Apartar",
    englishName: "Grab",
    category: "General",
    isActive: false,
    description:
      "Al empujar, el entrenador elige la casilla de destino (de las 3 disponibles). Anula Echarse a un lado. No compatible con Furia.",
  },
  {
    key: "block",
    name: "Placar",
    englishName: "Block",
    category: "General",
    isActive: false,
    isElite: true,
    description:
      'El resultado "Ambos Derribados" no afecta a este jugador; permanece de pie si el rival no tiene la habilidad. Elevada a categoría Élite en Temporada 3.',
  },
  {
    key: "defensive",
    name: "Defensa",
    englishName: "Defensive",
    category: "General",
    isActive: false,
    description:
      "Durante el turno del oponente, anula la habilidad Defensa de Equipo (Guard) de cualquier rival que marque a este jugador.",
  },
  {
    key: "dodge",
    name: "Esquivar",
    englishName: "Dodge",
    category: "General",
    isActive: false,
    isElite: true,
    description:
      'Permite repetir una tirada de Esquiva fallida por turno. Además, convierte "Defensor Tropieza" (Pow-Push) en "Empujado". Elevada a categoría Élite en Temporada 3.',
  },
  {
    key: "frenzy",
    name: "Furia",
    englishName: "Frenzy",
    category: "General",
    isActive: false,
    description:
      "Obligatorio seguir tras un placaje. Si el rival es empujado, debe realizar un segundo placaje inmediato si sigue adyacente.",
  },
  {
    key: "leader",
    name: "Liderazgo",
    englishName: "Leader",
    category: "General",
    isActive: false,
    description:
      "Otorga una Segunda Oportunidad de equipo adicional mientras el jugador esté en el campo.",
  },
  {
    key: "marcaje-de-sombra",
    name: "Marcaje de Sombra",
    englishName: "Shadowing",
    category: "General",
    isActive: false,
    description:
      "Permite seguir a un rival que abandona su zona de defensa. 1D6 + MV propio - MV rival, éxito con 6+.",
  },
  {
    key: "kick",
    name: "Patada",
    englishName: "Kick",
    category: "General",
    isActive: false,
    description:
      "Si el jugador no está en los extremos ni en la línea, divide a la mitad la dispersión del balón en la patada inicial.",
  },
  {
    key: "tackle",
    name: "Placaje",
    englishName: "Tackle",
    category: "General",
    isActive: false,
    description:
      "Los oponentes en su zona de defensa no pueden usar Esquivar para salir ni para evitar ser derribados.",
  },
  {
    key: "pro",
    name: "Profesional",
    englishName: "Pro",
    category: "General",
    isActive: true,
    description:
      "Permite repetir una tirada (excepto Armadura, Herida o Bajas) sacando previamente 3+ en 1D6.",
  },
  {
    key: "taunt",
    name: "Provocar",
    englishName: "Taunt",
    category: "General",
    isActive: true,
    description:
      "Una vez por turno, obliga a un rival adyacente con balón a realizar un bloqueo contra este jugador.",
  },
  {
    key: "strip-ball",
    name: "Robar el balón",
    englishName: "Strip Ball",
    category: "General",
    isActive: false,
    description:
      'Con "Empujado" o "Defensor Tropieza", el rival suelta el balón.',
  },
  {
    key: "break-tackle",
    name: "Superar defensas",
    englishName: "Break Tackle",
    category: "General",
    isActive: true,
    description:
      "Permite usar Fuerza en lugar de Agilidad para esquivar (una vez por activación).",
  },
  {
    key: "dauntless",
    name: "Valentía",
    englishName: "Dauntless",
    category: "General",
    isActive: false,
    description:
      "Si el rival es más fuerte: 1D6 + FU propia. Si supera la FU rival, la iguala para ese placaje.",
  },
  {
    key: "fend",
    name: "Zafarse",
    englishName: "Fend",
    category: "General",
    isActive: false,
    description: "Los rivales no pueden seguir (Follow-up) tras placar a este jugador.",
  },

  // ── Agilidad ─────────────────────────────────────────────────────────
  {
    key: "catch",
    name: "Atrapar",
    englishName: "Catch",
    category: "Agilidad",
    isActive: false,
    description: "Repite tiradas para atrapar, entregas o intercepciones.",
  },
  {
    key: "diving-catch",
    name: "Atrapar en picado",
    englishName: "Diving Catch",
    category: "Agilidad",
    isActive: true,
    description:
      "Puede atrapar balones que aterricen en casillas adyacentes. +1 a atrapar pases precisos.",
  },
  {
    key: "sidestep",
    name: "Echarse a un lado",
    englishName: "Sidestep",
    category: "Agilidad",
    isActive: false,
    description: "Si es empujado, el entrenador elige la casilla adyacente vacía de destino.",
  },
  {
    key: "sure-hands",
    name: "El balón es mío",
    englishName: "Sure Hands",
    category: "Agilidad",
    isActive: false,
    description: "Repite tiradas para recoger el balón. Inmune a Robar el balón.",
  },
  {
    key: "jump-up",
    name: "En pie de un salto",
    englishName: "Jump Up",
    category: "Agilidad",
    isActive: true,
    description:
      "Levantarse cuesta 0 MV. Puede placar desde el suelo con chequeo de Agilidad +2.",
  },
  {
    key: "steady-footing",
    name: "Equilibrio firme",
    englishName: "Steady Footing",
    category: "Agilidad",
    isActive: true,
    description: "Puede repetir una tirada de Esquiva por activación.",
  },
  {
    key: "sprint",
    name: "Esprintar",
    englishName: "Sprint",
    category: "Agilidad",
    isActive: false,
    description: "Permite realizar hasta 3 acciones de Forzar la marcha (GFI).",
  },
  {
    key: "wrestle",
    name: "Forcejear",
    englishName: "Wrestle",
    category: "Agilidad",
    isActive: false,
    description: 'En "Ambos Derribados", ambos caen sin tirar armadura.',
  },
  {
    key: "sure-feet",
    name: "Pies firmes",
    englishName: "Sure Feet",
    category: "Agilidad",
    isActive: true,
    description: "Repite una tirada fallida de Forzar la marcha por turno.",
  },
  {
    key: "diving-tackle",
    name: "Placaje defensivo",
    englishName: "Diving Tackle",
    category: "Agilidad",
    isActive: true,
    description:
      "El rival resta -2 a esquivar para salir de su zona de defensa. El jugador queda tumbado tras usarlo.",
  },
  {
    key: "leap",
    name: "Saltar",
    englishName: "Leap",
    category: "Agilidad",
    isActive: true,
    description: "Permite saltar sobre casillas ocupadas con chequeo de Agilidad.",
  },
  {
    key: "nerves-of-steel",
    name: "Recepción heroica",
    englishName: "Nerves of Steel",
    category: "Agilidad",
    isActive: false,
    description:
      "Ignora modificadores por zonas de defensa al pasar, atrapar o interceptar.",
  },
  {
    key: "on-the-ball",
    name: "Atento al balón",
    englishName: "On the Ball",
    category: "Agilidad",
    isActive: false,
    description:
      "Durante un pase o secuencia de patada inicial, puede moverse hasta 3 casillas gratis.",
  },

  // ── Fuerza ───────────────────────────────────────────────────────────
  {
    key: "strong-arm",
    name: "Brazo fuerte",
    englishName: "Strong Arm",
    category: "Fuerza",
    isActive: false,
    description: "+1 al lanzar a un compañero.",
  },
  {
    key: "guard",
    name: "Defensa",
    englishName: "Guard",
    category: "Fuerza",
    isActive: false,
    isElite: true,
    description:
      "Da apoyos ofensivos y defensivos aunque esté marcado por otros rivales. Elevada a categoría Élite en Temporada 3.",
  },
  {
    key: "mighty-blow",
    name: "Golpe mortífero (+X)",
    englishName: "Mighty Blow",
    category: "Fuerza",
    isActive: false,
    isElite: true,
    description:
      "Añade +X a la tirada de Armadura o de Herida tras un placaje exitoso. Elevada a categoría Élite en Temporada 3.",
  },
  {
    key: "juggernaut",
    name: "Imparable",
    englishName: "Juggernaut",
    category: "Fuerza",
    isActive: false,
    description:
      "En Blitz, los rivales no usan Zafarse, Mantenerse firme ni Forcejear.",
  },
  {
    key: "throw-team-mate",
    name: "Lanzar compañero",
    englishName: "Throw Team-mate",
    category: "Fuerza",
    isActive: true,
    description: "Permite lanzar jugadores con la característica Humanoide bala.",
  },
  {
    key: "stand-firm",
    name: "Mantenerse firme",
    englishName: "Stand Firm",
    category: "Fuerza",
    isActive: false,
    description: "El jugador elige no ser empujado.",
  },
  {
    key: "multiple-block",
    name: "Multiplicar bloqueo",
    englishName: "Multiple Block",
    category: "Fuerza",
    isActive: true,
    description: "Permite placar a dos rivales adyacentes (FU -2).",
  },

  // ── Pase ─────────────────────────────────────────────────────────────
  {
    key: "hail-mary-pass",
    name: "Lanzamiento a lo loco",
    englishName: "Hail Mary Pass",
    category: "Pase",
    isActive: true,
    description: "Lanza a cualquier distancia con mayor dispersión.",
  },
  {
    key: "pass",
    name: "Pasar",
    englishName: "Pass",
    category: "Pase",
    isActive: false,
    description: "+1 a tiradas de Pase y permite repetir una fallida.",
  },
  {
    key: "safe-pass",
    name: "Pasar y seguir",
    englishName: "Safe Pass",
    category: "Pase",
    isActive: false,
    description: "Si el pase falla, el balón cae a sus pies y no causa Turnover.",
  },
  {
    key: "safe-pair-of-hands",
    name: "Pase seguro",
    englishName: "Safe Pair of Hands",
    category: "Pase",
    isActive: false,
    description: "Si el jugador cae o es derribado, el balón no rebota.",
  },

  // ── Mutación ─────────────────────────────────────────────────────────
  {
    key: "claws",
    name: "Garras",
    englishName: "Claws",
    category: "Mutacion",
    isActive: false,
    description: "Rompe armadura automáticamente con un 8 natural.",
  },
  {
    key: "tentacles",
    name: "Tentáculos",
    englishName: "Tentacles",
    category: "Mutacion",
    isActive: false,
    description:
      "Impide que rivales se alejen. 1D6 + FU propia - FU rival, éxito con 6+.",
  },
  {
    key: "prehensile-tail",
    name: "Cola prensil",
    englishName: "Prehensile Tail",
    category: "Mutacion",
    isActive: false,
    description: "Rivales -1 a Esquivar, Saltar o Brincar.",
  },
  {
    key: "two-heads",
    name: "Dos cabezas",
    englishName: "Two Heads",
    category: "Mutacion",
    isActive: false,
    description: "+1 a todas las tiradas de Esquiva.",
  },
  {
    key: "extra-arms",
    name: "Extremidades extra",
    englishName: "Extra Arms",
    category: "Mutacion",
    isActive: false,
    description: "+1 a recoger o atrapar el balón.",
  },

  // ── Triquiñuelas ─────────────────────────────────────────────────────
  {
    key: "underhanded",
    name: "Agresor discreto",
    englishName: "Underhanded",
    category: "Triquinuelas",
    isActive: true,
    description:
      "Permite repetir una tirada de Armadura fallida al realizar una acción de Falta si no hay defensores prestando apoyos.",
  },
  {
    key: "crunch",
    name: "Crujir",
    englishName: "Crunch",
    category: "Triquinuelas",
    isActive: false,
    description: "Habilidad de impacto tras derribar a un oponente.",
  },
  {
    key: "dump-off",
    name: "Dejada",
    englishName: "Dump-off",
    category: "Triquinuelas",
    isActive: true,
    description:
      "Permite realizar un pase rápido justo antes de ser bloqueado por un rival. Reflejada en esta categoría según reglamentación de Temporada 3.",
  },
  {
    key: "quick-foul",
    name: "Falta rápida",
    englishName: "Quick Foul",
    category: "Triquinuelas",
    isActive: true,
    description:
      "Permite realizar una acción de Falta sin terminar la activación del jugador, pudiendo seguir moviéndose después.",
  },
  {
    key: "sneaky-git",
    name: "Furtivo",
    englishName: "Sneaky Git",
    category: "Triquinuelas",
    isActive: false,
    description:
      "Solo es expulsado al cometer una falta si saca un doble en la armadura y además logra romperla. Si saca dobles pero no abre chapa, ya no es expulsado.",
  },
  {
    key: "violent-innovator",
    name: "Innovador violento",
    englishName: "Violent Innovator",
    category: "Triquinuelas",
    isActive: false,
    description:
      "Si un rival sufre una Lesión debido a una acción especial de este jugador, este gana los Puntos de Estrellato (PE) correspondientes.",
  },
  {
    key: "dirty-player",
    name: "Jugar sucio (+X)",
    englishName: "Dirty Player",
    category: "Triquinuelas",
    isActive: false,
    description:
      "Proporciona un bonificador a la tirada de Armadura o Herida al realizar una falta.",
  },
  {
    key: "put-the-boot-in",
    name: "Meter la bota",
    englishName: "Put the Boot In",
    category: "Triquinuelas",
    isActive: false,
    description:
      "Permite prestar apoyos ofensivos a una acción de Falta sin importar cuántos rivales estén marcando al jugador.",
  },
  {
    key: "perseguir",
    name: "Perseguir",
    englishName: "Shadowing",
    category: "Triquinuelas",
    isActive: false,
    description:
      "Permite seguir a un rival que intenta esquivar para salir de la zona de defensa. 1D6 + MV propio - MV rival, éxito con 4+.",
  },
  {
    key: "eye-gouge",
    name: "Piquete de ojos",
    englishName: "Eye Gouge",
    category: "Triquinuelas",
    isActive: false,
    description:
      "Al empujar a un rival, este no puede prestar apoyos ofensivos ni defensivos hasta que vuelva a ser activado.",
  },
  {
    key: "saboteur",
    name: "Saboteador",
    englishName: "Saboteur",
    category: "Triquinuelas",
    isActive: true,
    description:
      "Si este jugador es derribado, puede intentar sabotear la armadura del atacante; con 4+, el arma explota y el atacante queda Inconsciente.",
  },
  {
    key: "lethal-flight",
    name: "Vuelo letal",
    englishName: "Lethal Flight",
    category: "Triquinuelas",
    isActive: false,
    description:
      "Si un compañero lanza a este jugador, puede sumar +1 a la tirada de aterrizaje y el daño por impacto a rivales aumenta.",
  },
];

export const ELITE_SKILL_KEYS = SKILLS.filter((s) => s.isElite).map((s) => s.key);

export function getSkillByKey(key: string): SkillDefinition | undefined {
  return SKILLS.find((s) => s.key === key);
}

export function getSkillsByCategory(category: SkillDefinition["category"]): SkillDefinition[] {
  return SKILLS.filter((s) => s.category === category);
}
