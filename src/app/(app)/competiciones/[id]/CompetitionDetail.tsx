"use client";

import { useState, useTransition } from "react";
import {
  joinCompetition,
  setCompetitionStatus,
  startTournament,
  closeGroupStage,
} from "../actions";
import BracketView from "./BracketView";
import FixtureList, { type FixtureRow, type EntryMeta } from "./FixtureList";
import { type RosterPlayer, type InjuryCatalogEntry, type InducementCatalogEntry } from "./MatchDetailsForm";
import MatchReportCard from "./MatchReportCard";
import GroupMatchList from "./GroupMatchList";
import CompetitionRoster from "./CompetitionRoster";
import CompetitionStats from "./CompetitionStats";
import type { SkillInfo } from "@/components/SkillPillList";
import type { StatBlock } from "@/lib/playerStats";

interface Entry {
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
interface MatchReportRow {
  id: string;
  homeEntryId: string | null;
  awayEntryId: string | null;
  homeTeamName: string;
  awayTeamName: string;
  homeScore: number;
  awayScore: number;
  playedAt: string;
  headline: string | null;
  article: string | null;
  // FRIENDLY nunca aparece de verdad aquí (un amistoso no pertenece a
  // ninguna competición), pero el enum de Prisma lo incluye igualmente.
  source: "FIXTURE" | "GROUP" | "BRACKET" | "FRIENDLY";
  editedAt: string | null;
  editedByName: string | null;
}
interface Group {
  name: string;
  entryIds: string[];
}
interface BracketMatch {
  id: string;
  homeEntryId: string | null;
  awayEntryId: string | null;
  homeScore: number | null;
  awayScore: number | null;
  winnerEntryId: string | null;
}
interface BracketRound {
  round: number;
  matches: BracketMatch[];
}
interface Competition {
  id: string;
  name: string;
  format: "LEAGUE" | "TOURNAMENT";
  status: "OPEN" | "IN_PROGRESS" | "FINISHED";
  visibility: "PUBLIC" | "PRIVATE";
  maxTeams: number;
  commissionerName: string;
  hasGroupStage: boolean;
  phase: "GROUPS" | "KNOCKOUT" | null;
  groups: Group[];
  bracket: BracketRound[];
}

const STATUS_LABEL: Record<Competition["status"], string> = {
  OPEN: "Abierta a inscripciones",
  IN_PROGRESS: "En curso",
  FINISHED: "Finalizada",
};
const FORMAT_LABEL: Record<Competition["format"], string> = {
  LEAGUE: "Liguilla",
  TOURNAMENT: "Torneo",
};

function sortEntries(entries: Entry[]) {
  return [...entries].sort(
    (a, b) => b.points - a.points || b.tdFor - b.tdAgainst - (a.tdFor - a.tdAgainst) || b.tdFor - a.tdFor
  );
}

function StandingsTable({ entries }: { entries: Entry[] }) {
  const standings = sortEntries(entries);
  return (
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
  );
}

interface MyRosterPlayer {
  id: string;
  number: number;
  customName: string;
  positionKey: string | null;
  starKey: string | null;
  spp: number;
  status: "ACTIVE" | "MISS_NEXT_GAME" | "NIGGLING_INJURY" | "DEAD" | "RETIRED";
  maIncreases: number;
  stIncreases: number;
  agIncreases: number;
  paIncreases: number;
  avIncreases: number;
  skills: { skillKey: string; source: string }[];
}
interface MyRoster {
  entryId: string;
  teamName: string;
  snapshotTreasury: number;
  players: MyRosterPlayer[];
  race: { name: string; positions: (StatBlock & { id: string; name: string; startingSkillKeys: string[]; primaryCategories: string[]; secondaryCategories: string[] })[] } | null;
  stars: (StatBlock & { key: string; name: string; cost: number; skillKeys: string[] })[];
  skills: SkillInfo[];
  traits: SkillInfo[];
}
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
interface Stats {
  topScorers: TalliedPlayer[];
  topBashers: TalliedPlayer[];
  injuryLog: InjuryLogRow[];
}

export default function CompetitionDetail({
  competition,
  entries,
  entryNameById,
  matchReports,
  isCommissioner,
  canRecordResult,
  myJoinableTeams,
  fixtures,
  rosterByEntry,
  entryMeta,
  injuryCatalog,
  inducementCatalog,
  stats,
  myEntryIds,
  myRosters,
}: {
  competition: Competition;
  entries: Entry[];
  entryNameById: Record<string, string>;
  matchReports: MatchReportRow[];
  isCommissioner: boolean;
  canRecordResult: boolean;
  myJoinableTeams: { id: string; name: string }[];
  fixtures: FixtureRow[];
  rosterByEntry: Record<string, RosterPlayer[]>;
  entryMeta: Record<string, EntryMeta>;
  injuryCatalog: InjuryCatalogEntry[];
  inducementCatalog: InducementCatalogEntry[];
  stats: Stats;
  myEntryIds: string[];
  myRosters: MyRoster[];
}) {
  const [error, setError] = useState<string | undefined>();
  const [pending, startTransition] = useTransition();

  // No basta con inicializar el estado una vez: tras cada inscripción
  // `myJoinableTeams` se reduce (revalidatePath trae la lista nueva desde el
  // servidor), pero este componente no se remonta, así que `joinTeamId`
  // podía quedarse apuntando a un equipo que ya se acababa de inscribir —
  // el desplegable mostraba el siguiente equipo disponible pero el envío
  // seguía usando el id viejo, y el servidor respondía "ya está inscrito".
  const [joinTeamId, setJoinTeamId] = useState(myJoinableTeams[0]?.id ?? "");
  const effectiveJoinTeamId = myJoinableTeams.some((t) => t.id === joinTeamId) ? joinTeamId : (myJoinableTeams[0]?.id ?? "");

  function handleJoin() {
    if (!effectiveJoinTeamId) return;
    setError(undefined);
    startTransition(async () => {
      const res = await joinCompetition(competition.id, effectiveJoinTeamId);
      if (!res.ok) setError(res.error);
    });
  }

  function handleStatus(status: "IN_PROGRESS" | "FINISHED") {
    if (status === "IN_PROGRESS" && !confirm("A partir de ahora ya no se podrán inscribir más equipos. ¿Marcar en curso?")) {
      return;
    }
    if (status === "FINISHED" && !confirm("Se cierra del todo: ya no se podrán registrar más resultados. ¿Finalizar?")) {
      return;
    }
    setError(undefined);
    startTransition(async () => {
      const res = await setCompetitionStatus(competition.id, status);
      if (!res.ok) setError(res.error);
    });
  }

  function handleStartTournament() {
    const groupsMsg = competition.hasGroupStage
      ? " Se repartirán los grupos al azar entre los inscritos."
      : " Se generará el cuadro de eliminatoria con los inscritos.";
    if (!confirm(`A partir de ahora ya no se podrán inscribir más equipos.${groupsMsg} ¿Iniciar torneo?`)) return;
    setError(undefined);
    startTransition(async () => {
      const res = await startTournament(competition.id);
      if (!res.ok) setError(res.error);
    });
  }

  function handleCloseGroups() {
    if (!confirm("Se clasifican los 2 primeros de cada grupo y ya no se podrán registrar más resultados de grupos. ¿Cerrar fase de grupos?")) {
      return;
    }
    setError(undefined);
    startTransition(async () => {
      const res = await closeGroupStage(competition.id);
      if (!res.ok) setError(res.error);
    });
  }

  const isTournament = competition.format === "TOURNAMENT";
  const notStarted = competition.status === "OPEN";

  return (
    <div className="mx-auto w-full max-w-4xl space-y-8 px-6 py-10">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{competition.name}</h1>
          <p className="mt-1 text-sm" style={{ color: "var(--ink-3)" }}>
            {FORMAT_LABEL[competition.format]}
            {isTournament && competition.hasGroupStage ? " con fase de grupos" : ""} · {STATUS_LABEL[competition.status]} ·{" "}
            {entries.length}/{competition.maxTeams} equipos · {competition.visibility === "PUBLIC" ? "Pública" : "Privada"} ·
            Comisario: {competition.commissionerName}
          </p>
        </div>
        {isCommissioner && (
          <div className="flex flex-wrap gap-2">
            {notStarted && isTournament && (
              <button type="button" onClick={handleStartTournament} disabled={pending} className="btn-primary">
                Iniciar torneo
              </button>
            )}
            {notStarted && !isTournament && (
              <button type="button" onClick={() => handleStatus("IN_PROGRESS")} disabled={pending} className="btn-secondary">
                Marcar en curso
              </button>
            )}
            {competition.phase === "GROUPS" && (
              <button type="button" onClick={handleCloseGroups} disabled={pending} className="btn-primary">
                Cerrar fase de grupos y generar cuadro
              </button>
            )}
            {competition.status !== "FINISHED" && (
              <button type="button" onClick={() => handleStatus("FINISHED")} disabled={pending} className="btn-danger">
                Finalizar
              </button>
            )}
          </div>
        )}
      </header>

      <p className="text-xs" style={{ color: "var(--ink-3)" }}>
        {competition.status === "OPEN" &&
          (isCommissioner
            ? "Abierta: cualquiera con el enlace puede inscribirse (o cualquiera, si es pública). Cuando quieras empezar a jugar, márcala en curso — a partir de ahí se cierran las inscripciones."
            : "Abierta a inscripciones.")}
        {competition.status === "IN_PROGRESS" &&
          "En curso: ya no se admiten más equipos. Los resultados se registran hasta que el comisario la finalice."}
        {competition.status === "FINISHED" && "Finalizada: no se pueden registrar más resultados."}
      </p>

      {error && <p className="text-sm text-red-500">{error}</p>}

      {notStarted && myJoinableTeams.length > 0 && (
        <section className="rounded-[3px] border p-4" style={{ borderColor: "var(--border)", background: "var(--surface-1)" }}>
          <h2 className="mb-2 text-sm font-semibold">Unirme con uno de mis equipos</h2>
          <div className="flex flex-wrap gap-2">
            <select className="input flex-1" value={effectiveJoinTeamId} onChange={(e) => setJoinTeamId(e.target.value)}>
              {myJoinableTeams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
            <button type="button" onClick={handleJoin} disabled={pending} className="btn-primary">
              Inscribirme
            </button>
          </div>
        </section>
      )}

      {myRosters.length > 0 && (
        <section className="space-y-2">
          {myRosters.map((r) => (
            <CompetitionRoster
              key={r.entryId}
              entryId={r.entryId}
              teamName={r.teamName}
              snapshotTreasury={r.snapshotTreasury}
              players={r.players}
              race={r.race}
              stars={r.stars}
              skills={r.skills}
              traits={r.traits}
            />
          ))}
        </section>
      )}

      {/* Liguilla: clasificación única de siempre. */}
      {!isTournament && (
        <section>
          <h2 className="mb-3 text-lg font-semibold">Clasificación</h2>
          {entries.length === 0 ? (
            <p className="text-sm" style={{ color: "var(--ink-3)" }}>
              Todavía no hay equipos inscritos.
            </p>
          ) : (
            <StandingsTable entries={entries} />
          )}
        </section>
      )}

      {/* Liguilla: calendario a doble vuelta, generado al marcar "en curso". */}
      {!isTournament && !notStarted && (
        <section>
          <h2 className="mb-3 text-lg font-semibold">Calendario</h2>
          <FixtureList
            fixtures={fixtures}
            rosterByEntry={rosterByEntry}
            entryMeta={entryMeta}
            injuryCatalog={injuryCatalog}
            inducementCatalog={inducementCatalog}
            canAct={canRecordResult}
            myEntryIds={myEntryIds}
            competitionName={competition.name}
          />
        </section>
      )}

      {/* Torneo, todavía sin arrancar: solo lista de inscritos. */}
      {isTournament && notStarted && (
        <section>
          <h2 className="mb-3 text-lg font-semibold">Equipos inscritos</h2>
          {entries.length === 0 ? (
            <p className="text-sm" style={{ color: "var(--ink-3)" }}>
              Todavía no hay equipos inscritos.
            </p>
          ) : (
            <ul className="grid gap-1 text-sm sm:grid-cols-2">
              {entries.map((e) => (
                <li key={e.id} className="rounded-[3px] border px-3 py-2" style={{ borderColor: "var(--border)" }}>
                  {e.teamName}
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {/* Torneo, fase de grupos: una tabla de clasificación por grupo. */}
      {isTournament && competition.phase === "GROUPS" && (
        <section>
          <h2 className="mb-3 text-lg font-semibold">Fase de grupos</h2>
          <div className="grid gap-6 sm:grid-cols-2">
            {competition.groups.map((group) => (
              <div key={group.name}>
                <h3 className="mb-2 text-sm font-semibold" style={{ color: "var(--gold)" }}>
                  {group.name}
                </h3>
                <StandingsTable entries={entries.filter((e) => group.entryIds.includes(e.id))} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Torneo, cuadro de eliminatoria (con o sin fase de grupos previa). */}
      {isTournament && competition.phase === "KNOCKOUT" && (
        <section>
          <h2 className="mb-3 text-lg font-semibold">Cuadro de eliminatoria</h2>
          <BracketView
            rounds={competition.bracket}
            entryNameById={entryNameById}
            rosterByEntry={rosterByEntry}
            entryMeta={entryMeta}
            injuryCatalog={injuryCatalog}
            inducementCatalog={inducementCatalog}
            competitionId={competition.id}
            canRecordResult={canRecordResult}
          />
        </section>
      )}

      {/* Enfrentamientos de fase de grupos: uno por cada pareja posible dentro de su grupo. */}
      {entries.length >= 2 && isTournament && competition.phase === "GROUPS" && (
        <section>
          <h2 className="mb-3 text-lg font-semibold">Partidos de grupo</h2>
          <GroupMatchList
            groups={competition.groups}
            matchReports={matchReports.filter((m) => m.source === "GROUP")}
            competitionId={competition.id}
            entryNameById={entryNameById}
            rosterByEntry={rosterByEntry}
            entryMeta={entryMeta}
            injuryCatalog={injuryCatalog}
            inducementCatalog={inducementCatalog}
            canAct={canRecordResult && competition.status !== "FINISHED"}
          />
        </section>
      )}

      <CompetitionStats topScorers={stats.topScorers} topBashers={stats.topBashers} injuryLog={stats.injuryLog} />

      <section>
        <h2 className="mb-3 text-lg font-semibold">Últimos partidos</h2>
        {matchReports.length === 0 ? (
          <p className="text-sm" style={{ color: "var(--ink-3)" }}>
            Todavía no se ha jugado ningún partido.
          </p>
        ) : (
          <div className="grid gap-2">
            {matchReports.map((m) => (
              <MatchReportCard key={m.id} report={m} canEdit={isCommissioner} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
