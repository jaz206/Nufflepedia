"use client";

import { useState } from "react";
import { proposeFixtureSchedule, confirmFixtureSchedule, recordFixtureResult } from "../actions";
import MatchDetailsForm, { type RosterPlayer, type InjuryCatalogEntry, type InducementCatalogEntry } from "./MatchDetailsForm";

export interface EntryMeta {
  snapshotTreasury: number;
  specialRules: string[];
}

export interface FixtureRow {
  id: string;
  round: number;
  homeEntryId: string;
  awayEntryId: string;
  homeTeamName: string;
  awayTeamName: string;
  scheduledAt: string | null;
  proposedByEntryId: string | null;
  confirmedAt: string | null;
  homeScore: number | null;
  awayScore: number | null;
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

/** Convierte un Date a valor de <input type="datetime-local"> en hora LOCAL del navegador (no UTC). */
function toLocalInputValue(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function toGoogleCalendarUrl(title: string, startsAt: Date): string {
  const end = new Date(startsAt.getTime() + 120 * 60_000);
  const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
  const params = new URLSearchParams({ action: "TEMPLATE", text: title, dates: `${fmt(startsAt)}/${fmt(end)}` });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function icsDataUrl(title: string, startsAt: Date): string {
  const end = new Date(startsAt.getTime() + 120 * 60_000);
  const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Blood Bowl Manager//ES",
    "BEGIN:VEVENT",
    `UID:${startsAt.getTime()}@blood-bowl-manager`,
    `DTSTAMP:${fmt(new Date())}`,
    `DTSTART:${fmt(startsAt)}`,
    `DTEND:${fmt(end)}`,
    `SUMMARY:${title}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  return `data:text/calendar;charset=utf-8,${encodeURIComponent(ics)}`;
}

function FixtureRowItem({
  fixture,
  rosterByEntry,
  entryMeta,
  injuryCatalog,
  inducementCatalog,
  canAct,
  myEntryIds,
  competitionName,
}: {
  fixture: FixtureRow;
  rosterByEntry: Record<string, RosterPlayer[]>;
  entryMeta: Record<string, EntryMeta>;
  injuryCatalog: InjuryCatalogEntry[];
  inducementCatalog: InducementCatalogEntry[];
  canAct: boolean;
  myEntryIds: string[];
  competitionName: string;
}) {
  const [dateInput, setDateInput] = useState(fixture.scheduledAt ? toLocalInputValue(new Date(fixture.scheduledAt)) : "");
  const [savingDate, setSavingDate] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [open, setOpen] = useState(false);
  const played = fixture.homeScore !== null;

  async function saveDate() {
    setSavingDate(true);
    await proposeFixtureSchedule(fixture.id, dateInput ? new Date(dateInput).toISOString() : null);
    setSavingDate(false);
  }

  async function confirm() {
    setConfirming(true);
    await confirmFixtureSchedule(fixture.id);
    setConfirming(false);
  }

  const scheduledDate = fixture.scheduledAt ? new Date(fixture.scheduledAt) : null;
  const title = `${competitionName}: ${fixture.homeTeamName} vs ${fixture.awayTeamName}`;
  const proposedByMe = fixture.proposedByEntryId !== null && myEntryIds.includes(fixture.proposedByEntryId);
  const proposedByTeamName =
    fixture.proposedByEntryId === fixture.homeEntryId
      ? fixture.homeTeamName
      : fixture.proposedByEntryId === fixture.awayEntryId
        ? fixture.awayTeamName
        : null;
  const canConfirm = canAct && scheduledDate && !fixture.confirmedAt && !proposedByMe;

  return (
    <div className="rounded-[3px] border p-3" style={{ borderColor: "var(--border)", background: "var(--surface-1)" }}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-sm">
          <span className="font-medium">{fixture.homeTeamName}</span> vs <span className="font-medium">{fixture.awayTeamName}</span>
        </span>
        {played ? (
          <span className="font-mono text-sm font-semibold" style={{ color: "var(--gold)" }}>
            {fixture.homeScore} — {fixture.awayScore}
          </span>
        ) : (
          canAct && (
            <button type="button" onClick={() => setOpen((v) => !v)} className="btn-secondary" style={{ padding: "3px 10px", fontSize: "12px" }}>
              {open ? "Cerrar" : "Registrar resultado"}
            </button>
          )
        )}
      </div>

      {!played && (
        <div className="mt-2 space-y-1.5 text-xs" style={{ color: "var(--ink-3)" }}>
          {scheduledDate && (
            <p>
              {fixture.confirmedAt
                ? "Fecha confirmada por los dos equipos."
                : proposedByTeamName
                  ? `Propuesta por ${proposedByTeamName} — pendiente de confirmación del rival.`
                  : "Fecha propuesta por el comisario — pendiente de confirmación."}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="datetime-local"
              className="input"
              style={{ padding: "3px 6px", fontSize: "12px" }}
              value={dateInput}
              onChange={(e) => setDateInput(e.target.value)}
              disabled={!canAct}
            />
            {canAct && (
              <button type="button" onClick={saveDate} disabled={savingDate} className="btn-secondary" style={{ padding: "3px 8px", fontSize: "11px" }}>
                {scheduledDate ? "Proponer otra fecha" : "Proponer fecha"}
              </button>
            )}
            {canConfirm && (
              <button type="button" onClick={confirm} disabled={confirming} className="btn-primary" style={{ padding: "3px 8px", fontSize: "11px" }}>
                Confirmar fecha
              </button>
            )}
          </div>
          {scheduledDate && (
            <div className="flex flex-wrap gap-2">
              <a href={toGoogleCalendarUrl(title, scheduledDate)} target="_blank" rel="noreferrer" className="underline">
                Añadir a Google Calendar
              </a>
              <a href={icsDataUrl(title, scheduledDate)} download={`${title}.ics`} className="underline">
                Descargar .ics
              </a>
            </div>
          )}
        </div>
      )}

      {open && !played && (
        <div className="mt-3">
          <MatchDetailsForm
            home={{
              entryId: fixture.homeEntryId,
              teamName: fixture.homeTeamName,
              roster: rosterByEntry[fixture.homeEntryId] ?? [],
              snapshotTreasury: entryMeta[fixture.homeEntryId]?.snapshotTreasury ?? 0,
              specialRules: entryMeta[fixture.homeEntryId]?.specialRules ?? [],
            }}
            away={{
              entryId: fixture.awayEntryId,
              teamName: fixture.awayTeamName,
              roster: rosterByEntry[fixture.awayEntryId] ?? [],
              snapshotTreasury: entryMeta[fixture.awayEntryId]?.snapshotTreasury ?? 0,
              specialRules: entryMeta[fixture.awayEntryId]?.specialRules ?? [],
            }}
            injuryCatalog={injuryCatalog}
            inducementCatalog={inducementCatalog}
            allowDraw
            onSubmit={(data) => recordFixtureResult(fixture.id, data)}
            onCancel={() => setOpen(false)}
          />
        </div>
      )}
    </div>
  );
}

export default function FixtureList({
  fixtures,
  rosterByEntry,
  entryMeta,
  injuryCatalog,
  inducementCatalog,
  canAct,
  myEntryIds,
  competitionName,
}: {
  fixtures: FixtureRow[];
  rosterByEntry: Record<string, RosterPlayer[]>;
  entryMeta: Record<string, EntryMeta>;
  injuryCatalog: InjuryCatalogEntry[];
  inducementCatalog: InducementCatalogEntry[];
  canAct: boolean;
  myEntryIds: string[];
  competitionName: string;
}) {
  const byRound = new Map<number, FixtureRow[]>();
  for (const f of fixtures) byRound.set(f.round, [...(byRound.get(f.round) ?? []), f]);
  const rounds = [...byRound.keys()].sort((a, b) => a - b);

  if (fixtures.length === 0) {
    return (
      <p className="text-sm" style={{ color: "var(--ink-3)" }}>
        El calendario todavía no se ha generado.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {rounds.map((round) => (
        <div key={round}>
          <h3 className="mb-2 text-sm font-semibold" style={{ color: "var(--ink-3)" }}>
            Jornada {round}
          </h3>
          <div className="space-y-2">
            {byRound.get(round)!.map((f) => (
              <FixtureRowItem
                key={f.id}
                fixture={f}
                rosterByEntry={rosterByEntry}
                entryMeta={entryMeta}
                injuryCatalog={injuryCatalog}
                inducementCatalog={inducementCatalog}
                canAct={canAct}
                myEntryIds={myEntryIds}
                competitionName={competitionName}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
