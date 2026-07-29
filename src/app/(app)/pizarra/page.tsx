import Link from "next/link";
import { requireUser } from "@/server/auth/requireUser";
import { prisma } from "@/server/db/prisma";
import EmptyState from "@/components/EmptyState";

export default async function PizarraPage() {
  const dbUser = await requireUser();

  const teams = await prisma.managedTeam.findMany({
    where: { ownerId: dbUser.id, isGuest: false },
    include: { _count: { select: { tacticalPlays: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 px-6 py-10">
      <header>
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--gold)" }}>
          Pizarra Táctica
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--ink-3)" }}>
          Elige un equipo para dibujar formaciones con sus jugadores reales y guardar jugadas.
        </p>
      </header>

      {teams.length === 0 ? (
        <EmptyState
          title="Todavía no tienes ningún equipo"
          description="Funda tu primer equipo para poder usar la Pizarra con tus jugadores reales."
          actionLabel="Fundar equipo"
          actionHref="/equipos"
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {teams.map((team) => (
            <Link
              key={team.id}
              href={`/pizarra/${team.id}`}
              className="rounded-[3px] border p-4 transition-colors hover:border-[var(--gold-soft)]"
              style={{ borderColor: "var(--border)", background: "var(--surface-1)" }}
            >
              <p className="font-semibold">{team.name}</p>
              <p className="text-sm" style={{ color: "var(--ink-3)" }}>
                {team._count.tacticalPlays} jugada(s) guardada(s)
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
