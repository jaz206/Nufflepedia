/**
 * Costes de progresión (gastar PE) y su impacto en el Valor de Equipo (VAE/TV).
 * Portado desde CODEX_REGLAS_S3.md, sección V.
 *
 * TODO: el manual completo define coste en PE según cuántas habilidades tiene
 * ya el jugador (la progresión sube en escalones, no es un coste plano). Esta
 * es una primera pasada con los valores base documentados; hay que completar
 * la tabla de umbrales por nivel antes de usarla en producción.
 */

export const LEVEL_UP_SPP_COST = {
  primarySkillRandom: 3,
  primarySkillChosen: 6,
  secondarySkillChosen: 12,
  /** Coste en PE para tirar mejora de atributo (1D8 determina cuál sube). */
  attributeRandom: 14,
} as const;

export const LEVEL_UP_TV_IMPACT_GP = {
  primarySkill: 20_000,
  secondarySkill: 40_000,
  attribute: { min: 10_000, max: 60_000 },
} as const;

/**
 * Habilidades Élite S3: recargo adicional acumulable al coste normal de
 * mejora en MO (no en PE).
 */
export const ELITE_SKILL_SURCHARGE_GP = 10_000;
