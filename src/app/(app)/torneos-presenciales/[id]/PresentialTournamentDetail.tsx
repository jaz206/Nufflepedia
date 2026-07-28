"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import {
  addEntrant,
  removeEntrant,
  dropEntrant,
  pairNextRound,
  reportMatchResult,
  finishTournament,
} from "../actions";

interface Entrant {
  id: string;
  displayName: string;
  teamName: string;
  raceName: string;
  dropped: boolean;
}
interface Match {
  id: string;
  tableNumber: number;
  entrantAName: string;
  entrantBName: string | null;
  scoreA: number | null;
  scoreB: number | null;
  casA: number;
  casB: number;
  reported: boolean;
}
interface Round {
  number: number;
  matches: Match[];
}
interface StandingsRow {
  entrantId: string;
  entrantName: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  byes: number;
  tdFor: number;
  tdAgainst: number;
  casFor: number;
  casAgainst: number;
  points: number;
}
interface Tournament {
  id: string;
  name: string;
  status: "SETUP" | "IN_PROGRESS" | "FINISHED";
  totalRounds: number;
  currentRound: number;
  pointsWin: number;
  pointsDraw: number;
  pointsLoss: number;
  publicSlug: string;
}

const STATUS_LABEL: Record<Tournament["status"], string> = {
  SETUP: "En preparación",
  IN_PROGRESS: "En curso",
  FINISHED: "Finalizado",
};

function StandingsTable({ rows }: { rows: StandingsRow[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b" style={{ borderColor: "var(--border-strong)" }}>
            <th className="px-2 py-2 text-left">#</th>
            <th className="px-2 py-2 text-left">Entrenador</th>
            <th className="px-2 py-2 text-right">PJ</th>
            <th className="px-2 py-2 text-right">V</th>
            <th className="px-2 py-2 text-right">E</th>
            <th className="px-2 py-2 text-right">D</th>
            <th className="px-2 py-2 text-right">Bye</th>
            <th className="px-2 py-2 text-right">TD +/-</th>
            <th className="px-2 py-2 text-right">Bajas +/-</th>
            <th className="px-2 py-2 text-right font-semibold">Pts</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.entrantId} className="border-b" style={{ borderColor: "var(--border)" }}>
              <td className="px-2 py-2" style={{ color: "var(--ink-3)" }}>{i + 1}</td>
              <td className="px-2 py-2 font-medium">{r.entrantName}</td>
              <td className="px-2 py-2 text-right font-mono">{r.played}</td>
              <td className="px-2 py-2 text-right font-mono">{r.won}</td>
              <td className="px-2 py-2 text-right font-mono">{r.drawn}</td>
              <td className="px-2 py-2 text-right font-mono">{r.lost}</td>
              <td className="px-2 py-2 text-right font-mono">{r.byes}</td>
              <td className="px-2 py-2 text-right font-mono">{r.tdFor}-{r.tdAgainst}</td>
              <td className="px-2 py-2 text-right font-mono">{r.casFor}-{r.casAgainst}</td>
              <td className="px-2 py-2 text-right font-mono font-semibold" style={{ color: "var(--gold)" }}>{r.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function MatchRow({ tournamentId, match }: { tournamentId: string; match: Match }) {
  const [scoreA, setScoreA] = useState(match.scoreA ?? 0);
  const [scoreB, setScoreB] = useState(match.scoreB ?? 0);
  const [casA, setCasA] = useState(match.casA);
  const [casB, setCasB] = useState(match.casB);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | undefined>();

  if (match.entrantBName === null) {
    return (
      <div className="flex items-center justify-between rounded-[3px] border px-3 py-2 text-sm" style={{ borderColor: "var(--border)" }}>
        <span>Mesa {match.tableNumber} — {match.entrantAName}</span>
        <span className="rounded-full px-2 py-0.5 text-xs" style={{ background: "var(--surface-2)", color: "var(--ink-3)" }}>Bye</span>
      </div>
    );
  }

  function save() {
    setError(undefined);
    startTransition(async () => {
      const res = await reportMatchResult(tournamentId, match.id, { scoreA, scoreB, casA, casB });
      if (!res.ok) setError(res.error);
    });
  }

  return (
    <div className="rounded-[3px] border px-3 py-2" style={{ borderColor: "var(--border)", background: match.reported ? "var(--surface-1)" : "var(--surface-2)" }}>
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <span className="w-16 shrink-0 font-mono text-xs" style={{ color: "var(--ink-3)" }}>Mesa {match.tableNumber}</span>
        <span className="flex-1 min-w-0 truncate">{match.entrantAName}</span>
        <input type="number" min={0} max={30} className="input w-14 text-center" value={scoreA} onChange={(e) => setScoreA(Number.parseInt(e.target.value, 10) || 0)} />
        <span style={{ color: "var(--ink-3)" }}>—</span>
        <input type="number" min={0} max={30} className="input w-14 text-center" value={scoreB} onChange={(e) => setScoreB(Number.parseInt(e.target.value, 10) || 0)} />
        <span className="flex-1 min-w-0 truncate text-right">{match.entrantBName}</span>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-3 text-xs" style={{ color: "var(--ink-3)" }}>
        <span className="w-16 shrink-0" />
        <label className="flex items-center gap-1">
          Bajas <input type="number" min={0} max={20} className="input w-12 text-center" value={casA} onChange={(e) => setCasA(Number.parseInt(e.target.value, 10) || 0)} />
        </label>
        <label className="ml-auto flex items-center gap-1">
          Bajas <input type="number" min={0} max={20} className="input w-12 text-center" value={casB} onChange={(e) => setCasB(Number.parseInt(e.target.value, 10) || 0)} />
        </label>
        <button type="button" onClick={save} disabled={pending} className="btn-secondary px-3 py-1">
          {match.reported ? "Actualizar" : "Guardar"}
        </button>
        {match.reported && <span style={{ color: "var(--ok)" }}>✓ Registrado</span>}
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

function EntrantsSetup({ tournamentId, entrants, canManage }: { tournamentId: string; entrants: Entrant[]; canManage: boolean }) {
  const [displayName, setDisplayName] = useState("");
  const [teamName, setTeamName] = useState("");
  const [raceName, setRaceName] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [pending, startTransition] = useTransition();

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError(undefined);
    startTransition(async () => {
      const res = await addEntrant(tournamentId, { displayName, teamName, raceName });
      if (!res.ok) setError(res.error);
      else {
        setDisplayName("");
        setTeamName("");
        setRaceName("");
      }
    });
  }

  function handleRemove(entrantId: string) {
    startTransition(async () => {
      await removeEntrant(tournamentId, entrantId);
    });
  }

  return (
    <section>
      <h2 className="mb-3 text-lg font-semibold">Inscritos ({entrants.length})</h2>
      {canManage && (
        <form onSubmit={handleAdd} className="mb-4 flex flex-wrap gap-2">
          <input className="input flex-1 min-w-32" placeholder="Entrenador" value={displayName} onChange={(e) => setDisplayName(e.target.value)} required />
          <input className="input flex-1 min-w-32" placeholder="Equipo" value={teamName} onChange={(e) => setTeamName(e.target.value)} required />
          <input className="input flex-1 min-w-32" placeholder="Raza" value={raceName} onChange={(e) => setRaceName(e.target.value)} required />
          <button type="submit" disabled={pending} className="btn-primary">Añadir</button>
        </form>
      )}
      {error && <p className="mb-2 text-sm text-red-500">{error}</p>}
      <div className="grid gap-1">
        {entrants.map((e) => (
          <div key={e.id} className="flex items-center justify-between rounded-[3px] border px-3 py-2 text-sm" style={{ borderColor: "var(--border)" }}>
            <span>{e.displayName} — <span style={{ color: "var(--ink-3)" }}>{e.teamName} ({e.raceName})</span></span>
            {canManage && (
              <button type="button" onClick={() => handleRemove(e.id)} className="text-xs" style={{ color: "var(--danger)" }}>
                Quitar
              </button>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

export default function PresentialTournamentDetail({
  tournament,
  entrants,
  rounds,
  standings,
}: {
  tournament: Tournament;
  entrants: Entrant[];
  rounds: Round[];
  standings: StandingsRow[];
}) {
  const [error, setError] = useState<string | undefined>();
  const [pending, startTransition] = useTransition();

  const currentRound = rounds.find((r) => r.number === tournament.currentRound);
  const roundComplete = currentRound ? currentRound.matches.every((m) => m.reported) : false;
  const isLastRound = tournament.currentRound >= tournament.totalRounds;
  const activeEntrants = entrants.filter((e) => !e.dropped);
  const publicUrl = `/torneo-en-directo/${tournament.publicSlug}`;

  function handlePairNext() {
    setError(undefined);
    startTransition(async () => {
      const res = await pairNextRound(tournament.id);
      if (!res.ok) setError(res.error);
    });
  }
  function handleFinish() {
    if (!confirm("¿Finalizar el torneo? Ya no se podrán registrar más resultados.")) return;
    setError(undefined);
    startTransition(async () => {
      const res = await finishTournament(tournament.id);
      if (!res.ok) setError(res.error);
    });
  }
  function handleDrop(entrantId: string) {
    if (!confirm("¿Retirar a este entrenador del torneo?")) return;
    startTransition(async () => {
      await dropEntrant(tournament.id, entrantId);
    });
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-8 px-6 py-10">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{tournament.name}</h1>
          <p className="mt-1 text-sm" style={{ color: "var(--ink-3)" }}>
            {STATUS_LABEL[tournament.status]} · Ronda {tournament.currentRound}/{tournament.totalRounds} ·{" "}
            {activeEntrants.length} inscritos activos · Puntos {tournament.pointsWin}/{tournament.pointsDraw}/{tournament.pointsLoss}
          </p>
          <Link href={publicUrl} target="_blank" className="mt-2 inline-block text-sm hover:underline" style={{ color: "var(--gold)" }}>
            📺 Pantalla pública para proyectar →
          </Link>
        </div>
        <div className="flex flex-wrap gap-2">
          {tournament.status !== "FINISHED" && (
            <button
              type="button"
              onClick={handlePairNext}
              disabled={pending || activeEntrants.length < 2 || (tournament.currentRound > 0 && !roundComplete) || isLastRound}
              className="btn-primary"
            >
              {tournament.currentRound === 0 ? "Emparejar ronda 1" : `Emparejar ronda ${tournament.currentRound + 1}`}
            </button>
          )}
          {tournament.status === "IN_PROGRESS" && isLastRound && (
            <button type="button" onClick={handleFinish} disabled={pending || !roundComplete} className="btn-danger">
              Finalizar torneo
            </button>
          )}
        </div>
      </header>

      {error && <p className="text-sm text-red-500">{error}</p>}

      {tournament.status === "SETUP" ? (
        <EntrantsSetup tournamentId={tournament.id} entrants={entrants} canManage />
      ) : (
        <section>
          <h2 className="mb-3 text-lg font-semibold">Inscritos ({activeEntrants.length} activos)</h2>
          <div className="grid gap-1 sm:grid-cols-2">
            {entrants.map((e) => (
              <div key={e.id} className="flex items-center justify-between rounded-[3px] border px-3 py-2 text-sm" style={{ borderColor: "var(--border)", opacity: e.dropped ? 0.5 : 1 }}>
                <span>{e.displayName} — <span style={{ color: "var(--ink-3)" }}>{e.teamName}</span></span>
                {!e.dropped && (
                  <button type="button" onClick={() => handleDrop(e.id)} className="text-xs" style={{ color: "var(--danger)" }}>
                    Retirar
                  </button>
                )}
                {e.dropped && <span className="text-xs" style={{ color: "var(--ink-3)" }}>Retirado</span>}
              </div>
            ))}
          </div>
        </section>
      )}

      {rounds.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-semibold">Ronda {tournament.currentRound}</h2>
          <div className="grid gap-2">
            {currentRound?.matches.map((m) => (
              <MatchRow key={m.id} tournamentId={tournament.id} match={m} />
            ))}
          </div>
        </section>
      )}

      {rounds.length > 1 && (
        <details>
          <summary className="cursor-pointer text-sm font-medium" style={{ color: "var(--ink-3)" }}>
            Ver rondas anteriores
          </summary>
          <div className="mt-3 space-y-4">
            {[...rounds]
              .filter((r) => r.number !== tournament.currentRound)
              .reverse()
              .map((r) => (
                <div key={r.number}>
                  <h3 className="mb-2 text-sm font-semibold">Ronda {r.number}</h3>
                  <div className="grid gap-2">
                    {r.matches.map((m) => (
                      <MatchRow key={m.id} tournamentId={tournament.id} match={m} />
                    ))}
                  </div>
                </div>
              ))}
          </div>
        </details>
      )}

      {standings.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-semibold">Clasificación</h2>
          <StandingsTable rows={standings} />
        </section>
      )}
    </div>
  );
}
