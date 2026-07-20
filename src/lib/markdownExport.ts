import {
  SKILL_CATEGORY_LABELS,
  SKILL_CATEGORY_VALUES,
  TRAIT_CATEGORY_LABELS,
  TRAIT_CATEGORY_VALUES,
  type SkillCategoryValue,
  type TraitCategoryValue,
} from "./categoryLabels";

export interface ExportSkill {
  key: string;
  name: string;
  englishName?: string | null;
  category: SkillCategoryValue;
  isActive: boolean;
  isElite: boolean;
  description: string;
}

export interface ExportTrait {
  key: string;
  name: string;
  englishName?: string | null;
  category: TraitCategoryValue;
  description: string;
}

/**
 * Genera un documento Markdown con el catálogo completo de habilidades y
 * rasgos, para guardar como referencia o reutilizar en otra herramienta.
 */
export function buildMarkdownExport(skills: ExportSkill[], traits: ExportTrait[]): string {
  const lines: string[] = [];
  const today = new Date().toISOString().slice(0, 10);

  lines.push("# Nufflepedia — Habilidades y Rasgos");
  lines.push("");
  lines.push(`_Exportado el ${today} desde Blood Bowl Manager._`);
  lines.push("");
  lines.push("## Habilidades");
  lines.push("");

  for (const category of SKILL_CATEGORY_VALUES) {
    const items = skills.filter((s) => s.category === category);
    if (items.length === 0) continue;
    lines.push(`### ${SKILL_CATEGORY_LABELS[category]} (${items.length})`);
    lines.push("");
    for (const skill of items) {
      const tags = [skill.isElite && "Élite", skill.isActive && "Activa"].filter(Boolean).join(", ");
      const title = skill.englishName ? `${skill.name} (${skill.englishName})` : skill.name;
      lines.push(`- **${title}**${tags ? ` — ${tags}` : ""}`);
      lines.push(`  ${skill.description}`);
      lines.push("");
    }
  }

  lines.push("## Rasgos");
  lines.push("");

  for (const category of TRAIT_CATEGORY_VALUES) {
    const items = traits.filter((t) => t.category === category);
    if (items.length === 0) continue;
    lines.push(`### ${TRAIT_CATEGORY_LABELS[category]} (${items.length})`);
    lines.push("");
    for (const trait of items) {
      const title = trait.englishName ? `${trait.name} (${trait.englishName})` : trait.name;
      lines.push(`- **${title}**`);
      lines.push(`  ${trait.description}`);
      lines.push("");
    }
  }

  return lines.join("\n");
}
