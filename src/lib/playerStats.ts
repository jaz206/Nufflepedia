/** Compartido entre El Cuartel y la plantilla-copia de una competición. */

export interface StatBlock {
  ma: number;
  st: number;
  ag: number;
  pa: number | null;
  av: number;
}

export interface StatIncreases {
  maIncreases: number;
  stIncreases: number;
  agIncreases: number;
  paIncreases: number;
  avIncreases: number;
}

export function statLine(p: StatBlock): string {
  return `MO ${p.ma} · FU ${p.st} · AG ${p.ag}+ · PA ${p.pa ? `${p.pa}+` : "–"} · AR ${p.av}+`;
}

/** Aplica las mejoras de atributo compradas: MO/FU/AR suman, AG/PA restan al "para superar" (mínimo 1). */
export function effectiveStats(base: StatBlock, increases: StatIncreases): StatBlock {
  return {
    ma: base.ma + increases.maIncreases,
    st: base.st + increases.stIncreases,
    ag: Math.max(1, base.ag - increases.agIncreases),
    pa: base.pa !== null ? Math.max(1, base.pa - increases.paIncreases) : null,
    av: base.av + increases.avIncreases,
  };
}
