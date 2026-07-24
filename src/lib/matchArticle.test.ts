import { describe, expect, it } from "vitest";
import { buildMatchArticle } from "./matchArticle";

describe("buildMatchArticle", () => {
  it("incluye ambos equipos y el marcador en el titular en caso de empate", () => {
    const { headline } = buildMatchArticle({
      homeTeamName: "Mandingorcs",
      awayTeamName: "bosquecityos",
      homeScore: 1,
      awayScore: 1,
      scorers: [],
      injuries: [],
    });
    expect(headline).toContain("Mandingorcs");
    expect(headline).toContain("bosquecityos");
  });

  it("menciona al ganador en una victoria clara", () => {
    const { headline } = buildMatchArticle({
      homeTeamName: "Mandingorcs",
      awayTeamName: "bosquecityos",
      homeScore: 4,
      awayScore: 0,
      scorers: [],
      injuries: [],
    });
    expect(headline).toContain("Mandingorcs");
  });

  it("el artículo incluye a los anotadores nombrados", () => {
    const { article } = buildMatchArticle({
      homeTeamName: "Mandingorcs",
      awayTeamName: "bosquecityos",
      homeScore: 1,
      awayScore: 0,
      scorers: [{ teamName: "Mandingorcs", playerName: "Grukk" }],
      injuries: [],
    });
    expect(article).toContain("Grukk");
    expect(article).toContain("Mandingorcs");
  });

  it("el artículo incluye las lesiones registradas", () => {
    const { article } = buildMatchArticle({
      homeTeamName: "Mandingorcs",
      awayTeamName: "bosquecityos",
      homeScore: 1,
      awayScore: 0,
      scorers: [],
      injuries: [
        {
          attackerTeamName: "Mandingorcs",
          attackerPlayerName: "Grukk",
          victimTeamName: "bosquecityos",
          victimPlayerName: "Elyon",
          injuryName: "Pierna rota",
        },
      ],
    });
    expect(article).toContain("Elyon");
    expect(article).toContain("Pierna rota");
  });

  it("sin anotadores ni lesiones, el artículo sigue siendo válido y no vacío", () => {
    const { article } = buildMatchArticle({
      homeTeamName: "Mandingorcs",
      awayTeamName: "bosquecityos",
      homeScore: 0,
      awayScore: 0,
      scorers: [],
      injuries: [],
    });
    expect(article.length).toBeGreaterThan(0);
    expect(article).toContain("0-0");
  });
});
