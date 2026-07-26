import Link from "next/link";
import { requireUser } from "@/server/auth/requireUser";
import { prisma } from "@/server/db/prisma";
import EmptyState from "@/components/EmptyState";

export default async function EquiposPage() {
  const dbUser = await requireUser();

  const [teams, races] = await Promise.all([
    prisma.managedTeam.findMany({
      where: { ownerId: dbUser.id, isGuest: false },
      include: { players: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.masterRace.findMany({ select: { key: true, name: true } }),
  ]);
  const raceNameByKey = Object.fromEntries(races.map((r) => [r.key, r.name]));

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 px-6 py-10">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Equipos</h1>
          <p className="mt-1 text-sm" style={{ color: "var(--ink-3)" }}>
            El Cuartel — tus franquicias.
          </p>
        </div>
        <Link href="/equipos/nuevo" className="btn-primary">
          Fundar nuevo equipo
        </Link>
      </header>

      {teams.length === 0 ? (
        <EmptyState
          title="Aún no tienes equipo"
          description="Elige una raza y reparte tu 1.000.000 MO inicial entre tus primeros desgraciados."
          actionLabel="Fundar mi primer equipo"
          actionHref="/equipos/nuevo"
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
          {teams.map((team) => (
            <Link
              key={team.id}
              href={`/equipos/${team.id}`}
              className="rounded-[3px] border p-4 transition-colors"
              style={{ borderColor: "var(--border)", background: "var(--surface-1)" }}
            >
              <p className="font-semibold">{team.name}</p>
              <p className="text-sm" style={{ color: "var(--ink-3)" }}>
                {raceNameByKey[team.rosterKey] ?? team.rosterKey} · {team.players.length} jugador
                {team.players.length === 1 ? "" : "es"}
              </p>
              <p className="mt-2 font-mono text-sm" style={{ color: "var(--gold)" }}>
                {team.treasury.toLocaleString("es-ES")} MO
              </p>
              <p className="mt-1 font-mono text-xs" style={{ color: "var(--ink-3)" }}>
                RR {team.rerolls} · Anim {team.cheerleaders} · Entr {team.assistantCoaches} · Afic {team.fanFactor}
                {team.hasApothecary && <span style={{ color: "var(--gold)" }}> · Apotecario</span>}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
