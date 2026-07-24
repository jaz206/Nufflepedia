"use client";

import { useMemo, useState } from "react";
import Modal from "@/components/Modal";

interface Entry {
  key: string;
  name: string;
  type: "Habilidad" | "Rasgo";
  category: string;
  description: string;
}

export default function QuickSearch({ entries }: { entries: Entry[] }) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Entry | null>(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return entries.filter((e) => e.name.toLowerCase().includes(q)).slice(0, 8);
  }, [entries, query]);

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
                onClick={() => setSelected(r)}
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

      <Modal open={selected !== null} onClose={() => setSelected(null)} title={selected?.name ?? ""}>
        {selected && (
          <div className="space-y-3">
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
              {selected.description}
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
}
