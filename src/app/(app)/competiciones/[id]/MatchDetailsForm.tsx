"use client";

import { useState } from "react";

export interface RosterPlayer {
  id: string;
  name: string;
}
export interface ScorerInput {
  entryId: string;
  playerId: string | null;
}
export type StatLoss = "MA" | "ST" | "AG" | "PA" | "AV";
export interface InjuryInput {
  attackerEntryId: string;
  attackerPlayerId: string | null;
  victimEntryId: string;
  victimPlayerId: string | null;
  injuryCode: string | null;
  statLoss: StatLoss | null;
}
export interface InjuryCatalogEntry {
  code: string;
  name: string;
  permanentStatLoss: boolean;
}

const STAT_LOSS_LABEL: Record<StatLoss, string> = { MA: "Movimiento", ST: "Fuerza", AG: "Agilidad", PA: "Pase", AV: "Armadura" };
export interface InducementCatalogEntry {
  key: string;
  name: string;
  cost: number;
  maxCount: number;
  restriction: string | null;
}
export interface InducementPurchaseInput {
  entryId: string;
  inducementKey: string;
  quantity: number;
}

interface Side {
  entryId: string;
  teamName: string;
  roster: RosterPlayer[];
  snapshotTreasury: number;
  specialRules: string[];
}

interface InjuryRow {
  key: number;
  attackerSide: "home" | "away";
  attackerPlayerId: string | null;
  victimPlayerId: string | null;
  injuryCode: string | null;
  statLoss: StatLoss | null;
}

/** Una lesión siempre la causa un jugador contra el equipo rival — nunca
 * contra un compañero de su propio equipo, así que el lado de la víctima no
 * es una elección: es siempre el otro equipo del partido. */
function opposite(side: "home" | "away"): "home" | "away" {
  return side === "home" ? "away" : "home";
}

function ScorerRow({
  label,
  roster,
  value,
  onChange,
}: {
  label: string;
  roster: RosterPlayer[];
  value: string | null;
  onChange: (playerId: string | null) => void;
}) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-16 shrink-0" style={{ color: "var(--ink-3)" }}>
        {label}
      </span>
      <select
        className="input flex-1"
        style={{ padding: "3px 6px", fontSize: "12px" }}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value || null)}
      >
        <option value="">Sin asignar</option>
        {roster.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>
    </div>
  );
}

function eligibleInducements(catalog: InducementCatalogEntry[], specialRules: string[]): InducementCatalogEntry[] {
  return catalog.filter((c) => !c.restriction || specialRules.includes(c.restriction));
}

function InducementPicker({
  side,
  catalog,
  quantities,
  onChange,
}: {
  side: Side;
  catalog: InducementCatalogEntry[];
  quantities: Record<string, number>;
  onChange: (inducementKey: string, quantity: number) => void;
}) {
  const options = eligibleInducements(catalog, side.specialRules);
  const spent = options.reduce((sum, c) => sum + (quantities[c.key] ?? 0) * c.cost, 0);
  const remaining = side.snapshotTreasury - spent;

  if (options.length === 0) {
    return (
      <p className="text-xs" style={{ color: "var(--ink-3)" }}>
        {side.teamName}: sin Incentivos disponibles.
      </p>
    );
  }

  return (
    <div className="space-y-1.5">
      <p className="flex items-center justify-between text-xs font-semibold" style={{ color: "var(--ink-3)" }}>
        <span>{side.teamName}</span>
        <span className="font-mono" style={{ color: remaining < 0 ? "var(--danger, #b23)" : "var(--gold)" }}>
          {remaining.toLocaleString("es-ES")} / {side.snapshotTreasury.toLocaleString("es-ES")} MO
        </span>
      </p>
      {options.map((c) => {
        const qty = quantities[c.key] ?? 0;
        return (
          <div key={c.key} className="flex items-center gap-2 text-xs">
            <span className="flex-1" title={c.name}>
              {c.name} <span style={{ color: "var(--ink-3)" }}>({c.cost.toLocaleString("es-ES")} MO)</span>
            </span>
            <button
              type="button"
              onClick={() => onChange(c.key, Math.max(0, qty - 1))}
              disabled={qty <= 0}
              className="btn-secondary"
              style={{ padding: "1px 7px", fontSize: "11px" }}
            >
              −
            </button>
            <span className="w-5 text-center font-mono">{qty}</span>
            <button
              type="button"
              onClick={() => onChange(c.key, Math.min(c.maxCount, qty + 1))}
              disabled={qty >= c.maxCount}
              className="btn-secondary"
              style={{ padding: "1px 7px", fontSize: "11px" }}
            >
              +
            </button>
          </div>
        );
      })}
    </div>
  );
}

export default function MatchDetailsForm({
  home,
  away,
  injuryCatalog,
  inducementCatalog = [],
  allowDraw,
  onSubmit,
  onCancel,
  submitLabel = "Guardar resultado",
}: {
  home: Side;
  away: Side;
  injuryCatalog: InjuryCatalogEntry[];
  inducementCatalog?: InducementCatalogEntry[];
  allowDraw: boolean;
  onSubmit: (data: {
    homeScore: number;
    awayScore: number;
    scorers: ScorerInput[];
    injuries: InjuryInput[];
    inducements: InducementPurchaseInput[];
  }) => Promise<{ ok: boolean; error?: string }>;
  onCancel?: () => void;
  submitLabel?: string;
}) {
  const [homeScore, setHomeScore] = useState(0);
  const [awayScore, setAwayScore] = useState(0);
  const [homeScorers, setHomeScorers] = useState<(string | null)[]>([]);
  const [awayScorers, setAwayScorers] = useState<(string | null)[]>([]);
  const [injuries, setInjuries] = useState<InjuryRow[]>([]);
  const [homeInducements, setHomeInducements] = useState<Record<string, number>>({});
  const [awayInducements, setAwayInducements] = useState<Record<string, number>>({});
  const [showDetail, setShowDetail] = useState(false);
  const [showInducements, setShowInducements] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [pending, setPending] = useState(false);

  function changeHomeScore(value: number) {
    setHomeScore(value);
    setHomeScorers((prev) => Array.from({ length: value }, (_, i) => prev[i] ?? null));
  }
  function changeAwayScore(value: number) {
    setAwayScore(value);
    setAwayScorers((prev) => Array.from({ length: value }, (_, i) => prev[i] ?? null));
  }

  function addInjuryRow() {
    setInjuries((prev) => [
      ...prev,
      {
        key: Date.now() + Math.random(),
        attackerSide: "home",
        attackerPlayerId: null,
        victimPlayerId: null,
        injuryCode: null,
        statLoss: null,
      },
    ]);
  }
  function removeInjuryRow(key: number) {
    setInjuries((prev) => prev.filter((r) => r.key !== key));
  }
  function updateInjuryRow(key: number, patch: Partial<InjuryRow>) {
    setInjuries((prev) => prev.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  }

  function sideOf(side: "home" | "away") {
    return side === "home" ? home : away;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!allowDraw && homeScore === awayScore) {
      setError("No hay empates en eliminatoria — un equipo debe ganar");
      return;
    }
    setError(undefined);
    setPending(true);
    const scorers: ScorerInput[] = [
      ...homeScorers.map((playerId) => ({ entryId: home.entryId, playerId })),
      ...awayScorers.map((playerId) => ({ entryId: away.entryId, playerId })),
    ];
    const injuryInputs: InjuryInput[] = injuries.map((r) => ({
      attackerEntryId: sideOf(r.attackerSide).entryId,
      attackerPlayerId: r.attackerPlayerId,
      victimEntryId: sideOf(opposite(r.attackerSide)).entryId,
      victimPlayerId: r.victimPlayerId,
      injuryCode: r.injuryCode,
      statLoss: r.statLoss,
    }));
    const inducementInputs: InducementPurchaseInput[] = [
      ...Object.entries(homeInducements)
        .filter(([, qty]) => qty > 0)
        .map(([inducementKey, quantity]) => ({ entryId: home.entryId, inducementKey, quantity })),
      ...Object.entries(awayInducements)
        .filter(([, qty]) => qty > 0)
        .map(([inducementKey, quantity]) => ({ entryId: away.entryId, inducementKey, quantity })),
    ];
    const res = await onSubmit({ homeScore, awayScore, scorers, injuries: injuryInputs, inducements: inducementInputs });
    setPending(false);
    if (!res.ok) setError(res.error);
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <span className="min-w-[100px] text-sm font-medium">{home.teamName}</span>
        <input
          type="number"
          className="input w-16 text-center"
          min={0}
          max={30}
          value={homeScore}
          onChange={(e) => changeHomeScore(Number(e.target.value))}
        />
        <span style={{ color: "var(--ink-3)" }}>—</span>
        <input
          type="number"
          className="input w-16 text-center"
          min={0}
          max={30}
          value={awayScore}
          onChange={(e) => changeAwayScore(Number(e.target.value))}
        />
        <span className="min-w-[100px] text-sm font-medium">{away.teamName}</span>
      </div>

      {inducementCatalog.length > 0 && (
        <>
          <button
            type="button"
            onClick={() => setShowInducements((v) => !v)}
            className="text-xs underline"
            style={{ color: "var(--ink-3)" }}
          >
            {showInducements ? "Ocultar Incentivos" : "Comprar Incentivos para este partido (opcional)"}
          </button>
          {showInducements && (
            <div className="grid gap-3 rounded-[3px] border p-3 sm:grid-cols-2" style={{ borderColor: "var(--border)" }}>
              <InducementPicker side={home} catalog={inducementCatalog} quantities={homeInducements} onChange={(k, q) => setHomeInducements((prev) => ({ ...prev, [k]: q }))} />
              <InducementPicker side={away} catalog={inducementCatalog} quantities={awayInducements} onChange={(k, q) => setAwayInducements((prev) => ({ ...prev, [k]: q }))} />
            </div>
          )}
        </>
      )}

      <button
        type="button"
        onClick={() => setShowDetail((v) => !v)}
        className="text-xs underline"
        style={{ color: "var(--ink-3)" }}
      >
        {showDetail ? "Ocultar detalle de anotadores y lesiones" : "Añadir detalle de anotadores y lesiones (opcional)"}
      </button>

      {showDetail && (
        <div className="space-y-3 rounded-[3px] border p-3" style={{ borderColor: "var(--border)" }}>
          {(homeScorers.length > 0 || awayScorers.length > 0) && (
            <div className="space-y-1.5">
              <p className="text-xs font-semibold" style={{ color: "var(--ink-3)" }}>
                ¿Quién ha anotado?
              </p>
              {homeScorers.map((v, i) => (
                <ScorerRow
                  key={`h-${i}`}
                  label={`${home.teamName} #${i + 1}`}
                  roster={home.roster}
                  value={v}
                  onChange={(playerId) => setHomeScorers((prev) => prev.map((p, idx) => (idx === i ? playerId : p)))}
                />
              ))}
              {awayScorers.map((v, i) => (
                <ScorerRow
                  key={`a-${i}`}
                  label={`${away.teamName} #${i + 1}`}
                  roster={away.roster}
                  value={v}
                  onChange={(playerId) => setAwayScorers((prev) => prev.map((p, idx) => (idx === i ? playerId : p)))}
                />
              ))}
            </div>
          )}

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold" style={{ color: "var(--ink-3)" }}>
                Lesiones
              </p>
              <button type="button" onClick={addInjuryRow} className="btn-secondary" style={{ padding: "2px 8px", fontSize: "11px" }}>
                + Añadir lesión
              </button>
            </div>
            {injuries.map((row) => (
              <div key={row.key} className="grid gap-1.5 rounded-[3px] border p-2 sm:grid-cols-[1fr_1fr_1fr_auto]" style={{ borderColor: "var(--border)" }}>
                <div className="space-y-1">
                  <label className="block text-[10px]" style={{ color: "var(--ink-3)" }}>
                    Causada por
                  </label>
                  <select
                    className="input w-full"
                    style={{ padding: "3px 6px", fontSize: "12px" }}
                    value={row.attackerSide}
                    onChange={(e) =>
                      updateInjuryRow(row.key, {
                        attackerSide: e.target.value as "home" | "away",
                        attackerPlayerId: null,
                        victimPlayerId: null,
                      })
                    }
                  >
                    <option value="home">{home.teamName}</option>
                    <option value="away">{away.teamName}</option>
                  </select>
                  <select
                    className="input w-full"
                    style={{ padding: "3px 6px", fontSize: "12px" }}
                    value={row.attackerPlayerId ?? ""}
                    onChange={(e) => updateInjuryRow(row.key, { attackerPlayerId: e.target.value || null })}
                  >
                    <option value="">Sin asignar</option>
                    {sideOf(row.attackerSide).roster.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px]" style={{ color: "var(--ink-3)" }}>
                    Recibida por ({sideOf(opposite(row.attackerSide)).teamName})
                  </label>
                  <select
                    className="input w-full"
                    style={{ padding: "3px 6px", fontSize: "12px" }}
                    value={row.victimPlayerId ?? ""}
                    onChange={(e) => updateInjuryRow(row.key, { victimPlayerId: e.target.value || null })}
                  >
                    <option value="">Sin asignar</option>
                    {sideOf(opposite(row.attackerSide)).roster.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px]" style={{ color: "var(--ink-3)" }}>
                    Resultado
                  </label>
                  <select
                    className="input w-full"
                    style={{ padding: "3px 6px", fontSize: "12px" }}
                    value={row.injuryCode ?? ""}
                    onChange={(e) => {
                      const code = e.target.value || null;
                      const entry = injuryCatalog.find((c) => c.code === code);
                      updateInjuryRow(row.key, { injuryCode: code, statLoss: entry?.permanentStatLoss ? row.statLoss : null });
                    }}
                  >
                    <option value="">Sin especificar</option>
                    {injuryCatalog.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  {injuryCatalog.find((c) => c.code === row.injuryCode)?.permanentStatLoss && (
                    <select
                      className="input w-full"
                      style={{ padding: "3px 6px", fontSize: "12px" }}
                      value={row.statLoss ?? ""}
                      onChange={(e) => updateInjuryRow(row.key, { statLoss: (e.target.value || null) as StatLoss | null })}
                    >
                      <option value="">¿Qué característica se reduce?</option>
                      {(Object.entries(STAT_LOSS_LABEL) as [StatLoss, string][]).map(([key, label]) => (
                        <option key={key} value={key}>
                          {label}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => removeInjuryRow(row.key)}
                  className="btn-secondary self-start"
                  style={{ padding: "3px 8px", fontSize: "11px" }}
                >
                  Quitar
                </button>
              </div>
            ))}
            {injuries.length === 0 && (
              <p className="text-xs" style={{ color: "var(--ink-3)" }}>
                Sin lesiones registradas.
              </p>
            )}
          </div>
        </div>
      )}

      {error && <p className="text-xs text-red-500">{error}</p>}
      <div className="flex gap-2">
        <button type="submit" disabled={pending} className="btn-primary">
          {submitLabel}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} disabled={pending} className="btn-secondary">
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}
