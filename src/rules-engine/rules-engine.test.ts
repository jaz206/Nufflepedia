import { describe, expect, it } from "vitest";
import { SKILLS, getSkillByKey, getSkillsByCategory } from "./data/skills";
import { TRAITS } from "./data/traits";
import { WEATHER_TABLE, resolveWeather } from "./data/tables/weather";
import { KICKOFF_TABLE, resolveKickoff } from "./data/tables/kickoff";
import { PRAYERS_TO_NUFFLE_TABLE, resolvePrayerToNuffle } from "./data/tables/prayersToNuffle";
import { resolveArmorRoll, resolveInjuryD16, resolveWoundRoll } from "./data/tables/injury";
import { getSppValue } from "./data/tables/spp";

describe("skills catalog", () => {
  it("has no duplicate keys", () => {
    const keys = SKILLS.map((s) => s.key);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("only uses the 6 official categories", () => {
    const validCategories = ["General", "Agilidad", "Fuerza", "Pase", "Mutacion", "Triquinuelas"];
    for (const skill of SKILLS) {
      expect(validCategories).toContain(skill.category);
    }
  });

  it("finds a known skill by key", () => {
    expect(getSkillByKey("block")?.name).toBe("Placar");
  });

  it("filters by category", () => {
    const agility = getSkillsByCategory("Agilidad");
    expect(agility.length).toBeGreaterThan(0);
    expect(agility.every((s) => s.category === "Agilidad")).toBe(true);
  });

  it("marks the S3 elite skills", () => {
    const elite = SKILLS.filter((s) => s.isElite).map((s) => s.key).sort();
    expect(elite).toEqual(["block", "dodge", "guard", "mighty-blow"]);
  });
});

describe("traits catalog", () => {
  it("has no duplicate keys", () => {
    const keys = TRAITS.map((t) => t.key);
    expect(new Set(keys).size).toBe(keys.length);
  });
});

describe("weather table", () => {
  it("covers every possible 2D6 sum (2-12) exactly once", () => {
    for (let roll = 2; roll <= 12; roll++) {
      expect(() => resolveWeather(roll)).not.toThrow();
    }
  });

  it("resolves boundary rolls correctly", () => {
    expect(resolveWeather(2).name).toBe("Calor Asfixiante");
    expect(resolveWeather(4).name).toBe("Clima Perfecto");
    expect(resolveWeather(10).name).toBe("Clima Perfecto");
    expect(resolveWeather(12).name).toBe("Ventisca");
  });

  it("has no gaps or overlaps across the table", () => {
    const sorted = [...WEATHER_TABLE].sort((a, b) => a.min - b.min);
    expect(sorted[0].min).toBe(2);
    expect(sorted[sorted.length - 1].max).toBe(12);
    for (let i = 1; i < sorted.length; i++) {
      expect(sorted[i].min).toBe(sorted[i - 1].max + 1);
    }
  });
});

describe("kickoff table", () => {
  it("covers every possible 2D6 sum (2-12) exactly once", () => {
    const rolls = KICKOFF_TABLE.map((e) => e.roll).sort((a, b) => a - b);
    expect(rolls).toEqual([2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  });

  it("resolves a known event", () => {
    expect(resolveKickoff(7).name).toBe("Entrenador Brillante");
  });
});

describe("prayers to Nuffle table", () => {
  it("covers every possible 1D16 roll exactly once", () => {
    const rolls = PRAYERS_TO_NUFFLE_TABLE.map((e) => e.roll).sort((a, b) => a - b);
    expect(rolls).toEqual(Array.from({ length: 16 }, (_, i) => i + 1));
  });

  it("resolves a known prayer", () => {
    expect(resolvePrayerToNuffle(16).name).toBe("Entrenamiento Intensivo");
    expect(resolvePrayerToNuffle(1).name).toBe("Trampilla Traicionera");
  });

  it("throws outside the 1-16 range", () => {
    expect(() => resolvePrayerToNuffle(0)).toThrow();
    expect(() => resolvePrayerToNuffle(17)).toThrow();
  });
});

describe("injury engine", () => {
  it("armor roll breaks only above the armor value", () => {
    expect(resolveArmorRoll(9, 8).broken).toBe(true);
    expect(resolveArmorRoll(8, 8).broken).toBe(false);
  });

  it("mighty blow can break armor that the base roll did not", () => {
    expect(resolveArmorRoll(8, 9, 2).broken).toBe(true);
    expect(resolveArmorRoll(6, 9, 2).broken).toBe(false);
  });

  it("wound roll thresholds match the S3 codex", () => {
    expect(resolveWoundRoll(7)).toBe("STUNNED");
    expect(resolveWoundRoll(8)).toBe("KO");
    expect(resolveWoundRoll(9)).toBe("KO");
    expect(resolveWoundRoll(10)).toBe("INJURY");
  });

  it("D16 injury table covers 1-16 with no gaps", () => {
    for (let roll = 1; roll <= 16; roll++) {
      expect(() => resolveInjuryD16(roll)).not.toThrow();
    }
    expect(resolveInjuryD16(16).status).toBe("DEAD");
    expect(resolveInjuryD16(1).status).toBe("BADLY_HURT");
  });
});

describe("SPP table", () => {
  it("uses standard values by default", () => {
    expect(getSppValue("TOUCHDOWN")).toBe(3);
    expect(getSppValue("CASUALTY")).toBe(2);
  });

  it("applies Brutos Brutales overrides", () => {
    expect(getSppValue("TOUCHDOWN", true)).toBe(2);
    expect(getSppValue("CASUALTY", true)).toBe(3);
    // Un valor sin override (pase) no cambia con la regla especial.
    expect(getSppValue("PASS_COMPLETE", true)).toBe(1);
  });
});
