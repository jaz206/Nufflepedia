import { describe, expect, it } from "vitest";
import { MATCH_SEQUENCE } from "./matchSequence";

describe("MATCH_SEQUENCE", () => {
  it("tiene las tres fases en orden: pre, durante y post partido", () => {
    expect(MATCH_SEQUENCE.map((s) => s.key)).toEqual([
      "pre-partido",
      "durante-el-partido",
      "post-partido",
    ]);
  });

  it("cada sección tiene pasos numerados consecutivos desde 1", () => {
    for (const section of MATCH_SEQUENCE) {
      const orders = section.steps.map((s) => s.order);
      expect(orders).toEqual(orders.map((_, i) => i + 1));
    }
  });

  it("ningún paso tiene título o descripción vacíos", () => {
    for (const section of MATCH_SEQUENCE) {
      for (const step of section.steps) {
        expect(step.title.trim().length).toBeGreaterThan(0);
        expect(step.description.trim().length).toBeGreaterThan(0);
      }
    }
  });
});
