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

  const [teams, entries, skills, traits, races, stars, allEntries, playerStates, liveMatches, magazineIssues] = await Promise.all([
    prisma.managedTeam.findMany({
      where: { ownerId: dbUser.id, isGuest: false },
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
    prisma.masterPlayerState.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.liveMatch.findMany({
      where: { createdById: dbUser.id, status: { not: "FINISHED" } },
      include: { homeEntry: true, awayEntry: true },
      orderBy: { createdAt: "desc" },
    }),
    // Últimos números de Balonazo Sangriento de cualquier competición donde
    // participo o soy comisario — mismo criterio de acceso que la propia
    // sección (ver /competiciones/[id]/balonazo).
    prisma.magazineIssue.findMany({
      where: {
        competition: {
          OR: [{ commissionerId: dbUser.id }, { entries: { some: { ownerId: dbUser.id } } }],
        },
      },
      include: { competition: { select: { id: true, name: true } } },
      orderBy: { createdAt: "desc" },
      take: 4,
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
    ...playerStates.map((s) => ({
      key: s.key,
      name: s.name,
      type: "Estado" as const,
      category: "Estado de un jugador",
      description: s.description,
    })),
  ];

  const statCards = [
    { href: "/equipos", label: "Equipos", value: teams.length },
    { href: "/competiciones", label: "Competiciones activas", value: entries.length },
    { href: "/arena", label: "Partidos en la Arena", value: liveMatches.length },
  ];

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8 px-6 py-10">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Hola, {dbUser.displayName}</h1>
        <p className="mt-1 text-sm" style={{ color: "var(--ink-3)" }}>
          Tu centro de operaciones: equipos, competiciones y consulta rápida de reglas.
        </p>
      </header>

      <section className="grid gap-3 sm:grid-cols-3">
        {statCards.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="rounded-[3px] border p-4 transition-colors hover:border-[var(--gold-soft)]"
            style={{ borderColor: "var(--border)", background: "var(--surface-1)" }}
          >
            <p className="text-2xl font-bold" style={{ color: "var(--gold)" }}>
              {c.value}
            </p>
            <p className="text-sm" style={{ color: "var(--ink-3)" }}>
              {c.label}
            </p>
          </Link>
        ))}
      </section>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
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
              <div className="grid gap-3 sm:grid-cols-2">
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
                        {entry.competition!.name}
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
                        color: STATUS_TOKEN[entry.competition!.status],
                        background: "var(--surface-2)",
                      }}
                    >
                      {STATUS_LABEL[entry.competition!.status]}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </section>

          {liveMatches.length > 0 && (
            <section>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-lg font-semibold">Mis partidos en la Arena</h2>
                <Link href="/arena" className="btn-secondary">
                  Ver todos
                </Link>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                {liveMatches.map((m) => (
                  <Link
                    key={m.id}
                    href={`/arena/${m.id}`}
                    className="flex items-center justify-between rounded-[3px] border px-4 py-3 transition-colors"
                    style={{ borderColor: "var(--border)", background: "var(--surface-1)" }}
                  >
                    <div>
                      <p className="font-semibold">
                        {m.homeEntry.teamName} <span style={{ color: "var(--ink-3)" }}>vs</span> {m.awayEntry.teamName}
                      </p>
                      {m.status === "IN_PROGRESS" && (
                        <p className="font-mono text-sm" style={{ color: "var(--gold)" }}>
                          {m.homeScore} — {m.awayScore}
                        </p>
                      )}
                    </div>
                    <span
                      className="rounded-full px-2 py-1 text-xs font-medium"
                      style={{ color: m.status === "IN_PROGRESS" ? "var(--warn)" : "var(--ink-3)", background: "var(--surface-2)" }}
                    >
                      {m.status === "IN_PROGRESS" ? "En curso" : "Preparando"}
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {magazineIssues.length > 0 && (
            <section>
              <h2 className="mb-3 text-lg font-semibold">📰 Últimos números de Balonazo Sangriento</h2>
              <div className="grid gap-2 sm:grid-cols-2">
                {magazineIssues.map((issue) => (
                  <Link
                    key={issue.id}
                    href={`/competiciones/${issue.competitionId}/balonazo/${issue.id}`}
                    className="rounded-[3px] border p-3 transition-colors hover:border-[var(--gold-soft)]"
                    style={{ borderColor: "var(--border)", background: "var(--surface-1)" }}
                  >
                    <p className="text-xs" style={{ color: "var(--ink-3)" }}>
                      {issue.competition.name} · Nº {issue.issueNumber}
                    </p>
                    <p className="mt-0.5 truncate font-semibold">{issue.featuredMatchTitle}</p>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {(topScorers.length > 0 || topBashers.length > 0) && (
            <section>
              <h2 className="mb-3 text-lg font-semibold">Estadísticas de la liga</h2>
              <p className="mb-3 text-xs" style={{ color: "var(--ink-3)" }}>
                Global, de todos los entrenadores. Solo touchdowns y bajas de competiciones por ahora — las
                estadísticas de los amistosos de la Arena todavía no se suman aquí.
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
        </div>

        <div className="space-y-8">
          <section>
            <h2 className="mb-3 text-lg font-semibold">Buscador rápido</h2>
            <QuickSearch entries={searchEntries} />
          </section>

          <HeraldoDeNuffle stars={stars} skills={skills} traits={traits} />
        </div>
      </div>
    </div>
  );
}
