/**
 * Costes de progresión (gastar PE) y su impacto en el Valor de Equipo (VAE/TV).
 * Verificado contra el reglamento oficial 2025 (Tabla de Mejoras, pág. 97).
 *
 * IMPORTANTE: el coste real depende del NIVEL del jugador (cuántas mejoras
 * tiene ya). La tabla oficial completa está en LEVEL_UP_SPP_COST_TABLE. Los
 * valores de LEVEL_UP_SPP_COST son solo el PRIMER nivel (Experimentado), que
 * es lo único que la base de datos modela por ahora; el motor de progresión
 * completo (Pilar 3) debe usar la tabla por niveles.
 */

/** Coste en PE del primer nivel (Experimentado). Ver tabla completa abajo. */
export const LEVEL_UP_SPP_COST = {
  primarySkillRandom: 3,
  primarySkillChosen: 6,
  secondarySkillChosen: 10,
  /** Coste en PE para tirar mejora de atributo (1D8 determina cuál sube). */
  attributeRandom: 14,
} as const;

/**
 * Tabla de Mejoras oficial 2025 completa (6 niveles). Coste en PE según el
 * número de mejoras que el jugador ya tiene.
 * [ primaria al azar, primaria elegida, secundaria elegida, mejora de atributo ]
 */
export const LEVEL_UP_SPP_COST_TABLE = [
  { level: 1, name: "Experimentado", primaryRandom: 3, primaryChosen: 6, secondaryChosen: 10, attribute: 14 },
  { level: 2, name: "Veterano", primaryRandom: 4, primaryChosen: 8, secondaryChosen: 12, attribute: 16 },
  { level: 3, name: "Estrella emergente", primaryRandom: 6, primaryChosen: 12, secondaryChosen: 16, attribute: 20 },
  { level: 4, name: "Estrella", primaryRandom: 8, primaryChosen: 16, secondaryChosen: 20, attribute: 24 },
  { level: 5, name: "Superestrella", primaryRandom: 10, primaryChosen: 20, secondaryChosen: 24, attribute: 28 },
  { level: 6, name: "Leyenda", primaryRandom: 15, primaryChosen: 30, secondaryChosen: 34, attribute: 38 },
] as const;

/**
 * Incremento de Valoración (TV) por tipo de mejora. Verificado contra el
 * reglamento oficial 2025 (Tabla de Incremento de Valoración, pág. 98).
 * Atributo: +1 AR=10k, +1 MV=20k, +1 PA=20k, +1 AG=30k, +1 FU=60k.
 */
export const LEVEL_UP_TV_IMPACT_GP = {
  primarySkill: 20_000,
  secondarySkill: 40_000,
  attribute: { min: 10_000, max: 60_000 },
} as const;

/** Incremento de TV exacto por atributo mejorado (MO). */
export const ATTRIBUTE_TV_IMPACT_GP = {
  AV: 10_000,
  MA: 20_000,
  PA: 20_000,
  AG: 30_000,
  ST: 60_000,
} as const;

/**
 * Habilidades Élite S3: recargo adicional acumulable al coste normal de
 * mejora en MO (no en PE).
 */
export const ELITE_SKILL_SURCHARGE_GP = 10_000;
