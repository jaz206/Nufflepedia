"use client";

import { useMemo, useState } from "react";

type Category = "GENERAL" | "AGILIDAD" | "FUERZA" | "PASE" | "MUTACION" | "TRIQUINUELAS";

interface Position {
  id: string;
  name: string;
  playerTags: string[];
  quantityMin: number;
  quantityMax: number;
  cost: number;
  ma: number;
  st: number;
  ag: number;
  pa: number | null;
  av: number;
  startingSkillKeys: string[];
  primaryCategories: Category[];
  secondaryCategories: Category[];
}
interface Race {
  id: string;
  name: string;
  leagues: string[];
  specialRules: string[];
  rerollCost: number;
  rerollMax: number;
  allowsApothecary: boolean;
  tier: number | null;
  playstyle: string | null;
  positions: Position[];
}

const CAT_ORDER: Category[] = ["AGILIDAD", "FUERZA", "GENERAL", "MUTACION", "PASE", "TRIQUINUELAS"];
const CAT_LETTER: Record<Category, string> = {
  AGILIDAD: "A",
  FUERZA: "F",
  GENERAL: "G",
  MUTACION: "M",
  PASE: "P",
  TRIQUINUELAS: "T",
};

function cats(list: Category[]) {
  return CAT_ORDER.filter((c) => list.includes(c)).map((c) => CAT_LETTER[c]).join(", ") || "—";
}
function gp(n: number) {
  return `${(n / 1000).toLocaleString("es-ES")}k`;
}

function RaceCard({ race }: { race: Race }) {
  return (
    <section className="rounded-[3px] border overflow-hidden" style={{ borderColor: "var(--border)" }}>
      <header className="px-4 py-3 border-b" style={{ background: "var(--surface-2)", borderColor: "var(--border)" }}>
        <div className="flex items-baseline justify-between gap-3 flex-wrap">
          <h2 className="text-xl font-semibold" style={{ color: "var(--gold)" }}>
            {race.name}
          </h2>
          <span className="text-xs" style={{ color: "var(--ink-3)" }}>
            Reroll {gp(race.rerollCost)} · Apotecario: {race.allowsApothecary ? "Sí" : "No"}
            {race.tier ? ` · Dificultad ${race.tier}/5` : ""}
          </span>
        </div>
        <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs" style={{ color: "var(--ink-3)" }}>
          {race.leagues.length > 0 && <span>Ligas: {race.leagues.join(", ")}</span>}
          {race.specialRules.length > 0 && <span>Reglas: {race.specialRules.join(", ")}</span>}
        </div>
        {race.playstyle && (
          <p className="mt-2 text-sm" style={{ color: "var(--ink-2)" }}>
            {race.playstyle}
          </p>
        )}
      </header>

      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[720px]">
          <thead>
            <tr className="text-[10px] uppercase tracking-wide border-b" style={{ color: "var(--ink-3)", borderColor: "var(--border)" }}>
              <th className="text-left font-medium px-3 py-2">Cant.</th>
              <th className="text-left font-medium px-3 py-2">Puesto</th>
              <th className="text-right font-medium px-3 py-2">Coste</th>
              <th className="text-center font-medium px-2 py-2">MA</th>
              <th className="text-center font-medium px-2 py-2">ST</th>
              <th className="text-center font-medium px-2 py-2">AG</th>
              <th className="text-center font-medium px-2 py-2">PA</th>
              <th className="text-center font-medium px-2 py-2">AV</th>
              <th className="text-left font-medium px-3 py-2">Habilidades</th>
              <th className="text-center font-medium px-2 py-2">Pri</th>
              <th className="text-center font-medium px-2 py-2">Sec</th>
            </tr>
          </thead>
          <tbody>
            {race.positions.map((p) => (
              <tr key={p.id} className="border-b last:border-0 align-top" style={{ borderColor: "var(--border)" }}>
                <td className="px-3 py-2 font-mono whitespace-nowrap" style={{ color: "var(--ink-3)" }}>
                  {p.quantityMin}-{p.quantityMax}
                </td>
                <td className="px-3 py-2">
                  <div className="font-medium">{p.name}</div>
                  <div className="text-[11px]" style={{ color: "var(--ink-3)" }}>
                    {p.playerTags.join(", ")}
                  </div>
                </td>
                <td className="px-3 py-2 text-right font-mono tabular-nums whitespace-nowrap">{gp(p.cost)}</td>
                <td className="px-2 py-2 text-center font-mono tabular-nums">{p.ma}</td>
                <td className="px-2 py-2 text-center font-mono tabular-nums">{p.st}</td>
                <td className="px-2 py-2 text-center font-mono tabular-nums">{p.ag}+</td>
                <td className="px-2 py-2 text-center font-mono tabular-nums">{p.pa === null ? "–" : `${p.pa}+`}</td>
                <td className="px-2 py-2 text-center font-mono tabular-nums">{p.av}+</td>
                <td className="px-3 py-2 text-[13px]" style={{ color: "var(--ink-2)" }}>
                  {p.startingSkillKeys.length ? p.startingSkillKeys.join(", ") : "—"}
                </td>
                <td className="px-2 py-2 text-center font-mono" style={{ color: "var(--ink-3)" }}>
                  {cats(p.primaryCategories)}
                </td>
                <td className="px-2 py-2 text-center font-mono" style={{ color: "var(--ink-3)" }}>
                  {cats(p.secondaryCategories)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default function RazasBrowser({ races }: { races: Race[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return races;
    return races.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.positions.some((p) => p.name.toLowerCase().includes(q) || p.startingSkillKeys.some((s) => s.toLowerCase().includes(q)))
    );
  }, [races, query]);

  return (
    <div>
      <input
        type="search"
        placeholder="Buscar raza, puesto o habilidad…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="input mb-6"
      />
      {query && (
        <p className="text-sm -mt-3 mb-6" style={{ color: "var(--ink-3)" }}>
          {filtered.length} raza(s) para &ldquo;{query}&rdquo;
        </p>
      )}
      <div className="space-y-6">
        {filtered.map((race) => (
          <RaceCard key={race.id} race={race} />
        ))}
        {filtered.length === 0 && (
          <p className="text-sm" style={{ color: "var(--ink-3)" }}>
            Ninguna raza coincide.
          </p>
        )}
      </div>
    </div>
  );
}
