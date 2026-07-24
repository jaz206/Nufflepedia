import Link from "next/link";
import { requireUser } from "@/server/auth/requireUser";
import { prisma } from "@/server/db/prisma";
import EmptyState from "@/components/EmptyState";

const STATUS_LABEL: Record<string, string> = {
  OPEN: "Abierta",
  IN_PROGRESS: "En curso",
  FINISHED: "Finalizada",
};
const STATUS_TOKEN: Record<string, string> = {
  OPEN: "var(--ok)",
  IN_PROGRESS: "var(--warn)",
  FINISHED: "var(--ink-3)",
};

export default async function CompeticionesPage() {
  const dbUser = await requireUser();

  const [myEntries, myCommissioned, discoverable] = await Promise.all([
    prisma.competitionEntry.findMany({
      where: { ownerId: dbUser.id },
      include: { competition: { include: { _count: { select: { entries: true } } } } },
      orderBy: { competition: { createdAt: "desc" } },
    }),
    prisma.competition.findMany({
      where: { commissionerId: dbUser.id },
      include: { _count: { select: { entries: true } } },
      orderBy: { createdAt: "desc" },
    }),
    // Todas las públicas ajenas, sin filtrar por estado — una liga "En
    // curso" o "Finalizada" sigue siendo interesante de ver (aunque ya no
    // se pueda unir a ella); joinCompetition() bloquea igualmente la
    // inscripción si no está Abierta.
    prisma.competition.findMany({
      where: { visibility: "PUBLIC", commissionerId: { not: dbUser.id } },
      include: { _count: { select: { entries: true } } },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);

  const myCompIds = new Set(myEntries.map((e) => e.competitionId));
  const commissionedNotEntered = myCommissioned.filter((c) => !myCompIds.has(c.id));
  const discover = discoverable.filter((c) => !myCompIds.has(c.id) && !commissionedNotEntered.some((m) => m.id === c.id));

  // Con varios equipos propios inscritos en la misma competición (torneo
  // casero con varios equipos de un usuario), myEntries trae una fila por
  // equipo — hay que deduplicar por competición o salen claves repetidas.
  const seenCompIds = new Set<string>();
  const myCompetitions = [...myEntries.map((e) => e.competition), ...commissionedNotEntered].filter((c) => {
    if (seenCompIds.has(c.id)) return false;
    seenCompIds.add(c.id);
    return true;
  });
  const myActive = myCompetitions.filter((c) => c.status !== "FINISHED");
  const myFinished = myCompetitions.filter((c) => c.status === "FINISHED");

  return (
    <div className="mx-auto w-full max-w-5xl space-y-10 px-6 py-10">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Competiciones</h1>
          <p className="mt-1 text-sm" style={{ color: "var(--ink-3)" }}>
            La Arena — ligas y torneos.
          </p>
        </div>
        <Link href="/competiciones/nueva" className="btn-primary">
          Crear competición
        </Link>
      </header>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Mis ligas</h2>
        {myActive.length === 0 ? (
          <EmptyState
            title="No participas en ninguna competición activa"
            description="Crea la tuya o únete a una liga pública abierta."
            actionLabel="Crear mi primera liga"
            actionHref="/competiciones/nueva"
          />
        ) : (
          <div className="grid gap-2 sm:grid-cols-2">
            {myActive.map((comp) => (
              <Link
                key={comp.id}
                href={`/competiciones/${comp.id}`}
                className="rounded-[3px] border p-4 transition-colors"
                style={{ borderColor: "var(--border)", background: "var(--surface-1)" }}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold">{comp.name}</p>
                  <span
                    className="rounded-full px-2 py-0.5 text-xs font-medium"
                    style={{ color: STATUS_TOKEN[comp.status], background: "var(--surface-2)" }}
                  >
                    {STATUS_LABEL[comp.status]}
                  </span>
                </div>
                <p className="text-sm" style={{ color: "var(--ink-3)" }}>
                  {comp._count.entries}/{comp.maxTeams} equipos · {comp.visibility === "PUBLIC" ? "Pública" : "Privada"}
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>

      {myFinished.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-semibold">Histórico</h2>
          <p className="mb-3 text-xs" style={{ color: "var(--ink-3)" }}>
            Competiciones finalizadas en las que has participado o que has organizado.
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {myFinished.map((comp) => (
              <Link
                key={comp.id}
                href={`/competiciones/${comp.id}`}
                className="rounded-[3px] border p-4 opacity-80 transition-colors hover:opacity-100"
                style={{ borderColor: "var(--border)", background: "var(--surface-1)" }}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold">{comp.name}</p>
                  <span
                    className="rounded-full px-2 py-0.5 text-xs font-medium"
                    style={{ color: STATUS_TOKEN[comp.status], background: "var(--surface-2)" }}
                  >
                    {STATUS_LABEL[comp.status]}
                  </span>
                </div>
                <p className="text-sm" style={{ color: "var(--ink-3)" }}>
                  {comp._count.entries}/{comp.maxTeams} equipos · {comp.visibility === "PUBLIC" ? "Pública" : "Privada"}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-3 text-lg font-semibold">Descubrir ligas públicas</h2>
        {discover.length === 0 ? (
          <p className="text-sm" style={{ color: "var(--ink-3)" }}>
            No hay ninguna otra liga pública todavía.
          </p>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2">
            {discover.map((comp) => (
              <Link
                key={comp.id}
                href={`/competiciones/${comp.id}`}
                className="rounded-[3px] border p-4 transition-colors"
                style={{ borderColor: "var(--border)", background: "var(--surface-1)" }}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold">{comp.name}</p>
                  <span
                    className="rounded-full px-2 py-0.5 text-xs font-medium"
                    style={{ color: STATUS_TOKEN[comp.status], background: "var(--surface-2)" }}
                  >
                    {STATUS_LABEL[comp.status]}
                  </span>
                </div>
                <p className="text-sm" style={{ color: "var(--ink-3)" }}>
                  {comp._count.entries}/{comp.maxTeams} equipos
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
