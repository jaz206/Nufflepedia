import { describe, expect, it } from "vitest";
import { generatePlayerName, getPositionFlavorLabel } from "./playerNames";

describe("generatePlayerName", () => {
  it("genera un nombre no vacío para unos tags conocidos", () => {
    const name = generatePlayerName(["Orco", "Línea"], []);
    expect(name.trim().length).toBeGreaterThan(0);
  });

  it("cae a la familia humana cuando no hay tags reconocibles", () => {
    const name = generatePlayerName(["Tag-Inexistente"], []);
    expect(name.trim().length).toBeGreaterThan(0);
  });

  it("un Grandullón Vampiro usa nombres de vampiro, no el genérico de No Muerto", () => {
    const name = generatePlayerName(["No muerto", "Vampiro", "Grandullón"], []);
    expect(["von Carstein", "el Eterno", "Sangre Fría", "de la Noche", "el Insaciable"].some((last) =>
      name.includes(last)
    )).toBe(true);
  });

  it("no repite un nombre ya usado en el equipo mientras haya alternativas", () => {
    const used = new Set<string>();
    for (let i = 0; i < 20; i++) {
      const name = generatePlayerName(["Enano", "Línea"], used);
      expect(used.has(name)).toBe(false);
      used.add(name);
    }
    expect(used.size).toBe(20);
  });

  it("no se bloquea aunque el fondo de nombres se agote (añade sufijo numérico)", () => {
    const used = new Set<string>();
    for (let i = 0; i < 60; i++) {
      const name = generatePlayerName(["Snotling", "Especial"], used);
      expect(used.has(name)).toBe(false);
      used.add(name);
    }
    expect(used.size).toBe(60);
  });
});

describe("getPositionFlavorLabel", () => {
  it("identifica un Grandullón Troll en un equipo de Orcos", () => {
    expect(getPositionFlavorLabel(["Troll", "Grandullón"])).toBe("Troll");
  });

  it("no identifica un Linorc normal (es la raza base del equipo)", () => {
    expect(getPositionFlavorLabel(["Orco", "Línea"])).toBeNull();
  });

  it("identifica un Vargheist Vampiro aunque el primer tag sea 'No muerto'", () => {
    expect(getPositionFlavorLabel(["No muerto", "Vampiro", "Grandullón"])).toBe("Vampiro");
  });
});
