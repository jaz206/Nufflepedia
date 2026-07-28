import { notFound, redirect } from "next/navigation";
import { requireUser } from "@/server/auth/requireUser";
import { prisma } from "@/server/db/prisma";
import { computeStandings } from "@/lib/presentialStandings";
import PresentialTournamentDetail from "./PresentialTournamentDetail";

export default async function PresentialTournamentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const dbUser = await requireUser();

  const tournament = await prisma.presentialTournament.findUnique({
    where: { id },
    include: {
      entrants: { orderBy: { createdAt: "asc" } },
      rounds: {
        orderBy: { number: "asc" },
        include: { matches: { orderBy: { tableNumber: "asc" } } },
      },
    },
  });
  if (!tournament) notFound();
  if (tournament.commissionerId !== dbUser.id) redirect("/torneos-presenciales");

  const allMatches = tournament.rounds.flatMap((r) => r.matches);
  const standings = computeStandings(
    tournament.entrants.map((e) => e.id),
    allMatches,
    { pointsWin: tournament.pointsWin, pointsDraw: tournament.pointsDraw, pointsLoss: tournament.pointsLoss }
  );
  const entrantById = new Map(tournament.entrants.map((e) => [e.id, e]));

  return (
    <PresentialTournamentDetail
      tournament={{
        id: tournament.id,
        name: tournament.name,
        status: tournament.status,
        totalRounds: tournament.totalRounds,
        currentRound: tournament.currentRound,
        pointsWin: tournament.pointsWin,
        pointsDraw: tournament.pointsDraw,
        pointsLoss: tournament.pointsLoss,
        publicSlug: tournament.publicSlug,
      }}
      entrants={tournament.entrants.map((e) => ({ id: e.id, displayName: e.displayName, teamName: e.teamName, raceName: e.raceName, dropped: e.dropped }))}
      rounds={tournament.rounds.map((r) => ({
        number: r.number,
        matches: r.matches.map((m) => ({
          id: m.id,
          tableNumber: m.tableNumber,
          entrantAName: entrantById.get(m.entrantAId)?.displayName ?? "?",
          entrantBName: m.entrantBId ? (entrantById.get(m.entrantBId)?.displayName ?? "?") : null,
          scoreA: m.scoreA,
          scoreB: m.scoreB,
          casA: m.casA,
          casB: m.casB,
          reported: m.reported,
        })),
      }))}
      standings={standings.map((s) => ({ ...s, entrantName: entrantById.get(s.entrantId)?.displayName ?? "?" }))}
    />
  );
}
