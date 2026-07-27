import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requireUser } from "@/server/auth/requireUser";
import { prisma } from "@/server/db/prisma";

const KIND_LABEL: Record<string, string> = {
  ROUND: "Jornada",
  GROUP_STAGE: "Fase de grupos",
  KNOCKOUT_ROUND: "Eliminatoria",
};

export default async function BalonazoListPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const dbUser = await requireUser();

  const competition = await prisma.competition.findUnique({
    where: { id },
    include: { entries: { select: { ownerId: true } } },
  });
  if (!competition) notFound();

  const isParticipant = competition.entries.some((e) => e.ownerId === dbUser.id);
  const isCommissioner = competition.commissionerId === dbUser.id;
  if (!isParticipant && !isCommissioner) redirect(`/competiciones/${id}`);

  const issues = await prisma.magazineIssue.findMany({
    where: { competitionId: id },
    orderBy: { issueNumber: "desc" },
  });

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 px-6 py-10">
      <div>
        <p className="text-xs" style={{ color: "var(--ink-3)" }}>
          <Link href={`/competiciones/${id}`} className="hover:underline">
            ← {competition.name}
          </Link>
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight" style={{ color: "var(--gold)" }}>
          📰 Balonazo Sangriento
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--ink-3)" }}>
          La revista de esta competición, generada sola al terminar cada jornada o fase.
        </p>
      </div>

      {issues.length === 0 ? (
        <p className="text-sm" style={{ color: "var(--ink-3)" }}>
          Todavía no ha salido ningún número — aparecerá aquí en cuanto se termine la primera jornada
          (o fase, si es un torneo).
        </p>
      ) : (
        <div className="grid gap-3">
          {issues.map((issue) => (
            <Link
              key={issue.id}
              href={`/competiciones/${id}/balonazo/${issue.id}`}
              className="rounded-[3px] border p-4 hover:border-[var(--gold-soft)]"
              style={{ borderColor: "var(--border)", background: "var(--surface-1)" }}
            >
              <div className="flex items-baseline justify-between gap-2">
                <span className="font-semibold">Nº {issue.issueNumber}</span>
                <span className="font-mono text-[10px] uppercase tracking-widest" style={{ color: "var(--ink-3)" }}>
                  {KIND_LABEL[issue.kind] ?? issue.kind}
                </span>
              </div>
              <p className="mt-1 text-sm" style={{ color: "var(--ink-2)" }}>
                {issue.label}
              </p>
              <p className="mt-1 truncate text-xs" style={{ color: "var(--ink-3)" }}>
                {issue.featuredMatchTitle}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
