"use client";

import { useMemo, useState, useTransition } from "react";
import { updateStar, type StarInput } from "./actions";

interface Star extends StarInput {
  id: string;
}

const toList = (arr: string[]) => arr.join(", ");
const fromList = (s: string) => s.split(",").map((x) => x.trim()).filter(Boolean);
const intOrNull = (s: string) => (s.trim() === "" ? null : Number.parseInt(s, 10));
const gp = (n: number) => `${(n / 1000).toLocaleString("es-ES")}k`;

function StarCard({ star }: { star: Star }) {
  const [open, setOpen] = useState(false);
  const [s, setS] = useState(star);
  const [, startTransition] = useTransition();
  const [err, setErr] = useState<string | undefined>();

  function save(patch: Partial<Star>) {
    const next = { ...s, ...patch };
    setS(next);
    startTransition(async () => {
      const { id, ...input } = next;
      void id;
      const res = await updateStar(star.id, input);
      setErr(res.ok ? undefined : res.error);
    });
  }

  const numInput = (label: string, val: number | null, key: keyof Star, nullable = false) => (
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
          if (v !== val && !(v !== null && Number.isNaN(v))) save({ [key]: v } as Partial<Star>);
        }}
      />
    </label>
  );

  return (
    <div className="rounded-lg border border-[var(--border-strong)] overflow-hidden">
      <button
        className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left hover:bg-[var(--surface-2)]"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="flex items-baseline gap-3 flex-wrap">
          <span className="font-semibold">{s.name}</span>
          <span className="text-xs text-zinc-400 font-mono">{gp(s.cost)}</span>
          <span className="text-xs text-zinc-400">
            {s.playsForAny ? "Cualquier equipo" : s.leagues.join(", ")}
          </span>
        </span>
        <span className="text-zinc-400">{open ? "−" : "+"}</span>
      </button>

      {open && (
        <div className="p-4 border-t border-[var(--border)] space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex flex-col text-[10px] uppercase tracking-wide text-zinc-400">
              Nombre
              <input
                className="input mt-0.5 py-1.5 text-sm"
                defaultValue={s.name}
                onBlur={(e) => e.target.value !== s.name && save({ name: e.target.value })}
              />
            </label>
            <label className="flex flex-col text-[10px] uppercase tracking-wide text-zinc-400">
              Coste (MO)
              <input
                type="text"
                inputMode="numeric"
                className="input mt-0.5 py-1.5 font-mono text-sm"
                defaultValue={s.cost}
                onBlur={(e) => {
                  const v = Number.parseInt(e.target.value, 10);
                  if (v !== s.cost && !Number.isNaN(v)) save({ cost: v });
                }}
              />
            </label>
          </div>

          <div className="flex flex-wrap items-end gap-2">
            {numInput("MA", s.ma, "ma")}
            {numInput("ST", s.st, "st")}
            {numInput("AG+", s.ag, "ag")}
            {numInput("PA+", s.pa, "pa", true)}
            {numInput("AV+", s.av, "av")}
            <label className="flex items-center gap-2 text-sm pb-1 ml-2">
              <input
                type="checkbox"
                checked={s.playsForAny}
                onChange={(e) => save({ playsForAny: e.target.checked })}
              />
              Cualquier equipo
            </label>
          </div>

          <label className="flex flex-col text-[10px] uppercase tracking-wide text-zinc-400">
            Etiquetas (puesto, raza…)
            <input
              className="input mt-0.5 py-1 text-sm"
              defaultValue={toList(s.playerTags)}
              onBlur={(e) => {
                const v = fromList(e.target.value);
                if (toList(v) !== toList(s.playerTags)) save({ playerTags: v });
              }}
            />
          </label>
          <label className="flex flex-col text-[10px] uppercase tracking-wide text-zinc-400">
            Habilidades (separadas por comas)
            <input
              className="input mt-0.5 py-1 text-sm"
              defaultValue={toList(s.skillKeys)}
              onBlur={(e) => {
                const v = fromList(e.target.value);
                if (toList(v) !== toList(s.skillKeys)) save({ skillKeys: v });
              }}
            />
          </label>
          <label className="flex flex-col text-[10px] uppercase tracking-wide text-zinc-400">
            Juega para (ligas, separadas por comas)
            <input
              className="input mt-0.5 py-1 text-sm"
              defaultValue={toList(s.leagues)}
              onBlur={(e) => {
                const v = fromList(e.target.value);
                if (toList(v) !== toList(s.leagues)) save({ leagues: v });
              }}
            />
          </label>
          <label className="flex flex-col text-[10px] uppercase tracking-wide text-zinc-400">
            Regla especial — nombre
            <input
              className="input mt-0.5 py-1 text-sm"
              defaultValue={s.specialRuleName ?? ""}
              onBlur={(e) => {
                const v = e.target.value.trim() || null;
                if (v !== s.specialRuleName) save({ specialRuleName: v });
              }}
            />
          </label>
          <label className="flex flex-col text-[10px] uppercase tracking-wide text-zinc-400">
            Regla especial — texto
            <textarea
              className="input mt-0.5 py-1 text-sm"
              rows={3}
              defaultValue={s.specialRuleText ?? ""}
              onBlur={(e) => {
                const v = e.target.value.trim() || null;
                if (v !== s.specialRuleText) save({ specialRuleText: v });
              }}
            />
          </label>
          <label className="flex flex-col text-[10px] uppercase tracking-wide text-zinc-400">
            Lore (biografía para &ldquo;Leyendas vivas&rdquo; en Balonazo Sangriento) — vacío = se genera sola la primera vez que se cite
            <textarea
              className="input mt-0.5 py-1 text-sm"
              rows={4}
              defaultValue={s.lore ?? ""}
              onBlur={(e) => {
                const v = e.target.value.trim() || null;
                if (v !== s.lore) save({ lore: v });
              }}
            />
          </label>
          {err && <p className="text-xs text-[var(--danger)]">{err}</p>}
        </div>
      )}
    </div>
  );
}

export default function StarsEditor({ stars }: { stars: Star[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return stars;
    return stars.filter(
      (s) => s.name.toLowerCase().includes(q) || s.skillKeys.some((k) => k.toLowerCase().includes(q))
    );
  }, [stars, query]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Jugadores Estrella ({stars.length})</h1>
        <p className="text-sm text-zinc-500 mt-1">Los cambios se guardan al salir de cada campo.</p>
      </div>
      <input
        type="search"
        placeholder="Buscar estrella o habilidad…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="input"
      />
      {query && (
        <p className="text-sm text-zinc-500 -mt-2">
          {filtered.length} estrella(s) para &ldquo;{query}&rdquo;
        </p>
      )}
      <div className="space-y-2">
        {filtered.map((star) => (
          <StarCard key={star.id} star={star} />
        ))}
      </div>
    </div>
  );
}
