import { describe, expect, it } from "vitest";
import { pairSwissRound, pairKey, buildPlayedPairs, type SwissEntrant } from "./swissPairing";

function makeEntrants(n: number, overrides: Partial<SwissEntrant> = {}): SwissEntrant[] {
  return Array.from({ length: n }, (_, i) => ({
    id: `e${i}`,
    points: 0,
    tdFor: 0,
    tdAgainst: 0,
    byes: 0,
    dropped: false,
    ...overrides,
  }));
}

describe("pairSwissRound", () => {
  it("empareja a todos una sola vez con número par de activos, sin bye", () => {
    const entrants = makeEntrants(8);
    const pairings = pairSwissRound(entrants, new Set(), 1);
    expect(pairings.length).toBe(4);
    expect(pairings.every((p) => p.entrantBId !== null)).toBe(true);
    const involved = pairings.flatMap((p) => [p.entrantAId, p.entrantBId]);
    expect(new Set(involved).size).toBe(8);
  });

  it("da exactamente un bye con número impar de activos", () => {
    const entrants = makeEntrants(7);
    const pairings = pairSwissRound(entrants, new Set(), 1);
    const byes = pairings.filter((p) => p.entrantBId === null);
    expect(byes.length).toBe(1);
    expect(pairings.length).toBe(4); // 3 partidos + 1 bye
  });

  it("no da un segundo bye a quien ya descansó si hay alguien sin bye disponible", () => {
    const entrants = makeEntrants(5, { byes: 0 });
    entrants[0].byes = 1; // este ya descansó antes
    const pairings = pairSwissRound(entrants, new Set(), 2);
    const bye = pairings.find((p) => p.entrantBId === null)!;
    expect(bye.entrantAId).not.toBe("e0");
  });

  it("ignora a los retirados (dropped) al emparejar", () => {
    const entrants = makeEntrants(7);
    entrants[0].dropped = true;
    const pairings = pairSwissRound(entrants, new Set(), 1);
    const involved = pairings.flatMap((p) => [p.entrantAId, p.entrantBId]);
    expect(involved).not.toContain("e0");
    expect(pairings.length).toBe(3); // 6 activos → 3 partidos, sin bye
  });

  it("evita repetir rival ya jugado cuando hay alternativa", () => {
    const entrants = makeEntrants(4, { points: 1 }); // todos empatados, en la misma franja
    const played = buildPlayedPairs([{ entrantAId: "e0", entrantBId: "e1" }, { entrantAId: "e2", entrantBId: "e3" }]);
    const pairings = pairSwissRound(entrants, played, 2);
    for (const p of pairings) {
      if (p.entrantBId) expect(played.has(pairKey(p.entrantAId, p.entrantBId))).toBe(false);
    }
  });

  it("con menos de 2 activos no genera ningún emparejamiento", () => {
    expect(pairSwissRound(makeEntrants(1), new Set(), 1)).toEqual([]);
    expect(pairSwissRound(makeEntrants(0), new Set(), 1)).toEqual([]);
  });
});

describe("pairKey", () => {
  it("es simétrica (mismo resultado sin importar el orden)", () => {
    expect(pairKey("a", "b")).toBe(pairKey("b", "a"));
  });
});
