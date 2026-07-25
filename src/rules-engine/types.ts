/**
 * Tipos base del motor de reglas. Este módulo es contenido puro: no depende de
 * React, Next.js ni de la base de datos. Representa el manual oficial de
 * Blood Bowl Season 3, no datos de usuario.
 */

export type SkillCategory =
  | "General"
  | "Agilidad"
  | "Fuerza"
  | "Pase"
  | "Mutacion"
  | "Triquinuelas";

export interface SkillDefinition {
  /** Slug estable, no cambia aunque cambie el nombre mostrado. */
  key: string;
  name: string;
  englishName?: string;
  category: SkillCategory;
  /** true = acción declarada por el entrenador. false = pasiva/automática. */
  isActive: boolean;
  /** S3: recargo de +10,000 MO acumulable al coste normal de mejora. */
  isElite?: boolean;
  description: string;
}

export type TraitCategory =
  | "General"
  | "Resistencia"
  | "Ataque"
  | "AccionEspecial"
  | "Tamano"
  | "Despliegue"
  | "JugadorEstrella";

export interface TraitDefinition {
  key: string;
  name: string;
  englishName?: string;
  category: TraitCategory;
  description: string;
}

export type Attribute = "MA" | "ST" | "AG" | "PA" | "AV";

export interface AttributeBlock {
  MA: number;
  ST: number;
  /** AG y PA se guardan como "para superar" (AG+), cuanto más bajo mejor. */
  AG: number;
  PA: number;
  AV: number;
}

/**
 * Estados de un jugador durante y entre partidos.
 */
export type PlayerStatus =
  | "STANDING" // En pie
  | "DISTRACTED" // Distraído (pierde su zona de defensa; ver rules-engine/data/tables/playerStates.ts)
  | "PRONE" // Tumbado
  | "STUNNED" // Aturdido
  | "KO" // Inconsciente (recupera con 4+ en cada patada inicial)
  | "BADLY_HURT" // Magullado (BHL) - falta solo este partido
  | "MISS_NEXT_GAME" // Apaleado / Herida Grave (MNG) - falta el siguiente
  | "NIGGLING_INJURY" // Herida Permanente que deja secuela pero el jugador sigue jugando
  | "DEAD" // Muerto
  | "SENT_OFF" // Expulsado (resto del partido)
  | "RESERVES"; // En el banquillo / reservas
