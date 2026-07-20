import type { PlayerStatus } from "../../types";

/**
 * Motor de daño (Armadura → Herida → Tabla de Lesiones D16).
 * Portado desde CODEX_REGLAS_S3.md, sección III.
 */

/** Tirada de Armadura (2D6). Éxito (rotura) si el resultado > AR. */
export function resolveArmorRoll(
  sum2d6: number,
  armorValue: number,
  mightyBlowBonus = 0
): { broken: boolean } {
  if (sum2d6 > armorValue) return { broken: true };
  // "Mighty Blow (+X): Añade el bonificador si el resultado base no rompió la AR."
  if (mightyBlowBonus > 0 && sum2d6 + mightyBlowBonus > armorValue) {
    return { broken: true };
  }
  return { broken: false };
}

export type WoundRollResult = "STUNNED" | "KO" | "INJURY";

/** Tirada de Heridas (2D6): 2-7 Aturdido, 8-9 KO, 10-12 Lesión. */
export function resolveWoundRoll(sum2d6: number): WoundRollResult {
  if (sum2d6 <= 7) return "STUNNED";
  if (sum2d6 <= 9) return "KO";
  return "INJURY";
}

export interface InjuryTableEntry {
  min: number;
  max: number;
  code: string;
  name: string;
  status: PlayerStatus;
  /** Aplica pérdida permanente de un punto de atributo (1D6 para determinar cuál). */
  permanentStatLoss?: boolean;
}

/** Tabla de Lesiones graves (1D16). */
export const INJURY_TABLE_D16: InjuryTableEntry[] = [
  { min: 1, max: 8, code: "BHL", name: "Magullado", status: "BADLY_HURT" },
  { min: 9, max: 10, code: "MNG", name: "Apaleado", status: "MISS_NEXT_GAME" },
  { min: 11, max: 12, code: "MNG+NI", name: "Herida Grave", status: "MISS_NEXT_GAME" },
  {
    min: 13,
    max: 14,
    code: "MNG+STAT",
    name: "Herida Permanente",
    status: "MISS_NEXT_GAME",
    permanentStatLoss: true,
  },
  { min: 15, max: 16, code: "DEAD", name: "¡Muerto!", status: "DEAD" },
];

export function resolveInjuryD16(roll1to16: number): InjuryTableEntry {
  const entry = INJURY_TABLE_D16.find((e) => roll1to16 >= e.min && roll1to16 <= e.max);
  if (!entry) {
    throw new Error(`Tirada de lesión fuera de rango (1-16): ${roll1to16}`);
  }
  return entry;
}
