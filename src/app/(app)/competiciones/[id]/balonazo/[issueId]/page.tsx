import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requireUser } from "@/server/auth/requireUser";
import { prisma } from "@/server/db/prisma";

interface StandingRow {
  id: string;
  teamName: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  tdFor: number;
  tdAgainst: number;
  casFor: number;
  casAgainst: number;
  points: number;
}

function Paragraphs({ text }: { text: string }) {
  return (
    <>
      {text
        .split(/\n{2,}/)
        .map((p) => p.trim())
        .filter(Boolean)
        .map((p, i) => (
          <p key={i} className="mt-3 text-sm leading-relaxed first:mt-0" style={{ color: "var(--ink-2)" }}>
            {p}
          </p>
        ))}
    </>
  );
}

function SectionCard({ eyebrow, title, children }: { eyebrow: string; title?: string; children: React.ReactNode }) {
  return (
    <article className="rounded-[3px] border" style={{ borderColor: "var(--border)", background: "var(--surface-1)" }}>
      <div
        className="flex items-center justify-between gap-3 rounded-t-[2px] border-b px-4 py-2"
        style={{ borderColor: "var(--border)", background: "var(--surface-2)" }}
      >
        <span className="font-mono text-[10px] uppercase tracking-widest" style={{ color: "var(--gold)" }}>
          {eyebrow}
        </span>
      </div>
      <div className="p-4">
        {title && <h3 className="mb-2 text-lg font-bold leading-tight">{title}</h3>}
        {children}
      </div>
    </article>
  );
}

export default async function BalonazoIssuePage({ params }: { params: Promise<{ id: string; issueId: string }> }) {
  const { id, issueId } = await params;
  const dbUser = await requireUser();

  const competition = await prisma.competition.findUnique({
    where: { id },
    include: { entries: { select: { ownerId: true } } },
  });
  if (!competition) notFound();

  const isParticipant = competition.entries.some((e) => e.ownerId === dbUser.id);
  const isCommissioner = competition.commissionerId === dbUser.id;
  if (!isParticipant && !isCommissioner) redirect(`/competiciones/${id}`);

  const issue = await prisma.magazineIssue.findUnique({ where: { id: issueId } });
  if (!issue || issue.competitionId !== id) notFound();

  const legend = issue.legendStarKey ? await prisma.masterStarPlayer.findUnique({ where: { key: issue.legendStarKey } }) : null;
  const standings = issue.standings as unknown as StandingRow[];

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 px-6 py-10">
      <div>
        <p className="text-xs" style={{ color: "var(--ink-3)" }}>
          <Link href={`/competiciones/${id}/balonazo`} className="hover:underline">
            ← Balonazo Sangriento
          </Link>
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight" style={{ color: "var(--gold)" }}>
          Balonazo Sangriento — Nº {issue.issueNumber}
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--ink-3)" }}>
          {competition.name} · {issue.label}
        </p>
      </div>

      <SectionCard eyebrow="Ronda de noticias">
        <Paragraphs text={issue.newsRoundup} />
      </SectionCard>

      <SectionCard eyebrow="El ojo del Contemplador" title={issue.featuredMatchTitle}>
        <Paragraphs text={issue.featuredMatchBody} />
      </SectionCard>

      <SectionCard eyebrow="El próximo objetivo">
        <Paragraphs text={issue.nextTargetText} />
      </SectionCard>

      <SectionCard eyebrow="Leyendas vivas" title={legend?.name}>
        {legend && (
          <p className="mb-2 font-mono text-xs" style={{ color: "var(--ink-3)" }}>
            {legend.cost.toLocaleString("es-ES")} MO · MO {legend.ma} · FU {legend.st} · AG {legend.ag}+ · PA{" "}
            {legend.pa ? `${legend.pa}+` : "–"} · AR {legend.av}+
          </p>
        )}
        <Paragraphs text={issue.legendText} />
      </SectionCard>

      <SectionCard eyebrow="Tablas y más tablas" title="Clasificación">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b" style={{ borderColor: "var(--border-strong)" }}>
                <th className="px-2 py-2 text-left">#</th>
                <th className="px-2 py-2 text-left">Equipo</th>
                <th className="px-2 py-2 text-right">PJ</th>
                <th className="px-2 py-2 text-right">V</th>
                <th className="px-2 py-2 text-right">E</th>
                <th className="px-2 py-2 text-right">D</th>
                <th className="px-2 py-2 text-right">TD +/-</th>
                <th className="px-2 py-2 text-right">Bajas +/-</th>
                <th className="px-2 py-2 text-right font-semibold">Pts</th>
              </tr>
            </thead>
            <tbody>
              {standings.map((e, i) => (
                <tr key={e.id} className="border-b" style={{ borderColor: "var(--border)" }}>
                  <td className="px-2 py-2" style={{ color: "var(--ink-3)" }}>
                    {i + 1}
                  </td>
                  <td className="px-2 py-2 font-medium">{e.teamName}</td>
                  <td className="px-2 py-2 text-right font-mono">{e.played}</td>
                  <td className="px-2 py-2 text-right font-mono">{e.won}</td>
                  <td className="px-2 py-2 text-right font-mono">{e.drawn}</td>
                  <td className="px-2 py-2 text-right font-mono">{e.lost}</td>
                  <td className="px-2 py-2 text-right font-mono">
                    {e.tdFor}-{e.tdAgainst}
                  </td>
                  <td className="px-2 py-2 text-right font-mono">
                    {e.casFor}-{e.casAgainst}
                  </td>
                  <td className="px-2 py-2 text-right font-mono font-semibold" style={{ color: "var(--gold)" }}>
                    {e.points}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}
