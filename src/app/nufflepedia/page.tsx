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
        <h1 className="text-3xl font-bold tracking-tight" style={{ color: "var(--gold)" }}>
          Nufflepedia
        </h1>
        <p className="mt-2" style={{ color: "var(--ink-3)" }}>
          Motor de reglas Season 3 — {skills.length} habilidades, {traits.length} rasgos.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          {[
            { href: "/nufflepedia/razas", label: `Ver las ${raceCount} razas →` },
            { href: "/nufflepedia/estrellas", label: `Ver los ${starCount} Jugadores Estrella →` },
            { href: "/nufflepedia/partido", label: "Secuencia de Partido →" },
            { href: "/nufflepedia/tablas", label: "Ver las Tablas de juego →" },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="inline-block rounded-[3px] border px-4 py-2 text-sm transition-colors hover:border-[var(--gold-soft)]"
              style={{ borderColor: "var(--border-strong)", background: "var(--surface-1)", color: "var(--ink-2)" }}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>

      <NufflepediaBrowser skills={skills} traits={traits} />
    </div>
  );
}
