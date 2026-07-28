"use client";

import { useState, useTransition } from "react";
import { createPresentialTournament } from "../actions";

export default function NewTournamentForm() {
  const [name, setName] = useState("");
  const [totalRounds, setTotalRounds] = useState(5);
  const [pointsWin, setPointsWin] = useState(2);
  const [pointsDraw, setPointsDraw] = useState(1);
  const [pointsLoss, setPointsLoss] = useState(0);
  const [error, setError] = useState<string | undefined>();
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(undefined);
    startTransition(async () => {
      const res = await createPresentialTournament({ name, totalRounds, pointsWin, pointsDraw, pointsLoss });
      if (res && !res.ok) setError(res.error);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <label className="flex flex-col gap-1 text-sm">
        Nombre del torneo
        <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Copa de Invierno 2026" required />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Número de rondas
        <input
          type="number"
          min={1}
          max={20}
          className="input"
          value={totalRounds}
          onChange={(e) => setTotalRounds(Number.parseInt(e.target.value, 10) || 1)}
        />
      </label>

      <div>
        <p className="mb-1 text-sm">Sistema de puntos</p>
        <div className="flex gap-3">
          <label className="flex flex-col gap-1 text-xs" style={{ color: "var(--ink-3)" }}>
            Victoria
            <input type="number" min={0} max={10} className="input w-20" value={pointsWin} onChange={(e) => setPointsWin(Number.parseInt(e.target.value, 10) || 0)} />
          </label>
          <label className="flex flex-col gap-1 text-xs" style={{ color: "var(--ink-3)" }}>
            Empate
            <input type="number" min={0} max={10} className="input w-20" value={pointsDraw} onChange={(e) => setPointsDraw(Number.parseInt(e.target.value, 10) || 0)} />
          </label>
          <label className="flex flex-col gap-1 text-xs" style={{ color: "var(--ink-3)" }}>
            Derrota
            <input type="number" min={0} max={10} className="input w-20" value={pointsLoss} onChange={(e) => setPointsLoss(Number.parseInt(e.target.value, 10) || 0)} />
          </label>
        </div>
        <p className="mt-1 text-xs" style={{ color: "var(--ink-3)" }}>
          Por defecto 2/1/0, el recomendado por la NAF. Un bye (descanso) siempre da los puntos de victoria.
        </p>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <button type="submit" disabled={pending} className="btn-primary">
        Crear torneo
      </button>
    </form>
  );
}
