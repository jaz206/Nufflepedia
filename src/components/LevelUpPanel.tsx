"use client";

import { useState } from "react";
import type { SkillInfo } from "@/components/SkillPillList";

export type StatKey = "MA" | "ST" | "AG" | "PA" | "AV";

type Choice =
  | { kind: "PRIMARY_RANDOM" }
  | { kind: "PRIMARY_CHOSEN"; skillKey: string }
  | { kind: "SECONDARY_CHOSEN"; skillKey: string }
  | { kind: "ATTRIBUTE"; stat: StatKey };

interface LevelRow {
  primaryRandom: number;
  primaryChosen: number;
  secondaryChosen: number;
  attribute: number;
}

const STAT_LABEL: Record<StatKey, string> = { MA: "Movimiento", ST: "Fuerza", AG: "Agilidad", PA: "Pase", AV: "Armadura" };

/**
 * Gasta PE en una mejora: habilidad primaria (al azar o elegida), secundaria
 * elegida, o mejora de atributo. La mejora de atributo no simula el dado —
 * el reglamento exige tirar 1D8 físicamente según su tabla oficial; aquí
 * solo se registra qué característica subió, igual que con las lesiones.
 * Compartido entre El Cuartel (plantilla real) y la plantilla-copia de una
 * competición — ambos pagan el mismo coste con la misma tabla oficial.
 */
export default function LevelUpPanel({
  spp,
  levelRow,
  primaryCategories,
  secondaryCategories,
  knownSkillKeys,
  allSkills,
  hasPa,
  onLevelUp,
}: {
  spp: number;
  levelRow: LevelRow;
  primaryCategories: string[];
  secondaryCategories: string[];
  knownSkillKeys: string[];
  allSkills: SkillInfo[];
  hasPa: boolean;
  onLevelUp: (choice: Choice, cost: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const [primarySkillKey, setPrimarySkillKey] = useState("");
  const [secondarySkillKey, setSecondarySkillKey] = useState("");
  const [stat, setStat] = useState<StatKey>("MA");

  const known = new Set(knownSkillKeys);
  const primaryOptions = allSkills.filter((s) => s.key && s.category && primaryCategories.includes(s.category) && !known.has(s.key));
  const secondaryOptions = allSkills.filter((s) => s.key && s.category && secondaryCategories.includes(s.category) && !known.has(s.key));
  const statOptions: StatKey[] = hasPa ? ["MA", "ST", "AG", "PA", "AV"] : ["MA", "ST", "AG", "AV"];

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="btn-secondary mt-1"
        style={{ padding: "2px 8px", fontSize: "11px" }}
      >
        Subir de nivel
      </button>
    );
  }

  return (
    <div className="mt-2 space-y-2 rounded-[3px] border p-2" style={{ borderColor: "var(--border)", background: "var(--surface-2)" }}>
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold" style={{ color: "var(--ink-3)" }}>
          Subir de nivel — {spp} PE disponibles
        </p>
        <button type="button" onClick={() => setOpen(false)} className="text-xs underline" style={{ color: "var(--ink-3)" }}>
          Cerrar
        </button>
      </div>

      <div className="flex items-center justify-between gap-2 text-xs">
        <span>Habilidad primaria al azar</span>
        <button
          type="button"
          disabled={spp < levelRow.primaryRandom}
          onClick={() => onLevelUp({ kind: "PRIMARY_RANDOM" }, levelRow.primaryRandom)}
          className="btn-primary"
          style={{ padding: "2px 8px", fontSize: "11px" }}
        >
          {levelRow.primaryRandom} PE
        </button>
      </div>

      {primaryOptions.length > 0 && (
        <div className="flex items-center gap-2 text-xs">
          <select className="input flex-1" style={{ padding: "2px 4px", fontSize: "11px" }} value={primarySkillKey} onChange={(e) => setPrimarySkillKey(e.target.value)}>
            <option value="">Habilidad primaria elegida…</option>
            {primaryOptions.map((s) => (
              <option key={s.key} value={s.key}>
                {s.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            disabled={!primarySkillKey || spp < levelRow.primaryChosen}
            onClick={() => onLevelUp({ kind: "PRIMARY_CHOSEN", skillKey: primarySkillKey }, levelRow.primaryChosen)}
            className="btn-primary"
            style={{ padding: "2px 8px", fontSize: "11px" }}
          >
            {levelRow.primaryChosen} PE
          </button>
        </div>
      )}

      {secondaryOptions.length > 0 && (
        <div className="flex items-center gap-2 text-xs">
          <select className="input flex-1" style={{ padding: "2px 4px", fontSize: "11px" }} value={secondarySkillKey} onChange={(e) => setSecondarySkillKey(e.target.value)}>
            <option value="">Habilidad secundaria elegida…</option>
            {secondaryOptions.map((s) => (
              <option key={s.key} value={s.key}>
                {s.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            disabled={!secondarySkillKey || spp < levelRow.secondaryChosen}
            onClick={() => onLevelUp({ kind: "SECONDARY_CHOSEN", skillKey: secondarySkillKey }, levelRow.secondaryChosen)}
            className="btn-primary"
            style={{ padding: "2px 8px", fontSize: "11px" }}
          >
            {levelRow.secondaryChosen} PE
          </button>
        </div>
      )}

      <div className="flex items-center gap-2 text-xs">
        <select className="input flex-1" style={{ padding: "2px 4px", fontSize: "11px" }} value={stat} onChange={(e) => setStat(e.target.value as StatKey)}>
          {statOptions.map((s) => (
            <option key={s} value={s}>
              Mejora de atributo: {STAT_LABEL[s]}
            </option>
          ))}
        </select>
        <button
          type="button"
          disabled={spp < levelRow.attribute}
          onClick={() => onLevelUp({ kind: "ATTRIBUTE", stat }, levelRow.attribute)}
          className="btn-primary"
          style={{ padding: "2px 8px", fontSize: "11px" }}
        >
          {levelRow.attribute} PE
        </button>
      </div>
      <p className="text-[10px]" style={{ color: "var(--ink-3)" }}>
        Tira 1D8 según la Tabla de Mejora de Atributos del reglamento y elige aquí lo que salga.
      </p>
    </div>
  );
}
