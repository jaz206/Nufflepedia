import Link from "next/link";
import { prisma } from "@/server/db/prisma";
import NufflepediaBrowser from "./NufflepediaBrowser";

export default async function NufflepediaPage() {
  const [skills, traits, raceCount, starCount, weather, kickoff, prayers, injury, inducements, specialRules] = await Promise.all([
    prisma.masterSkill.findMany({ orderBy: { name: "asc" } }),
    prisma.masterTrait.findMany({ orderBy: { name: "asc" } }),
    prisma.masterRace.count(),
    prisma.masterStarPlayer.count(),
    prisma.masterWeatherEntry.findMany({ orderBy: { minRoll: "asc" } }),
    prisma.masterKickoffEntry.findMany({ orderBy: { roll: "asc" } }),
    prisma.masterPrayerEntry.findMany({ orderBy: { roll: "asc" } }),
    prisma.masterInjuryEntry.findMany({ orderBy: { minRoll: "asc" } }),
    prisma.masterInducement.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.masterSpecialRule.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="mx-auto max-w-4xl px-6 py-16 space-y-16">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Nufflepedia</h1>
        <p className="mt-2 text-zinc-500">
          Motor de reglas Season 3 — {skills.length} habilidades, {traits.length} rasgos.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href="/nufflepedia/razas"
            className="inline-block rounded-md border border-zinc-300 dark:border-zinc-700 px-4 py-2 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-900"
          >
            Ver las {raceCount} razas →
          </Link>
          <Link
            href="/nufflepedia/estrellas"
            className="inline-block rounded-md border border-zinc-300 dark:border-zinc-700 px-4 py-2 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-900"
          >
            Ver los {starCount} Jugadores Estrella →
          </Link>
          <Link
            href="/nufflepedia/partido"
            className="inline-block rounded-md border border-zinc-300 dark:border-zinc-700 px-4 py-2 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-900"
          >
            Secuencia de Partido →
          </Link>
        </div>
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
          <div className="sm:col-span-2">
            <h3 className="text-lg font-semibold border-b border-zinc-200 dark:border-zinc-800 pb-2 mb-3">Incentivos</h3>
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
            <h3 className="text-lg font-semibold border-b border-zinc-200 dark:border-zinc-800 pb-2 mb-3">
              Reglas especiales de equipo
            </h3>
            <ul className="space-y-2 text-sm">
              {specialRules.map((r) => (
                <li key={r.id}>
                  <strong>{r.name}</strong> — {r.description}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
