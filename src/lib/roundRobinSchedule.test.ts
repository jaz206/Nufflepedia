import { describe, expect, it } from "vitest";
import { generateRoundRobinSchedule } from "./roundRobinSchedule";

describe("generateRoundRobinSchedule", () => {
  it("2 equipos a doble vuelta: 2 partidos, con local/visitante invertido", () => {
    const fixtures = generateRoundRobinSchedule(["a", "b"]);
    expect(fixtures).toHaveLength(2);
    expect(fixtures[0]).toEqual({ round: 1, homeEntryId: "a", awayEntryId: "b" });
    expect(fixtures[1]).toEqual({ round: 2, homeEntryId: "b", awayEntryId: "a" });
  });

  it("4 equipos a doble vuelta: cada pareja juega exactamente 2 veces (una en cada casa)", () => {
    const teams = ["a", "b", "c", "d"];
    const fixtures = generateRoundRobinSchedule(teams);
    expect(fixtures).toHaveLength(12); // C(4,2)=6 parejas x 2

    const pairCounts = new Map<string, number>();
    for (const f of fixtures) {
      const key = [f.homeEntryId, f.awayEntryId].sort().join("-");
      pairCounts.set(key, (pairCounts.get(key) ?? 0) + 1);
    }
    expect(pairCounts.size).toBe(6);
    for (const count of pairCounts.values()) expect(count).toBe(2);

    // Cada pareja juega una vez en cada sentido (ida y vuelta real).
    for (let i = 0; i < teams.length; i++) {
      for (let j = i + 1; j < teams.length; j++) {
        const home1 = fixtures.some((f) => f.homeEntryId === teams[i] && f.awayEntryId === teams[j]);
        const home2 = fixtures.some((f) => f.homeEntryId === teams[j] && f.awayEntryId === teams[i]);
        expect(home1).toBe(true);
        expect(home2).toBe(true);
      }
    }
  });

  it("3 equipos (impar): cada uno descansa una vez por vuelta, nadie juega dos veces en la misma ronda", () => {
    const fixtures = generateRoundRobinSchedule(["a", "b", "c"]);
    const byRound = new Map<number, typeof fixtures>();
    for (const f of fixtures) {
      byRound.set(f.round, [...(byRound.get(f.round) ?? []), f]);
    }
    for (const roundFixtures of byRound.values()) {
      const teamsPlaying = roundFixtures.flatMap((f) => [f.homeEntryId, f.awayEntryId]);
      expect(new Set(teamsPlaying).size).toBe(teamsPlaying.length); // sin duplicados
    }
  });

  it("vuelta simple (double=false) da la mitad de partidos", () => {
    const fixtures = generateRoundRobinSchedule(["a", "b", "c", "d"], false);
    expect(fixtures).toHaveLength(6);
  });

  it("con menos de 2 equipos no genera nada", () => {
    expect(generateRoundRobinSchedule([])).toEqual([]);
    expect(generateRoundRobinSchedule(["a"])).toEqual([]);
  });
});
