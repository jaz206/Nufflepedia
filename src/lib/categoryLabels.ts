/**
 * Única fuente de verdad para las categorías de habilidades y rasgos:
 * las usan el schema de validación del admin, los editores y la Nufflepedia.
 */

export const SKILL_CATEGORY_VALUES = [
  "GENERAL",
  "AGILIDAD",
  "FUERZA",
  "PASE",
  "MUTACION",
  "TRIQUINUELAS",
] as const;

export type SkillCategoryValue = (typeof SKILL_CATEGORY_VALUES)[number];

export const SKILL_CATEGORY_LABELS: Record<SkillCategoryValue, string> = {
  GENERAL: "General",
  AGILIDAD: "Agilidad",
  FUERZA: "Fuerza",
  PASE: "Pase",
  MUTACION: "Mutación",
  TRIQUINUELAS: "Triquiñuelas",
};

export const TRAIT_CATEGORY_VALUES = [
  "GENERAL",
  "RESISTENCIA",
  "ATAQUE",
  "ACCION_ESPECIAL",
  "TAMANO",
  "DESPLIEGUE",
  "JUGADOR_ESTRELLA",
] as const;

export type TraitCategoryValue = (typeof TRAIT_CATEGORY_VALUES)[number];

export const TRAIT_CATEGORY_LABELS: Record<TraitCategoryValue, string> = {
  GENERAL: "General",
  RESISTENCIA: "Resistencia",
  ATAQUE: "Ataque",
  ACCION_ESPECIAL: "Acción Especial",
  TAMANO: "Tamaño",
  DESPLIEGUE: "Despliegue",
  JUGADOR_ESTRELLA: "Jugador Estrella",
};
