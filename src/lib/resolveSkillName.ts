/**
 * Resuelve un nombre de habilidad/rasgo tal como aparece en el roster oficial
 * (p.ej. "Solitario (4+)") a la `key` del catálogo (MasterSkill/MasterTrait).
 *
 * Misma normalización + tabla de alias que `prisma/seedRaces.ts` usó para
 * validar `startingSkillKeys` al sembrar razas (ahí se comprobó que resuelve
 * el 100% de las 155 posiciones) — la reutilizamos en tiempo de ejecución
 * para poder asignar las habilidades de partida a cada jugador fichado.
 */

export function normalizeSkillName(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\([^)]*\)/g, "")
    .replace(/[.,]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

const SKILL_NAME_ALIASES: Record<string, string> = {
  "atacar y huir": "golpe a la carrera",
};

export function buildSkillNameIndex(entries: { key: string; name: string }[]): Map<string, string> {
  const index = new Map<string, string>();
  for (const e of entries) index.set(normalizeSkillName(e.name), e.key);
  return index;
}

/** Devuelve la key resuelta, o `null` si el nombre no está en el catálogo. */
export function resolveSkillKey(display: string, index: Map<string, string>): string | null {
  const n = normalizeSkillName(display);
  if (index.has(n)) return index.get(n)!;
  if (SKILL_NAME_ALIASES[n] && index.has(SKILL_NAME_ALIASES[n])) return index.get(SKILL_NAME_ALIASES[n])!;
  return null;
}

/**
 * Igual que `buildSkillNameIndex`/`resolveSkillKey` pero guardando el
 * registro completo (para el tooltip del SkillPill: nombre + descripción).
 * Funciona en cliente y servidor — son funciones puras sin dependencias.
 */
export function buildSkillInfoIndex<T extends { name: string }>(entries: T[]): Map<string, T> {
  const index = new Map<string, T>();
  for (const e of entries) index.set(normalizeSkillName(e.name), e);
  return index;
}

export function resolveSkillInfo<T extends { name: string }>(display: string, index: Map<string, T>): T | null {
  const n = normalizeSkillName(display);
  if (index.has(n)) return index.get(n)!;
  if (SKILL_NAME_ALIASES[n] && index.has(SKILL_NAME_ALIASES[n])) return index.get(SKILL_NAME_ALIASES[n])!;
  return null;
}
