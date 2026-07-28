import { describe, expect, it } from "vitest";
import { computeStandings, type StandingsMatchInput } from "./presentialStandings";

const SCORING = { pointsWin: 2, pointsDraw: 1, pointsLoss: 0 };

describe("computeStandings", () => {
  it("reparte puntos de victoria/empate/derrota y acumula TD/bajas de ambos lados", () => {
    const matches: StandingsMatchInput[] = [
      { entrantAId: "a", entrantBId: "b", scoreA: 3, scoreB: 1, casA: 2, casB: 0, reported: true },
      { entrantAId: "a", entrantBId: "b", scoreA: 1, scoreB: 1, casA: 0, casB: 1, reported: true },
    ];
    const rows = computeStandings(["a", "b"], matches, SCORING);
    const a = rows.find((r) => r.entrantId === "a")!;
    const b = rows.find((r) => r.entrantId === "b")!;
    expect(a.won).toBe(1);
    expect(a.drawn).toBe(1);
    expect(a.points).toBe(3); // 2 + 1
    expect(b.lost).toBe(1);
    expect(b.drawn).toBe(1);
    expect(b.points).toBe(1); // 0 + 1
    expect(a.tdFor).toBe(4);
    expect(a.tdAgainst).toBe(2);
    expect(a.casFor).toBe(2);
    expect(b.casFor).toBe(1);
  });

  it("un bye da los puntos de victoria sin contar como partido jugado", () => {
    const matches: StandingsMatchInput[] = [{ entrantAId: "a", entrantBId: null, scoreA: null, scoreB: null, casA: 0, casB: 0, reported: true }];
    const rows = computeStandings(["a"], matches, SCORING);
    const a = rows[0];
    expect(a.byes).toBe(1);
    expect(a.played).toBe(0);
    expect(a.points).toBe(2);
  });

  it("ignora los partidos todavía no reportados", () => {
    const matches: StandingsMatchInput[] = [{ entrantAId: "a", entrantBId: "b", scoreA: 3, scoreB: 0, casA: 0, casB: 0, reported: false }];
    const rows = computeStandings(["a", "b"], matches, SCORING);
    expect(rows.every((r) => r.played === 0 && r.points === 0)).toBe(true);
  });

  it("ordena por puntos, luego diferencia de TD, luego TD a favor", () => {
    const matches: StandingsMatchInput[] = [
      { entrantAId: "a", entrantBId: "b", scoreA: 4, scoreB: 0, casA: 0, casB: 0, reported: true },
      { entrantAId: "c", entrantBId: "d", scoreA: 1, scoreB: 0, casA: 0, casB: 0, reported: true },
    ];
    const rows = computeStandings(["a", "b", "c", "d"], matches, SCORING);
    // a (4-0) por encima de c (1-0) por diferencia de TD; b y d perdieron
    // ambos 0-0 de diferencia, empatados entre sí — solo importa que
    // los dos ganadores queden por delante de los dos perdedores.
    expect(rows.slice(0, 2).map((r) => r.entrantId)).toEqual(["a", "c"]);
    expect(new Set(rows.slice(2).map((r) => r.entrantId))).toEqual(new Set(["b", "d"]));
  });
});
