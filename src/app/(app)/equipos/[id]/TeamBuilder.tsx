"use client";

import Link from "next/link";
import { useMemo, useOptimistic, useState, useTransition } from "react";
import {
  addPlayer,
  removePlayer,
  updatePlayer,
  deleteTeam,
  adjustAsset,
  toggleApothecary,
  hireStar,
  levelUpPlayer,
  type AssetType,
  type StatKey,
} from "../actions";
import { buildSkillInfoIndex } from "@/lib/resolveSkillName";
import { getPositionFlavorLabel } from "@/rules-engine/data/playerNames";
import SkillPillList, { type SkillInfo } from "@/components/SkillPillList";
import LevelUpPanel from "@/components/LevelUpPanel";
import { LEVEL_UP_SPP_COST_TABLE } from "@/rules-engine/data/tables/levelUp";
import { statLine, effectiveStats } from "@/lib/playerStats";

interface Player {
  id: string;
  number: number;
  customName: string;
  positionKey: string | null;
  starKey: string | null;
  spp: number;
  skills: { skillKey: string; source: string }[];
  maIncreases: number;
  stIncreases: number;
  agIncreases: number;
  paIncreases: number;
  avIncreases: number;
}
interface StatBlock {
  ma: number;
  st: number;
  ag: number;
  pa: number | null;
  av: number;
}
interface Position extends StatBlock {
  id: string;
  name: string;
  quantityMax: number;
  cost: number;
  startingSkillKeys: string[];
  playerTags: string[];
  primaryCategories: string[];
  secondaryCategories: string[];
}
interface StarPlayer extends StatBlock {
  key: string;
  name: string;
  cost: number;
  skillKeys: string[];
  specialRuleName: string | null;
  specialRuleText: string | null;
}
interface Team {
  id: string;
  name: string;
  treasury: number;
  rerolls: number;
  cheerleaders: number;
  assistantCoaches: number;
  fanFactor: number;
  hasApothecary: boolean;
  players: Player[];
}
interface Race {
  name: string;
  rerollCost: number;
  rerollMax: number;
  allowsApothecary: boolean;
  positions: Position[];
}
interface OptimisticState {
  players: Player[];
  treasury: number;
  rerolls: number;
  cheerleaders: number;
  assistantCoaches: number;
  fanFactor: number;
  hasApothecary: boolean;
}
type OptimisticAction =
  | { type: "add"; tempId: string; position: Position }
  | { type: "hireStar"; tempId: string; star: StarPlayer; copyNumber: number }
  | { type: "remove"; playerId: string; refund: number }
  | { type: "update"; playerId: string; patch: { customName?: string; number?: number } }
  | { type: "asset"; asset: AssetType; delta: 1 | -1; cost: number }
  | { type: "apothecary"; enabling: boolean; cost: number }
  | { type: "levelUp"; playerId: string; cost: number; result: { skillKey: string } | { stat: StatKey } };

// Debe coincidir con APOTHECARY_COST/MAX_COPIES_PER_STAR en actions.ts — un
// módulo "use server" solo puede exportar funciones async, así que estos
// valores no se comparten.
const APOTHECARY_COST = 50_000;
const MAX_COPIES_PER_STAR = 2;

const BUDGET = 1_000_000;
const MIN_ROSTER = 11;

/** Insignia "es de otra raza" — solo aparece en Grandullones y sub-criaturas
 * de No Muertos (getPositionFlavorLabel filtra el resto). */
function RaceBadge({ label }: { label: string | null }) {
  if (!label) return null;
  return (
    <span
      className="ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide"
      style={{ background: "var(--gold)", color: "var(--surface-1)" }}
    >
      {label}
    </span>
  );
}

function AssetRow({
  label,
  value,
  cost,
  max,
  floor = 0,
  canAfford,
  onBuy,
  onSell,
}: {
  label: string;
  value: number;
  cost: number;
  max?: number;
  floor?: number;
  canAfford: boolean;
  onBuy: () => void;
  onSell: () => void;
}) {
  const maxed = max !== undefined && value >= max;
  return (
    <div
      className="flex items-center justify-between rounded-[3px] border px-3 py-2"
      style={{ borderColor: "var(--border)", background: "var(--surface-1)" }}
    >
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="font-mono text-xs" style={{ color: "var(--ink-3)" }}>
          {cost.toLocaleString("es-ES")} MO c/u{max !== undefined ? ` · máx. ${max}` : ""}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onSell}
          disabled={value <= floor}
          className="btn-secondary"
          style={{ padding: "2px 10px", fontSize: "14px" }}
        >
          −
        </button>
        <span className="w-6 text-center font-mono text-sm">{value}</span>
        <button
          type="button"
          onClick={onBuy}
          disabled={maxed || !canAfford}
          className="btn-secondary"
          style={{ padding: "2px 10px", fontSize: "14px" }}
        >
          +
        </button>
      </div>
    </div>
  );
}

export default function TeamBuilder({
  team,
  race,
  skills,
  traits,
  stars,
}: {
  team: Team;
  race: Race;
  skills: SkillInfo[];
  traits: SkillInfo[];
  stars: StarPlayer[];
}) {
  const [, startTransition] = useTransition();
  const [error, setError] = useState<string | undefined>();
  const skillIndex = useMemo(() => buildSkillInfoIndex([...skills, ...traits]), [skills, traits]);
  const skillNameByKey = useMemo(
    () => new Map(skills.filter((s): s is SkillInfo & { key: string } => !!s.key).map((s) => [s.key, s.name])),
    [skills]
  );

  // Estado optimista: refleja el clic al instante (jugador añadido/quitado,
  // presupuesto ajustado) mientras el Server Action confirma de verdad. Si
  // el servidor devuelve error, `error` se muestra y el estado real (props)
  // corrige la vista en cuanto llega — sin esperar la ida y vuelta a Supabase
  // para que el clic "se sienta" instantáneo (regla de velocidad en mesa).
  const [optimistic, applyOptimistic] = useOptimistic<OptimisticState, OptimisticAction>(
    {
      players: team.players,
      treasury: team.treasury,
      rerolls: team.rerolls,
      cheerleaders: team.cheerleaders,
      assistantCoaches: team.assistantCoaches,
      fanFactor: team.fanFactor,
      hasApothecary: team.hasApothecary,
    },
    (state, action) => {
      if (action.type === "add") {
        const countSoFar = state.players.filter((p) => p.positionKey === action.position.id).length;
        const tempPlayer: Player = {
          id: `temp-${action.tempId}`,
          number: -1,
          customName: `${action.position.name} ${countSoFar + 1}`,
          positionKey: action.position.id,
          starKey: null,
          spp: 0,
          skills: [],
          maIncreases: 0,
          stIncreases: 0,
          agIncreases: 0,
          paIncreases: 0,
          avIncreases: 0,
        };
        return { ...state, players: [...state.players, tempPlayer], treasury: state.treasury - action.position.cost };
      }
      if (action.type === "hireStar") {
        const tempPlayer: Player = {
          id: `temp-${action.tempId}`,
          number: -1,
          customName: action.copyNumber > 0 ? `${action.star.name} (${action.copyNumber + 1})` : action.star.name,
          positionKey: null,
          starKey: action.star.key,
          spp: 0,
          skills: [],
          maIncreases: 0,
          stIncreases: 0,
          agIncreases: 0,
          paIncreases: 0,
          avIncreases: 0,
        };
        return { ...state, players: [...state.players, tempPlayer], treasury: state.treasury - action.star.cost };
      }
      if (action.type === "remove") {
        return {
          ...state,
          players: state.players.filter((p) => p.id !== action.playerId),
          treasury: state.treasury + action.refund,
        };
      }
      if (action.type === "update") {
        return {
          ...state,
          players: state.players.map((p) => (p.id === action.playerId ? { ...p, ...action.patch } : p)),
        };
      }
      if (action.type === "asset") {
        const treasury = state.treasury - action.cost * action.delta;
        if (action.asset === "reroll") return { ...state, rerolls: state.rerolls + action.delta, treasury };
        if (action.asset === "cheerleader") return { ...state, cheerleaders: state.cheerleaders + action.delta, treasury };
        if (action.asset === "coach") return { ...state, assistantCoaches: state.assistantCoaches + action.delta, treasury };
        return { ...state, fanFactor: state.fanFactor + action.delta, treasury };
      }
      if (action.type === "levelUp") {
        return {
          ...state,
          players: state.players.map((p) => {
            if (p.id !== action.playerId) return p;
            const next = { ...p, spp: p.spp - action.cost };
            if ("skillKey" in action.result) {
              return { ...next, skills: [...next.skills, { skillKey: action.result.skillKey, source: "LEVEL_UP" }] };
            }
            const field = `${action.result.stat.toLowerCase()}Increases` as
              | "maIncreases"
              | "stIncreases"
              | "agIncreases"
              | "paIncreases"
              | "avIncreases";
            return { ...next, [field]: next[field] + 1 };
          }),
        };
      }
      // apothecary
      return {
        ...state,
        hasApothecary: action.enabling,
        treasury: state.treasury + (action.enabling ? -action.cost : action.cost),
      };
    }
  );

  const spent = BUDGET - optimistic.treasury;
  const countInPosition = (posId: string) => optimistic.players.filter((p) => p.positionKey === posId).length;
  const countForStar = (starKey: string) => optimistic.players.filter((p) => p.starKey === starKey).length;

  function handleAdd(pos: Position) {
    setError(undefined);
    startTransition(async () => {
      applyOptimistic({ type: "add", tempId: `${pos.id}-${Date.now()}`, position: pos });
      const res = await addPlayer(team.id, pos.id);
      if (!res.ok) setError(res.error);
    });
  }

  function handleHireStar(star: StarPlayer) {
    setError(undefined);
    const copyNumber = countForStar(star.key);
    startTransition(async () => {
      applyOptimistic({ type: "hireStar", tempId: `${star.key}-${Date.now()}`, star, copyNumber });
      const res = await hireStar(team.id, star.key);
      if (!res.ok) setError(res.error);
    });
  }

  function handleRemove(player: Player) {
    setError(undefined);
    const refund = player.starKey
      ? (stars.find((s) => s.key === player.starKey)?.cost ?? 0)
      : (race.positions.find((x) => x.id === player.positionKey)?.cost ?? 0);
    startTransition(async () => {
      applyOptimistic({ type: "remove", playerId: player.id, refund });
      const res = await removePlayer(player.id);
      if (!res.ok) setError(res.error);
    });
  }

  function handleUpdatePlayer(playerId: string, patch: { customName?: string; number?: number }) {
    setError(undefined);
    startTransition(async () => {
      applyOptimistic({ type: "update", playerId, patch });
      const res = await updatePlayer(playerId, patch);
      if (!res.ok) setError(res.error);
    });
  }

  function handleAsset(asset: AssetType, delta: 1 | -1, cost: number) {
    setError(undefined);
    startTransition(async () => {
      applyOptimistic({ type: "asset", asset, delta, cost });
      const res = await adjustAsset(team.id, asset, delta);
      if (!res.ok) setError(res.error);
    });
  }

  function handleApothecary() {
    setError(undefined);
    const enabling = !optimistic.hasApothecary;
    startTransition(async () => {
      applyOptimistic({ type: "apothecary", enabling, cost: APOTHECARY_COST });
      const res = await toggleApothecary(team.id);
      if (!res.ok) setError(res.error);
    });
  }

  function handleLevelUp(
    player: Player,
    cost: number,
    choice: { kind: "PRIMARY_RANDOM" } | { kind: "PRIMARY_CHOSEN"; skillKey: string } | { kind: "SECONDARY_CHOSEN"; skillKey: string } | { kind: "ATTRIBUTE"; stat: StatKey }
  ) {
    setError(undefined);
    const result: { skillKey: string } | { stat: StatKey } =
      choice.kind === "ATTRIBUTE" ? { stat: choice.stat } : { skillKey: "skillKey" in choice ? choice.skillKey : "" };
    startTransition(async () => {
      // La mejora "al azar" no se puede reflejar de forma optimista (no sabemos
      // qué habilidad tocará hasta que responda el servidor) — solo se
      // optimiza el gasto de PE en ese caso, el resto llega con la revalidación.
      if (choice.kind !== "PRIMARY_RANDOM") {
        applyOptimistic({ type: "levelUp", playerId: player.id, cost, result });
      }
      const res = await levelUpPlayer(player.id, choice);
      if (!res.ok) setError(res.error);
    });
  }

  function handleDelete() {
    if (!confirm(`¿Disolver «${team.name}»? Esta acción no se puede deshacer.`)) return;
    startTransition(async () => {
      await deleteTeam(team.id);
    });
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-6 py-10">
      <Link
        href="/equipos"
        className="inline-flex items-center gap-1 text-sm hover:underline"
        style={{ color: "var(--ink-2)" }}
      >
        ← Volver a Equipos
      </Link>

      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{team.name}</h1>
          <p className="mt-1 text-sm" style={{ color: "var(--ink-3)" }}>
            {race.name}
            {optimistic.players.length < MIN_ROSTER
              ? ` · necesitas ${MIN_ROSTER - optimistic.players.length} jugador(es) más para jugar`
              : " · plantilla lista para jugar"}
          </p>
        </div>
        <button onClick={handleDelete} className="btn-danger" type="button">
          Disolver equipo
        </button>
      </header>

      <section>
        <div className="mb-2 flex items-baseline justify-between">
          <span className="text-sm font-medium">Presupuesto</span>
          <span className="font-mono text-sm">
            {spent.toLocaleString("es-ES")} / {BUDGET.toLocaleString("es-ES")} MO
          </span>
        </div>
        <div
          className="h-2 overflow-hidden rounded-full"
          style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}
        >
          <div
            className="h-full transition-[width] duration-200"
            style={{ width: `${Math.min(100, (spent / BUDGET) * 100)}%`, background: "var(--accent)" }}
          />
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Personal de banquillo</h2>
        <div className="grid gap-2 sm:grid-cols-2">
          <AssetRow
            label="Relanzamientos de equipo"
            value={optimistic.rerolls}
            cost={race.rerollCost}
            max={race.rerollMax}
            canAfford={optimistic.treasury >= race.rerollCost}
            onBuy={() => handleAsset("reroll", 1, race.rerollCost)}
            onSell={() => handleAsset("reroll", -1, race.rerollCost)}
          />
          <AssetRow
            label="Animadoras"
            value={optimistic.cheerleaders}
            cost={10_000}
            canAfford={optimistic.treasury >= 10_000}
            onBuy={() => handleAsset("cheerleader", 1, 10_000)}
            onSell={() => handleAsset("cheerleader", -1, 10_000)}
          />
          <AssetRow
            label="Entrenadores asistentes"
            value={optimistic.assistantCoaches}
            cost={10_000}
            canAfford={optimistic.treasury >= 10_000}
            onBuy={() => handleAsset("coach", 1, 10_000)}
            onSell={() => handleAsset("coach", -1, 10_000)}
          />
          <AssetRow
            label="Aficionados dedicados"
            value={optimistic.fanFactor}
            cost={10_000}
            floor={1}
            canAfford={optimistic.treasury >= 10_000}
            onBuy={() => handleAsset("fan", 1, 10_000)}
            onSell={() => handleAsset("fan", -1, 10_000)}
          />
          {race.allowsApothecary && (
            <div
              className="flex items-center justify-between rounded-[3px] border px-3 py-2 sm:col-span-2"
              style={{ borderColor: "var(--border)", background: "var(--surface-1)" }}
            >
              <div>
                <p className="text-sm font-medium">Apotecario</p>
                <p className="font-mono text-xs" style={{ color: "var(--ink-3)" }}>
                  {APOTHECARY_COST.toLocaleString("es-ES")} MO
                </p>
              </div>
              <button
                type="button"
                onClick={handleApothecary}
                disabled={!optimistic.hasApothecary && optimistic.treasury < APOTHECARY_COST}
                className={optimistic.hasApothecary ? "btn-secondary" : "btn-primary"}
                style={{ padding: "4px 12px", fontSize: "12px" }}
              >
                {optimistic.hasApothecary ? "Contratado — vender" : "Contratar"}
              </button>
            </div>
          )}
        </div>
      </section>

      {error && <p className="text-sm text-red-500">{error}</p>}

      {/*
        Tres columnas independientes a propósito: si los catálogos y la
        plantilla compartieran una sola columna, cada jugador fichado
        alargaría la lista de arriba y desplazaría el botón "Añadir"/"Fichar"
        justo cuando ibas a hacer el siguiente clic. En columnas separadas (o
        apiladas en móvil con los catálogos primero) el botón nunca se mueve.
      */}
      <div className="grid gap-8 lg:grid-cols-3 lg:items-start">
        <section>
          <h2 className="mb-3 text-lg font-semibold">Roster de {race.name}</h2>
          <div className="grid gap-2">
            {race.positions.map((pos) => {
              const count = countInPosition(pos.id);
              const maxed = count >= pos.quantityMax;
              const tooExpensive = pos.cost > optimistic.treasury;
              const disabled = maxed || tooExpensive;
              return (
                <div
                  key={pos.id}
                  className="flex items-center justify-between rounded-[3px] border px-3 py-2"
                  style={{ borderColor: "var(--border)", background: "var(--surface-1)" }}
                >
                  <div>
                    <p className="text-sm font-medium">
                      {pos.name}
                      <RaceBadge label={getPositionFlavorLabel(pos.playerTags)} />{" "}
                      <span className="font-mono text-xs" style={{ color: "var(--ink-3)" }}>
                        ({count}/{pos.quantityMax})
                      </span>
                    </p>
                    <p className="font-mono text-xs" style={{ color: "var(--ink-3)" }}>
                      {statLine(pos)} · {pos.cost.toLocaleString("es-ES")} MO
                    </p>
                    <SkillPillList names={pos.startingSkillKeys} index={skillIndex} />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleAdd(pos)}
                    disabled={disabled}
                    className="btn-primary"
                    style={{ padding: "4px 12px", fontSize: "12px" }}
                  >
                    {maxed ? "Al máximo" : tooExpensive ? "Sin fondos" : "Añadir"}
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold">Mercado de Estrellas</h2>
          {stars.length === 0 ? (
            <p className="text-sm" style={{ color: "var(--ink-3)" }}>
              Ninguna Estrella juega para las ligas de {race.name}.
            </p>
          ) : (
            <div className="grid gap-2">
              {stars.map((star) => {
                const copies = countForStar(star.key);
                const maxed = copies >= MAX_COPIES_PER_STAR;
                const tooExpensive = star.cost > optimistic.treasury;
                const disabled = maxed || tooExpensive;
                return (
                  <div
                    key={star.key}
                    className="rounded-[3px] border px-3 py-2"
                    style={{ borderColor: "var(--gold-soft)", background: "var(--surface-1)" }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-medium">
                          {star.name}{" "}
                          <span className="font-mono text-xs" style={{ color: "var(--ink-3)" }}>
                            ({copies}/{MAX_COPIES_PER_STAR})
                          </span>
                        </p>
                        <p className="font-mono text-xs" style={{ color: "var(--ink-3)" }}>
                          {statLine(star)} · {star.cost.toLocaleString("es-ES")} MO
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleHireStar(star)}
                        disabled={disabled}
                        className="btn-primary"
                        style={{ padding: "4px 12px", fontSize: "12px" }}
                      >
                        {maxed ? "Al máximo" : tooExpensive ? "Sin fondos" : "Fichar"}
                      </button>
                    </div>
                    <SkillPillList names={star.skillKeys} index={skillIndex} />
                    {star.specialRuleName && (
                      <p className="mt-1 text-xs" style={{ color: "var(--gold)" }}>
                        {star.specialRuleName}
                        {star.specialRuleText && (
                          <span style={{ color: "var(--ink-3)" }}> — {star.specialRuleText}</span>
                        )}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold">Plantilla ({optimistic.players.length})</h2>
          {optimistic.players.length === 0 ? (
            <p className="text-sm" style={{ color: "var(--ink-3)" }}>
              Sin jugadores todavía. Recluta desde los catálogos de la izquierda.
            </p>
          ) : (
            <div className="grid gap-2">
              {optimistic.players.map((p) => {
                const pos = p.positionKey ? race.positions.find((x) => x.id === p.positionKey) : undefined;
                const star = p.starKey ? stars.find((s) => s.key === p.starKey) : undefined;
                const baseStats = pos ?? star;
                const stats = baseStats ? effectiveStats(baseStats, p) : undefined;
                const levelUpSkills = p.skills.filter((s) => s.source === "LEVEL_UP");
                const levelUpNames = levelUpSkills.map((s) => skillNameByKey.get(s.skillKey) ?? s.skillKey);
                const skillNames = [...(pos?.startingSkillKeys ?? star?.skillKeys ?? []), ...levelUpNames];
                const isTemp = p.id.startsWith("temp-");
                const levelUpsTaken =
                  levelUpSkills.length + p.maIncreases + p.stIncreases + p.agIncreases + p.paIncreases + p.avIncreases;
                const levelRow = LEVEL_UP_SPP_COST_TABLE[Math.min(levelUpsTaken, LEVEL_UP_SPP_COST_TABLE.length - 1)];
                return (
                  <div
                    key={p.id}
                    className="flex items-center justify-between rounded-[3px] border px-3 py-2"
                    style={{
                      borderColor: star ? "var(--gold-soft)" : "var(--border)",
                      background: "var(--surface-1)",
                      opacity: isTemp ? 0.6 : 1,
                    }}
                  >
                    <div className="min-w-0 flex-1">
                      {isTemp ? (
                        <p className="text-sm font-medium">… {p.customName}</p>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <input
                            key={`num-${p.id}-${p.number}`}
                            type="number"
                            defaultValue={p.number}
                            min={1}
                            max={16}
                            aria-label="Dorsal"
                            onBlur={(e) => {
                              const v = Number(e.target.value);
                              if (Number.isInteger(v) && v >= 1 && v <= 16 && v !== p.number) {
                                handleUpdatePlayer(p.id, { number: v });
                              } else {
                                e.target.value = String(p.number);
                              }
                            }}
                            className="w-11 shrink-0 rounded-[3px] border bg-transparent px-1 py-0.5 text-center font-mono text-xs"
                            style={{ borderColor: "var(--border)" }}
                          />
                          <input
                            key={`name-${p.id}-${p.customName}`}
                            type="text"
                            defaultValue={p.customName}
                            maxLength={30}
                            aria-label="Nombre del jugador"
                            onBlur={(e) => {
                              const v = e.target.value.trim();
                              if (v && v !== p.customName) {
                                handleUpdatePlayer(p.id, { customName: v });
                              } else {
                                e.target.value = p.customName;
                              }
                            }}
                            className="min-w-0 flex-1 rounded-[3px] border bg-transparent px-1 py-0.5 text-sm font-medium"
                            style={{ borderColor: "var(--border)" }}
                          />
                          {pos && <RaceBadge label={getPositionFlavorLabel(pos.playerTags)} />}
                        </div>
                      )}
                      <p className="font-mono text-xs" style={{ color: "var(--ink-3)" }}>
                        {stats ? statLine(stats) : "?"}
                        {!isTemp && !star && (
                          <span className="ml-2" style={{ color: "var(--gold)" }}>
                            {p.spp} PE
                          </span>
                        )}
                      </p>
                      <SkillPillList names={skillNames} index={skillIndex} />
                      {!isTemp && pos && (
                        <LevelUpPanel
                          spp={p.spp}
                          levelRow={levelRow}
                          primaryCategories={pos.primaryCategories}
                          secondaryCategories={pos.secondaryCategories}
                          knownSkillKeys={p.skills.map((s) => s.skillKey)}
                          allSkills={skills}
                          hasPa={pos.pa !== null}
                          onLevelUp={(choice, cost) => handleLevelUp(p, cost, choice)}
                        />
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemove(p)}
                      disabled={isTemp}
                      className="btn-secondary"
                      style={{ padding: "4px 10px", fontSize: "12px" }}
                    >
                      Quitar
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
