import { notFound } from "next/navigation";
import { prisma } from "@/server/db/prisma";
import { computeStandings } from "@/lib/presentialStandings";
import LiveRefresh from "./LiveRefresh";

const STATUS_LABEL: Record<string, string> = {
  SETUP: "Todavía no ha empezado",
  IN_PROGRESS: "En curso",
  FINISHED: "Finalizado",
};

export default async function LiveTournamentScreen({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const tournament = await prisma.presentialTournament.findUnique({
    where: { publicSlug: slug },
    include: {
      entrants: true,
      rounds: { orderBy: { number: "asc" }, include: { matches: { orderBy: { tableNumber: "asc" } } } },
    },
  });
  if (!tournament) notFound();

  const entrantById = new Map(tournament.entrants.map((e) => [e.id, e]));
  const allMatches = tournament.rounds.flatMap((r) => r.matches);
  const standings = computeStandings(
    tournament.entrants.map((e) => e.id),
    allMatches,
    { pointsWin: tournament.pointsWin, pointsDraw: tournament.pointsDraw, pointsLoss: tournament.pointsLoss }
  ).map((s) => ({ ...s, name: entrantById.get(s.entrantId)?.displayName ?? "?" }));

  const currentRound = tournament.rounds.find((r) => r.number === tournament.currentRound);

  return (
    <div className="mx-auto w-full max-w-5xl space-y-10 px-8 py-12">
      <LiveRefresh />
      <header className="text-center">
        <h1 className="text-4xl font-bold tracking-tight">{tournament.name}</h1>
        <p className="mt-2 text-lg" style={{ color: "var(--ink-3)" }}>
          {STATUS_LABEL[tournament.status]}
          {tournament.status !== "SETUP" && ` · Ronda ${tournament.currentRound}/${tournament.totalRounds}`}
        </p>
      </header>

      <div className="grid gap-10 lg:grid-cols-2">
        {currentRound && (
          <section>
            <h2 className="mb-4 text-2xl font-semibold">Ronda {currentRound.number}</h2>
            <div className="grid gap-2">
              {currentRound.matches.map((m) => {
                const a = entrantById.get(m.entrantAId);
                const b = m.entrantBId ? entrantById.get(m.entrantBId) : null;
                return (
                  <div
                    key={m.id}
                    className="flex items-center justify-between rounded-[3px] border px-4 py-3 text-lg"
                    style={{ borderColor: "var(--border)", background: "var(--surface-1)" }}
                  >
                    <span className="font-mono text-sm" style={{ color: "var(--gold)" }}>
                      Mesa {m.tableNumber}
                    </span>
                    {b ? (
                      <span className="flex-1 px-4 text-center">
                        {a?.displayName} {m.reported ? <strong>{m.scoreA} — {m.scoreB}</strong> : <span style={{ color: "var(--ink-3)" }}>vs</span>} {b.displayName}
                      </span>
                    ) : (
                      <span className="flex-1 px-4 text-center">{a?.displayName} — Bye</span>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        <section>
          <h2 className="mb-4 text-2xl font-semibold">Clasificación</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-base">
              <thead>
                <tr className="border-b" style={{ borderColor: "var(--border-strong)" }}>
                  <th className="px-2 py-2 text-left">#</th>
                  <th className="px-2 py-2 text-left">Entrenador</th>
                  <th className="px-2 py-2 text-right">TD +/-</th>
                  <th className="px-2 py-2 text-right font-semibold">Pts</th>
                </tr>
              </thead>
              <tbody>
                {standings.map((s, i) => (
                  <tr key={s.entrantId} className="border-b" style={{ borderColor: "var(--border)" }}>
                    <td className="px-2 py-2" style={{ color: "var(--ink-3)" }}>{i + 1}</td>
                    <td className="px-2 py-2 font-medium">{s.name}</td>
                    <td className="px-2 py-2 text-right font-mono">{s.tdFor}-{s.tdAgainst}</td>
                    <td className="px-2 py-2 text-right font-mono font-semibold" style={{ color: "var(--gold)" }}>{s.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
