import { describe, expect, it } from "vitest";
import { applyFormation, clampToGrid, FORMATIONS, GRID_COLS, GRID_ROWS } from "./tacticalFormations";

describe("FORMATIONS", () => {
  it("todas las formaciones caben dentro de la cuadrícula", () => {
    for (const f of FORMATIONS) {
      for (const slot of f.slots) {
        expect(slot.x).toBeGreaterThanOrEqual(0);
        expect(slot.x).toBeLessThan(GRID_COLS);
        expect(slot.y).toBeGreaterThanOrEqual(0);
        expect(slot.y).toBeLessThan(GRID_ROWS);
      }
    }
  });

  it("ninguna formación pasa de 11 jugadores", () => {
    for (const f of FORMATIONS) {
      expect(f.slots.length).toBeLessThanOrEqual(11);
    }
  });
});

describe("applyFormation", () => {
  it("coloca en orden los primeros N jugadores según los huecos de la formación", () => {
    const formation = FORMATIONS[0];
    const ids = Array.from({ length: 5 }, (_, i) => `p${i}`);
    const placed = applyFormation(formation, ids);
    expect(placed.length).toBe(5);
    expect(placed.map((p) => p.playerId)).toEqual(ids);
    expect(placed[0]).toEqual({ playerId: "p0", x: formation.slots[0].x, y: formation.slots[0].y });
  });

  it("no coloca más jugadores de los que caben en la formación", () => {
    const formation = FORMATIONS[0];
    const ids = Array.from({ length: 20 }, (_, i) => `p${i}`);
    const placed = applyFormation(formation, ids);
    expect(placed.length).toBe(formation.slots.length);
  });
});

describe("clampToGrid", () => {
  it("recorta coordenadas fuera de rango a los bordes de la cuadrícula", () => {
    expect(clampToGrid(-5, -5)).toEqual({ x: 0, y: 0 });
    expect(clampToGrid(999, 999)).toEqual({ x: GRID_COLS - 1, y: GRID_ROWS - 1 });
  });

  it("redondea coordenadas fraccionarias", () => {
    expect(clampToGrid(3.6, 4.4)).toEqual({ x: 4, y: 4 });
  });
});
