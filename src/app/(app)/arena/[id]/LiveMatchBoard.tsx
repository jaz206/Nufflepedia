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
import { statLine, effectiveStats, type StatBlock } from "@/lib/playerStats";
import { buildSkillInfoIndex } from "@/lib/resolveSkillName";
import SkillPillList, { type SkillInfo } from "@/components/SkillPillList";

type Side = "home" | "away";
type LiveEventType = Parameters<typeof logLiveMatchEvent>[1]["type"];
type PlayerStatus = "ACTIVE" | "MISS_NEXT_GAME" | "NIGGLING_INJURY" | "DEAD" | "RETIRED";

interface Player {
  id: string;
  number: number;
  customName: string;
  status: PlayerStatus;
  spp: number;
  maIncreases: number;
  stIncreases: number;
  agIncreases: number;
  paIncreases: number;
  avIncreases: number;
  skills: { skillKey: string; source: string }[];
  position: (StatBlock & { id: string; name: string; startingSkillKeys: string[] }) | null;
  star: (StatBlock & { key: string; name: string; skillKeys: string[] }) | null;
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
  skillCatalog,
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
  skillCatalog: SkillInfo[];
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
      skillCatalog={skillCatalog}
    />
  );
}

/** Botón de control con una explicación breve debajo, para que quien lo usa vaya aprendiendo qué hace cada cosa. */
function ControlButton({
  children,
  onClick,
  disabled,
  primary,
  hint,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  primary?: boolean;
  hint: string;
}) {
  return (
    <div className="flex w-36 flex-col gap-1">
      <button type="button" onClick={onClick} disabled={disabled} className={primary ? "btn-primary" : "btn-secondary"}>
        {children}
      </button>
      <p className="text-[10px] leading-tight" style={{ color: "var(--ink-3)" }}>
        {hint}
      </p>
    </div>
  );
}

/** Botón de acción de jugador, con una explicación de a qué afecta justo debajo. */
function ActionButton({
  children,
  onClick,
  disabled,
  primary,
  hint,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  primary?: boolean;
  hint: string;
}) {
  return (
    <div>
      <button type="button" onClick={onClick} disabled={disabled} className={primary ? "btn-primary w-full" : "btn-secondary w-full"}>
        {children}
      </button>
      <p className="mt-0.5 text-[10px] leading-tight" style={{ color: "var(--ink-3)" }}>
        {hint}
      </p>
    </div>
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

  // Todo se queda en estado local hasta pulsar "Empezar el partido" — ahí
  // se guarda todo de una vez y se abre el marcador, sin ir confirmando
  // paso a paso.
  function begin() {
    if (!weatherId || !kickingId) {
      setError("Elige el Clima y el equipo pateador antes de empezar");
      return;
    }
    setError(undefined);
    startTransition(async () => {
      const fans = await setFanFactor(liveMatch.id, { home: fanHome, away: fanAway });
      if (!fans.ok) return setError(fans.error);
      const w = await setWeather(liveMatch.id, weatherId);
      if (!w.ok) return setError(w.error);
      const k = await setKickingTeam(liveMatch.id, kickingId);
      if (!k.ok) return setError(k.error);
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
        <p className="mb-1 text-xs" style={{ color: "var(--ink-3)" }}>
          Tira 1D3 por cada equipo y súmalo al valor de Hinchas de su Hoja de plantilla.
        </p>
        <p className="mb-2 text-xs italic" style={{ color: "var(--ink-3)" }}>
          A qué afecta: a los eventos de Patada Inicial que dependen de Hinchas (ej. «Los hinchas animan», «Invasión de
          campo») y, en liga, a las ganancias tras el partido.
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
        </div>
      </Panel>

      <Panel>
        <h2 className="mb-2 font-semibold">2. Clima</h2>
        <p className="mb-1 text-xs" style={{ color: "var(--ink-3)" }}>
          Cada Entrenador tira 1D6, sumad los resultados y consultad la tabla.
        </p>
        <p className="mb-2 text-xs italic" style={{ color: "var(--ink-3)" }}>
          A qué afecta: se queda fijo todo el partido y su efecto se aplica desde ya (ej. «Muy Soleado» penaliza los
          Pases; «Ventisca» solo deja Pases cortos).
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
        </div>
        {weatherId && (
          <p className="mt-2 text-xs" style={{ color: "var(--ink-2)" }}>
            {weather.find((w) => w.id === weatherId)?.effect}
          </p>
        )}
      </Panel>

      <Panel>
        <h2 className="mb-2 font-semibold">3. Equipo pateador</h2>
        <p className="mb-1 text-xs" style={{ color: "var(--ink-3)" }}>
          Tirada enfrentada — quien saque más alto decide quién patea y quién recibe.
        </p>
        <p className="mb-2 text-xs italic" style={{ color: "var(--ink-3)" }}>
          A qué afecta: el equipo pateador se despliega primero y chuta el balón hacia el receptor — el pateador
          defiende, el receptor ataca con el balón esta entrada.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <select className="input flex-1" value={kickingId} onChange={(e) => setKickingId(e.target.value)}>
            <option value="">¿Quién patea?</option>
            <option value={liveMatch.homeEntryId}>{homeTeam.teamName}</option>
            <option value={liveMatch.awayEntryId}>{awayTeam.teamName}</option>
          </select>
        </div>
      </Panel>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div>
        <button type="button" onClick={begin} disabled={pending || !weatherId || !kickingId} className="btn-primary">
          {pending ? "Guardando…" : "Empezar el partido"}
        </button>
        <p className="mt-1 text-xs" style={{ color: "var(--ink-3)" }}>
          Al pulsar aquí se guarda todo lo elegido arriba de golpe, se abre el marcador y podrás registrar
          Touchdowns, bajas, cambios de turno y todo lo demás en vivo.
        </p>
      </div>
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
  skillCatalog,
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
  skillCatalog: SkillInfo[];
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

  const skillIndex = useMemo(() => buildSkillInfoIndex(skillCatalog), [skillCatalog]);
  const skillNameByKey = useMemo(() => {
    const map = new Map<string, string>();
    for (const s of skillCatalog) if (s.key) map.set(s.key, s.name);
    return map;
  }, [skillCatalog]);

  function statsFor(p: Player) {
    const base = p.position ?? p.star;
    return base ? effectiveStats(base, p) : null;
  }
  function skillNamesFor(p: Player) {
    const baseNames = p.position?.startingSkillKeys ?? p.star?.skillKeys ?? [];
    const levelUpNames = p.skills.filter((s) => s.source === "LEVEL_UP").map((s) => skillNameByKey.get(s.skillKey) ?? s.skillKey);
    return [...baseNames, ...levelUpNames];
  }
  function tallyFor(playerId: string) {
    return {
      td: events.filter((e) => e.type === "TOUCHDOWN" && e.playerId === playerId).length,
      pass: events.filter((e) => e.type === "COMPLETED_PASS" && e.playerId === playerId).length,
      int: events.filter((e) => e.type === "INTERCEPTION" && e.playerId === playerId).length,
      cas: events.filter((e) => e.type === "CASUALTY" && e.playerId === playerId).length,
      injured: events.filter((e) => e.type === "CASUALTY" && e.opponentPlayerId === playerId).length,
    };
  }

  function fire(input: Parameters<typeof logLiveMatchEvent>[1]) {
    setError(undefined);
    startTransition(async () => {
      const res = await logLiveMatchEvent(liveMatch.id, input);
      if (!res.ok) setError(res.error);
      else {
        setSelected(null);
        setPendingInjury(null);
        // El turno y el equipo pateador ya cambian solos en el servidor —
        // solo falta la tirada de la tabla de Patada Inicial, que sí
        // requiere al usuario, así que se abre directamente el selector.
        if (input.type === "TOUCHDOWN") setShowKickoffPicker(true);
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
            <ControlButton onClick={nextTurn} disabled={pending} hint="Avanza el contador cuando el equipo activo pierde el balón o termina de jugar sin marcar — tras un touchdown el turno y el equipo pateador ya cambian solos.">
              Cambio de turno
            </ControlButton>
            {liveMatch.half === 1 && (
              <ControlButton onClick={secondHalf} disabled={pending} hint="Solo al acabar los 8 turnos de la 1ª parte — reinicia el turno a 1 e intercambia quién patea.">
                Empezar 2ª parte
              </ControlButton>
            )}
            <ControlButton onClick={() => setShowKickoffPicker((v) => !v)} disabled={pending} hint="2D6 tras cada patada (inicio de entrada, o justo después de un touchdown).">
              Evento de Patada Inicial
            </ControlButton>
            <ControlButton onClick={() => setShowPrayerPicker((v) => !v)} disabled={pending} hint="Solo si un equipo despliega con 2+ jugadores menos que el rival.">
              Plegaria a Nuffle
            </ControlButton>
            <ControlButton onClick={finish} disabled={pending} primary hint="Cierra el partido, genera la crónica y aplica PE/lesiones a la plantilla real — no se puede deshacer.">
              Finalizar partido
            </ControlButton>
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
              {(() => {
                const stats = statsFor(selected.player);
                const skillNames = skillNamesFor(selected.player);
                const tally = tallyFor(selected.player.id);
                const positionLabel = selected.player.position?.name ?? (selected.player.star ? "Jugador Estrella" : null);
                return (
                  <>
                    <p className="text-sm font-semibold">
                      #{selected.player.number} {selected.player.customName}
                    </p>
                    <p className="text-xs" style={{ color: "var(--ink-3)" }}>
                      {teamOf(selected.side).teamName}
                      {positionLabel && <> · {positionLabel}</>} · {STATUS_LABEL[selected.player.status]} · {selected.player.spp} PE
                    </p>
                    {stats && (
                      <p className="mt-1 font-mono text-xs" style={{ color: "var(--ink-2)" }}>
                        {statLine(stats)}
                      </p>
                    )}
                    <SkillPillList names={skillNames} index={skillIndex} />
                    {(tally.td > 0 || tally.pass > 0 || tally.int > 0 || tally.cas > 0 || tally.injured > 0) && (
                      <p className="mt-2 text-xs" style={{ color: "var(--gold)" }}>
                        Este partido:{" "}
                        {[
                          tally.td > 0 && `${tally.td} TD`,
                          tally.pass > 0 && `${tally.pass} pase(s)`,
                          tally.int > 0 && `${tally.int} intercepción(es)`,
                          tally.cas > 0 && `${tally.cas} baja(s) causada(s)`,
                          tally.injured > 0 && `${tally.injured} baja(s) recibida(s)`,
                        ]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                    )}
                  </>
                );
              })()}
              <div className="mt-3 flex flex-col gap-2">
                <ActionButton onClick={() => quickAction("TOUCHDOWN")} disabled={pending} primary hint="+1 al marcador de su equipo y 3 PE para este jugador.">
                  Touchdown
                </ActionButton>
                <ActionButton onClick={() => quickAction("COMPLETED_PASS")} disabled={pending} hint="1 PE — se anota en quien lanza el pase, no en quien lo recibe.">
                  Pase completado
                </ActionButton>
                <ActionButton onClick={() => quickAction("INTERCEPTION")} disabled={pending} hint="2 PE para el jugador que intercepta.">
                  Intercepción
                </ActionButton>
                <ActionButton onClick={startInjury} disabled={pending} hint="2 PE para el agresor — a continuación eliges quién la recibe y el resultado de la Tabla de Lesiones.">
                  Causó una baja
                </ActionButton>
                <ActionButton onClick={() => quickAction("SENT_OFF")} disabled={pending} hint="Se pierde el resto del partido (doble en Armadura/Heridas, o Arma secreta).">
                  Expulsión
                </ActionButton>
                <ActionButton onClick={() => quickAction("APOTHECARY_USED")} disabled={pending} hint="Una vez por partido y equipo — repite la tirada de Lesiones de un jugador K.O./lesionado.">
                  Usar apotecario
                </ActionButton>
                <ActionButton onClick={() => quickAction("KO_RECOVERY")} disabled={pending} hint="Tirada de 1D6 al final de la entrada — con 4+ vuelve a Reservas.">
                  Recuperación K.O.
                </ActionButton>
                <ActionButton
                  onClick={() => toggleBench(selected.player.id, selected.side)}
                  disabled={pending}
                  hint="Solo para llevar la cuenta visualmente durante el partido — no afecta al resultado final."
                >
                  {onBench.has(selected.player.id) ? "Meter en el campo" : "Sacar al banquillo"}
                </ActionButton>
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
  const passes = events.filter((e) => e.type === "COMPLETED_PASS").length;
  const interceptions = events.filter((e) => e.type === "INTERCEPTION").length;
  const winner =
    liveMatch.homeScore === liveMatch.awayScore ? null : liveMatch.homeScore > liveMatch.awayScore ? homeTeam.teamName : awayTeam.teamName;
  return (
    <div className="mx-auto w-full max-w-2xl space-y-6 px-6 py-10">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Partido finalizado</h1>
        <p className="mt-1 text-sm" style={{ color: "var(--ink-3)" }}>
          Este partido ya está cerrado — no se puede reabrir ni editar. Si algo se registró mal, dínoslo y lo
          corregimos a mano.
        </p>
      </header>
      <Panel>
        <p className="mb-1 text-lg font-semibold">
          {homeTeam.teamName} {liveMatch.homeScore} — {liveMatch.awayScore} {awayTeam.teamName}
        </p>
        <p className="mb-3 text-sm" style={{ color: winner ? "var(--gold)" : "var(--ink-3)" }}>
          {winner ? `Gana ${winner}.` : "Empate."}
        </p>
        <p className="text-sm" style={{ color: "var(--ink-3)" }}>
          {touchdowns} touchdown(s) · {passes} pase(s) completado(s) · {interceptions} intercepción(es) ·{" "}
          {casualties} baja(s) registrada(s).
        </p>
        <p className="mt-2 text-xs italic" style={{ color: "var(--ink-3)" }}>
          A qué afecta: cada evento ya ha repartido sus PE (Puntos de Estrellato), y cada baja con secuela ha
          actualizado el estado del jugador — todo esto se aplicó directamente a la plantilla real de El Cuartel de
          ambos equipos, no a una copia.
        </p>
      </Panel>
      <EventLog events={events} homeTeam={homeTeam} awayTeam={awayTeam} homeEntryId={homeTeam.entryId} />
    </div>
  );
}
