"use client";

import { useState, useTransition } from "react";
import { createCompetition } from "../actions";

export default function NewCompetitionForm() {
  const [name, setName] = useState("");
  const [format, setFormat] = useState<"LEAGUE" | "TOURNAMENT">("LEAGUE");
  const [visibility, setVisibility] = useState<"PUBLIC" | "PRIVATE">("PUBLIC");
  const [maxTeams, setMaxTeams] = useState(8);
  const [hasGroupStage, setHasGroupStage] = useState(false);
  const [groupCount, setGroupCount] = useState(4);
  const [error, setError] = useState<string | undefined>();
  const [pending, startTransition] = useTransition();

  // Cada grupo necesita al menos 2 equipos para poder jugar algo — el
  // número de grupos no puede superar la mitad del máximo de equipos.
  // maxTeams es un TOPE (puede que se apunten menos), así que además el
  // comisario no podrá arrancar el torneo si al final se inscriben menos
  // equipos de los que hacen falta para ese número de grupos (lo valida
  // startTournament en el servidor).
  const maxGroupCount = Math.max(2, Math.floor(maxTeams / 2));
  const effectiveGroupCount = Math.min(groupCount, maxGroupCount);

  function handleMaxTeamsChange(value: number) {
    setMaxTeams(value);
    const newMax = Math.max(2, Math.floor(value / 2));
    if (groupCount > newMax) setGroupCount(newMax);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(undefined);
    startTransition(async () => {
      const res = await createCompetition({
        name,
        format,
        visibility,
        maxTeams,
        hasGroupStage: format === "TOURNAMENT" && hasGroupStage,
        groupCount: format === "TOURNAMENT" && hasGroupStage ? effectiveGroupCount : null,
      });
      if (res && !res.ok) setError(res.error);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <label className="block text-sm font-medium" htmlFor="compName">
          Nombre
        </label>
        <input
          id="compName"
          className="input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="p. ej. Liga de Otoño 2026"
          required
          minLength={2}
          maxLength={60}
        />
      </div>

      <div className="space-y-2">
        <span className="block text-sm font-medium">Formato</span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setFormat("LEAGUE")}
            className={format === "LEAGUE" ? "btn-primary" : "btn-secondary"}
          >
            Liguilla
          </button>
          <button
            type="button"
            onClick={() => setFormat("TOURNAMENT")}
            className={format === "TOURNAMENT" ? "btn-primary" : "btn-secondary"}
          >
            Torneo (eliminatoria)
          </button>
        </div>
        <p className="text-xs" style={{ color: "var(--ink-3)" }}>
          {format === "LEAGUE"
            ? "Todos contra todos, sin calendario fijo — cualquier pareja inscrita juega y registra cuando quiera."
            : "Eliminatoria directa. Si el número de equipos no es potencia de 2, se reparten pases directos (byes)."}
        </p>
      </div>

      {format === "TOURNAMENT" && (
        <div className="space-y-2 rounded-[3px] border p-3" style={{ borderColor: "var(--border)" }}>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={hasGroupStage} onChange={(e) => setHasGroupStage(e.target.checked)} />
            Con fase de grupos previa (estilo Mundial)
          </label>
          {hasGroupStage && (
            <div className="space-y-1 pl-6">
              <div className="flex items-center gap-2">
                <label className="text-xs" style={{ color: "var(--ink-3)" }} htmlFor="groupCount">
                  Número de grupos
                </label>
                <input
                  id="groupCount"
                  type="number"
                  className="input w-20"
                  value={effectiveGroupCount}
                  onChange={(e) => setGroupCount(Number(e.target.value))}
                  min={2}
                  max={maxGroupCount}
                />
              </div>
              <p className="text-xs" style={{ color: "var(--ink-3)" }}>
                Con un máximo de {maxTeams} equipos, cada grupo tendrá hasta {Math.floor(maxTeams / effectiveGroupCount)} — ajusta
                primero el máximo de equipos si quieres más grupos.
              </p>
            </div>
          )}
        </div>
      )}

      <div className="space-y-2">
        <label className="block text-sm font-medium" htmlFor="maxTeams">
          Máximo de equipos
        </label>
        <input
          id="maxTeams"
          type="number"
          className="input"
          value={maxTeams}
          onChange={(e) => handleMaxTeamsChange(Number(e.target.value))}
          min={2}
          max={32}
          required
        />
      </div>

      <div className="space-y-2">
        <span className="block text-sm font-medium">Visibilidad</span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setVisibility("PUBLIC")}
            className={visibility === "PUBLIC" ? "btn-primary" : "btn-secondary"}
          >
            Pública — cualquiera puede unirse
          </button>
          <button
            type="button"
            onClick={() => setVisibility("PRIVATE")}
            className={visibility === "PRIVATE" ? "btn-primary" : "btn-secondary"}
          >
            Privada
          </button>
        </div>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <button type="submit" disabled={pending} className="btn-primary">
        {pending ? "Creando…" : "Crear competición"}
      </button>
    </form>
  );
}
