import { prisma } from "@/server/db/prisma";

export default async function TablasPage() {
  const [weather, kickoff, prayers, injury, inducements, specialRules, playerStates] = await Promise.all([
    prisma.masterWeatherEntry.findMany({ orderBy: { minRoll: "asc" } }),
    prisma.masterKickoffEntry.findMany({ orderBy: { roll: "asc" } }),
    prisma.masterPrayerEntry.findMany({ orderBy: { roll: "asc" } }),
    prisma.masterInjuryEntry.findMany({ orderBy: { minRoll: "asc" } }),
    prisma.masterInducement.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.masterSpecialRule.findMany({ orderBy: { name: "asc" } }),
    prisma.masterPlayerState.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight">Tablas</h1>
        <p className="mt-2 text-zinc-500">
          Todas las tablas de juego oficiales de la Temporada 3, en un solo sitio.
        </p>
      </div>

      <div className="grid gap-8 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <h2 className="text-lg font-semibold border-b border-zinc-200 dark:border-zinc-800 pb-2 mb-3">Estados de un jugador</h2>
          <p className="mb-3 text-xs text-zinc-500">
            No son ni habilidades ni rasgos — son los 4 estados en los que puede estar un jugador durante un partido.
          </p>
          <ul className="space-y-2 text-sm">
            {playerStates.map((s) => (
              <li key={s.id} className="flex gap-3">
                <span className="w-40 shrink-0 font-semibold">{s.name}</span>
                <span className="text-zinc-500">{s.description}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="text-lg font-semibold border-b border-zinc-200 dark:border-zinc-800 pb-2 mb-3">Clima (2D6)</h2>
          <ul className="space-y-2 text-sm">
            {weather.map((w) => (
              <li key={w.id} className="flex gap-3">
                <span className="w-12 shrink-0 font-mono text-zinc-400">
                  {w.minRoll === w.maxRoll ? w.minRoll : `${w.minRoll}-${w.maxRoll}`}
                </span>
                <span>
                  <strong>{w.name}</strong> — {w.effect}
                </span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="text-lg font-semibold border-b border-zinc-200 dark:border-zinc-800 pb-2 mb-3">Patada Inicial (2D6)</h2>
          <ul className="space-y-2 text-sm">
            {kickoff.map((k) => (
              <li key={k.id} className="flex gap-3">
                <span className="w-12 shrink-0 font-mono text-zinc-400">{k.roll}</span>
                <span>
                  <strong>{k.name}</strong> — {k.effect}
                </span>
              </li>
            ))}
          </ul>
        </div>
        <div className="sm:col-span-2">
          <h2 className="text-lg font-semibold border-b border-zinc-200 dark:border-zinc-800 pb-2 mb-3">Plegarias a Nuffle (1D16)</h2>
          <ul className="space-y-2 text-sm">
            {prayers.map((p) => (
              <li key={p.id} className="flex gap-3">
                <span className="w-12 shrink-0 font-mono text-zinc-400">{p.roll}</span>
                <span>
                  <strong>{p.name}</strong> — {p.effect}
                </span>
              </li>
            ))}
          </ul>
        </div>
        <div className="sm:col-span-2">
          <h2 className="text-lg font-semibold border-b border-zinc-200 dark:border-zinc-800 pb-2 mb-3">Lesiones graves (1D16)</h2>
          <ul className="space-y-2 text-sm">
            {injury.map((i) => (
              <li key={i.id} className="flex gap-3">
                <span className="w-16 shrink-0 font-mono text-zinc-400">
                  {i.minRoll === i.maxRoll ? i.minRoll : `${i.minRoll}-${i.maxRoll}`}
                </span>
                <span>
                  <strong>{i.name}</strong>
                  {i.isDeath && " · Muerte"}
                  {i.permanentStatLoss && " · Pérdida de atributo"}
                  {i.missesNextGame && !i.isDeath && " · Falta el siguiente partido"}
                </span>
              </li>
            ))}
          </ul>
        </div>
        <div className="sm:col-span-2">
          <h2 className="text-lg font-semibold border-b border-zinc-200 dark:border-zinc-800 pb-2 mb-3">Incentivos</h2>
          <p className="mb-3 text-xs text-zinc-500">
            Se adquieren gastando M.O. antes del partido (tesorería en ligas, presupuesto de fichajes en partidos
            equilibrados/exhibición).
          </p>
          <ul className="space-y-2 text-sm">
            {inducements.map((ind) => (
              <li key={ind.id} className="flex gap-3">
                <span className="w-28 shrink-0 font-mono text-xs text-zinc-400">
                  0-{ind.maxCount} · {ind.cost !== null ? `${ind.cost.toLocaleString("es-ES")} MO` : "variable"}
                </span>
                <span>
                  <strong>{ind.name}</strong>
                  {ind.restriction && <span className="text-zinc-400"> ({ind.restriction})</span>} — {ind.effect}
                </span>
              </li>
            ))}
          </ul>
        </div>
        <div className="sm:col-span-2">
          <h2 className="text-lg font-semibold border-b border-zinc-200 dark:border-zinc-800 pb-2 mb-3">
            Reglas especiales de equipo
          </h2>
          <ul className="space-y-2 text-sm">
            {specialRules.map((r) => (
              <li key={r.id}>
                <strong>{r.name}</strong> — {r.description}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
