import { describe, expect, it } from "vitest";
import {
  generateBracket,
  recordBracketMatch,
  isBracketComplete,
  bracketChampion,
  findBracketMatch,
} from "./tournamentBracket";

describe("generateBracket", () => {
  it("genera log2(potencia de 2) rondas para 8 equipos, sin byes", () => {
    const teams = Array.from({ length: 8 }, (_, i) => `t${i}`);
    const rounds = generateBracket(teams);
    expect(rounds.map((r) => r.matches.length)).toEqual([4, 2, 1]);
    // Sin equipos null y sin byes con 8 (potencia de 2 exacta).
    for (const m of rounds[0].matches) {
      expect(m.homeEntryId).not.toBeNull();
      expect(m.awayEntryId).not.toBeNull();
      expect(m.winnerEntryId).toBeNull();
    }
  });

  it("resuelve los byes automáticamente cuando no es potencia de 2 (5 equipos → cuadro de 8)", () => {
    const teams = Array.from({ length: 5 }, (_, i) => `t${i}`);
    const rounds = generateBracket(teams);
    expect(rounds.map((r) => r.matches.length)).toEqual([4, 2, 1]);
    const byeWins = rounds[0].matches.filter((m) => m.winnerEntryId !== null);
    expect(byeWins.length).toBe(3); // 8 - 5 = 3 byes
    // Los ganadores de bye ya están sembrados en la ronda 2.
    const round2Ids = rounds[1].matches.flatMap((m) => [m.homeEntryId, m.awayEntryId]);
    for (const bye of byeWins) {
      expect(round2Ids).toContain(bye.winnerEntryId);
    }
  });

  it("un torneo de 2 equipos es directamente la final", () => {
    const rounds = generateBracket(["a", "b"]);
    expect(rounds.length).toBe(1);
    expect(rounds[0].matches.length).toBe(1);
  });

  it("devuelve cuadro vacío con menos de 2 equipos", () => {
    expect(generateBracket(["a"])).toEqual([]);
    expect(generateBracket([])).toEqual([]);
  });
});

describe("recordBracketMatch + isBracketComplete + bracketChampion", () => {
  it("avanza al ganador a la siguiente ronda y declara campeón al resolver la final", () => {
    let rounds = generateBracket(["a", "b", "c", "d"]);
    expect(isBracketComplete(rounds)).toBe(false);

    const semi1 = rounds[0].matches[0];
    const semi2 = rounds[0].matches[1];

    rounds = recordBracketMatch(rounds, semi1.id, 3, 1);
    const winner1 = findBracketMatch(rounds, semi1.id)!.winnerEntryId!;
    expect([semi1.homeEntryId, semi1.awayEntryId]).toContain(winner1);
    expect(isBracketComplete(rounds)).toBe(false);

    rounds = recordBracketMatch(rounds, semi2.id, 0, 2);
    const winner2 = findBracketMatch(rounds, semi2.id)!.winnerEntryId!;

    // La final ya debe tener sembrados a ambos finalistas.
    const final = rounds[rounds.length - 1].matches[0];
    expect([final.homeEntryId, final.awayEntryId].sort()).toEqual([winner1, winner2].sort());

    rounds = recordBracketMatch(rounds, final.id, 2, 1);
    expect(isBracketComplete(rounds)).toBe(true);
    expect(bracketChampion(rounds)).toBe(final.homeEntryId);
  });

  it("no declara campeón mientras el cuadro no esté resuelto", () => {
    const rounds = generateBracket(["a", "b", "c", "d"]);
    expect(bracketChampion(rounds)).toBeNull();
  });
});
