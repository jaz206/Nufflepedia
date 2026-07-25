/**
 * Detecta menciones de otras habilidades/rasgos dentro del texto de una
 * descripción (ej. el texto de "Esquivar" menciona "Placar") para poder
 * convertirlas en enlaces dentro de la Nufflepedia.
 */
export type ReferenceToken = { type: "text"; value: string } | { type: "ref"; value: string };

export function buildReferenceMatcher(names: string[]): RegExp | null {
  const unique = [...new Set(names)].filter((n) => n.trim().length > 0).sort((a, b) => b.length - a.length);
  if (unique.length === 0) return null;
  const escaped = unique.map((n) => n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  // Límites de palabra manuales (no \b) porque los nombres pueden llevar
  // acentos/ñ, que \b no trata como parte de la palabra de forma fiable.
  // Sin la 'i': el texto oficial siempre escribe en mayúscula inicial una
  // mención real a otra habilidad/rasgo ("su habilidad Esquivar"); en
  // minúscula suele ser solo el verbo genérico ("intente esquivar"), que no
  // debe convertirse en enlace.
  return new RegExp(`(?<![\\p{L}])(${escaped.join("|")})(?![\\p{L}])`, "gu");
}

export function tokenizeReferences(text: string, matcher: RegExp | null, ownName: string): ReferenceToken[] {
  if (!matcher) return [{ type: "text", value: text }];
  const tokens: ReferenceToken[] = [];
  let lastIndex = 0;
  matcher.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = matcher.exec(text))) {
    if (m.index > lastIndex) tokens.push({ type: "text", value: text.slice(lastIndex, m.index) });
    const matched = m[1];
    // No auto-enlazar una habilidad/rasgo consigo mismo dentro de su propia
    // descripción (ej. "Placar" mencionándose a sí mismo).
    tokens.push({ type: matched === ownName ? "text" : "ref", value: matched });
    lastIndex = m.index + matched.length;
  }
  if (lastIndex < text.length) tokens.push({ type: "text", value: text.slice(lastIndex) });
  return tokens;
}
