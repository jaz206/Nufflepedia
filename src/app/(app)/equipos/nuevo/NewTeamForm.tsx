"use client";

import { useState, useTransition } from "react";
import { createTeam } from "../actions";

interface Race {
  key: string;
  name: string;
  tier: number | null;
  leagues: string[];
  rerollCost: number;
}

export default function NewTeamForm({ races }: { races: Race[] }) {
  const [raceKey, setRaceKey] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [pending, startTransition] = useTransition();

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
    <form onSubmit={handleSubmit} className="space-y-8">
      <div>
        <p className="mb-3 text-sm font-medium">Raza</p>
        <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
          {races.map((r) => {
            const active = raceKey === r.key;
            return (
              <button
                type="button"
                key={r.key}
                onClick={() => setRaceKey(r.key)}
                className="rounded-[3px] border p-3 text-left transition-colors"
                style={{
                  borderColor: active ? "var(--accent)" : "var(--border)",
                  background: active
                    ? "color-mix(in srgb, var(--accent) 10%, var(--surface-1))"
                    : "var(--surface-1)",
                }}
              >
                <p className="font-medium">{r.name}</p>
                <p className="text-xs" style={{ color: "var(--ink-3)" }}>
                  {r.tier ? `Tier ${r.tier} · ` : ""}Reroll {(r.rerollCost / 1000).toLocaleString("es-ES")}k
                </p>
              </button>
            );
          })}
        </div>
      </div>

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
