import { requireUser } from "@/server/auth/requireUser";
import { prisma } from "@/server/db/prisma";
import NewFriendlyForm from "./NewFriendlyForm";

export default async function NewFriendlyPage() {
  const dbUser = await requireUser();

  const [myTeams, myGuestTeams, races] = await Promise.all([
    prisma.managedTeam.findMany({ where: { ownerId: dbUser.id, isGuest: false }, orderBy: { createdAt: "desc" } }),
    prisma.managedTeam.findMany({ where: { ownerId: dbUser.id, isGuest: true }, orderBy: { createdAt: "desc" } }),
    prisma.masterRace.findMany({ select: { key: true, name: true }, orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6 px-6 py-10">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Nuevo partido amistoso</h1>
        <p className="mt-1 text-sm" style={{ color: "var(--ink-3)" }}>
          Elige tu equipo y el rival — puede ser otro equipo tuyo, el de un amigo con cuenta, o uno que crees al vuelo.
        </p>
      </header>
      <NewFriendlyForm myTeams={myTeams} myGuestTeams={myGuestTeams} races={races} />
    </div>
  );
}
