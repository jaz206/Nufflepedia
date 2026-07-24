import { requireUser } from "@/server/auth/requireUser";
import { prisma } from "@/server/db/prisma";
import NewTeamForm from "./NewTeamForm";

export default async function NuevoEquipoPage() {
  await requireUser();

  const races = await prisma.masterRace.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: { key: true, name: true, tier: true, leagues: true, rerollCost: true },
  });

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 px-6 py-10">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Fundar nueva franquicia</h1>
        <p className="mt-1 text-sm" style={{ color: "var(--ink-3)" }}>
          Elige raza y bautiza tu equipo. Empiezas con 1.000.000 MO para reclutar.
        </p>
      </header>
      <NewTeamForm races={races} />
    </div>
  );
}
