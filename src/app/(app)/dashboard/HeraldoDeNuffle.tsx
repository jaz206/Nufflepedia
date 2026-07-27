"use client";

import { useMemo, useState } from "react";
import { buildSkillInfoIndex } from "@/lib/resolveSkillName";
import SkillPillList, { type SkillInfo } from "@/components/SkillPillList";

interface Star {
  key: string;
  name: string;
  playerTags: string[];
  cost: number;
  ma: number;
  st: number;
  ag: number;
  pa: number | null;
  av: number;
  skillKeys: string[];
  specialRuleName: string | null;
  specialRuleText: string | null;
  lore: string | null;
}

/**
 * Gaceta de Jugadores Estrella: navegación manual (anterior/siguiente/
 * aleatoria) entre las 68 fichas, con su biografía cuando ya se ha
 * generado. Solo depende de MasterStarPlayer — no de equipos ni de
 * partidos, así que puede vivir en el Dashboard desde ya.
 */
export default function HeraldoDeNuffle({
  stars,
  skills,
  traits,
}: {
  stars: Star[];
  skills: SkillInfo[];
  traits: SkillInfo[];
}) {
  const [index, setIndex] = useState(0);
  const skillIndex = useMemo(() => buildSkillInfoIndex([...skills, ...traits]), [skills, traits]);

  if (stars.length === 0) return null;
  const star = stars[index];

  function go(delta: number) {
    setIndex((i) => (i + delta + stars.length) % stars.length);
  }
  function random() {
    if (stars.length <= 1) return;
    setIndex((i) => {
      let next = Math.floor(Math.random() * stars.length);
      if (next === i) next = (next + 1) % stars.length;
      return next;
    });
  }

  return (
    <section>
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="text-lg font-semibold">El Heraldo de Nuffle</h2>
        {stars.length > 1 && (
          <span className="font-mono text-xs" style={{ color: "var(--ink-3)" }}>
            Estrella {index + 1} de {stars.length}
          </span>
        )}
      </div>

      {/*
        Sin overflow-hidden a propósito: recortaría el tooltip de SkillPill
        en cuanto se abriera. Las esquinas redondeadas se replican a mano en
        la cabecera en vez de depender de recortar el contenedor entero.
      */}
      <article
        className="rounded-[3px] border"
        style={{ borderColor: "var(--gold-soft)", background: "var(--surface-1)" }}
      >
        <div
          className="flex items-center justify-between gap-3 rounded-t-[2px] border-b px-4 py-2"
          style={{ borderColor: "var(--border)", background: "var(--surface-2)" }}
        >
          <span
            className="font-mono text-[10px] uppercase tracking-widest"
            style={{ color: "var(--gold)" }}
          >
            Leyenda del Nuffle
          </span>
          <span className="font-mono text-[10px] uppercase tracking-widest" style={{ color: "var(--ink-3)" }}>
            Edición Altdorf
          </span>
        </div>

        <div className="flex flex-wrap gap-4 p-4">
          <div
            className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-2 text-xl font-bold"
            style={{ borderColor: "var(--gold)", color: "var(--gold)", background: "var(--surface-2)" }}
            aria-hidden="true"
          >
            {star.name.charAt(0)}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="text-lg font-bold leading-tight">{star.name}</h3>
              <span className="font-mono text-sm font-bold" style={{ color: "var(--gold)" }}>
                {star.cost.toLocaleString("es-ES")} MO
              </span>
            </div>
            {star.playerTags.length > 0 && (
              <p className="text-xs" style={{ color: "var(--ink-3)" }}>
                {star.playerTags.join(" · ")}
              </p>
            )}

            <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 font-mono text-xs" style={{ color: "var(--ink-2)" }}>
              <span>MO {star.ma}</span>
              <span>FU {star.st}</span>
              <span>AG {star.ag}+</span>
              <span>PA {star.pa ? `${star.pa}+` : "–"}</span>
              <span>AR {star.av}+</span>
            </div>

            <SkillPillList names={star.skillKeys} index={skillIndex} />

            {star.specialRuleName && (
              <p className="mt-2 text-sm">
                <span style={{ color: "var(--gold)" }}>{star.specialRuleName}</span>
                {star.specialRuleText && (
                  <span style={{ color: "var(--ink-2)" }}> — {star.specialRuleText}</span>
                )}
              </p>
            )}

            {star.lore ? (
              <p className="mt-3 border-t pt-3 text-sm leading-relaxed" style={{ borderColor: "var(--border)", color: "var(--ink-2)" }}>
                {star.lore}
              </p>
            ) : (
              <p className="mt-3 border-t pt-3 text-xs italic" style={{ borderColor: "var(--border)", color: "var(--ink-3)" }}>
                Todavía no tiene biografía — está pendiente de generarse.
              </p>
            )}
          </div>
        </div>

        {stars.length > 1 && (
          <div
            className="flex items-center justify-between gap-2 rounded-b-[2px] border-t px-4 py-2"
            style={{ borderColor: "var(--border)", background: "var(--surface-2)" }}
          >
            <button type="button" onClick={() => go(-1)} className="btn-secondary px-3 py-1 text-xs">
              ← Anterior
            </button>
            <button type="button" onClick={random} className="text-xs hover:underline" style={{ color: "var(--ink-3)" }}>
              🎲 Al azar
            </button>
            <button type="button" onClick={() => go(1)} className="btn-secondary px-3 py-1 text-xs">
              Siguiente →
            </button>
          </div>
        )}
      </article>
    </section>
  );
}
