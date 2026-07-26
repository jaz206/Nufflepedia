"use client";

import { useMemo, useState } from "react";
import Modal from "@/components/Modal";
import SkillPill from "@/components/SkillPill";
import { buildReferenceMatcher, tokenizeReferences } from "@/lib/crossReference";

interface Entry {
  key: string;
  name: string;
  type: "Habilidad" | "Rasgo" | "Estado";
  category: string;
  description: string;
}

export default function QuickSearch({ entries }: { entries: Entry[] }) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Entry | null>(null);
  // Pila de fichas visitadas al saltar de una a otra por sus enlaces
  // cruzados, para poder volver atrás en vez de perder de dónde venías.
  const [history, setHistory] = useState<Entry[]>([]);

  function openEntry(entry: Entry) {
    setSelected(entry);
  }
  function jumpToReference(entry: Entry) {
    if (selected) setHistory((h) => [...h, selected]);
    setSelected(entry);
  }
  function goBack() {
    setHistory((h) => {
      const prev = h[h.length - 1];
      if (prev) setSelected(prev);
      return h.slice(0, -1);
    });
  }
  function closeModal() {
    setSelected(null);
    setHistory([]);
  }

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return entries.filter((e) => e.name.toLowerCase().includes(q)).slice(0, 8);
  }, [entries, query]);

  const matcher = useMemo(() => buildReferenceMatcher(entries.map((e) => e.name)), [entries]);
  const nameToEntry = useMemo(() => {
    const map = new Map<string, Entry>();
    for (const e of entries) if (!map.has(e.name.toLowerCase())) map.set(e.name.toLowerCase(), e);
    return map;
  }, [entries]);
  const descriptionTokens = useMemo(
    () => (selected ? tokenizeReferences(selected.description, matcher, selected.name) : []),
    [selected, matcher]
  );

  return (
    <div>
      <input
        type="search"
        className="input"
        placeholder="Buscar habilidad o rasgo, p. ej. «Esquivar»…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        autoComplete="off"
      />

      {query.trim() !== "" && (
        <div className="mt-3 grid gap-2">
          {results.length === 0 ? (
            <p className="text-sm" style={{ color: "var(--ink-3)" }}>
              Sin resultados para «{query}».
            </p>
          ) : (
            results.map((r) => (
              <button
                key={`${r.type}-${r.key}`}
                type="button"
                onClick={() => openEntry(r)}
                className="flex items-center justify-between gap-3 rounded-[3px] border px-3 py-2 text-left text-sm transition-colors"
                style={{ borderColor: "var(--border)", background: "var(--surface-1)" }}
              >
                <span>
                  <strong>{r.name}</strong>{" "}
                  <span style={{ color: "var(--ink-3)" }}>· {r.category}</span>
                </span>
                <span
                  className="rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wide"
                  style={{ background: "var(--surface-2)", color: "var(--ink-2)" }}
                >
                  {r.type}
                </span>
              </button>
            ))
          )}
        </div>
      )}

      <Modal open={selected !== null} onClose={closeModal} title={selected?.name ?? ""}>
        {selected && (
          <div className="space-y-3">
            {history.length > 0 && (
              <button
                type="button"
                onClick={goBack}
                className="text-xs underline"
                style={{ color: "var(--ink-3)" }}
              >
                ← Volver a {history[history.length - 1].name}
              </button>
            )}
            <div className="flex items-center gap-2">
              <span
                className="rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wide"
                style={{ background: "var(--surface-2)", color: "var(--ink-2)" }}
              >
                {selected.type}
              </span>
              <span className="text-xs" style={{ color: "var(--ink-3)" }}>
                {selected.category}
              </span>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: "var(--ink-2)" }}>
              {descriptionTokens.map((t, i) => {
                if (t.type === "text") return <span key={i}>{t.value}</span>;
                const ref = nameToEntry.get(t.value.toLowerCase());
                if (!ref) return <span key={i}>{t.value}</span>;
                return (
                  <SkillPill key={i} label={t.value} description={ref.description} onClick={() => jumpToReference(ref)} />
                );
              })}
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
}
