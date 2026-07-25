"use client";

import { useMemo, useRef, useState } from "react";
import {
  SKILL_CATEGORY_LABELS,
  SKILL_CATEGORY_VALUES,
  TRAIT_CATEGORY_LABELS,
  TRAIT_CATEGORY_VALUES,
} from "@/lib/categoryLabels";
import { buildMarkdownExport, type ExportSkill, type ExportTrait } from "@/lib/markdownExport";
import { buildReferenceMatcher, tokenizeReferences } from "@/lib/crossReference";

function matches(term: string, ...fields: (string | null | undefined)[]) {
  const needle = term.trim().toLowerCase();
  if (!needle) return true;
  return fields.some((f) => f?.toLowerCase().includes(needle));
}

function downloadMarkdown(content: string) {
  const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const date = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = `nufflepedia-habilidades-rasgos-${date}.md`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

type RefKind = "skill" | "trait";

function refId(kind: RefKind, key: string) {
  return `ref-${kind}-${key}`;
}

/** Descripción con las menciones a otras habilidades/rasgos convertidas en
 * enlaces que saltan (y resaltan brevemente) a su propia ficha. */
function LinkedDescription({
  text,
  matcher,
  ownName,
  nameToRef,
  onJump,
}: {
  text: string;
  matcher: RegExp | null;
  ownName: string;
  nameToRef: Map<string, { kind: RefKind; key: string }>;
  onJump: (kind: RefKind, key: string) => void;
}) {
  const tokens = useMemo(() => tokenizeReferences(text, matcher, ownName), [text, matcher, ownName]);
  return (
    <>
      {tokens.map((t, i) => {
        if (t.type === "text") return <span key={i}>{t.value}</span>;
        const ref = nameToRef.get(t.value.toLowerCase());
        if (!ref) return <span key={i}>{t.value}</span>;
        return (
          <button
            key={i}
            type="button"
            onClick={() => onJump(ref.kind, ref.key)}
            className="underline decoration-dotted underline-offset-2 hover:decoration-solid"
          >
            {t.value}
          </button>
        );
      })}
    </>
  );
}

export default function NufflepediaBrowser({
  skills,
  traits,
}: {
  skills: ExportSkill[];
  traits: ExportTrait[];
}) {
  const [query, setQuery] = useState("");
  const [flashId, setFlashId] = useState<string | null>(null);
  const flashTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const matcher = useMemo(
    () => buildReferenceMatcher([...skills.map((s) => s.name), ...traits.map((t) => t.name)]),
    [skills, traits]
  );
  const nameToRef = useMemo(() => {
    const map = new Map<string, { kind: RefKind; key: string }>();
    for (const s of skills) map.set(s.name.toLowerCase(), { kind: "skill", key: s.key });
    for (const t of traits) if (!map.has(t.name.toLowerCase())) map.set(t.name.toLowerCase(), { kind: "trait", key: t.key });
    return map;
  }, [skills, traits]);

  function jumpTo(kind: RefKind, key: string) {
    const id = refId(kind, key);
    setQuery("");
    // Espera a que el DOM se actualice (la búsqueda pudo estar filtrando la
    // ficha destino) antes de desplazarse hasta ella.
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "center" });
      })
    );
    if (flashTimeout.current) clearTimeout(flashTimeout.current);
    setFlashId(id);
    flashTimeout.current = setTimeout(() => setFlashId(null), 1600);
  }

  const filteredSkills = useMemo(
    () => skills.filter((s) => matches(query, s.name, s.englishName, s.description, s.key)),
    [skills, query]
  );
  const filteredTraits = useMemo(
    () => traits.filter((t) => matches(query, t.name, t.englishName, t.description, t.key)),
    [traits, query]
  );

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-10">
        <input
          type="search"
          placeholder="Buscar habilidad o rasgo (nombre o descripción)..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="input flex-1"
        />
        <button
          type="button"
          className="btn-secondary whitespace-nowrap"
          onClick={() => downloadMarkdown(buildMarkdownExport(skills, traits))}
        >
          ⬇ Descargar .md
        </button>
      </div>

      {query && (
        <p className="text-sm text-zinc-500 -mt-6 mb-10">
          {filteredSkills.length} habilidad(es), {filteredTraits.length} rasgo(s) para &ldquo;{query}&rdquo;
        </p>
      )}

      <section>
        <h2 className="text-2xl font-semibold mb-6">Habilidades</h2>
        <div className="space-y-10">
          {SKILL_CATEGORY_VALUES.map((category) => {
            const items = filteredSkills.filter((s) => s.category === category);
            if (items.length === 0) return null;
            return (
              <div key={category}>
                <h3 className="text-xl font-semibold border-b border-zinc-200 dark:border-zinc-800 pb-2">
                  {SKILL_CATEGORY_LABELS[category]}{" "}
                  <span className="text-sm font-normal text-zinc-500">({items.length})</span>
                </h3>
                <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                  {items.map((skill) => (
                    <li
                      key={skill.key}
                      id={refId("skill", skill.key)}
                      className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-3 transition-colors duration-500"
                      style={{
                        borderColor: flashId === refId("skill", skill.key) ? "var(--gold, #b8860b)" : undefined,
                        background: flashId === refId("skill", skill.key) ? "color-mix(in srgb, var(--gold, #b8860b) 15%, transparent)" : undefined,
                      }}
                    >
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="font-medium">{skill.name}</span>
                        {skill.isElite && (
                          <span className="text-[10px] uppercase tracking-wide text-amber-600 dark:text-amber-400">
                            Élite
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-zinc-500">
                        <LinkedDescription text={skill.description} matcher={matcher} ownName={skill.name} nameToRef={nameToRef} onJump={jumpTo} />
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
          {query && filteredSkills.length === 0 && (
            <p className="text-zinc-500 text-sm">Ninguna habilidad coincide.</p>
          )}
        </div>
      </section>

      <section className="mt-16">
        <h2 className="text-2xl font-semibold mb-6">Rasgos</h2>
        <div className="space-y-10">
          {TRAIT_CATEGORY_VALUES.map((category) => {
            const items = filteredTraits.filter((t) => t.category === category);
            if (items.length === 0) return null;
            return (
              <div key={category}>
                <h3 className="text-xl font-semibold border-b border-zinc-200 dark:border-zinc-800 pb-2">
                  {TRAIT_CATEGORY_LABELS[category]}{" "}
                  <span className="text-sm font-normal text-zinc-500">({items.length})</span>
                </h3>
                <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                  {items.map((trait) => (
                    <li
                      key={trait.key}
                      id={refId("trait", trait.key)}
                      className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-3 transition-colors duration-500"
                      style={{
                        borderColor: flashId === refId("trait", trait.key) ? "var(--gold, #b8860b)" : undefined,
                        background: flashId === refId("trait", trait.key) ? "color-mix(in srgb, var(--gold, #b8860b) 15%, transparent)" : undefined,
                      }}
                    >
                      <span className="font-medium">{trait.name}</span>
                      <p className="mt-1 text-sm text-zinc-500">
                        <LinkedDescription text={trait.description} matcher={matcher} ownName={trait.name} nameToRef={nameToRef} onJump={jumpTo} />
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
          {query && filteredTraits.length === 0 && (
            <p className="text-zinc-500 text-sm">Ningún rasgo coincide.</p>
          )}
        </div>
      </section>
    </div>
  );
}
