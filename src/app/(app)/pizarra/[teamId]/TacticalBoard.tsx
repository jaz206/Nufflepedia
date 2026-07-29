"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import { FORMATIONS, GRID_COLS, GRID_ROWS, applyFormation, clampToGrid } from "@/lib/tacticalFormations";
import { savePlay, deletePlay } from "../actions";

const CELL = 26;

// Paleta fija (no un hash de HSL crudo) para que los colores sean siempre
// distinguibles entre sí y legibles sobre el césped verde.
const POSITION_PALETTE = [
  "#2f6fb0",
  "#d97e1f",
  "#8a3fb0",
  "#1f9e8a",
  "#c23f7a",
  "#8a5a2f",
  "#46536b",
  "#d1495b",
  "#6fae2f",
  "#3f7fd9",
];

/** Color estable por nombre de posición (mismo puesto = mismo color siempre). */
function colorForPosition(label: string): string {
  let hash = 0;
  for (let i = 0; i < label.length; i++) hash = (hash * 31 + label.charCodeAt(i)) >>> 0;
  return POSITION_PALETTE[hash % POSITION_PALETTE.length];
}

interface RosterPlayer {
  id: string;
  number: number;
  customName: string;
  positionLabel: string | null;
  isStar: boolean;
}
interface Token {
  /** Clave de React local — no persiste, se recalcula al guardar. */
  key: string;
  playerId: string | null;
  side: "mine" | "opponent";
  x: number;
  y: number;
  label: string | null;
}
interface SavedPlay {
  id: string;
  name: string;
  description: string | null;
  tokens: { playerId: string | null; side: "mine" | "opponent"; x: number; y: number; label: string | null }[];
}

let keySeq = 0;
function newKey() {
  keySeq += 1;
  return `t${Date.now().toString(36)}${keySeq}`;
}

function tokensFromSaved(saved: SavedPlay["tokens"]): Token[] {
  return saved.map((t) => ({ ...t, key: newKey() }));
}

export default function TacticalBoard({
  team,
  roster,
  plays,
}: {
  team: { id: string; name: string };
  roster: RosterPlayer[];
  plays: SavedPlay[];
}) {
  const [currentPlayId, setCurrentPlayId] = useState<string | null>(null);
  const [playName, setPlayName] = useState("");
  const [playDescription, setPlayDescription] = useState("");
  const [tokens, setTokens] = useState<Token[]>([]);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [selectedBenchPlayerId, setSelectedBenchPlayerId] = useState<string | null>(null);
  const [error, setError] = useState<string | undefined>();
  const [pending, startTransition] = useTransition();
  const boardRef = useRef<HTMLDivElement>(null);
  const dragKeyRef = useRef<string | null>(null);

  const placedPlayerIds = useMemo(() => new Set(tokens.map((t) => t.playerId).filter((id): id is string => !!id)), [tokens]);
  const bench = useMemo(() => roster.filter((p) => !placedPlayerIds.has(p.id)), [roster, placedPlayerIds]);
  const positionLegend = useMemo(() => {
    const seen = new Map<string, string>();
    for (const p of roster) {
      if (p.positionLabel && !seen.has(p.positionLabel)) seen.set(p.positionLabel, colorForPosition(p.positionLabel));
    }
    return [...seen.entries()];
  }, [roster]);

  function loadPlay(play: SavedPlay | null) {
    setError(undefined);
    setSelectedKey(null);
    setSelectedBenchPlayerId(null);
    if (!play) {
      setCurrentPlayId(null);
      setPlayName("");
      setPlayDescription("");
      setTokens([]);
      return;
    }
    setCurrentPlayId(play.id);
    setPlayName(play.name);
    setPlayDescription(play.description ?? "");
    setTokens(tokensFromSaved(play.tokens));
  }

  function cellFromPointer(clientX: number, clientY: number) {
    const rect = boardRef.current?.getBoundingClientRect();
    if (!rect) return null;
    const relX = (clientX - rect.left) / CELL;
    const relY = (clientY - rect.top) / CELL;
    if (relX < 0 || relY < 0 || relX >= GRID_COLS || relY >= GRID_ROWS) return null;
    return clampToGrid(relX, relY);
  }

  function placeBenchPlayer(player: RosterPlayer, cell: { x: number; y: number }) {
    setTokens((prev) => [...prev, { key: newKey(), playerId: player.id, side: "mine", x: cell.x, y: cell.y, label: null }]);
    setSelectedBenchPlayerId(null);
  }

  function handleBoardClick(e: React.MouseEvent<HTMLDivElement>) {
    if (!selectedBenchPlayerId) return;
    const cell = cellFromPointer(e.clientX, e.clientY);
    if (!cell) return;
    const player = roster.find((p) => p.id === selectedBenchPlayerId);
    if (player) placeBenchPlayer(player, cell);
  }

  function startDrag(key: string) {
    setSelectedBenchPlayerId(null);
    setSelectedKey(key);
    dragKeyRef.current = key;

    function onMove(ev: PointerEvent) {
      const cell = cellFromPointer(ev.clientX, ev.clientY);
      if (!cell || !dragKeyRef.current) return;
      const k = dragKeyRef.current;
      setTokens((prev) => prev.map((t) => (t.key === k ? { ...t, x: cell.x, y: cell.y } : t)));
    }
    function onUp() {
      dragKeyRef.current = null;
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    }
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  }

  function removeToken(key: string) {
    setTokens((prev) => prev.filter((t) => t.key !== key));
    setSelectedKey(null);
  }

  function addOpponentToken() {
    setTokens((prev) => [...prev, { key: newKey(), playerId: null, side: "opponent", x: 14, y: 7, label: "Rival" }]);
  }

  function applyPreset(formationKey: string) {
    const formation = FORMATIONS.find((f) => f.key === formationKey);
    if (!formation) return;
    const availableIds = roster.filter((p) => !placedPlayerIds.has(p.id)).map((p) => p.id);
    const placements = applyFormation(formation, availableIds);
    setTokens((prev) => [
      ...prev,
      ...placements.map((p) => ({ key: newKey(), playerId: p.playerId, side: "mine" as const, x: p.x, y: p.y, label: null })),
    ]);
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError(undefined);
    startTransition(async () => {
      const res = await savePlay({
        playId: currentPlayId,
        teamId: team.id,
        name: playName,
        description: playDescription.trim() || null,
        tokens: tokens.map(({ playerId, side, x, y, label }) => ({ playerId, side, x, y, label })),
      });
      if (!res.ok) setError(res.error);
      else setCurrentPlayId(res.playId);
    });
  }

  function handleDelete(playId: string) {
    if (!confirm("¿Borrar esta jugada?")) return;
    startTransition(async () => {
      await deletePlay(playId);
      if (currentPlayId === playId) loadPlay(null);
    });
  }

  const selectedToken = tokens.find((t) => t.key === selectedKey) ?? null;

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 px-6 py-10">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--gold)" }}>
            Pizarra Táctica — {team.name}
          </h1>
          <p className="mt-1 text-sm" style={{ color: "var(--ink-3)" }}>
            Pincha un jugador del banquillo y luego una casilla para colocarlo; arrastra una ficha ya puesta para
            moverla.
          </p>
        </div>
        <button type="button" onClick={() => loadPlay(null)} className="btn-secondary">
          + Nueva jugada
        </button>
      </header>

      {plays.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {plays.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => loadPlay(p)}
              className="rounded-[3px] border px-3 py-1.5 text-sm transition-colors"
              style={{
                borderColor: currentPlayId === p.id ? "var(--accent)" : "var(--border)",
                background: currentPlayId === p.id ? "color-mix(in srgb, var(--accent) 10%, var(--surface-1))" : "var(--surface-1)",
              }}
            >
              {p.name}
            </button>
          ))}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[auto_1fr]">
        <div className="space-y-4">
          <div>
            <p className="mb-2 text-sm font-medium">Formaciones</p>
            <div className="flex flex-col gap-2">
              {FORMATIONS.map((f) => (
                <button key={f.key} type="button" onClick={() => applyPreset(f.key)} className="btn-secondary text-left">
                  {f.name}
                </button>
              ))}
              <button type="button" onClick={addOpponentToken} className="btn-secondary text-left">
                + Ficha rival
              </button>
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm font-medium">Banquillo ({bench.length})</p>
            <div className="flex flex-col gap-1 max-h-64 overflow-y-auto pr-1">
              {bench.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setSelectedBenchPlayerId((cur) => (cur === p.id ? null : p.id))}
                  className="flex items-center gap-1.5 rounded-[3px] border px-2 py-1 text-left text-sm transition-colors"
                  style={{
                    borderColor: selectedBenchPlayerId === p.id ? "var(--accent)" : "var(--border)",
                    background: selectedBenchPlayerId === p.id ? "color-mix(in srgb, var(--accent) 12%, var(--surface-1))" : "var(--surface-1)",
                  }}
                >
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{
                      background: p.isStar ? "var(--gold)" : p.positionLabel ? colorForPosition(p.positionLabel) : "var(--ink-3)",
                    }}
                  />
                  #{p.number} {p.customName}
                </button>
              ))}
              {bench.length === 0 && (
                <p className="text-xs" style={{ color: "var(--ink-3)" }}>
                  Todos los jugadores están en el tablero.
                </p>
              )}
            </div>
          </div>

          {positionLegend.length > 0 && (
            <div>
              <p className="mb-2 text-sm font-medium">Leyenda de posiciones</p>
              <div className="flex flex-col gap-1">
                {positionLegend.map(([label, color]) => (
                  <div key={label} className="flex items-center gap-1.5 text-xs" style={{ color: "var(--ink-2)" }}>
                    <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: color }} />
                    {label}
                  </div>
                ))}
                <div className="flex items-center gap-1.5 text-xs" style={{ color: "var(--ink-2)" }}>
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: "var(--gold)" }} />
                  Jugador Estrella
                </div>
              </div>
            </div>
          )}

          {selectedToken && (
            <div className="rounded-[3px] border p-3 text-sm" style={{ borderColor: "var(--border)", background: "var(--surface-1)" }}>
              <p className="font-medium">
                {selectedToken.playerId
                  ? roster.find((p) => p.id === selectedToken.playerId)?.customName
                  : selectedToken.label}
              </p>
              {selectedToken.side === "opponent" && (
                <input
                  className="input mt-2 py-1 text-sm"
                  defaultValue={selectedToken.label ?? ""}
                  placeholder="Etiqueta (p.ej. Blitzer)"
                  onBlur={(e) => {
                    const value = e.target.value.trim() || "Rival";
                    setTokens((prev) => prev.map((t) => (t.key === selectedToken.key ? { ...t, label: value } : t)));
                  }}
                />
              )}
              <button type="button" onClick={() => removeToken(selectedToken.key)} className="mt-2 text-xs" style={{ color: "var(--danger)" }}>
                Quitar del tablero
              </button>
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          <div
            ref={boardRef}
            onClick={handleBoardClick}
            className="relative"
            style={{
              width: GRID_COLS * CELL,
              height: GRID_ROWS * CELL,
              background: `repeating-linear-gradient(90deg, #4d8f41 0, #4d8f41 ${CELL}px, #457f3a ${CELL}px, #457f3a ${2 * CELL}px)`,
              border: "3px solid #2c4f27",
              boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.12)",
              cursor: selectedBenchPlayerId ? "crosshair" : "default",
            }}
          >
            {/* Casillas: líneas finas blancas translúcidas sobre el césped */}
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                backgroundImage:
                  `repeating-linear-gradient(0deg, rgba(255,255,255,0.25) 0 1px, transparent 1px ${CELL}px), ` +
                  `repeating-linear-gradient(90deg, rgba(255,255,255,0.25) 0 1px, transparent 1px ${CELL}px)`,
              }}
            />

            {/* Zonas de ensayo, primera y última columna */}
            <div
              className="pointer-events-none absolute top-0 bottom-0"
              style={{
                left: 0,
                width: CELL,
                background: "repeating-linear-gradient(45deg, rgba(122,30,30,0.55) 0 8px, rgba(90,20,20,0.55) 8px 16px)",
              }}
            />
            <div
              className="pointer-events-none absolute top-0 bottom-0"
              style={{
                left: (GRID_COLS - 1) * CELL,
                width: CELL,
                background: "repeating-linear-gradient(45deg, rgba(122,30,30,0.55) 0 8px, rgba(90,20,20,0.55) 8px 16px)",
              }}
            />

            {/* Límites de las zonas anchas (4 casillas desde cada banda) */}
            <div className="pointer-events-none absolute left-0 right-0" style={{ top: 4 * CELL, borderTop: "2px dashed rgba(255,255,255,0.35)" }} />
            <div className="pointer-events-none absolute left-0 right-0" style={{ top: 11 * CELL, borderTop: "2px dashed rgba(255,255,255,0.35)" }} />

            {/* Línea de scrimmage, referencia visual */}
            <div
              className="pointer-events-none absolute top-0 bottom-0"
              style={{ left: 13 * CELL, borderLeft: "2px dashed rgba(255,244,214,0.85)" }}
            />

            {tokens.map((t) => {
              const player = t.playerId ? roster.find((p) => p.id === t.playerId) : null;
              const mine = t.side === "mine";
              const fill = mine
                ? player?.positionLabel
                  ? colorForPosition(player.positionLabel)
                  : "var(--accent)"
                : "#241a14";
              return (
                <button
                  key={t.key}
                  type="button"
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    setSelectedKey(t.key);
                    startDrag(t.key);
                  }}
                  className="absolute flex items-center justify-center rounded-full text-[10px] font-mono font-bold transition-transform"
                  style={{
                    left: t.x * CELL,
                    top: t.y * CELL,
                    width: CELL - 2,
                    height: CELL - 2,
                    background: fill,
                    color: "#f4ead8",
                    border: player?.isStar ? "2px solid var(--gold)" : "1.5px solid rgba(255,255,255,0.85)",
                    boxShadow: "1px 1px 0 rgba(0,0,0,0.35)",
                    outline: selectedKey === t.key ? "2px solid var(--gold)" : "none",
                    outlineOffset: 1,
                    touchAction: "none",
                  }}
                  title={
                    player
                      ? `#${player.number} ${player.customName}${player.positionLabel ? ` — ${player.positionLabel}` : ""}`
                      : (t.label ?? "Rival")
                  }
                >
                  {player ? player.number : "R"}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="max-w-md space-y-3 rounded-[3px] border p-4" style={{ borderColor: "var(--border)", background: "var(--surface-1)" }}>
        <label className="flex flex-col gap-1 text-sm">
          Nombre de la jugada
          <input className="input" value={playName} onChange={(e) => setPlayName(e.target.value)} required maxLength={60} />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Descripción (opcional)
          <textarea className="input" rows={2} value={playDescription} onChange={(e) => setPlayDescription(e.target.value)} maxLength={500} />
        </label>
        {error && <p className="text-sm text-red-500">{error}</p>}
        <div className="flex items-center gap-3">
          <button type="submit" disabled={pending} className="btn-primary">
            {currentPlayId ? "Actualizar jugada" : "Guardar jugada"}
          </button>
          {currentPlayId && (
            <button type="button" onClick={() => handleDelete(currentPlayId)} className="text-sm" style={{ color: "var(--danger)" }}>
              Borrar esta jugada
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
