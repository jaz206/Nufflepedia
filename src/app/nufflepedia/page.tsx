import Link from "next/link";
import { prisma } from "@/server/db/prisma";
import NufflepediaBrowser from "./NufflepediaBrowser";

export default async function NufflepediaPage() {
  const [skills, traits, raceCount, starCount] = await Promise.all([
    prisma.masterSkill.findMany({ orderBy: { name: "asc" } }),
    prisma.masterTrait.findMany({ orderBy: { name: "asc" } }),
    prisma.masterRace.count(),
    prisma.masterStarPlayer.count(),
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
          <Link
            href="/nufflepedia/tablas"
            className="inline-block rounded-md border border-zinc-300 dark:border-zinc-700 px-4 py-2 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-900"
          >
            Ver las Tablas de juego →
          </Link>
        </div>
      </div>

      <NufflepediaBrowser skills={skills} traits={traits} />
    </div>
  );
}
