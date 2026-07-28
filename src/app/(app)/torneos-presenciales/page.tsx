import Link from "next/link";
import { requireUser } from "@/server/auth/requireUser";
import { prisma } from "@/server/db/prisma";
import EmptyState from "@/components/EmptyState";

const STATUS_LABEL: Record<string, string> = {
  SETUP: "En preparación",
  IN_PROGRESS: "En curso",
  FINISHED: "Finalizado",
};

export default async function PresentialTournamentsPage() {
  const dbUser = await requireUser();

  const tournaments = await prisma.presentialTournament.findMany({
    where: { commissionerId: dbUser.id },
    include: { _count: { select: { entrants: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 px-6 py-10">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Torneos Presenciales</h1>
          <p className="mt-1 text-sm" style={{ color: "var(--ink-3)" }}>
            Para un evento de un día con muchas mesas a la vez: emparejamiento suizo, resultados
            centralizados y pantalla pública para proyectar.
          </p>
        </div>
        <Link href="/torneos-presenciales/nuevo" className="btn-primary">
          Nuevo torneo
        </Link>
      </header>

      {tournaments.length === 0 ? (
        <EmptyState
          title="Todavía no has organizado ningún torneo presencial"
          description="Crea uno para empezar a inscribir jugadores."
          actionLabel="Crear torneo"
          actionHref="/torneos-presenciales/nuevo"
        />
      ) : (
        <div className="grid gap-2">
          {tournaments.map((t) => (
            <Link
              key={t.id}
              href={`/torneos-presenciales/${t.id}`}
              className="flex items-center justify-between rounded-[3px] border px-4 py-3 transition-colors hover:border-[var(--gold-soft)]"
              style={{ borderColor: "var(--border)", background: "var(--surface-1)" }}
            >
              <div>
                <p className="font-semibold">{t.name}</p>
                <p className="text-sm" style={{ color: "var(--ink-3)" }}>
                  {t._count.entrants} inscritos · Ronda {t.currentRound}/{t.totalRounds}
                </p>
              </div>
              <span className="rounded-full px-2 py-1 text-xs font-medium" style={{ background: "var(--surface-2)", color: "var(--ink-2)" }}>
                {STATUS_LABEL[t.status]}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
