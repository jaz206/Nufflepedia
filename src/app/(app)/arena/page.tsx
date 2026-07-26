import Link from "next/link";
import { requireUser } from "@/server/auth/requireUser";
import { prisma } from "@/server/db/prisma";
import EmptyState from "@/components/EmptyState";

const STATUS_LABEL: Record<string, string> = {
  PRE_MATCH: "Preparando",
  IN_PROGRESS: "En curso",
  FINISHED: "Finalizado",
};
const STATUS_TOKEN: Record<string, string> = {
  PRE_MATCH: "var(--ink-3)",
  IN_PROGRESS: "var(--warn)",
  FINISHED: "var(--ok)",
};

export default async function ArenaPage() {
  const dbUser = await requireUser();

  const matches = await prisma.liveMatch.findMany({
    where: { createdById: dbUser.id },
    include: { homeEntry: true, awayEntry: true },
    orderBy: { createdAt: "desc" },
    take: 30,
  });

  const active = matches.filter((m) => m.status !== "FINISHED");
  const finished = matches.filter((m) => m.status === "FINISHED");

  return (
    <div className="mx-auto w-full max-w-4xl space-y-10 px-6 py-10">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Arena</h1>
          <p className="mt-1 text-sm" style={{ color: "var(--ink-3)" }}>
            Asistente de Partido en vivo — amistosos con tus equipos, con los de un amigo, o con un rival creado al vuelo.
          </p>
        </div>
        <Link href="/arena/nuevo" className="btn-primary">
          Nuevo partido
        </Link>
      </header>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Partidos activos</h2>
        {active.length === 0 ? (
          <EmptyState
            title="No tienes ningún partido en marcha"
            description="Crea un amistoso y lleva el marcador, las bajas y los cambios en vivo mientras jugáis."
            actionLabel="Nuevo partido"
            actionHref="/arena/nuevo"
          />
        ) : (
          <div className="grid gap-2 sm:grid-cols-2">
            {active.map((m) => (
              <Link
                key={m.id}
                href={`/arena/${m.id}`}
                className="rounded-[3px] border p-4 transition-colors"
                style={{ borderColor: "var(--border)", background: "var(--surface-1)" }}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold">
                    {m.homeEntry.teamName} <span style={{ color: "var(--ink-3)" }}>vs</span> {m.awayEntry.teamName}
                  </p>
                  <span
                    className="rounded-full px-2 py-0.5 text-xs font-medium"
                    style={{ color: STATUS_TOKEN[m.status], background: "var(--surface-2)" }}
                  >
                    {STATUS_LABEL[m.status]}
                  </span>
                </div>
                {m.status === "IN_PROGRESS" && (
                  <p className="mt-1 font-mono text-sm" style={{ color: "var(--gold)" }}>
                    {m.homeScore} — {m.awayScore}
                  </p>
                )}
              </Link>
            ))}
          </div>
        )}
      </section>

      {finished.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-semibold">Histórico de amistosos</h2>
          <div className="grid gap-2 sm:grid-cols-2">
            {finished.map((m) => (
              <Link
                key={m.id}
                href={`/arena/${m.id}`}
                className="rounded-[3px] border p-4 opacity-80 transition-colors hover:opacity-100"
                style={{ borderColor: "var(--border)", background: "var(--surface-1)" }}
              >
                <p className="font-semibold">
                  {m.homeEntry.teamName} <span style={{ color: "var(--ink-3)" }}>vs</span> {m.awayEntry.teamName}
                </p>
                <p className="font-mono text-sm" style={{ color: "var(--ink-3)" }}>
                  {m.homeScore} — {m.awayScore}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      <p className="text-sm" style={{ color: "var(--ink-3)" }}>
        ¿No recuerdas algún paso del reglamento? La{" "}
        <Link href="/nufflepedia/partido" className="underline">
          chuleta de la Secuencia de Partido
        </Link>{" "}
        sigue disponible en La Biblioteca.
      </p>
    </div>
  );
}
