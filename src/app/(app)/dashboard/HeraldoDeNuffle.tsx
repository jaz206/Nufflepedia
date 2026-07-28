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
  lore: string | null;
}

const ROTATE_MS = 30_000;
const LORE_PREVIEW_CHARS = 220;

/**
 * Gaceta de Jugadores Estrella: rota sola cada 30s, pero cualquier
 * interacción manual (anterior/siguiente/al azar/expandir biografía) la
 * pausa — hay que darle otra vez a "reanudar" para que vuelva a avanzar
 * sola. Solo depende de MasterStarPlayer — no de equipos ni de partidos,
 * así que puede vivir en el Dashboard desde ya.
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
  const [auto, setAuto] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const skillIndex = useMemo(() => buildSkillInfoIndex([...skills, ...traits]), [skills, traits]);

  useEffect(() => {
    if (!auto || stars.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % stars.length);
      setExpanded(false);
    }, ROTATE_MS);
    return () => clearInterval(timer);
  }, [auto, stars.length]);

  if (stars.length === 0) return null;
  const star = stars[index];

  function go(delta: number) {
    setAuto(false);
    setExpanded(false);
    setIndex((i) => (i + delta + stars.length) % stars.length);
  }
  function random() {
    if (stars.length <= 1) return;
    setAuto(false);
    setExpanded(false);
    setIndex((i) => {
      let next = Math.floor(Math.random() * stars.length);
      if (next === i) next = (next + 1) % stars.length;
      return next;
    });
  }
  function toggleExpanded() {
    setAuto(false);
    setExpanded((e) => !e);
  }

  const loreIsLong = !!star.lore && star.lore.length > LORE_PREVIEW_CHARS;
  const lorePreview = star.lore && loreIsLong ? `${star.lore.slice(0, LORE_PREVIEW_CHARS).trimEnd()}…` : star.lore;

  return (
    <section>
      <div className="mb-3 flex items-baseline justify-between gap-2">
        <h2 className="text-lg font-semibold">El Heraldo de Nuffle</h2>
        {stars.length > 1 && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setAuto((a) => !a)}
              className="text-xs hover:underline"
              style={{ color: "var(--ink-3)" }}
              title={auto ? "Pausar rotación automática" : "Reanudar rotación automática"}
            >
              {auto ? "⏸ Auto" : "▶ Pausado"}
            </button>
            <span className="font-mono text-xs" style={{ color: "var(--ink-3)" }}>
              Estrella {index + 1} de {stars.length}
            </span>
          </div>
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
              <div className="mt-3 border-t pt-3" style={{ borderColor: "var(--border)" }}>
                <p className="text-sm leading-relaxed" style={{ color: "var(--ink-2)" }}>
                  {expanded ? star.lore : lorePreview}
                </p>
                {loreIsLong && (
                  <button
                    type="button"
                    onClick={toggleExpanded}
                    className="mt-1 text-xs font-medium hover:underline"
                    style={{ color: "var(--gold)" }}
                  >
                    {expanded ? "Leer menos ▲" : "Leer más ▼"}
                  </button>
                )}
              </div>
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
