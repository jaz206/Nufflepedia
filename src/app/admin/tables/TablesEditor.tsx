"use client";

import { useState, useTransition } from "react";
import {
  updateInjuryEntry,
  updateKickoffEntry,
  updateLevelUpConfig,
  updateSppValue,
  updateWeatherEntry,
} from "./actions";

interface WeatherRow {
  id: string;
  minRoll: number;
  maxRoll: number;
  name: string;
  effect: string;
}
interface KickoffRow {
  id: string;
  roll: number;
  name: string;
  effect: string;
}
interface InjuryRow {
  id: string;
  minRoll: number;
  maxRoll: number;
  code: string;
  name: string;
  missesNextGame: boolean;
  permanentStatLoss: boolean;
  isDeath: boolean;
}
interface SppRow {
  id: string;
  actionKey: string;
  label: string;
  standardValue: number;
  brutosBrutalesValue: number | null;
}
interface LevelUpRow {
  id: string;
  configKey: string;
  label: string;
  sppCost: number;
  tvImpactMinGp: number | null;
  tvImpactMaxGp: number | null;
}

function RollLabel({ min, max }: { min: number; max: number }) {
  return (
    <span className="inline-block w-14 shrink-0 rounded bg-zinc-100 dark:bg-zinc-900 px-2 py-1 text-center text-xs font-mono">
      {min === max ? min : `${min}-${max}`}
    </span>
  );
}

function WeatherSection({ rows }: { rows: WeatherRow[] }) {
  const [items, setItems] = useState(rows);
  const [isPending, startTransition] = useTransition();

  function save(id: string, name: string, effect: string) {
    startTransition(async () => {
      await updateWeatherEntry(id, { name, effect });
      setItems(items.map((r) => (r.id === id ? { ...r, name, effect } : r)));
    });
  }

  return (
    <section>
      <h2 className="text-lg font-semibold border-b border-zinc-200 dark:border-zinc-800 pb-2 mb-3">
        Clima (2D6)
      </h2>
      <div className="space-y-2">
        {items.map((row) => (
          <div key={row.id} className="flex items-start gap-3">
            <RollLabel min={row.minRoll} max={row.maxRoll} />
            <input
              className="input flex-1"
              defaultValue={row.name}
              onBlur={(e) => e.target.value !== row.name && save(row.id, e.target.value, row.effect)}
            />
            <input
              className="input flex-[2]"
              defaultValue={row.effect}
              disabled={isPending}
              onBlur={(e) => e.target.value !== row.effect && save(row.id, row.name, e.target.value)}
            />
          </div>
        ))}
      </div>
    </section>
  );
}

function KickoffSection({ rows }: { rows: KickoffRow[] }) {
  const [items, setItems] = useState(rows);
  const [isPending, startTransition] = useTransition();

  function save(id: string, name: string, effect: string) {
    startTransition(async () => {
      await updateKickoffEntry(id, { name, effect });
      setItems(items.map((r) => (r.id === id ? { ...r, name, effect } : r)));
    });
  }

  return (
    <section>
      <h2 className="text-lg font-semibold border-b border-zinc-200 dark:border-zinc-800 pb-2 mb-3">
        Patada Inicial (2D6)
      </h2>
      <div className="space-y-2">
        {items.map((row) => (
          <div key={row.id} className="flex items-start gap-3">
            <RollLabel min={row.roll} max={row.roll} />
            <input
              className="input flex-1"
              defaultValue={row.name}
              onBlur={(e) => e.target.value !== row.name && save(row.id, e.target.value, row.effect)}
            />
            <input
              className="input flex-[2]"
              defaultValue={row.effect}
              disabled={isPending}
              onBlur={(e) => e.target.value !== row.effect && save(row.id, row.name, e.target.value)}
            />
          </div>
        ))}
      </div>
    </section>
  );
}

function InjurySection({ rows }: { rows: InjuryRow[] }) {
  const [items, setItems] = useState(rows);
  const [isPending, startTransition] = useTransition();

  function save(id: string, patch: Partial<InjuryRow>) {
    const row = items.find((r) => r.id === id)!;
    const next = { ...row, ...patch };
    startTransition(async () => {
      await updateInjuryEntry(id, {
        name: next.name,
        missesNextGame: next.missesNextGame,
        permanentStatLoss: next.permanentStatLoss,
        isDeath: next.isDeath,
      });
      setItems(items.map((r) => (r.id === id ? next : r)));
    });
  }

  return (
    <section>
      <h2 className="text-lg font-semibold border-b border-zinc-200 dark:border-zinc-800 pb-2 mb-3">
        Lesiones graves (1D16)
      </h2>
      <div className="space-y-2">
        {items.map((row) => (
          <div key={row.id} className="flex flex-wrap items-center gap-3">
            <RollLabel min={row.minRoll} max={row.maxRoll} />
            <span className="text-xs text-zinc-400 w-16">{row.code}</span>
            <input
              className="input flex-1"
              defaultValue={row.name}
              disabled={isPending}
              onBlur={(e) => e.target.value !== row.name && save(row.id, { name: e.target.value })}
            />
            <label className="flex items-center gap-1 text-xs text-zinc-500">
              <input
                type="checkbox"
                checked={row.missesNextGame}
                onChange={(e) => save(row.id, { missesNextGame: e.target.checked })}
              />
              Falta siguiente
            </label>
            <label className="flex items-center gap-1 text-xs text-zinc-500">
              <input
                type="checkbox"
                checked={row.permanentStatLoss}
                onChange={(e) => save(row.id, { permanentStatLoss: e.target.checked })}
              />
              Pérdida atributo
            </label>
            <label className="flex items-center gap-1 text-xs text-zinc-500">
              <input
                type="checkbox"
                checked={row.isDeath}
                onChange={(e) => save(row.id, { isDeath: e.target.checked })}
              />
              Muerte
            </label>
          </div>
        ))}
      </div>
    </section>
  );
}

function SppSection({ rows }: { rows: SppRow[] }) {
  const [items, setItems] = useState(rows);
  const [isPending, startTransition] = useTransition();

  function save(id: string, patch: Partial<SppRow>) {
    const row = items.find((r) => r.id === id)!;
    const next = { ...row, ...patch };
    startTransition(async () => {
      await updateSppValue(id, {
        label: next.label,
        standardValue: next.standardValue,
        brutosBrutalesValue: next.brutosBrutalesValue,
      });
      setItems(items.map((r) => (r.id === id ? next : r)));
    });
  }

  return (
    <section>
      <h2 className="text-lg font-semibold border-b border-zinc-200 dark:border-zinc-800 pb-2 mb-3">
        Puntos de Estrellato (SPP)
      </h2>
      <div className="space-y-2">
        {items.map((row) => (
          <div key={row.id} className="flex items-center gap-3">
            <span className="w-40 text-sm">{row.label}</span>
            <input
              type="number"
              className="input w-24"
              defaultValue={row.standardValue}
              disabled={isPending}
              onBlur={(e) => {
                const v = Number(e.target.value);
                if (v !== row.standardValue) save(row.id, { standardValue: v });
              }}
            />
            <span className="text-xs text-zinc-400">Brutos Brutales:</span>
            <input
              type="number"
              className="input w-24"
              placeholder="—"
              defaultValue={row.brutosBrutalesValue ?? ""}
              disabled={isPending}
              onBlur={(e) => {
                const v = e.target.value === "" ? null : Number(e.target.value);
                if (v !== row.brutosBrutalesValue) save(row.id, { brutosBrutalesValue: v });
              }}
            />
          </div>
        ))}
      </div>
    </section>
  );
}

function LevelUpSection({ rows }: { rows: LevelUpRow[] }) {
  const [items, setItems] = useState(rows);
  const [isPending, startTransition] = useTransition();

  function save(id: string, patch: Partial<LevelUpRow>) {
    const row = items.find((r) => r.id === id)!;
    const next = { ...row, ...patch };
    startTransition(async () => {
      await updateLevelUpConfig(id, {
        label: next.label,
        sppCost: next.sppCost,
        tvImpactMinGp: next.tvImpactMinGp,
        tvImpactMaxGp: next.tvImpactMaxGp,
      });
      setItems(items.map((r) => (r.id === id ? next : r)));
    });
  }

  return (
    <section>
      <h2 className="text-lg font-semibold border-b border-zinc-200 dark:border-zinc-800 pb-2 mb-3">
        Coste de mejoras (Level Up)
      </h2>
      <div className="space-y-2">
        {items.map((row) => (
          <div key={row.id} className="flex items-center gap-3">
            <span className="w-56 text-sm">{row.label}</span>
            <span className="text-xs text-zinc-400">PE:</span>
            <input
              type="number"
              className="input w-20"
              defaultValue={row.sppCost}
              disabled={isPending}
              onBlur={(e) => {
                const v = Number(e.target.value);
                if (v !== row.sppCost) save(row.id, { sppCost: v });
              }}
            />
            <span className="text-xs text-zinc-400">VAE min:</span>
            <input
              type="number"
              className="input w-24"
              defaultValue={row.tvImpactMinGp ?? ""}
              disabled={isPending}
              onBlur={(e) => {
                const v = e.target.value === "" ? null : Number(e.target.value);
                if (v !== row.tvImpactMinGp) save(row.id, { tvImpactMinGp: v });
              }}
            />
            <span className="text-xs text-zinc-400">VAE max:</span>
            <input
              type="number"
              className="input w-24"
              defaultValue={row.tvImpactMaxGp ?? ""}
              disabled={isPending}
              onBlur={(e) => {
                const v = e.target.value === "" ? null : Number(e.target.value);
                if (v !== row.tvImpactMaxGp) save(row.id, { tvImpactMaxGp: v });
              }}
            />
          </div>
        ))}
      </div>
    </section>
  );
}

export default function TablesEditor({
  weather,
  kickoff,
  injury,
  spp,
  levelUp,
}: {
  weather: WeatherRow[];
  kickoff: KickoffRow[];
  injury: InjuryRow[];
  spp: SppRow[];
  levelUp: LevelUpRow[];
}) {
  return (
    <div className="space-y-10">
      <h1 className="text-2xl font-bold">Tablas</h1>
      <p className="text-sm text-zinc-500 -mt-6">
        Edita el texto o los valores y haz clic fuera del campo (o cambia el número) para guardar.
      </p>
      <WeatherSection rows={weather} />
      <KickoffSection rows={kickoff} />
      <InjurySection rows={injury} />
      <SppSection rows={spp} />
      <LevelUpSection rows={levelUp} />
    </div>
  );
}
