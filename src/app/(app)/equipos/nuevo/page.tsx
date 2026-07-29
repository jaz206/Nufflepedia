import { requireUser } from "@/server/auth/requireUser";
import { prisma } from "@/server/db/prisma";
import NewTeamForm from "./NewTeamForm";

export default async function NuevoEquipoPage() {
  await requireUser();

  const races = await prisma.masterRace.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: { positions: { orderBy: { sortOrder: "asc" } } },
  });

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 px-6 py-10">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Fundar nueva franquicia</h1>
        <p className="mt-1 text-sm" style={{ color: "var(--ink-3)" }}>
          Empiezas con 1.000.000 MO para reclutar. Pasa razas con las flechas o la lista, mira
          su ficha al momento y pon el nombre de tu equipo sin bajar la página.
        </p>
      </header>
      <NewTeamForm
        races={races.map((r) => ({
          key: r.key,
          name: r.name,
          tier: r.tier,
          playstyle: r.playstyle,
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
          })),
        }))}
      />
    </div>
  );
}
