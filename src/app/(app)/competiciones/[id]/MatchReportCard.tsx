"use client";

import { useState, useTransition } from "react";
import { editMatchResult } from "../actions";

export interface MatchReportRow {
  id: string;
  homeTeamName: string;
  awayTeamName: string;
  homeScore: number;
  awayScore: number;
  playedAt: string;
  headline: string | null;
  article: string | null;
  source: "FIXTURE" | "GROUP" | "BRACKET" | "FRIENDLY";
  editedAt: string | null;
  editedByName: string | null;
}

export default function MatchReportCard({ report, canEdit }: { report: MatchReportRow; canEdit: boolean }) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [homeScore, setHomeScore] = useState(report.homeScore);
  const [awayScore, setAwayScore] = useState(report.awayScore);
  const [error, setError] = useState<string | undefined>();
  const [pending, startTransition] = useTransition();
  const hasArticle = !!report.article;

  function startEdit(e: React.MouseEvent) {
    e.stopPropagation();
    setHomeScore(report.homeScore);
    setAwayScore(report.awayScore);
    setError(undefined);
    setEditing(true);
  }

  function saveEdit(e: React.FormEvent) {
    e.preventDefault();
    setError(undefined);
    startTransition(async () => {
      const res = await editMatchResult(report.id, { homeScore, awayScore });
      if (!res.ok) setError(res.error);
      else setEditing(false);
    });
  }

  return (
    <div className="rounded-[3px] border text-sm" style={{ borderColor: "var(--border)", background: "var(--surface-1)" }}>
      <div className="flex w-full items-center justify-between gap-2 px-4 py-2">
        <button
          type="button"
          onClick={() => hasArticle && setOpen((v) => !v)}
          className="min-w-0 flex-1 text-left"
          style={{ cursor: hasArticle ? "pointer" : "default" }}
        >
          {report.headline ? (
            <p className="truncate font-medium" style={{ color: "var(--gold)" }}>
              {report.headline}
            </p>
          ) : null}
          <span>
            {report.homeTeamName} <span className="font-mono font-semibold">{report.homeScore}</span> —{" "}
            <span className="font-mono font-semibold">{report.awayScore}</span> {report.awayTeamName}
          </span>
        </button>
        <div className="flex shrink-0 items-center gap-2">
          <span className="text-xs" style={{ color: "var(--ink-3)" }}>
            {new Date(report.playedAt).toLocaleDateString("es-ES")}
          </span>
          {canEdit && report.source !== "BRACKET" && !editing && (
            <button type="button" onClick={startEdit} className="text-xs underline" style={{ color: "var(--ink-3)" }}>
              Editar
            </button>
          )}
        </div>
      </div>

      {report.editedAt && (
        <p className="px-4 pb-1 text-[10px]" style={{ color: "var(--ink-3)" }}>
          Editado por {report.editedByName ?? "un comisario"} el {new Date(report.editedAt).toLocaleDateString("es-ES")}
        </p>
      )}

      {editing && (
        <form onSubmit={saveEdit} className="flex flex-wrap items-center gap-2 border-t px-4 py-3" style={{ borderColor: "var(--border)" }}>
          <span className="text-xs">{report.homeTeamName}</span>
          <input
            type="number"
            className="input w-16 text-center"
            min={0}
            max={30}
            value={homeScore}
            onChange={(e) => setHomeScore(Number(e.target.value))}
          />
          <span style={{ color: "var(--ink-3)" }}>—</span>
          <input
            type="number"
            className="input w-16 text-center"
            min={0}
            max={30}
            value={awayScore}
            onChange={(e) => setAwayScore(Number(e.target.value))}
          />
          <span className="text-xs">{report.awayTeamName}</span>
          <button type="submit" disabled={pending} className="btn-primary" style={{ padding: "3px 10px", fontSize: "12px" }}>
            Guardar
          </button>
          <button
            type="button"
            onClick={() => setEditing(false)}
            disabled={pending}
            className="btn-secondary"
            style={{ padding: "3px 10px", fontSize: "12px" }}
          >
            Cancelar
          </button>
          {error && <p className="w-full text-xs text-red-500">{error}</p>}
        </form>
      )}

      {open && report.article && (
        <div className="space-y-2 border-t px-4 py-3" style={{ borderColor: "var(--border)", color: "var(--ink-2)" }}>
          {report.article.split("\n\n").map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      )}
    </div>
  );
}
