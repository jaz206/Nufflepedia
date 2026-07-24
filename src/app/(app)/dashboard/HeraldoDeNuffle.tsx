"use client";

import { useEffect, useMemo, useState } from "react";
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
}

const ROTATE_MS = 30_000;

/**
 * Gaceta rotativa de Jugadores Estrella: cambia de protagonista cada 30s.
 * Solo depende de MasterStarPlayer (Fase 1, ya disponible) — no de equipos
 * ni de partidos, así que puede vivir en el Dashboard desde ya.
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

  useEffect(() => {
    if (stars.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % stars.length);
    }, ROTATE_MS);
    return () => clearInterval(timer);
  }, [stars.length]);

  if (stars.length === 0) return null;
  const star = stars[index];

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
        la cabecera y la barra de progreso (primer/último hijo) en vez de
        depender de recortar el contenedor entero.
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
          </div>
        </div>

        {stars.length > 1 && (
          <div className="h-1 overflow-hidden rounded-b-[2px]" style={{ background: "var(--surface-2)" }}>
            <div key={index} className="heraldo-progress-bar h-full" style={{ background: "var(--gold)" }} />
          </div>
        )}
      </article>
    </section>
  );
}
