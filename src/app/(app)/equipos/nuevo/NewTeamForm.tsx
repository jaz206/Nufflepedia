"use client";

import { useMemo, useState, useTransition } from "react";
import { createTeam } from "../actions";

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
}
interface Race {
  key: string;
  name: string;
  tier: number | null;
  playstyle: string | null;
  leagues: string[];
  specialRules: string[];
  rerollCost: number;
  rerollMax: number;
  allowsApothecary: boolean;
  positions: Position[];
}

function difficultyLabel(tier: number | null): { text: string; color: string } | null {
  if (!tier) return null;
  if (tier <= 2) return { text: "Fácil", color: "var(--ok)" };
  if (tier === 3) return { text: "Media", color: "var(--warn)" };
  return { text: "Difícil", color: "var(--danger)" };
}
function gp(n: number) {
  return `${(n / 1000).toLocaleString("es-ES")}k`;
}

function RaceDetail({ race }: { race: Race }) {
  const difficulty = difficultyLabel(race.tier);
  return (
    <div className="rounded-[3px] border p-4" style={{ borderColor: "var(--gold-soft)", background: "var(--surface-1)" }}>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-lg font-bold">{race.name}</h3>
        <div className="flex items-center gap-3 text-xs" style={{ color: "var(--ink-3)" }}>
          {difficulty && (
            <span className="font-semibold" style={{ color: difficulty.color }}>
              Dificultad: {difficulty.text}
            </span>
          )}
          <span>Reroll {gp(race.rerollCost)} (máx {race.rerollMax})</span>
          <span>Apotecario: {race.allowsApothecary ? "Sí" : "No"}</span>
        </div>
      </div>

      {race.playstyle && (
        <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--ink-2)" }}>
          {race.playstyle}
        </p>
      )}
      {race.specialRules.length > 0 && (
        <p className="mt-2 text-xs" style={{ color: "var(--ink-3)" }}>
          Reglas especiales: {race.specialRules.join(", ")}
        </p>
      )}

      <div className="mt-3 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-[10px] uppercase tracking-wide" style={{ borderColor: "var(--border-strong)", color: "var(--ink-3)" }}>
              <th className="px-2 py-1 text-left">Cant.</th>
              <th className="px-2 py-1 text-left">Puesto</th>
              <th className="px-2 py-1 text-right">Coste</th>
              <th className="px-1 py-1 text-center">MO</th>
              <th className="px-1 py-1 text-center">FU</th>
              <th className="px-1 py-1 text-center">AG</th>
              <th className="px-1 py-1 text-center">PA</th>
              <th className="px-1 py-1 text-center">AR</th>
              <th className="px-2 py-1 text-left">Habilidades</th>
            </tr>
          </thead>
          <tbody>
            {race.positions.map((p) => (
              <tr key={p.id} className="border-b" style={{ borderColor: "var(--border)" }}>
                <td className="px-2 py-1 font-mono whitespace-nowrap" style={{ color: "var(--ink-3)" }}>
                  {p.quantityMin}-{p.quantityMax}
                </td>
                <td className="px-2 py-1 font-medium">{p.name}</td>
                <td className="px-2 py-1 text-right font-mono whitespace-nowrap">{gp(p.cost)}</td>
                <td className="px-1 py-1 text-center font-mono">{p.ma}</td>
                <td className="px-1 py-1 text-center font-mono">{p.st}</td>
                <td className="px-1 py-1 text-center font-mono">{p.ag}+</td>
                <td className="px-1 py-1 text-center font-mono">{p.pa ? `${p.pa}+` : "–"}</td>
                <td className="px-1 py-1 text-center font-mono">{p.av}+</td>
                <td className="px-2 py-1 text-xs" style={{ color: "var(--ink-2)" }}>
                  {p.startingSkillKeys.length ? p.startingSkillKeys.join(", ") : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function NewTeamForm({ races }: { races: Race[] }) {
  const [raceKey, setRaceKey] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [pending, startTransition] = useTransition();

  const selectedRace = useMemo(() => races.find((r) => r.key === raceKey) ?? null, [races, raceKey]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!raceKey) {
      setError("Elige una raza");
      return;
    }
    setError(undefined);
    startTransition(async () => {
      const res = await createTeam({ raceKey, name });
      if (res && !res.ok) setError(res.error);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <p className="mb-3 text-sm font-medium">Raza</p>
        <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
          {races.map((r) => {
            const active = raceKey === r.key;
            const difficulty = difficultyLabel(r.tier);
            return (
              <button
                type="button"
                key={r.key}
                onClick={() => setRaceKey(active ? null : r.key)}
                className="rounded-[3px] border p-3 text-left transition-colors"
                style={{
                  borderColor: active ? "var(--accent)" : "var(--border)",
                  background: active
                    ? "color-mix(in srgb, var(--accent) 10%, var(--surface-1))"
                    : "var(--surface-1)",
                }}
              >
                <div className="flex items-baseline justify-between gap-2">
                  <p className="font-medium">{r.name}</p>
                  {difficulty && (
                    <span className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: difficulty.color }}>
                      {difficulty.text}
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-xs" style={{ color: "var(--ink-3)" }}>
                  {r.playstyle ? r.playstyle : `Reroll ${gp(r.rerollCost)}`}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {selectedRace && <RaceDetail race={selectedRace} />}

      <div className="max-w-sm space-y-2">
        <label className="block text-sm font-medium" htmlFor="teamName">
          Nombre del equipo
        </label>
        <input
          id="teamName"
          className="input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="p. ej. Trituradores Verdes"
          required
          minLength={2}
          maxLength={40}
        />
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <button type="submit" disabled={pending || !raceKey} className="btn-primary">
        {pending ? "Fundando…" : "Fundar franquicia"}
      </button>
    </form>
  );
}
