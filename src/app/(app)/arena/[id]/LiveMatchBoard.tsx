"use client";

import { useMemo, useState, useTransition } from "react";
import {
  setFanFactor,
  setWeather,
  setKickingTeam,
  startLiveMatch,
  logLiveMatchEvent,
  advanceTurn,
  startSecondHalf,
  finishLiveMatch,
} from "../actions";

type Side = "home" | "away";
type LiveEventType = Parameters<typeof logLiveMatchEvent>[1]["type"];
type PlayerStatus = "ACTIVE" | "MISS_NEXT_GAME" | "NIGGLING_INJURY" | "DEAD" | "RETIRED";

interface Player {
  id: string;
  number: number;
  customName: string;
  status: PlayerStatus;
  spp: number;
}
interface TeamSide {
  entryId: string;
  teamName: string;
  players: Player[];
}
interface LiveEvent {
  id: string;
  type: string;
  half: number;
  turn: number;
  entryId: string | null;
  playerId: string | null;
  opponentEntryId: string | null;
  opponentPlayerId: string | null;
  payload: Record<string, unknown>;
  createdAt: string;
}
interface TableEntry {
  id: string;
  name: string;
  effect: string;
}
interface InjuryEntry {
  code: string;
  name: string;
  permanentStatLoss: boolean;
}
type StatLoss = "MA" | "ST" | "AG" | "PA" | "AV";
const STAT_LOSS_LABEL: Record<StatLoss, string> = { MA: "Movimiento", ST: "Fuerza", AG: "Agilidad", PA: "Pase", AV: "Armadura" };

const STATUS_LABEL: Record<PlayerStatus, string> = {
  ACTIVE: "Activo",
  MISS_NEXT_GAME: "Se pierde el próximo",
  NIGGLING_INJURY: "Lesión permanente",
  DEAD: "Muerto",
  RETIRED: "Retirado",
};

export default function LiveMatchBoard({
  liveMatch,
  homeTeam,
  awayTeam,
  events,
  weather,
  kickoffEvents,
  prayers,
  injuryCatalog,
}: {
  liveMatch: {
    id: string;
    status: "PRE_MATCH" | "IN_PROGRESS" | "FINISHED";
    half: number;
    turn: number;
    homeScore: number;
    awayScore: number;
    fanFactorHome: number | null;
    fanFactorAway: number | null;
    weatherCode: string | null;
    kickingEntryId: string | null;
    matchReportId: string | null;
    homeEntryId: string;
    awayEntryId: string;
  };
  homeTeam: TeamSide;
  awayTeam: TeamSide;
  events: LiveEvent[];
  weather: TableEntry[];
  kickoffEvents: TableEntry[];
  prayers: TableEntry[];
  injuryCatalog: InjuryEntry[];
}) {
  if (liveMatch.status === "PRE_MATCH") {
    return <PreMatchStage liveMatch={liveMatch} homeTeam={homeTeam} awayTeam={awayTeam} weather={weather} />;
  }
  if (liveMatch.status === "FINISHED") {
    return <FinishedStage liveMatch={liveMatch} homeTeam={homeTeam} awayTeam={awayTeam} events={events} />;
  }
  return (
    <InProgressStage
      liveMatch={liveMatch}
      homeTeam={homeTeam}
      awayTeam={awayTeam}
      events={events}
      weather={weather}
      kickoffEvents={kickoffEvents}
      prayers={prayers}
      injuryCatalog={injuryCatalog}
    />
  );
}

function Panel({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-[3px] border p-4" style={{ borderColor: "var(--border)", background: "var(--surface-1)" }}>
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// PRE-PARTIDO
// ─────────────────────────────────────────────────────────────────────────
function PreMatchStage({
  liveMatch,
  homeTeam,
  awayTeam,
  weather,
}: {
  liveMatch: { id: string; fanFactorHome: number | null; fanFactorAway: number | null; weatherCode: string | null; kickingEntryId: string | null; homeEntryId: string; awayEntryId: string };
  homeTeam: TeamSide;
  awayTeam: TeamSide;
  weather: TableEntry[];
}) {
  const [fanHome, setFanHome] = useState(1);
  const [fanAway, setFanAway] = useState(1);
  const [weatherId, setWeatherId] = useState(liveMatch.weatherCode ?? "");
  const [kickingId, setKickingId] = useState(liveMatch.kickingEntryId ?? "");
  const [error, setError] = useState<string | undefined>();
  const [pending, startTransition] = useTransition();

  function saveFans() {
    startTransition(async () => {
      const res = await setFanFactor(liveMatch.id, { home: fanHome, away: fanAway });
      if (!res.ok) setError(res.error);
    });
  }
  function saveWeather() {
    if (!weatherId) return;
    startTransition(async () => {
      const res = await setWeather(liveMatch.id, weatherId);
      if (!res.ok) setError(res.error);
    });
  }
  function saveKicking() {
    if (!kickingId) return;
    startTransition(async () => {
      const res = await setKickingTeam(liveMatch.id, kickingId);
      if (!res.ok) setError(res.error);
    });
  }
  function begin() {
    startTransition(async () => {
      const res = await startLiveMatch(liveMatch.id);
      if (!res.ok) setError(res.error);
    });
  }

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6 px-6 py-10">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">
          {homeTeam.teamName} <span style={{ color: "var(--ink-3)" }}>vs</span> {awayTeam.teamName}
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--ink-3)" }}>
          Secuencia anterior al partido — resuelve estos pasos con los dados físicos y registra el resultado.
        </p>
      </header>

      <Panel>
        <h2 className="mb-2 font-semibold">1. Factor de Hinchas</h2>
        <p className="mb-2 text-xs" style={{ color: "var(--ink-3)" }}>
          Tira 1D3 por cada equipo y súmalo al valor de Hinchas de su Hoja de plantilla.
        </p>
        <div className="flex flex-wrap items-end gap-3">
          <label className="text-sm">
            {homeTeam.teamName}
            <input type="number" className="input mt-1 w-20" min={1} value={fanHome} onChange={(e) => setFanHome(Number(e.target.value))} />
          </label>
          <label className="text-sm">
            {awayTeam.teamName}
            <input type="number" className="input mt-1 w-20" min={1} value={fanAway} onChange={(e) => setFanAway(Number(e.target.value))} />
          </label>
          <button type="button" onClick={saveFans} disabled={pending} className="btn-secondary">
            Guardar
          </button>
          {liveMatch.fanFactorHome !== null && <span className="text-xs" style={{ color: "var(--ok)" }}>✓ guardado</span>}
        </div>
      </Panel>

      <Panel>
        <h2 className="mb-2 font-semibold">2. Clima</h2>
        <p className="mb-2 text-xs" style={{ color: "var(--ink-3)" }}>
          Cada Entrenador tira 1D6, sumad los resultados y consultad la tabla.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <select className="input flex-1" value={weatherId} onChange={(e) => setWeatherId(e.target.value)}>
            <option value="">Elige el resultado…</option>
            {weather.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </select>
          <button type="button" onClick={saveWeather} disabled={pending} className="btn-secondary">
            Guardar
          </button>
          {liveMatch.weatherCode && <span className="text-xs" style={{ color: "var(--ok)" }}>✓ guardado</span>}
        </div>
      </Panel>

      <Panel>
        <h2 className="mb-2 font-semibold">3. Equipo pateador</h2>
        <p className="mb-2 text-xs" style={{ color: "var(--ink-3)" }}>
          Tirada enfrentada — quien saque más alto decide quién patea y quién recibe.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <select className="input flex-1" value={kickingId} onChange={(e) => setKickingId(e.target.value)}>
            <option value="">¿Quién patea?</option>
            <option value={liveMatch.homeEntryId}>{homeTeam.teamName}</option>
            <option value={liveMatch.awayEntryId}>{awayTeam.teamName}</option>
          </select>
          <button type="button" onClick={saveKicking} disabled={pending} className="btn-secondary">
            Guardar
          </button>
          {liveMatch.kickingEntryId && <span className="text-xs" style={{ color: "var(--ok)" }}>✓ guardado</span>}
        </div>
      </Panel>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <button
        type="button"
        onClick={begin}
        disabled={pending || !liveMatch.weatherCode || !liveMatch.kickingEntryId}
        className="btn-primary"
      >
        Empezar el partido
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// PARTIDO EN VIVO
// ─────────────────────────────────────────────────────────────────────────

interface Selected {
  side: Side;
  player: Player;
}

function InProgressStage({
  liveMatch,
  homeTeam,
  awayTeam,
  events,
  weather,
  kickoffEvents,
  prayers,
  injuryCatalog,
}: {
  liveMatch: {
    id: string;
    half: number;
    turn: number;
    homeScore: number;
    awayScore: number;
    weatherCode: string | null;
    kickingEntryId: string | null;
    homeEntryId: string;
    awayEntryId: string;
  };
  homeTeam: TeamSide;
  awayTeam: TeamSide;
  events: LiveEvent[];
  weather: TableEntry[];
  kickoffEvents: TableEntry[];
  prayers: TableEntry[];
  injuryCatalog: InjuryEntry[];
}) {
  const [selected, setSelected] = useState<Selected | null>(null);
  const [pendingInjury, setPendingInjury] = useState<{ attackerSide: Side; attackerPlayer: Player } | null>(null);
  const [injuryVictimId, setInjuryVictimId] = useState("");
  const [injuryCode, setInjuryCode] = useState("");
  const [injuryStatLoss, setInjuryStatLoss] = useState<StatLoss | "">("");
  const [showKickoffPicker, setShowKickoffPicker] = useState(false);
  const [showPrayerPicker, setShowPrayerPicker] = useState(false);
  const [onBench, setOnBench] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | undefined>();
  const [pending, startTransition] = useTransition();

  const weatherName = weather.find((w) => w.id === liveMatch.weatherCode)?.name ?? "—";
  const entryIdOf = (side: Side) => (side === "home" ? liveMatch.homeEntryId : liveMatch.awayEntryId);
  const teamOf = (side: Side) => (side === "home" ? homeTeam : awayTeam);
  const otherSide = (side: Side): Side => (side === "home" ? "away" : "home");

  function fire(input: Parameters<typeof logLiveMatchEvent>[1]) {
    setError(undefined);
    startTransition(async () => {
      const res = await logLiveMatchEvent(liveMatch.id, input);
      if (!res.ok) setError(res.error);
      else {
        setSelected(null);
        setPendingInjury(null);
      }
    });
  }

  function quickAction(type: LiveEventType) {
    if (!selected) return;
    fire({ type, entryId: entryIdOf(selected.side), playerId: selected.player.id });
  }

  function startInjury() {
    if (!selected) return;
    setPendingInjury({ attackerSide: selected.side, attackerPlayer: selected.player });
    setInjuryVictimId("");
    setInjuryCode("");
    setInjuryStatLoss("");
  }

  function confirmInjury() {
    if (!pendingInjury) return;
    const victimSide = otherSide(pendingInjury.attackerSide);
    fire({
      type: "CASUALTY",
      entryId: entryIdOf(pendingInjury.attackerSide),
      playerId: pendingInjury.attackerPlayer.id,
      opponentEntryId: entryIdOf(victimSide),
      opponentPlayerId: injuryVictimId || undefined,
      payload: { injuryCode: injuryCode || undefined, statLoss: injuryStatLoss || undefined },
    });
  }

  function toggleBench(playerId: string, side: Side) {
    setOnBench((prev) => {
      const next = new Set(prev);
      if (next.has(playerId)) next.delete(playerId);
      else next.add(playerId);
      return next;
    });
    fire({
      type: "SUBSTITUTION",
      entryId: entryIdOf(side),
      playerId,
      payload: { direction: onBench.has(playerId) ? "IN" : "OUT" },
    });
  }

  function pickKickoff(entry: TableEntry) {
    setShowKickoffPicker(false);
    fire({ type: "KICKOFF_EVENT", entryId: liveMatch.kickingEntryId ?? undefined, payload: { id: entry.id, name: entry.name, effect: entry.effect } });
  }
  function pickPrayer(entry: TableEntry) {
    setShowPrayerPicker(false);
    fire({ type: "PRAYER_TO_NUFFLE", payload: { id: entry.id, name: entry.name, effect: entry.effect } });
  }

  function nextTurn() {
    startTransition(async () => {
      await advanceTurn(liveMatch.id);
    });
  }
  function secondHalf() {
    startTransition(async () => {
      await startSecondHalf(liveMatch.id);
    });
  }
  function finish() {
    if (!confirm("¿Finalizar el partido? Se aplicará el resultado a las plantillas.")) return;
    startTransition(async () => {
      const res = await finishLiveMatch(liveMatch.id);
      if (!res.ok) setError(res.error);
      else window.location.reload();
    });
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-4 px-6 py-6">
      <Panel>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm" style={{ color: "var(--ink-3)" }}>
              {homeTeam.teamName} vs {awayTeam.teamName} · {liveMatch.half}ª parte · turno {liveMatch.turn} · Clima: {weatherName}
            </p>
            <p className="font-mono text-3xl font-bold" style={{ color: "var(--gold)" }}>
              {liveMatch.homeScore} — {liveMatch.awayScore}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={nextTurn} disabled={pending} className="btn-secondary">
              Cambio de turno
            </button>
            {liveMatch.half === 1 && (
              <button type="button" onClick={secondHalf} disabled={pending} className="btn-secondary">
                Empezar 2ª parte
              </button>
            )}
            <button type="button" onClick={() => setShowKickoffPicker((v) => !v)} disabled={pending} className="btn-secondary">
              Evento de Patada Inicial
            </button>
            <button type="button" onClick={() => setShowPrayerPicker((v) => !v)} disabled={pending} className="btn-secondary">
              Plegaria a Nuffle
            </button>
            <button type="button" onClick={finish} disabled={pending} className="btn-primary">
              Finalizar partido
            </button>
          </div>
        </div>
        {showKickoffPicker && (
          <TablePicker entries={kickoffEvents} onPick={pickKickoff} onClose={() => setShowKickoffPicker(false)} />
        )}
        {showPrayerPicker && <TablePicker entries={prayers} onPick={pickPrayer} onClose={() => setShowPrayerPicker(false)} />}
        {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
      </Panel>

      <div className="grid gap-4 lg:grid-cols-[1fr_auto_1fr]">
        <RosterPanel side="home" team={homeTeam} selected={selected} onSelect={setSelected} onBench={onBench} />

        <div className="min-w-[280px] space-y-4">
          {pendingInjury ? (
            <Panel>
              <p className="mb-2 text-sm font-semibold">
                Baja causada por {pendingInjury.attackerPlayer.customName} ({teamOf(pendingInjury.attackerSide).teamName})
              </p>
              <label className="mb-2 block text-xs" style={{ color: "var(--ink-3)" }}>
                ¿Quién la recibe?
              </label>
              <select className="input mb-2 w-full" value={injuryVictimId} onChange={(e) => setInjuryVictimId(e.target.value)}>
                <option value="">Sin asignar</option>
                {teamOf(otherSide(pendingInjury.attackerSide)).players.map((p) => (
                  <option key={p.id} value={p.id}>
                    #{p.number} {p.customName}
                  </option>
                ))}
              </select>
              <select className="input mb-2 w-full" value={injuryCode} onChange={(e) => setInjuryCode(e.target.value)}>
                <option value="">Resultado de la Tabla de Lesiones</option>
                {injuryCatalog.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.name}
                  </option>
                ))}
              </select>
              {injuryCatalog.find((c) => c.code === injuryCode)?.permanentStatLoss && (
                <select
                  className="input mb-2 w-full"
                  value={injuryStatLoss}
                  onChange={(e) => setInjuryStatLoss(e.target.value as StatLoss)}
                >
                  <option value="">¿Qué característica se reduce?</option>
                  {(Object.entries(STAT_LOSS_LABEL) as [StatLoss, string][]).map(([k, label]) => (
                    <option key={k} value={k}>
                      {label}
                    </option>
                  ))}
                </select>
              )}
              <div className="flex gap-2">
                <button type="button" onClick={confirmInjury} disabled={pending} className="btn-primary">
                  Guardar baja
                </button>
                <button type="button" onClick={() => setPendingInjury(null)} className="btn-secondary">
                  Cancelar
                </button>
              </div>
            </Panel>
          ) : selected ? (
            <Panel>
              <p className="mb-1 text-sm font-semibold">
                #{selected.player.number} {selected.player.customName}
              </p>
              <p className="mb-3 text-xs" style={{ color: "var(--ink-3)" }}>
                {teamOf(selected.side).teamName} · {STATUS_LABEL[selected.player.status]} · {selected.player.spp} PE
              </p>
              <div className="flex flex-col gap-2">
                <button type="button" onClick={() => quickAction("TOUCHDOWN")} disabled={pending} className="btn-primary">
                  Touchdown
                </button>
                <button type="button" onClick={() => quickAction("COMPLETED_PASS")} disabled={pending} className="btn-secondary">
                  Pase completado
                </button>
                <button type="button" onClick={() => quickAction("INTERCEPTION")} disabled={pending} className="btn-secondary">
                  Intercepción
                </button>
                <button type="button" onClick={startInjury} disabled={pending} className="btn-secondary">
                  Causó una baja
                </button>
                <button type="button" onClick={() => quickAction("SENT_OFF")} disabled={pending} className="btn-secondary">
                  Expulsión
                </button>
                <button type="button" onClick={() => quickAction("APOTHECARY_USED")} disabled={pending} className="btn-secondary">
                  Usar apotecario
                </button>
                <button type="button" onClick={() => quickAction("KO_RECOVERY")} disabled={pending} className="btn-secondary">
                  Recuperación K.O.
                </button>
                <button
                  type="button"
                  onClick={() => toggleBench(selected.player.id, selected.side)}
                  disabled={pending}
                  className="btn-secondary"
                >
                  {onBench.has(selected.player.id) ? "Meter en el campo" : "Sacar al banquillo"}
                </button>
              </div>
            </Panel>
          ) : (
            <Panel>
              <p className="text-sm" style={{ color: "var(--ink-3)" }}>
                Selecciona un jugador de cualquiera de los dos equipos para registrar lo que hace.
              </p>
            </Panel>
          )}
        </div>

        <RosterPanel side="away" team={awayTeam} selected={selected} onSelect={setSelected} onBench={onBench} />
      </div>

      <EventLog events={events} homeTeam={homeTeam} awayTeam={awayTeam} homeEntryId={liveMatch.homeEntryId} />
    </div>
  );
}

function TablePicker({ entries, onPick, onClose }: { entries: TableEntry[]; onPick: (e: TableEntry) => void; onClose: () => void }) {
  return (
    <div className="mt-3 max-h-64 space-y-1 overflow-y-auto rounded-[3px] border p-2" style={{ borderColor: "var(--border)" }}>
      {entries.map((e) => (
        <button
          key={e.id}
          type="button"
          onClick={() => onPick(e)}
          className="block w-full rounded-[3px] px-2 py-1.5 text-left text-xs hover:opacity-80"
          style={{ background: "var(--surface-2)" }}
        >
          <strong>{e.name}</strong> — {e.effect}
        </button>
      ))}
      <button type="button" onClick={onClose} className="text-xs underline" style={{ color: "var(--ink-3)" }}>
        Cerrar
      </button>
    </div>
  );
}

function RosterPanel({
  side,
  team,
  selected,
  onSelect,
  onBench,
}: {
  side: Side;
  team: TeamSide;
  selected: Selected | null;
  onSelect: (s: Selected) => void;
  onBench: Set<string>;
}) {
  return (
    <Panel>
      <h3 className="mb-2 font-semibold">{team.teamName}</h3>
      <div className="space-y-1">
        {team.players.map((p) => {
          const isSelected = selected?.player.id === p.id;
          const bench = onBench.has(p.id);
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => onSelect({ side, player: p })}
              className="flex w-full items-center justify-between rounded-[3px] border px-2 py-1.5 text-left text-sm transition-colors"
              style={{
                borderColor: isSelected ? "var(--gold)" : "var(--border)",
                background: isSelected ? "color-mix(in srgb, var(--gold) 12%, transparent)" : "var(--surface-2)",
                opacity: bench ? 0.55 : 1,
              }}
            >
              <span>
                #{p.number} {p.customName}
                {bench && <span className="ml-1 text-[10px]" style={{ color: "var(--ink-3)" }}>(banquillo)</span>}
              </span>
              {p.status !== "ACTIVE" && (
                <span className="rounded-full px-2 py-0.5 text-[10px]" style={{ background: "var(--surface-3)", color: "var(--danger, #b23)" }}>
                  {STATUS_LABEL[p.status]}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </Panel>
  );
}

const EVENT_LABEL: Record<string, string> = {
  FAN_FACTOR: "Factor de Hinchas",
  WEATHER_ROLL: "Clima",
  KICKING_TEAM_ROLL: "Equipo pateador",
  KICKOFF_EVENT: "Evento de Patada Inicial",
  TURNOVER: "Cambio de turno",
  TOUCHDOWN: "¡Touchdown!",
  COMPLETED_PASS: "Pase completado",
  INTERCEPTION: "Intercepción",
  CASUALTY: "Baja",
  SENT_OFF: "Expulsión",
  APOTHECARY_USED: "Apotecario",
  SUBSTITUTION: "Cambio de banquillo",
  PRAYER_TO_NUFFLE: "Plegaria a Nuffle",
  KO_RECOVERY: "Recuperación K.O.",
  HALF_END: "Fin de la primera parte",
  NOTE: "Nota",
};

function EventLog({
  events,
  homeTeam,
  awayTeam,
  homeEntryId,
}: {
  events: LiveEvent[];
  homeTeam: TeamSide;
  awayTeam: TeamSide;
  homeEntryId: string;
}) {
  const playerName = useMemo(() => {
    const map = new Map<string, string>();
    for (const p of [...homeTeam.players, ...awayTeam.players]) map.set(p.id, p.customName);
    return map;
  }, [homeTeam, awayTeam]);
  const teamName = (entryId: string | null) => (entryId === homeEntryId ? homeTeam.teamName : entryId ? awayTeam.teamName : null);

  const visible = events.filter((e) => e.type !== "FAN_FACTOR" && e.type !== "WEATHER_ROLL" && e.type !== "KICKING_TEAM_ROLL");

  return (
    <Panel>
      <h3 className="mb-2 font-semibold">Lo que ha pasado</h3>
      {visible.length === 0 ? (
        <p className="text-sm" style={{ color: "var(--ink-3)" }}>
          Todavía no hay eventos registrados.
        </p>
      ) : (
        <ol className="max-h-96 space-y-1 overflow-y-auto text-sm">
          {[...visible].reverse().map((e) => (
            <li key={e.id} className="flex items-baseline gap-2 border-b py-1" style={{ borderColor: "var(--border)" }}>
              <span className="w-16 shrink-0 font-mono text-xs" style={{ color: "var(--ink-3)" }}>
                {e.half}ª · T{e.turn}
              </span>
              <span>
                <strong>{EVENT_LABEL[e.type] ?? e.type}</strong>
                {teamName(e.entryId) && <> — {teamName(e.entryId)}</>}
                {e.playerId && <> ({playerName.get(e.playerId) ?? "jugador"})</>}
                {e.type === "CASUALTY" && e.opponentPlayerId && <> → {playerName.get(e.opponentPlayerId) ?? "jugador"}</>}
                {typeof e.payload?.name === "string" && <>: {e.payload.name}</>}
              </span>
            </li>
          ))}
        </ol>
      )}
    </Panel>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// POST-PARTIDO
// ─────────────────────────────────────────────────────────────────────────
function FinishedStage({
  liveMatch,
  homeTeam,
  awayTeam,
  events,
}: {
  liveMatch: { homeScore: number; awayScore: number };
  homeTeam: TeamSide;
  awayTeam: TeamSide;
  events: LiveEvent[];
}) {
  const touchdowns = events.filter((e) => e.type === "TOUCHDOWN").length;
  const casualties = events.filter((e) => e.type === "CASUALTY").length;
  return (
    <div className="mx-auto w-full max-w-2xl space-y-6 px-6 py-10">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Partido finalizado</h1>
      </header>
      <Panel>
        <p className="mb-2 text-lg font-semibold">
          {homeTeam.teamName} {liveMatch.homeScore} — {liveMatch.awayScore} {awayTeam.teamName}
        </p>
        <p className="text-sm" style={{ color: "var(--ink-3)" }}>
          {touchdowns} touchdown(s) registrados · {casualties} baja(s) registradas. El resultado ya se ha aplicado a la
          plantilla real de ambos equipos (PE, tesorería y lesiones).
        </p>
      </Panel>
      <EventLog events={events} homeTeam={homeTeam} awayTeam={awayTeam} homeEntryId={homeTeam.entryId} />
    </div>
  );
}
