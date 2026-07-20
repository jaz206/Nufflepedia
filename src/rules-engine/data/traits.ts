import type { TraitDefinition } from "../types";

/**
 * Rasgos: cualidades especiales de ciertos jugadores/razas que NO forman
 * parte de las 6 categorías de habilidades (no se compran con PE en la
 * progresión normal). Portado desde Skills.md.
 */
export const TRAITS: TraitDefinition[] = [
  // ── Generales ────────────────────────────────────────────────────────
  {
    key: "animal-savagery",
    name: "Animal Savagery",
    category: "General",
    description: "Con 1-3 en 1D6, ataca a un compañero adyacente para poder activarse.",
  },
  {
    key: "unchannelled-fury",
    name: "Unchannelled Fury",
    category: "General",
    description: "Con 1-3, la activación termina inmediatamente.",
  },
  {
    key: "bone-head",
    name: "Bone Head",
    category: "General",
    description: "Con 1, el jugador no actúa y queda Distraído.",
  },
  {
    key: "really-stupid",
    name: "Really Stupid",
    category: "General",
    description: "Falla con 1-2, salvo que tenga un compañero adyacente.",
  },
  {
    key: "always-hungry",
    name: "Always Hungry",
    category: "General",
    description: "Al lanzar un compañero, con 1 en 1D6 intenta comérselo.",
  },
  {
    key: "animosity",
    name: "Animosity (X)",
    category: "General",
    description: "Con 1 en 1D6, se niega a pasar el balón a ciertos compañeros.",
  },
  {
    key: "unsteady",
    name: "Tembloroso",
    englishName: "Unsteady",
    category: "General",
    description:
      "Este jugador tiene prohibido declarar la acción de Asegurar el balón. Además, tiene un penalizador de -1 a cualquier tirada de Agilidad.",
  },

  // ── Resistencia ──────────────────────────────────────────────────────
  {
    key: "thick-skull",
    name: "Thick Skull",
    category: "Resistencia",
    description: "Resultado 9 en heridas → Aturdido.",
  },
  {
    key: "iron-skin",
    name: "Iron Skin",
    category: "Resistencia",
    description: "No se aplican modificadores a Armadura y anula Garras.",
  },
  {
    key: "regeneration",
    name: "Regeneration",
    category: "Resistencia",
    description: "Con 4+, ignora completamente la baja.",
  },
  {
    key: "decay",
    name: "Decay",
    category: "Resistencia",
    description: "+1 a tiradas de Lesión contra el jugador.",
  },
  {
    key: "stunty",
    name: "Stunty",
    category: "Resistencia",
    description: "Ignora zonas de defensa al esquivar pero -1 Armadura.",
  },

  // ── Ataque ───────────────────────────────────────────────────────────
  {
    key: "stab",
    name: "Stab",
    category: "Ataque",
    description: "Tirada directa de Armadura sin modificadores.",
  },
  {
    key: "chainsaw",
    name: "Chainsaw",
    category: "Ataque",
    description: "+3 Armadura. Con 1, el usuario se hiere.",
  },
  {
    key: "projectile-vomit",
    name: "Projectile Vomit",
    category: "Ataque",
    description: "Ataque especial contra rival adyacente.",
  },
  {
    key: "firebreath",
    name: "Firebreath",
    category: "Ataque",
    description: "Con 4+, el rival cae.",
  },
  {
    key: "ball-and-chain",
    name: "Ball & Chain",
    category: "Ataque",
    description: "Movimiento aleatorio y placajes automáticos.",
  },

  // ── Acciones especiales ──────────────────────────────────────────────
  {
    key: "bombardier",
    name: "Bombardier",
    category: "AccionEspecial",
    description: "Permite lanzar una bomba.",
  },
  {
    key: "kick-team-mate",
    name: "Kick Team-mate",
    category: "AccionEspecial",
    description: "Variante de lanzamiento mediante patada.",
  },

  // ── Tamaño ───────────────────────────────────────────────────────────
  {
    key: "titchy",
    name: "Titchy",
    category: "Tamano",
    description: "+1 a Esquivar y no aplica penalizador por marcaje.",
  },
  {
    key: "right-stuff",
    name: "Right Stuff",
    category: "Tamano",
    description: "Puede ser lanzado por un compañero.",
  },
  {
    key: "swoop",
    name: "Swoop",
    category: "Tamano",
    description: "Permite controlar la dirección de aterrizaje tras ser lanzado.",
  },

  // ── Despliegue ───────────────────────────────────────────────────────
  {
    key: "swarming",
    name: "Swarming",
    category: "Despliegue",
    description:
      "Al inicio de una entrada, el equipo puede añadir 1D3 jugadores extra desde Reservas.",
  },
  {
    key: "infected",
    name: "Infected",
    category: "Despliegue",
    description: "Si mata a un rival de FU ≤ 4, genera un jugador gratis en Reservas.",
  },

  // ── Jugador estrella ─────────────────────────────────────────────────
  {
    key: "incorporeal",
    name: "Incorporeal",
    category: "JugadorEstrella",
    description:
      "Puede abandonar una zona de defensa sin tirar Esquiva una vez por activación.",
  },
  {
    key: "blind-rage",
    name: "Blind Rage",
    category: "JugadorEstrella",
    description: "Puede repetir el dado al usar Valentía.",
  },
  {
    key: "tasty-morsel",
    name: "Tasty Morsel",
    category: "JugadorEstrella",
    description: "Puede morder a un rival débil para satisfacer Sed de Sangre.",
  },
];

export function getTraitByKey(key: string): TraitDefinition | undefined {
  return TRAITS.find((t) => t.key === key);
}
