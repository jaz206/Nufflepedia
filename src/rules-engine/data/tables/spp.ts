/**
 * Puntos de Estrellato (SPP/PE) y coste de mejoras (Level Up).
 * Portado desde CODEX_REGLAS_S3.md, secciones IV y V.
 */

export type SppActionType = "PASS_COMPLETE" | "CASUALTY" | "INTERCEPTION" | "TOUCHDOWN" | "MVP";

export const SPP_VALUES: Record<SppActionType, number> = {
  PASS_COMPLETE: 1,
  CASUALTY: 2,
  INTERCEPTION: 2,
  TOUCHDOWN: 3,
  MVP: 4,
};

/** Regla especial de equipo "Brutos Brutales": más PE por bajas, menos por touchdown. */
export const BRUTOS_BRUTALES_OVERRIDES: Partial<Record<SppActionType, number>> = {
  CASUALTY: 3,
  TOUCHDOWN: 2,
};

export function getSppValue(action: SppActionType, hasBrutosBrutales = false): number {
  if (hasBrutosBrutales && action in BRUTOS_BRUTALES_OVERRIDES) {
    return BRUTOS_BRUTALES_OVERRIDES[action]!;
  }
  return SPP_VALUES[action];
}
