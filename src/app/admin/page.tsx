import Link from "next/link";
import { prisma } from "@/server/db/prisma";

export default async function AdminHome() {
  const [
    skillCount,
    traitCount,
    raceCount,
    positionCount,
    starCount,
    weatherCount,
    kickoffCount,
    injuryCount,
    matchStepCount,
    guideSectionCount,
  ] = await Promise.all([
    prisma.masterSkill.count(),
    prisma.masterTrait.count(),
    prisma.masterRace.count(),
    prisma.masterPosition.count(),
    prisma.masterStarPlayer.count(),
    prisma.masterWeatherEntry.count(),
    prisma.masterKickoffEntry.count(),
    prisma.masterInjuryEntry.count(),
    prisma.masterMatchStep.count(),
    prisma.masterGuideSection.count(),
  ]);

  const cards = [
    { href: "/admin/skills", label: "Habilidades", count: skillCount },
    { href: "/admin/traits", label: "Rasgos", count: traitCount },
    { href: "/admin/races", label: "Razas", count: raceCount },
    { href: "/admin/races", label: "Puestos", count: positionCount },
    { href: "/admin/stars", label: "Jugadores Estrella", count: starCount },
    { href: "/admin/tables", label: "Clima", count: weatherCount },
    { href: "/admin/tables", label: "Patada Inicial", count: kickoffCount },
    { href: "/admin/tables", label: "Lesiones D16", count: injuryCount },
    { href: "/admin/partido", label: "Pasos de Secuencia de Partido", count: matchStepCount },
    { href: "/admin/guia", label: "Tarjetas de la Guía", count: guideSectionCount },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Panel de Admin</h1>
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-4 hover:border-zinc-400 dark:hover:border-zinc-600"
          >
            <div className="text-2xl font-bold">{card.count}</div>
            <div className="text-zinc-500 text-sm">{card.label}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
