"use client";

import { useState } from "react";
import { recordBracketResult } from "../actions";
import MatchDetailsForm, { type RosterPlayer, type InjuryCatalogEntry, type InducementCatalogEntry } from "./MatchDetailsForm";
import type { EntryMeta } from "./FixtureList";

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

function MatchCard({
  match,
  entryNameById,
  rosterByEntry,
  entryMeta,
  injuryCatalog,
  inducementCatalog,
  competitionId,
  canRecordResult,
  isFinal,
}: {
  match: BracketMatch;
  entryNameById: Record<string, string>;
  rosterByEntry: Record<string, RosterPlayer[]>;
  entryMeta: Record<string, EntryMeta>;
  injuryCatalog: InjuryCatalogEntry[];
  inducementCatalog: InducementCatalogEntry[];
  competitionId: string;
  canRecordResult: boolean;
  isFinal: boolean;
}) {
  const [open, setOpen] = useState(false);

  const homeName = match.homeEntryId ? (entryNameById[match.homeEntryId] ?? "?") : "— pendiente —";
  const awayName = match.awayEntryId ? (entryNameById[match.awayEntryId] ?? "?") : "— pendiente —";
  const isBye = match.homeEntryId && !match.awayEntryId;
  const pendingBothSides = match.homeEntryId && match.awayEntryId && !match.winnerEntryId;

  return (
    <div
      className="w-56 shrink-0 rounded-[3px] border p-2 text-sm"
      style={{
        borderColor: isFinal ? "var(--gold)" : "var(--border)",
        background: "var(--surface-1)",
      }}
    >
      <div className={`flex items-center justify-between ${match.winnerEntryId === match.homeEntryId ? "font-semibold" : ""}`}>
        <span className="truncate" style={{ color: match.homeEntryId ? "var(--ink)" : "var(--ink-3)" }}>
          {homeName}
        </span>
        {match.homeScore !== null && <span className="font-mono">{match.homeScore}</span>}
      </div>
      <div className={`flex items-center justify-between ${match.winnerEntryId === match.awayEntryId ? "font-semibold" : ""}`}>
        <span className="truncate" style={{ color: match.awayEntryId ? "var(--ink)" : "var(--ink-3)" }}>
          {isBye ? "(pase directo)" : awayName}
        </span>
        {match.awayScore !== null && <span className="font-mono">{match.awayScore}</span>}
      </div>

      {pendingBothSides && canRecordResult && (
        <div className="mt-2">
          {!open ? (
            <button type="button" onClick={() => setOpen(true)} className="btn-secondary w-full" style={{ padding: "3px 8px", fontSize: "11px" }}>
              Registrar resultado
            </button>
          ) : (
            <MatchDetailsForm
              home={{
                entryId: match.homeEntryId!,
                teamName: homeName,
                roster: rosterByEntry[match.homeEntryId!] ?? [],
                snapshotTreasury: entryMeta[match.homeEntryId!]?.snapshotTreasury ?? 0,
                specialRules: entryMeta[match.homeEntryId!]?.specialRules ?? [],
              }}
              away={{
                entryId: match.awayEntryId!,
                teamName: awayName,
                roster: rosterByEntry[match.awayEntryId!] ?? [],
                snapshotTreasury: entryMeta[match.awayEntryId!]?.snapshotTreasury ?? 0,
                specialRules: entryMeta[match.awayEntryId!]?.specialRules ?? [],
              }}
              injuryCatalog={injuryCatalog}
              inducementCatalog={inducementCatalog}
              allowDraw={false}
              submitLabel="Guardar"
              onCancel={() => setOpen(false)}
              onSubmit={async (data) => {
                const res = await recordBracketResult(competitionId, { matchId: match.id, ...data });
                if (res.ok) setOpen(false);
                return res;
              }}
            />
          )}
        </div>
      )}
    </div>
  );
}

export default function BracketView({
  rounds,
  entryNameById,
  rosterByEntry,
  entryMeta,
  injuryCatalog,
  inducementCatalog,
  competitionId,
  canRecordResult,
}: {
  rounds: BracketRound[];
  entryNameById: Record<string, string>;
  rosterByEntry: Record<string, RosterPlayer[]>;
  entryMeta: Record<string, EntryMeta>;
  injuryCatalog: InjuryCatalogEntry[];
  inducementCatalog: InducementCatalogEntry[];
  competitionId: string;
  canRecordResult: boolean;
}) {
  if (rounds.length === 0) {
    return (
      <p className="text-sm" style={{ color: "var(--ink-3)" }}>
        El cuadro todavía no se ha generado.
      </p>
    );
  }

  return (
    <div className="flex gap-6 overflow-x-auto pb-2">
      {rounds.map((round, i) => (
        <div key={round.round} className="flex flex-col justify-around gap-4">
          <p className="text-center text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--ink-3)" }}>
            {i === rounds.length - 1 ? "Final" : i === rounds.length - 2 ? "Semifinales" : `Ronda ${round.round}`}
          </p>
          {round.matches.map((match) => (
            <MatchCard
              key={match.id}
              match={match}
              entryNameById={entryNameById}
              rosterByEntry={rosterByEntry}
              entryMeta={entryMeta}
              injuryCatalog={injuryCatalog}
              inducementCatalog={inducementCatalog}
              competitionId={competitionId}
              canRecordResult={canRecordResult}
              isFinal={i === rounds.length - 1}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
