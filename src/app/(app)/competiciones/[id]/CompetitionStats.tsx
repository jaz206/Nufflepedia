interface TalliedPlayer {
  name: string;
  teamName: string;
  count: number;
}
interface InjuryLogRow {
  id: string;
  victimName: string | null;
  victimTeamName: string;
  attackerName: string | null;
  attackerTeamName: string;
  injuryName: string | null;
}

function RankedList({ entries, unit, color }: { entries: TalliedPlayer[]; unit: string; color: string }) {
  if (entries.length === 0) {
    return (
      <p className="text-sm" style={{ color: "var(--ink-3)" }}>
        Todavía no hay datos.
      </p>
    );
  }
  return (
    <ol className="space-y-1.5 text-sm">
      {entries.map((e, i) => (
        <li key={`${e.name}-${e.teamName}`} className="flex items-center justify-between">
          <span>
            <span className="font-mono text-xs" style={{ color: "var(--ink-3)" }}>
              {i + 1}.
            </span>{" "}
            {e.name} <span style={{ color: "var(--ink-3)" }}>({e.teamName})</span>
          </span>
          <span className="font-mono font-semibold" style={{ color }}>
            {e.count} {unit}
          </span>
        </li>
      ))}
    </ol>
  );
}

export default function CompetitionStats({
  topScorers,
  topBashers,
  injuryLog,
}: {
  topScorers: TalliedPlayer[];
  topBashers: TalliedPlayer[];
  injuryLog: InjuryLogRow[];
}) {
  if (topScorers.length === 0 && topBashers.length === 0 && injuryLog.length === 0) return null;

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold">Estadísticas de la competición</h2>
      <p className="text-xs" style={{ color: "var(--ink-3)" }}>
        Solo cuenta a los jugadores concretos asignados al registrar cada resultado — si un touchdown o lesión se
        guardó &ldquo;sin asignar&rdquo;, no aparece aquí.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-[3px] border p-4" style={{ borderColor: "var(--border)", background: "var(--surface-1)" }}>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--ink-3)" }}>
            Máximos anotadores
          </p>
          <RankedList entries={topScorers} unit="TD" color="var(--gold)" />
        </div>
        <div className="rounded-[3px] border p-4" style={{ borderColor: "var(--border)", background: "var(--surface-1)" }}>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--ink-3)" }}>
            Carniceros (bajas causadas)
          </p>
          <RankedList entries={topBashers} unit="" color="var(--danger, #b23)" />
        </div>
      </div>

      {injuryLog.length > 0 && (
        <div className="rounded-[3px] border p-4" style={{ borderColor: "var(--border)", background: "var(--surface-1)" }}>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--ink-3)" }}>
            Últimas lesiones
          </p>
          <ul className="space-y-1 text-sm">
            {injuryLog.map((inj) => (
              <li key={inj.id}>
                <span style={{ color: "var(--ink-3)" }}>{inj.attackerName ?? `Un jugador de ${inj.attackerTeamName}`}</span>
                {" → "}
                <span className="font-medium">{inj.victimName ?? `un jugador de ${inj.victimTeamName}`}</span>
                {inj.injuryName && (
                  <span className="ml-1 font-mono text-xs" style={{ color: "var(--danger, #b23)" }}>
                    ({inj.injuryName})
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
