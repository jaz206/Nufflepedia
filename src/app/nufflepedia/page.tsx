import { prisma } from "@/server/db/prisma";
import NufflepediaBrowser from "./NufflepediaBrowser";

export default async function NufflepediaPage() {
  const [skills, traits, weather, kickoff, prayers, injury] = await Promise.all([
    prisma.masterSkill.findMany({ orderBy: { name: "asc" } }),
    prisma.masterTrait.findMany({ orderBy: { name: "asc" } }),
    prisma.masterWeatherEntry.findMany({ orderBy: { minRoll: "asc" } }),
    prisma.masterKickoffEntry.findMany({ orderBy: { roll: "asc" } }),
    prisma.masterPrayerEntry.findMany({ orderBy: { roll: "asc" } }),
    prisma.masterInjuryEntry.findMany({ orderBy: { minRoll: "asc" } }),
  ]);

  return (
    <div className="mx-auto max-w-4xl px-6 py-16 space-y-16">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Nufflepedia</h1>
        <p className="mt-2 text-zinc-500">
          Motor de reglas Season 3 — {skills.length} habilidades, {traits.length} rasgos.
        </p>
      </div>

      <NufflepediaBrowser skills={skills} traits={traits} />

      <section>
        <h2 className="text-2xl font-semibold mb-6">Tablas</h2>
        <div className="grid gap-8 sm:grid-cols-2">
          <div>
            <h3 className="text-lg font-semibold border-b border-zinc-200 dark:border-zinc-800 pb-2 mb-3">Clima (2D6)</h3>
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
            <h3 className="text-lg font-semibold border-b border-zinc-200 dark:border-zinc-800 pb-2 mb-3">Patada Inicial (2D6)</h3>
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
            <h3 className="text-lg font-semibold border-b border-zinc-200 dark:border-zinc-800 pb-2 mb-3">Plegarias a Nuffle (1D16)</h3>
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
            <h3 className="text-lg font-semibold border-b border-zinc-200 dark:border-zinc-800 pb-2 mb-3">Lesiones graves (1D16)</h3>
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
        </div>
      </section>
    </div>
  );
}
