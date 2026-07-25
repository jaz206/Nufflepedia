import Link from "next/link";
import { requireUser } from "@/server/auth/requireUser";
import { prisma } from "@/server/db/prisma";
import EmptyState from "@/components/EmptyState";
import QuickSearch from "./QuickSearch";
import HeraldoDeNuffle from "./HeraldoDeNuffle";

const STATUS_LABEL: Record<string, string> = {
  OPEN: "Abierta",
  IN_PROGRESS: "En curso",
  FINISHED: "Finalizada",
};

const STATUS_TOKEN: Record<string, string> = {
  OPEN: "var(--ok)",
  IN_PROGRESS: "var(--warn)",
  FINISHED: "var(--ink-3)",
};

export default async function DashboardPage() {
  const dbUser = await requireUser();

  const [teams, entries, skills, traits, races, stars, allEntries] = await Promise.all([
    prisma.managedTeam.findMany({
      where: { ownerId: dbUser.id },
      orderBy: { createdAt: "desc" },
    }),
    prisma.competitionEntry.findMany({
      where: { ownerId: dbUser.id, competition: { status: { not: "FINISHED" } } },
      include: { competition: true },
      orderBy: { competition: { createdAt: "desc" } },
    }),
    prisma.masterSkill.findMany({ orderBy: { name: "asc" } }),
    prisma.masterTrait.findMany({ orderBy: { name: "asc" } }),
    prisma.masterRace.findMany({ select: { key: true, name: true } }),
    prisma.masterStarPlayer.findMany({ orderBy: { cost: "desc" } }),
    // Estadísticas globales: se agregan en JS porque un mismo equipo puede
    // tener varias entradas (una por competición) y el volumen de datos
    // hoy es pequeño — no compensa un groupBy de Prisma todavía.
    prisma.competitionEntry.findMany({
      select: { id: true, managedTeamId: true, teamName: true, tdFor: true, casFor: true, won: true, played: true },
    }),
  ]);

  const raceNameByKey = Object.fromEntries(races.map((r) => [r.key, r.name]));

  const teamTotals = new Map<string, { key: string; name: string; td: number; cas: number; won: number; played: number }>();
  for (const e of allEntries) {
    // Agrupa por managedTeamId cuando el equipo real sigue existiendo (para
    // fusionar varias inscripciones del mismo equipo en distintas
    // competiciones); si ya se disolvió, cada inscripción cuenta aparte.
    const key = e.managedTeamId ?? e.id;
    const t = teamTotals.get(key) ?? { key, name: e.teamName, td: 0, cas: 0, won: 0, played: 0 };
    t.td += e.tdFor;
    t.cas += e.casFor;
    t.won += e.won;
    t.played += e.played;
    teamTotals.set(key, t);
  }
  const topScorers = [...teamTotals.values()]
    .filter((t) => t.td > 0)
    .sort((a, b) => b.td - a.td)
    .slice(0, 5);
  const topBashers = [...teamTotals.values()]
    .filter((t) => t.cas > 0)
    .sort((a, b) => b.cas - a.cas)
    .slice(0, 5);

  const searchEntries = [
    ...skills.map((s) => ({
      key: s.key,
      name: s.name,
      type: "Habilidad" as const,
      category: s.category,
      description: s.description,
    })),
    ...traits.map((t) => ({
      key: t.key,
      name: t.name,
      type: "Rasgo" as const,
      category: t.category,
      description: t.description,
    })),
  ];

  return (
    <div className="mx-auto w-full max-w-5xl space-y-10 px-6 py-10">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Hola, {dbUser.displayName}</h1>
        <p className="mt-1 text-sm" style={{ color: "var(--ink-3)" }}>
          Tu centro de operaciones: equipos, competiciones y consulta rápida de reglas.
        </p>
      </header>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Buscador rápido</h2>
        <QuickSearch entries={searchEntries} />
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Mis equipos</h2>
          <Link href="/equipos" className="btn-primary">
            Fundar nuevo equipo
          </Link>
        </div>

        {teams.length === 0 ? (
          <EmptyState
            title="Aún no tienes equipo"
            description="Recluta a tus primeros desgraciados y funda tu franquicia."
            actionLabel="Fundar mi primer equipo"
            actionHref="/equipos"
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
                  {raceNameByKey[team.rosterKey] ?? team.rosterKey}
                </p>
                <p className="mt-2 font-mono text-sm" style={{ color: "var(--gold)" }}>
                  {team.treasury.toLocaleString("es-ES")} MO
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Mis competiciones</h2>
          <Link href="/competiciones" className="btn-secondary">
            Ver todas
          </Link>
        </div>

        {entries.length === 0 ? (
          <EmptyState
            title="No participas en ninguna competición"
            description="Únete a una liga o torneo abierto, o crea el tuyo propio."
            actionLabel="Explorar competiciones"
            actionHref="/competiciones"
          />
        ) : (
          <div className="grid gap-2">
            {entries.map((entry) => (
              <Link
                key={entry.id}
                href={`/competiciones/${entry.competitionId}`}
                className="flex items-center justify-between rounded-[3px] border px-4 py-3 transition-colors"
                style={{ borderColor: "var(--border)", background: "var(--surface-1)" }}
              >
                <div>
                  <p className="font-semibold">
                    {entry.competition.name}
                    <span className="ml-2 font-normal" style={{ color: "var(--ink-3)" }}>
                      ({entry.teamName})
                    </span>
                  </p>
                  <p className="text-sm" style={{ color: "var(--ink-3)" }}>
                    {entry.won}V — {entry.drawn}E — {entry.lost}D · {entry.points} pts
                  </p>
                </div>
                <span
                  className="rounded-full px-2 py-1 text-xs font-medium"
                  style={{
                    color: STATUS_TOKEN[entry.competition.status],
                    background: "var(--surface-2)",
                  }}
                >
                  {STATUS_LABEL[entry.competition.status]}
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>

      {(topScorers.length > 0 || topBashers.length > 0) && (
        <section>
          <h2 className="mb-3 text-lg font-semibold">Estadísticas de la liga</h2>
          <p className="mb-3 text-xs" style={{ color: "var(--ink-3)" }}>
            Global, de todos los entrenadores. Solo touchdowns y bajas por ahora — pases y
            otras estadísticas por jugada llegarán con el Asistente de Partido en vivo.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-[3px] border p-4" style={{ borderColor: "var(--border)", background: "var(--surface-1)" }}>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--ink-3)" }}>
                Máximos anotadores
              </p>
              <ol className="space-y-1.5 text-sm">
                {topScorers.map((t, i) => (
                  <li key={t.key} className="flex items-center justify-between">
                    <span>
                      <span className="font-mono text-xs" style={{ color: "var(--ink-3)" }}>
                        {i + 1}.
                      </span>{" "}
                      {t.name}
                    </span>
                    <span className="font-mono font-semibold" style={{ color: "var(--gold)" }}>
                      {t.td} TD
                    </span>
                  </li>
                ))}
              </ol>
            </div>
            <div className="rounded-[3px] border p-4" style={{ borderColor: "var(--border)", background: "var(--surface-1)" }}>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--ink-3)" }}>
                Carniceros (más bajas causadas)
              </p>
              <ol className="space-y-1.5 text-sm">
                {topBashers.map((t, i) => (
                  <li key={t.key} className="flex items-center justify-between">
                    <span>
                      <span className="font-mono text-xs" style={{ color: "var(--ink-3)" }}>
                        {i + 1}.
                      </span>{" "}
                      {t.name}
                    </span>
                    <span className="font-mono font-semibold" style={{ color: "var(--danger)" }}>
                      {t.cas}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>
      )}

      <HeraldoDeNuffle stars={stars} skills={skills} traits={traits} />
    </div>
  );
}
