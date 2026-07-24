"use client";

import { useState } from "react";
import { recordMatchResult } from "../actions";
import MatchDetailsForm, { type RosterPlayer, type InjuryCatalogEntry, type InducementCatalogEntry } from "./MatchDetailsForm";
import type { EntryMeta } from "./FixtureList";

export interface GroupInfo {
  name: string;
  entryIds: string[];
}
export interface GroupMatchReport {
  homeEntryId: string | null;
  awayEntryId: string | null;
  homeScore: number;
  awayScore: number;
}

interface Pairing {
  homeEntryId: string;
  awayEntryId: string;
  homeScore: number | null;
  awayScore: number | null;
}

/** Todas las parejas posibles de un grupo, cada una una única vez. */
function pairingsOf(entryIds: string[], reports: GroupMatchReport[]): Pairing[] {
  const pairings: Pairing[] = [];
  for (let i = 0; i < entryIds.length; i++) {
    for (let j = i + 1; j < entryIds.length; j++) {
      const a = entryIds[i];
      const b = entryIds[j];
      const played = reports.find(
        (r) => (r.homeEntryId === a && r.awayEntryId === b) || (r.homeEntryId === b && r.awayEntryId === a)
      );
      pairings.push({
        homeEntryId: played?.homeEntryId ?? a,
        awayEntryId: played?.awayEntryId ?? b,
        homeScore: played?.homeScore ?? null,
        awayScore: played?.awayScore ?? null,
      });
    }
  }
  return pairings;
}

function PairingRow({
  pairing,
  competitionId,
  entryNameById,
  rosterByEntry,
  entryMeta,
  injuryCatalog,
  inducementCatalog,
  canAct,
}: {
  pairing: Pairing;
  competitionId: string;
  entryNameById: Record<string, string>;
  rosterByEntry: Record<string, RosterPlayer[]>;
  entryMeta: Record<string, EntryMeta>;
  injuryCatalog: InjuryCatalogEntry[];
  inducementCatalog: InducementCatalogEntry[];
  canAct: boolean;
}) {
  const [open, setOpen] = useState(false);
  const played = pairing.homeScore !== null;
  const homeName = entryNameById[pairing.homeEntryId] ?? "?";
  const awayName = entryNameById[pairing.awayEntryId] ?? "?";

  return (
    <div className="rounded-[3px] border p-2" style={{ borderColor: "var(--border)", background: "var(--surface-1)" }}>
      <div className="flex items-center justify-between gap-2 text-sm">
        <span>
          {homeName} vs {awayName}
        </span>
        {played ? (
          <span className="font-mono font-semibold" style={{ color: "var(--gold)" }}>
            {pairing.homeScore} — {pairing.awayScore}
          </span>
        ) : (
          canAct && (
            <button type="button" onClick={() => setOpen((v) => !v)} className="btn-secondary" style={{ padding: "2px 8px", fontSize: "11px" }}>
              {open ? "Cerrar" : "Registrar resultado"}
            </button>
          )
        )}
      </div>
      {open && !played && (
        <div className="mt-2">
          <MatchDetailsForm
            home={{
              entryId: pairing.homeEntryId,
              teamName: homeName,
              roster: rosterByEntry[pairing.homeEntryId] ?? [],
              snapshotTreasury: entryMeta[pairing.homeEntryId]?.snapshotTreasury ?? 0,
              specialRules: entryMeta[pairing.homeEntryId]?.specialRules ?? [],
            }}
            away={{
              entryId: pairing.awayEntryId,
              teamName: awayName,
              roster: rosterByEntry[pairing.awayEntryId] ?? [],
              snapshotTreasury: entryMeta[pairing.awayEntryId]?.snapshotTreasury ?? 0,
              specialRules: entryMeta[pairing.awayEntryId]?.specialRules ?? [],
            }}
            injuryCatalog={injuryCatalog}
            inducementCatalog={inducementCatalog}
            allowDraw
            submitLabel="Guardar"
            onCancel={() => setOpen(false)}
            onSubmit={async (data) => {
              const res = await recordMatchResult(competitionId, {
                homeEntryId: pairing.homeEntryId,
                awayEntryId: pairing.awayEntryId,
                ...data,
              });
              if (res.ok) setOpen(false);
              return res;
            }}
          />
        </div>
      )}
    </div>
  );
}

/**
 * Todos los enfrentamientos de la fase de grupos, agrupados visualmente por
 * grupo (antes había un único desplegable libre de Local/Visitante que no
 * dejaba ver ni elegir el otro grupo — confuso con más de un grupo).
 */
export default function GroupMatchList({
  groups,
  matchReports,
  competitionId,
  entryNameById,
  rosterByEntry,
  entryMeta,
  injuryCatalog,
  inducementCatalog,
  canAct,
}: {
  groups: GroupInfo[];
  matchReports: GroupMatchReport[];
  competitionId: string;
  entryNameById: Record<string, string>;
  rosterByEntry: Record<string, RosterPlayer[]>;
  entryMeta: Record<string, EntryMeta>;
  injuryCatalog: InjuryCatalogEntry[];
  inducementCatalog: InducementCatalogEntry[];
  canAct: boolean;
}) {
  return (
    <div className="grid gap-6 sm:grid-cols-2">
      {groups.map((group) => (
        <div key={group.name} className="space-y-2">
          <h3 className="text-sm font-semibold" style={{ color: "var(--gold)" }}>
            {group.name}
          </h3>
          {pairingsOf(group.entryIds, matchReports).map((pairing) => (
            <PairingRow
              key={`${pairing.homeEntryId}-${pairing.awayEntryId}`}
              pairing={pairing}
              competitionId={competitionId}
              entryNameById={entryNameById}
              rosterByEntry={rosterByEntry}
              entryMeta={entryMeta}
              injuryCatalog={injuryCatalog}
              inducementCatalog={inducementCatalog}
              canAct={canAct}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
