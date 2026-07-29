"use client";

import { useMemo, useState } from "react";

interface Star {
  id: string;
  name: string;
  playerTags: string[];
  cost: number;
  ma: number;
  st: number;
  ag: number;
  pa: number | null;
  av: number;
  skillKeys: string[];
  playsForAny: boolean;
  leagues: string[];
  specialRuleName: string | null;
  specialRuleText: string | null;
}

const gp = (n: number) => `${(n / 1000).toLocaleString("es-ES")}k`;

function StatBox({ label, value }: { label: string; value: string | number }) {
  return (
    <div
      className="flex flex-col items-center px-2.5 py-1 border first:rounded-l-[3px] last:rounded-r-[3px]"
      style={{ borderColor: "var(--border)" }}
    >
      <span className="text-[9px] uppercase tracking-wide" style={{ color: "var(--ink-3)" }}>
        {label}
      </span>
      <span className="font-mono tabular-nums text-sm">{value}</span>
    </div>
  );
}

function StarCard({ star }: { star: Star }) {
  return (
    <article className="rounded-[3px] border p-4" style={{ borderColor: "var(--border)", background: "var(--surface-1)" }}>
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-lg font-semibold">{star.name}</h2>
          <p className="text-[11px]" style={{ color: "var(--ink-3)" }}>
            {star.playerTags.join(", ")}
          </p>
        </div>
        <div className="text-right">
          <div className="font-mono font-semibold" style={{ color: "var(--gold)" }}>
            {gp(star.cost)}
          </div>
          <div className="text-[11px]" style={{ color: "var(--ink-3)" }}>
            {star.playsForAny ? "Cualquier equipo" : star.leagues.join(", ")}
          </div>
        </div>
      </div>

      <div className="flex mt-3">
        <StatBox label="MA" value={star.ma} />
        <StatBox label="ST" value={star.st} />
        <StatBox label="AG" value={`${star.ag}+`} />
        <StatBox label="PA" value={star.pa === null ? "–" : `${star.pa}+`} />
        <StatBox label="AV" value={`${star.av}+`} />
      </div>

      {star.skillKeys.length > 0 && (
        <p className="mt-3 text-sm" style={{ color: "var(--ink-2)" }}>
          {star.skillKeys.join(", ")}
        </p>
      )}

      {star.specialRuleName && (
        <div className="mt-3 rounded-[3px] border p-3" style={{ background: "var(--surface-2)", borderColor: "var(--border)" }}>
          <span className="text-sm font-semibold" style={{ color: "var(--accent)" }}>
            {star.specialRuleName}
          </span>
          {star.specialRuleText && (
            <p className="mt-1 text-[13px] leading-relaxed" style={{ color: "var(--ink-2)" }}>
              {star.specialRuleText}
            </p>
          )}
        </div>
      )}
    </article>
  );
}

export default function EstrellasBrowser({ stars }: { stars: Star[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return stars;
    return stars.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.skillKeys.some((k) => k.toLowerCase().includes(q)) ||
        s.leagues.some((l) => l.toLowerCase().includes(q)) ||
        (s.specialRuleName?.toLowerCase().includes(q) ?? false)
    );
  }, [stars, query]);

  return (
    <div>
      <input
        type="search"
        placeholder="Buscar estrella, habilidad, liga o regla…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="input mb-6"
      />
      {query && (
        <p className="text-sm -mt-3 mb-6" style={{ color: "var(--ink-3)" }}>
          {filtered.length} estrella(s) para &ldquo;{query}&rdquo;
        </p>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        {filtered.map((star) => (
          <StarCard key={star.id} star={star} />
        ))}
        {filtered.length === 0 && (
          <p className="text-sm" style={{ color: "var(--ink-3)" }}>
            Ninguna estrella coincide.
          </p>
        )}
      </div>
    </div>
  );
}
