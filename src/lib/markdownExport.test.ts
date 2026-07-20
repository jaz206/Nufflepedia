import { describe, expect, it } from "vitest";
import { buildMarkdownExport, type ExportSkill, type ExportTrait } from "./markdownExport";

const skill: ExportSkill = {
  key: "block",
  name: "Placar",
  englishName: "Block",
  category: "GENERAL",
  isActive: false,
  isElite: true,
  description: "Descripción de prueba.",
};

const trait: ExportTrait = {
  key: "bone-head",
  name: "Bone Head",
  category: "GENERAL",
  description: "Con 1, el jugador no actúa.",
};

describe("buildMarkdownExport", () => {
  it("includes both sections with headers", () => {
    const md = buildMarkdownExport([skill], [trait]);
    expect(md).toContain("# Nufflepedia — Habilidades y Rasgos");
    expect(md).toContain("## Habilidades");
    expect(md).toContain("## Rasgos");
  });

  it("groups by category and shows the elite tag", () => {
    const md = buildMarkdownExport([skill], [trait]);
    expect(md).toContain("### General (1)");
    expect(md).toContain("**Placar (Block)** — Élite");
  });

  it("omits empty categories", () => {
    const md = buildMarkdownExport([skill], []);
    expect(md).not.toContain("### Agilidad");
    expect(md).not.toContain("### Resistencia");
  });

  it("handles no data without throwing", () => {
    expect(() => buildMarkdownExport([], [])).not.toThrow();
  });
});
