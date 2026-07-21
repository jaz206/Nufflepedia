import { prisma } from "@/server/db/prisma";
import RacesEditor from "./RacesEditor";

export default async function AdminRacesPage() {
  const races = await prisma.masterRace.findMany({
    orderBy: { sortOrder: "asc" },
    include: { positions: { orderBy: { sortOrder: "asc" } } },
  });

  return (
    <RacesEditor
      races={races.map((r) => ({
        id: r.id,
        key: r.key,
        name: r.name,
        pageRef: r.pageRef,
        tier: r.tier,
        leagues: r.leagues,
        specialRules: r.specialRules,
        rerollCost: r.rerollCost,
        rerollMax: r.rerollMax,
        allowsApothecary: r.allowsApothecary,
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
  );
}
