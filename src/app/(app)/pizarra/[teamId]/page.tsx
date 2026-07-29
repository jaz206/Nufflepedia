import { notFound, redirect } from "next/navigation";
import { requireUser } from "@/server/auth/requireUser";
import { prisma } from "@/server/db/prisma";
import TacticalBoard from "./TacticalBoard";

export default async function PizarraTeamPage({ params }: { params: Promise<{ teamId: string }> }) {
  const { teamId } = await params;
  const dbUser = await requireUser();

  const team = await prisma.managedTeam.findUnique({
    where: { id: teamId },
    include: {
      players: { orderBy: { number: "asc" } },
      tacticalPlays: {
        orderBy: { updatedAt: "desc" },
        include: { tokens: true },
      },
    },
  });
  if (!team) notFound();
  if (team.ownerId !== dbUser.id) redirect("/pizarra");

  return (
    <TacticalBoard
      team={{ id: team.id, name: team.name }}
      roster={team.players.map((p) => ({ id: p.id, number: p.number, customName: p.customName }))}
      plays={team.tacticalPlays.map((play) => ({
        id: play.id,
        name: play.name,
        description: play.description,
        tokens: play.tokens.map((t) => ({
          playerId: t.playerId,
          side: t.side as "mine" | "opponent",
          x: t.x,
          y: t.y,
          label: t.label,
        })),
      }))}
    />
  );
}
