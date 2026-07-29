import { prisma } from "@/server/db/prisma";
import RazasBrowser from "./RazasBrowser";

export default async function RazasPage() {
  const races = await prisma.masterRace.findMany({
    orderBy: { name: "asc" },
    include: { positions: { orderBy: { sortOrder: "asc" } } },
  });

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight" style={{ color: "var(--gold)" }}>
          Razas
        </h1>
        <p className="mt-2" style={{ color: "var(--ink-3)" }}>
          Las {races.length} plantillas oficiales de la Temporada 3, con costes, límites,
          atributos y acceso a habilidades.
        </p>
      </div>
      <RazasBrowser
        races={races.map((r) => ({
          id: r.id,
          name: r.name,
          leagues: r.leagues,
          specialRules: r.specialRules,
          rerollCost: r.rerollCost,
          rerollMax: r.rerollMax,
          allowsApothecary: r.allowsApothecary,
          tier: r.tier,
          playstyle: r.playstyle,
          positions: r.positions.map((p) => ({
            id: p.id,
            name: p.name,
            playerTags: p.playerTags,
            quantityMin: p.quantityMin,
            quantityMax: p.quantityMax,
            cost: p.cost,
            ma: p.ma,
            st: p.st,
            ag: p.ag,
            pa: p.pa,
            av: p.av,
            startingSkillKeys: p.startingSkillKeys,
            primaryCategories: p.primaryCategories,
            secondaryCategories: p.secondaryCategories,
          })),
        }))}
      />
    </div>
  );
}
