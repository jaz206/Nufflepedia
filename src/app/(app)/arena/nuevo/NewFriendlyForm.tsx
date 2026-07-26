"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { createFriendlyMatch, searchOpponentTeams } from "../actions";
import { createTeam } from "../../equipos/actions";

interface Team {
  id: string;
  name: string;
  rosterKey: string;
}
interface SearchResult {
  id: string;
  name: string;
  rosterKey: string;
  owner: { displayName: string };
}
type OpponentMode = "own" | "guest" | "friend" | "createGuest";

export default function NewFriendlyForm({
  myTeams,
  myGuestTeams,
  races,
}: {
  myTeams: Team[];
  myGuestTeams: Team[];
  races: { key: string; name: string }[];
}) {
  const [homeTeamId, setHomeTeamId] = useState(myTeams[0]?.id ?? "");
  const [mode, setMode] = useState<OpponentMode>(myTeams.length > 1 ? "own" : "friend");
  const [awayTeamId, setAwayTeamId] = useState("");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [guestName, setGuestName] = useState("");
  const [guestRace, setGuestRace] = useState(races[0]?.key ?? "");
  const [error, setError] = useState<string | undefined>();
  const [pending, startTransition] = useTransition();

  async function runSearch(value: string) {
    setQuery(value);
    setAwayTeamId("");
    if (value.trim().length < 2) {
      setResults([]);
      return;
    }
    setSearching(true);
    const found = await searchOpponentTeams(value);
    setResults(found);
    setSearching(false);
  }

  function handleModeChange(next: OpponentMode) {
    setMode(next);
    setAwayTeamId("");
    setResults([]);
    setQuery("");
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(undefined);
    if (!homeTeamId) return setError("Elige tu equipo");
    if (!awayTeamId) return setError("Elige o busca el equipo rival");
    startTransition(async () => {
      const res = await createFriendlyMatch({ homeTeamId, awayTeamId });
      if (res && !res.ok) setError(res.error);
    });
  }

  function createGuest(e: React.FormEvent) {
    e.preventDefault();
    setError(undefined);
    if (guestName.trim().length < 2) return setError("Nombre del equipo invitado demasiado corto");
    startTransition(async () => {
      // createTeam redirige él mismo a la ficha del equipo (con ?arena=1) —
      // desde ahí, con la plantilla montada, se vuelve aquí para crear el partido.
      await createTeam({ raceKey: guestRace, name: guestName }, { isGuest: true });
    });
  }

  if (myTeams.length === 0) {
    return (
      <p className="text-sm" style={{ color: "var(--ink-3)" }}>
        Necesitas fundar al menos un equipo en{" "}
        <Link href="/equipos/nuevo" className="underline">
          El Cuartel
        </Link>{" "}
        antes de poder jugar un amistoso.
      </p>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      <div className="space-y-2">
        <label className="block text-sm font-medium" htmlFor="homeTeam">
          Tu equipo
        </label>
        <select id="homeTeam" className="input" value={homeTeamId} onChange={(e) => setHomeTeamId(e.target.value)}>
          {myTeams.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-3">
        <span className="block text-sm font-medium">Equipo rival</span>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => handleModeChange("own")} className={mode === "own" ? "btn-primary" : "btn-secondary"}>
            Otro equipo mío
          </button>
          <button type="button" onClick={() => handleModeChange("friend")} className={mode === "friend" ? "btn-primary" : "btn-secondary"}>
            Equipo de un amigo
          </button>
          {myGuestTeams.length > 0 && (
            <button type="button" onClick={() => handleModeChange("guest")} className={mode === "guest" ? "btn-primary" : "btn-secondary"}>
              Equipo invitado ya creado
            </button>
          )}
          <button type="button" onClick={() => handleModeChange("createGuest")} className={mode === "createGuest" ? "btn-primary" : "btn-secondary"}>
            Crear equipo invitado
          </button>
        </div>

        {mode === "own" && (
          <select className="input" value={awayTeamId} onChange={(e) => setAwayTeamId(e.target.value)}>
            <option value="">Elige uno de tus equipos…</option>
            {myTeams
              .filter((t) => t.id !== homeTeamId)
              .map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
          </select>
        )}

        {mode === "guest" && (
          <select className="input" value={awayTeamId} onChange={(e) => setAwayTeamId(e.target.value)}>
            <option value="">Elige un equipo invitado…</option>
            {myGuestTeams.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        )}

        {mode === "friend" && (
          <div className="space-y-2">
            <input
              type="search"
              className="input"
              placeholder="Nombre de su equipo, o su email exacto para ver todos los suyos…"
              value={query}
              onChange={(e) => runSearch(e.target.value)}
            />
            {searching && (
              <p className="text-xs" style={{ color: "var(--ink-3)" }}>
                Buscando…
              </p>
            )}
            {results.length > 0 && (
              <div className="space-y-1">
                {results.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setAwayTeamId(r.id)}
                    className="flex w-full items-center justify-between rounded-[3px] border px-3 py-2 text-left text-sm"
                    style={{
                      borderColor: awayTeamId === r.id ? "var(--gold)" : "var(--border)",
                      background: "var(--surface-1)",
                    }}
                  >
                    <span>
                      <strong>{r.name}</strong>{" "}
                      <span style={{ color: "var(--ink-3)" }}>· entrenador {r.owner.displayName}</span>
                    </span>
                  </button>
                ))}
              </div>
            )}
            {query.trim().length >= 2 && !searching && results.length === 0 && (
              <p className="text-xs" style={{ color: "var(--ink-3)" }}>
                Ningún equipo coincide con «{query}».
              </p>
            )}
          </div>
        )}

        {mode === "createGuest" && (
          <div className="space-y-2 rounded-[3px] border p-3" style={{ borderColor: "var(--border)" }}>
            <p className="text-xs" style={{ color: "var(--ink-3)" }}>
              Para un amigo sin cuenta: crea su equipo ahora mismo, monta la plantilla, y vuelve aquí para empezar el
              partido.
            </p>
            <input
              type="text"
              className="input"
              placeholder="Nombre del equipo invitado"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              minLength={2}
              maxLength={40}
            />
            <select className="input" value={guestRace} onChange={(e) => setGuestRace(e.target.value)}>
              {races.map((r) => (
                <option key={r.key} value={r.key}>
                  {r.name}
                </option>
              ))}
            </select>
            <button type="button" onClick={createGuest} disabled={pending} className="btn-secondary">
              Crear equipo invitado y montar plantilla
            </button>
          </div>
        )}
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      {mode !== "createGuest" && (
        <button type="submit" disabled={pending || !awayTeamId} className="btn-primary">
          {pending ? "Creando partido…" : "Empezar el Asistente de Partido"}
        </button>
      )}
    </form>
  );
}
