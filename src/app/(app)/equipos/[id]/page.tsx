import { notFound } from "next/navigation";
import { requireUser } from "@/server/auth/requireUser";
import { prisma } from "@/server/db/prisma";
import TeamBuilder from "./TeamBuilder";

export default async function TeamPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const dbUser = await requireUser();

  const team = await prisma.managedTeam.findUnique({
    where: { id },
    include: { players: { include: { skills: true }, orderBy: { number: "asc" } } },
  });
  if (!team || team.ownerId !== dbUser.id) notFound();

  const [race, skills, traits, allStars] = await Promise.all([
    prisma.masterRace.findUnique({
      where: { key: team.rosterKey },
      include: { positions: { orderBy: { sortOrder: "asc" } } },
    }),
    prisma.masterSkill.findMany({ select: { key: true, name: true, description: true, isElite: true, category: true } }),
    prisma.masterTrait.findMany({ select: { name: true, description: true } }),
    prisma.masterStarPlayer.findMany({ orderBy: { name: "asc" } }),
  ]);
  if (!race) notFound();

  // Regla "plays for": la Estrella juega para cualquier equipo, o comparte
  // al menos una liga con la raza de este equipo.
  const stars = allStars.filter((s) => s.playsForAny || s.leagues.some((l) => race.leagues.includes(l)));

  return <TeamBuilder team={team} race={race} skills={skills} traits={traits} stars={stars} />;
}
