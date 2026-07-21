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
    <div className="flex flex-col items-center px-2.5 py-1 border border-zinc-200 dark:border-zinc-800 first:rounded-l-md last:rounded-r-md">
      <span className="text-[9px] uppercase tracking-wide text-zinc-400">{label}</span>
      <span className="font-mono tabular-nums text-sm">{value}</span>
    </div>
  );
}

function StarCard({ star }: { star: Star }) {
  return (
    <article className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-4">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-lg font-semibold">{star.name}</h2>
          <p className="text-[11px] text-zinc-400">{star.playerTags.join(", ")}</p>
        </div>
        <div className="text-right">
          <div className="font-mono text-amber-600 dark:text-amber-400">{gp(star.cost)}</div>
          <div className="text-[11px] text-zinc-500">
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
        <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-300">{star.skillKeys.join(", ")}</p>
      )}

      {star.specialRuleName && (
        <div className="mt-3 rounded-md bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-3">
          <span className="text-sm font-semibold text-[var(--accent)]">{star.specialRuleName}</span>
          {star.specialRuleText && (
            <p className="mt-1 text-[13px] leading-relaxed text-zinc-600 dark:text-zinc-300">
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
        <p className="text-sm text-zinc-500 -mt-3 mb-6">
          {filtered.length} estrella(s) para &ldquo;{query}&rdquo;
        </p>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        {filtered.map((star) => (
          <StarCard key={star.id} star={star} />
        ))}
        {filtered.length === 0 && <p className="text-zinc-500 text-sm">Ninguna estrella coincide.</p>}
      </div>
    </div>
  );
}
