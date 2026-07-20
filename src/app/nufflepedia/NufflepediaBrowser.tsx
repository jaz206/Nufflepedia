"use client";

import { useMemo, useState } from "react";
import {
  SKILL_CATEGORY_LABELS,
  SKILL_CATEGORY_VALUES,
  TRAIT_CATEGORY_LABELS,
  TRAIT_CATEGORY_VALUES,
} from "@/lib/categoryLabels";
import { buildMarkdownExport, type ExportSkill, type ExportTrait } from "@/lib/markdownExport";

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

export default function NufflepediaBrowser({
  skills,
  traits,
}: {
  skills: ExportSkill[];
  traits: ExportTrait[];
}) {
  const [query, setQuery] = useState("");

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
                    <li key={skill.key} className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-3">
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="font-medium">{skill.name}</span>
                        {skill.isElite && (
                          <span className="text-[10px] uppercase tracking-wide text-amber-600 dark:text-amber-400">
                            Élite
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-zinc-500">{skill.description}</p>
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
                    <li key={trait.key} className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-3">
                      <span className="font-medium">{trait.name}</span>
                      <p className="mt-1 text-sm text-zinc-500">{trait.description}</p>
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
