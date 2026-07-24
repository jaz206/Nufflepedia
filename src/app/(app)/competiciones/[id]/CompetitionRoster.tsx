"use client";

import { useMemo, useState, useTransition } from "react";
import { levelUpCompetitionPlayer, hireCompetitionStar, type StatKey } from "../rosterActions";
import { buildSkillInfoIndex } from "@/lib/resolveSkillName";
import { statLine, effectiveStats, type StatBlock } from "@/lib/playerStats";
import { LEVEL_UP_SPP_COST_TABLE } from "@/rules-engine/data/tables/levelUp";
import SkillPillList, { type SkillInfo } from "@/components/SkillPillList";
import LevelUpPanel from "@/components/LevelUpPanel";

interface Position extends StatBlock {
  id: string;
  name: string;
  startingSkillKeys: string[];
  primaryCategories: string[];
  secondaryCategories: string[];
}
interface StarPlayer extends StatBlock {
  key: string;
  name: string;
  cost: number;
  skillKeys: string[];
}
interface CompPlayer {
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

const STATUS_LABEL: Record<CompPlayer["status"], string> = {
  ACTIVE: "Activo",
  MISS_NEXT_GAME: "Se pierde el próximo",
  NIGGLING_INJURY: "Lesión persistente",
  DEAD: "Muerto",
  RETIRED: "Retirado",
};

const MAX_COPIES_PER_STAR = 2;

export default function CompetitionRoster({
  entryId,
  teamName,
  snapshotTreasury,
  players,
  race,
  stars,
  skills,
  traits,
}: {
  entryId: string;
  teamName: string;
  snapshotTreasury: number;
  players: CompPlayer[];
  race: { name: string; positions: Position[] } | null;
  stars: StarPlayer[];
  skills: SkillInfo[];
  traits: SkillInfo[];
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [pending, startTransition] = useTransition();
  const skillIndex = useMemo(() => buildSkillInfoIndex([...skills, ...traits]), [skills, traits]);
  const skillNameByKey = useMemo(
    () => new Map(skills.filter((s): s is SkillInfo & { key: string } => !!s.key).map((s) => [s.key, s.name])),
    [skills]
  );

  function countForStar(starKey: string) {
    return players.filter((p) => p.starKey === starKey).length;
  }

  function handleLevelUp(
    playerId: string,
    cost: number,
    choice: { kind: "PRIMARY_RANDOM" } | { kind: "PRIMARY_CHOSEN"; skillKey: string } | { kind: "SECONDARY_CHOSEN"; skillKey: string } | { kind: "ATTRIBUTE"; stat: StatKey }
  ) {
    setError(undefined);
    startTransition(async () => {
      const res = await levelUpCompetitionPlayer(playerId, choice);
      if (!res.ok) setError(res.error);
    });
  }

  function handleHireStar(starKey: string) {
    setError(undefined);
    startTransition(async () => {
      const res = await hireCompetitionStar(entryId, starKey);
      if (!res.ok) setError(res.error);
    });
  }

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="btn-secondary">
        Ver mi plantilla de esta competición — {teamName}
      </button>
    );
  }

  return (
    <div className="space-y-4 rounded-[3px] border p-4" style={{ borderColor: "var(--border)", background: "var(--surface-1)" }}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold">Mi plantilla de esta competición — {teamName}</h3>
          <p className="text-xs" style={{ color: "var(--ink-3)" }}>
            Copia de trabajo aislada de tu equipo — lo que pase aquí (PE, subidas de nivel, fichajes) no afecta a tu plantilla real
            en El Cuartel.
          </p>
        </div>
        <button type="button" onClick={() => setOpen(false)} className="text-xs underline" style={{ color: "var(--ink-3)" }}>
          Cerrar
        </button>
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}

      <p className="font-mono text-xs" style={{ color: "var(--gold)" }}>
        Tesorería de la competición: {snapshotTreasury.toLocaleString("es-ES")} MO
      </p>

      <div className="grid gap-2">
        {players.map((p) => {
          const pos = p.positionKey ? race?.positions.find((x) => x.id === p.positionKey) : undefined;
          const star = p.starKey ? stars.find((s) => s.key === p.starKey) : undefined;
          const baseStats = pos ?? star;
          const stats = baseStats ? effectiveStats(baseStats, p) : undefined;
          const levelUpSkills = p.skills.filter((s) => s.source === "LEVEL_UP");
          const levelUpNames = levelUpSkills.map((s) => skillNameByKey.get(s.skillKey) ?? s.skillKey);
          const skillNames = [...(pos?.startingSkillKeys ?? star?.skillKeys ?? []), ...levelUpNames];
          const levelUpsTaken = levelUpSkills.length + p.maIncreases + p.stIncreases + p.agIncreases + p.paIncreases + p.avIncreases;
          const levelRow = LEVEL_UP_SPP_COST_TABLE[Math.min(levelUpsTaken, LEVEL_UP_SPP_COST_TABLE.length - 1)];

          return (
            <div
              key={p.id}
              className="rounded-[3px] border px-3 py-2"
              style={{ borderColor: star ? "var(--gold-soft)" : "var(--border)", background: "var(--surface-2)" }}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium">
                  #{p.number} {p.customName}
                </p>
                <div className="flex items-center gap-2">
                  {p.status !== "ACTIVE" && (
                    <span className="text-xs" style={{ color: "var(--danger, #b23)" }}>
                      {STATUS_LABEL[p.status]}
                    </span>
                  )}
                  {!star && (
                    <span className="font-mono text-xs" style={{ color: "var(--gold)" }}>
                      {p.spp} PE
                    </span>
                  )}
                </div>
              </div>
              <p className="font-mono text-xs" style={{ color: "var(--ink-3)" }}>
                {stats ? statLine(stats) : "?"}
              </p>
              <SkillPillList names={skillNames} index={skillIndex} />
              {pos && (
                <LevelUpPanel
                  spp={p.spp}
                  levelRow={levelRow}
                  primaryCategories={pos.primaryCategories}
                  secondaryCategories={pos.secondaryCategories}
                  knownSkillKeys={p.skills.map((s) => s.skillKey)}
                  allSkills={skills}
                  hasPa={pos.pa !== null}
                  onLevelUp={(choice, cost) => handleLevelUp(p.id, cost, choice)}
                />
              )}
            </div>
          );
        })}
      </div>

      {stars.length > 0 && (
        <div>
          <h4 className="mb-2 text-sm font-semibold">Fichar Estrella solo para esta competición</h4>
          <div className="grid gap-2">
            {stars.map((star) => {
              const copies = countForStar(star.key);
              const maxed = copies >= MAX_COPIES_PER_STAR;
              const tooExpensive = star.cost > snapshotTreasury;
              return (
                <div
                  key={star.key}
                  className="flex items-center justify-between rounded-[3px] border px-3 py-2"
                  style={{ borderColor: "var(--gold-soft)", background: "var(--surface-2)" }}
                >
                  <div>
                    <p className="text-sm font-medium">
                      {star.name}{" "}
                      <span className="font-mono text-xs" style={{ color: "var(--ink-3)" }}>
                        ({copies}/{MAX_COPIES_PER_STAR})
                      </span>
                    </p>
                    <p className="font-mono text-xs" style={{ color: "var(--ink-3)" }}>
                      {statLine(star)} · {star.cost.toLocaleString("es-ES")} MO
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleHireStar(star.key)}
                    disabled={pending || maxed || tooExpensive}
                    className="btn-primary"
                    style={{ padding: "4px 12px", fontSize: "12px" }}
                  >
                    {maxed ? "Al máximo" : tooExpensive ? "Sin fondos" : "Fichar"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
