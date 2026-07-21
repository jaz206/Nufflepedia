"use client";

import { useState, useTransition } from "react";
import { updateRace, updatePosition, type RaceInput, type PositionInput } from "./actions";

type Category = "GENERAL" | "AGILIDAD" | "FUERZA" | "PASE" | "MUTACION" | "TRIQUINUELAS";

interface Position extends PositionInput {
  id: string;
}
interface Race extends RaceInput {
  id: string;
  key: string;
  positions: Position[];
}

const CAT_ORDER: Category[] = ["AGILIDAD", "FUERZA", "GENERAL", "MUTACION", "PASE", "TRIQUINUELAS"];
const CAT_LETTER: Record<Category, string> = {
  AGILIDAD: "A",
  FUERZA: "F",
  GENERAL: "G",
  MUTACION: "M",
  PASE: "P",
  TRIQUINUELAS: "T",
};

const toList = (arr: string[]) => arr.join(", ");
const fromList = (s: string) => s.split(",").map((x) => x.trim()).filter(Boolean);
const intOrNull = (s: string) => (s.trim() === "" ? null : Number.parseInt(s, 10));

// ── Editor de categorías (6 letras conmutables) ──────────────────────────
function CategoryToggle({
  value,
  onChange,
}: {
  value: Category[];
  onChange: (next: Category[]) => void;
}) {
  return (
    <div className="flex gap-1">
      {CAT_ORDER.map((c) => {
        const on = value.includes(c);
        return (
          <button
            key={c}
            type="button"
            title={c}
            onClick={() => onChange(on ? value.filter((x) => x !== c) : [...value, c])}
            className={
              on
                ? "w-6 h-6 rounded text-xs font-bold bg-[var(--accent)] text-[var(--accent-ink)]"
                : "w-6 h-6 rounded text-xs font-bold border border-[var(--border-strong)] text-zinc-400"
            }
          >
            {CAT_LETTER[c]}
          </button>
        );
      })}
    </div>
  );
}

// ── Fila de puesto (editable al vuelo) ───────────────────────────────────
function PositionRow({ position }: { position: Position }) {
  const [p, setP] = useState(position);
  const [, startTransition] = useTransition();
  const [err, setErr] = useState<string | undefined>();

  function save(patch: Partial<Position>) {
    const next = { ...p, ...patch };
    setP(next);
    startTransition(async () => {
      const { id, ...input } = next;
      void id;
      const res = await updatePosition(position.id, input);
      setErr(res.ok ? undefined : res.error);
    });
  }

  const numInput = (label: string, val: number | null, key: keyof Position, nullable = false) => (
    <label className="flex flex-col text-[10px] uppercase tracking-wide text-zinc-400">
      {label}
      <input
        type="text"
        inputMode="numeric"
        className="input w-14 mt-0.5 py-1 text-center font-mono text-sm"
        defaultValue={val ?? ""}
        placeholder={nullable ? "–" : ""}
        onBlur={(e) => {
          const v = nullable ? intOrNull(e.target.value) : Number.parseInt(e.target.value, 10);
          if (v !== val && !(v !== null && Number.isNaN(v))) save({ [key]: v } as Partial<Position>);
        }}
      />
    </label>
  );

  return (
    <div className="rounded-md border border-[var(--border)] p-3 space-y-2 bg-[var(--surface-1)]">
      <div className="flex flex-wrap items-end gap-2">
        <label className="flex flex-col text-[10px] uppercase tracking-wide text-zinc-400">
          Cant.
          <div className="flex items-center gap-1 mt-0.5">
            <input
              type="text"
              inputMode="numeric"
              className="input w-10 py-1 text-center font-mono text-sm"
              defaultValue={p.quantityMin}
              onBlur={(e) => {
                const v = Number.parseInt(e.target.value, 10);
                if (v !== p.quantityMin && !Number.isNaN(v)) save({ quantityMin: v });
              }}
            />
            <span className="text-zinc-400">-</span>
            <input
              type="text"
              inputMode="numeric"
              className="input w-10 py-1 text-center font-mono text-sm"
              defaultValue={p.quantityMax}
              onBlur={(e) => {
                const v = Number.parseInt(e.target.value, 10);
                if (v !== p.quantityMax && !Number.isNaN(v)) save({ quantityMax: v });
              }}
            />
          </div>
        </label>
        <label className="flex flex-col text-[10px] uppercase tracking-wide text-zinc-400 flex-1 min-w-[160px]">
          Puesto
          <input
            className="input mt-0.5 py-1 text-sm"
            defaultValue={p.name}
            onBlur={(e) => e.target.value !== p.name && save({ name: e.target.value })}
          />
        </label>
        <label className="flex flex-col text-[10px] uppercase tracking-wide text-zinc-400">
          Coste
          <input
            type="text"
            inputMode="numeric"
            className="input w-24 mt-0.5 py-1 font-mono text-sm"
            defaultValue={p.cost}
            onBlur={(e) => {
              const v = Number.parseInt(e.target.value, 10);
              if (v !== p.cost && !Number.isNaN(v)) save({ cost: v });
            }}
          />
        </label>
      </div>

      <div className="flex flex-wrap items-end gap-2">
        {numInput("MA", p.ma, "ma")}
        {numInput("ST", p.st, "st")}
        {numInput("AG+", p.ag, "ag")}
        {numInput("PA+", p.pa, "pa", true)}
        {numInput("AV+", p.av, "av")}
        <div className="flex flex-col text-[10px] uppercase tracking-wide text-zinc-400">
          Primarias
          <div className="mt-0.5">
            <CategoryToggle value={p.primaryCategories} onChange={(v) => save({ primaryCategories: v })} />
          </div>
        </div>
        <div className="flex flex-col text-[10px] uppercase tracking-wide text-zinc-400">
          Secundarias
          <div className="mt-0.5">
            <CategoryToggle value={p.secondaryCategories} onChange={(v) => save({ secondaryCategories: v })} />
          </div>
        </div>
      </div>

      <label className="flex flex-col text-[10px] uppercase tracking-wide text-zinc-400">
        Habilidades iniciales (separadas por comas)
        <input
          className="input mt-0.5 py-1 text-sm"
          defaultValue={toList(p.startingSkillKeys)}
          onBlur={(e) => {
            const v = fromList(e.target.value);
            if (toList(v) !== toList(p.startingSkillKeys)) save({ startingSkillKeys: v });
          }}
        />
      </label>
      <label className="flex flex-col text-[10px] uppercase tracking-wide text-zinc-400">
        Etiquetas (racial, posición…)
        <input
          className="input mt-0.5 py-1 text-sm"
          defaultValue={toList(p.playerTags)}
          onBlur={(e) => {
            const v = fromList(e.target.value);
            if (toList(v) !== toList(p.playerTags)) save({ playerTags: v });
          }}
        />
      </label>
      {err && <p className="text-xs text-[var(--danger)]">{err}</p>}
    </div>
  );
}

// ── Tarjeta de raza (colapsable) ─────────────────────────────────────────
function RaceCard({ race }: { race: Race }) {
  const [open, setOpen] = useState(false);
  const [r, setR] = useState(race);
  const [, startTransition] = useTransition();
  const [err, setErr] = useState<string | undefined>();

  function saveRace(patch: Partial<RaceInput>) {
    const next = { ...r, ...patch };
    setR(next);
    startTransition(async () => {
      const res = await updateRace(race.id, {
        name: next.name,
        pageRef: next.pageRef,
        tier: next.tier,
        leagues: next.leagues,
        specialRules: next.specialRules,
        rerollCost: next.rerollCost,
        rerollMax: next.rerollMax,
        allowsApothecary: next.allowsApothecary,
      });
      setErr(res.ok ? undefined : res.error);
    });
  }

  return (
    <div className="rounded-lg border border-[var(--border-strong)] overflow-hidden">
      <button
        className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left hover:bg-[var(--surface-2)]"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="flex items-baseline gap-3">
          <span className="font-semibold">{r.name}</span>
          <span className="text-xs text-zinc-400">{race.positions.length} puestos</span>
          <span className="text-xs text-zinc-400">{r.leagues.join(", ")}</span>
        </span>
        <span className="text-zinc-400">{open ? "−" : "+"}</span>
      </button>

      {open && (
        <div className="p-4 border-t border-[var(--border)] space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex flex-col text-[10px] uppercase tracking-wide text-zinc-400">
              Nombre
              <input
                className="input mt-0.5 py-1.5 text-sm"
                defaultValue={r.name}
                onBlur={(e) => e.target.value !== r.name && saveRace({ name: e.target.value })}
              />
            </label>
            <label className="flex flex-col text-[10px] uppercase tracking-wide text-zinc-400">
              Ligas (separadas por comas)
              <input
                className="input mt-0.5 py-1.5 text-sm"
                defaultValue={toList(r.leagues)}
                onBlur={(e) => {
                  const v = fromList(e.target.value);
                  if (toList(v) !== toList(r.leagues)) saveRace({ leagues: v });
                }}
              />
            </label>
            <label className="flex flex-col text-[10px] uppercase tracking-wide text-zinc-400 sm:col-span-2">
              Reglas especiales (separadas por comas)
              <input
                className="input mt-0.5 py-1.5 text-sm"
                defaultValue={toList(r.specialRules)}
                onBlur={(e) => {
                  const v = fromList(e.target.value);
                  if (toList(v) !== toList(r.specialRules)) saveRace({ specialRules: v });
                }}
              />
            </label>
            <div className="flex flex-wrap items-end gap-3">
              <label className="flex flex-col text-[10px] uppercase tracking-wide text-zinc-400">
                Reroll (MO)
                <input
                  type="text"
                  inputMode="numeric"
                  className="input w-24 mt-0.5 py-1.5 font-mono text-sm"
                  defaultValue={r.rerollCost}
                  onBlur={(e) => {
                    const v = Number.parseInt(e.target.value, 10);
                    if (v !== r.rerollCost && !Number.isNaN(v)) saveRace({ rerollCost: v });
                  }}
                />
              </label>
              <label className="flex flex-col text-[10px] uppercase tracking-wide text-zinc-400">
                Máx. rerolls
                <input
                  type="text"
                  inputMode="numeric"
                  className="input w-16 mt-0.5 py-1.5 font-mono text-sm"
                  defaultValue={r.rerollMax}
                  onBlur={(e) => {
                    const v = Number.parseInt(e.target.value, 10);
                    if (v !== r.rerollMax && !Number.isNaN(v)) saveRace({ rerollMax: v });
                  }}
                />
              </label>
              <label className="flex flex-col text-[10px] uppercase tracking-wide text-zinc-400">
                Tier
                <input
                  type="text"
                  inputMode="numeric"
                  className="input w-14 mt-0.5 py-1.5 font-mono text-sm"
                  defaultValue={r.tier ?? ""}
                  placeholder="—"
                  onBlur={(e) => {
                    const v = intOrNull(e.target.value);
                    if (v !== r.tier && !(v !== null && Number.isNaN(v))) saveRace({ tier: v });
                  }}
                />
              </label>
              <label className="flex items-center gap-2 text-sm pb-1">
                <input
                  type="checkbox"
                  checked={r.allowsApothecary}
                  onChange={(e) => saveRace({ allowsApothecary: e.target.checked })}
                />
                Apotecario
              </label>
            </div>
          </div>

          {err && <p className="text-xs text-[var(--danger)]">{err}</p>}

          <div>
            <h3 className="text-sm font-semibold mb-2">Puestos</h3>
            <div className="space-y-2">
              {race.positions.map((pos) => (
                <PositionRow key={pos.id} position={pos} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function RacesEditor({ races }: { races: Race[] }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Razas ({races.length})</h1>
        <p className="text-sm text-zinc-500 mt-1">
          Los cambios se guardan al salir de cada campo. Repasa sobre todo las categorías
          primaria/secundaria de los puestos (la extracción del PDF fue ambigua en algunos).
        </p>
      </div>
      <div className="space-y-2">
        {races.map((race) => (
          <RaceCard key={race.id} race={race} />
        ))}
      </div>
    </div>
  );
}
