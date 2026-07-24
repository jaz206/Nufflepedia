/**
 * Genera un titular + artículo de crónica de partido por plantillas (sin
 * IA, determinista salvo por la elección aleatoria de frase dentro de cada
 * plantilla). Se guarda en MatchReport.headline/article al registrar el
 * resultado. El tono cambia según cómo haya sido el partido — un 0-0 se
 * narra como un tostón de verdad, una manita se narra como una masacre —
 * en vez de una plantilla única para todos los resultados.
 */

export interface ArticleScorer {
  teamName: string;
  playerName: string | null;
}

export interface ArticleInjury {
  attackerTeamName: string;
  attackerPlayerName: string | null;
  victimTeamName: string;
  victimPlayerName: string | null;
  injuryName: string | null;
}

/** Tabla de máximos anotadores de la competición DESPUÉS de este partido (top 3). */
export interface SeasonScorerContext {
  name: string;
  teamName: string;
  count: number;
}

export interface MatchArticleInput {
  homeTeamName: string;
  awayTeamName: string;
  homeScore: number;
  awayScore: number;
  scorers: ArticleScorer[];
  injuries: ArticleInjury[];
  seasonTopScorers?: SeasonScorerContext[];
}

export interface MatchArticle {
  headline: string;
  article: string;
}

type Mood = "boring" | "tenseDraw" | "livelyDraw" | "cagey" | "close" | "comfortable" | "blowout" | "shutout";

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function moodOf(hs: number, as: number): Mood {
  const total = hs + as;
  if (hs === as) {
    if (total === 0) return "boring";
    return total <= 2 ? "tenseDraw" : "livelyDraw";
  }
  const winner = Math.max(hs, as);
  const loser = Math.min(hs, as);
  const diff = winner - loser;
  if (loser === 0 && winner >= 2) return "shutout";
  if (diff >= 4) return "blowout";
  if (diff === 1 && total <= 3) return "cagey";
  if (diff <= 1) return "close";
  return "comfortable";
}

function buildHeadline(input: MatchArticleInput, mood: Mood): string {
  const { homeTeamName: home, awayTeamName: away, homeScore: hs, awayScore: as } = input;
  const winner = hs > as ? home : away;
  const loser = hs > as ? away : home;
  const winnerScore = Math.max(hs, as);
  const loserScore = Math.min(hs, as);

  switch (mood) {
    case "boring":
      return pick([
        `Nadie se atrevió: ${home} 0-0 ${away}`,
        `Blanco y en botella: empate a cero entre ${home} y ${away}`,
        `${home} y ${away} firman la paz más aburrida de la temporada`,
      ]);
    case "tenseDraw":
      return pick([
        `${home} y ${away} se reparten los puntos (${hs}-${as})`,
        `Tablas entre ${home} y ${away}, sin margen para el error`,
        `Ni un paso atrás: ${home} ${hs}-${as} ${away}`,
      ]);
    case "livelyDraw":
      return pick([
        `Festival de touchdowns sin ganador: ${home} ${hs}-${as} ${away}`,
        `${home} y ${away} no se pusieron límites (${hs}-${as})`,
        `Empate loco en el que nadie quiso defender: ${hs}-${as}`,
      ]);
    case "shutout":
      return pick([
        `${winner} no deja ni las migas: ${winnerScore}-0 a ${loser}`,
        `Portería a cero para ${winner} ante un ${loser} desaparecido`,
        `${loser} se va de vacío ante ${winner} (${winnerScore}-0)`,
      ]);
    case "blowout":
      return pick([
        `${winner} arrasa a ${loser} por ${winnerScore}-${loserScore}`,
        `Masacre en el campo: ${winner} humilla a ${loser}`,
        `${loser} no tiene nada que hacer ante ${winner} (${winnerScore}-${loserScore})`,
      ]);
    case "cagey":
      return pick([
        `${winner} se lleva un ajustadísimo ${winnerScore}-${loserScore} ante ${loser}`,
        `Sufrido triunfo de ${winner} sobre ${loser} (${winnerScore}-${loserScore})`,
        `${winner} sobrevive por la mínima a ${loser}`,
      ]);
    case "close":
      return pick([
        `${winner} doblega a ${loser} en un final apretado (${winnerScore}-${loserScore})`,
        `${winner} se impone a ${loser} tras un pulso reñido`,
      ]);
    case "comfortable":
    default:
      return pick([
        `${winner} vence a ${loser} por ${winnerScore}-${loserScore}`,
        `${winner} controla de principio a fin ante ${loser}`,
      ]);
  }
}

function openingParagraph(input: MatchArticleInput, mood: Mood): string {
  const { homeTeamName: home, awayTeamName: away, homeScore: hs, awayScore: as } = input;
  const winner = hs > as ? home : away;
  const loser = hs > as ? away : home;
  const winnerScore = Math.max(hs, as);
  const loserScore = Math.min(hs, as);

  switch (mood) {
    case "boring":
      return pick([
        `Si alguien fue al estadio esperando sangre y touchdowns, salió decepcionado: ${home} y ${away} firmaron un 0-0 en el que lo más emocionante fue la venta de cerveza en el descanso.`,
        `Noventa minutos de fútbol de fantasía y cero fantasía: ${home} y ${away} se neutralizaron por completo y el marcador se quedó en un aséptico 0-0.`,
        `Ni un touchdown, ni una lesión reseñable: ${home} y ${away} firmaron un discreto 0-0 de los que Nuffle preferiría olvidar.`,
      ]);
    case "tenseDraw":
      return pick([
        `Partido de trincheras entre ${home} y ${away}, que se marcharon con un ${hs}-${as} que sabe a poco para los dos banquillos.`,
        `Ni ${home} ni ${away} quisieron arriesgar más de la cuenta, y el ${hs}-${as} final refleja un partido gris pero peleado hasta el último turno.`,
      ]);
    case "livelyDraw":
      return pick([
        `${home} y ${away} se olvidaron de defender y regalaron un ${hs}-${as} de infarto en el que el marcador no paró de moverse.`,
        `Partido de ida y vuelta entre ${home} y ${away}: ${hs}-${as} final tras un festival de touchdowns que dejó a la defensa como convidada de piedra.`,
      ]);
    case "shutout":
      return pick([
        `${winner} no tuvo compasión: se llevó por delante a ${loser} por ${winnerScore}-0 en una exhibición de principio a fin.`,
        `Tarde negra para ${loser}, incapaz de inquietar la portería de ${winner} en una goleada sin paliativos (${winnerScore}-0).`,
      ]);
    case "blowout":
      return pick([
        `${winner} no tuvo piedad de ${loser} y firmó una de esas goleadas que se recuerdan durante toda la temporada: ${winnerScore}-${loserScore}.`,
        `Lo de ${winner} ante ${loser} fue más una demolición que un partido de Blood Bowl: ${winnerScore}-${loserScore} en el marcador final.`,
      ]);
    case "cagey":
      return pick([
        `${winner} y ${loser} se jugaron el partido al milímetro, y al final fue ${winner} quien se llevó el gato al agua por la mínima (${winnerScore}-${loserScore}).`,
        `Partido decidido por detalles: ${winner} superó a ${loser} por ${winnerScore}-${loserScore} en un final que se decidió en los últimos turnos.`,
      ]);
    case "close":
      return pick([
        `${winner} y ${loser} ofrecieron un buen espectáculo, con ${winner} llevándose el triunfo por ${winnerScore}-${loserScore}.`,
        `Partido entretenido entre ${winner} y ${loser}, que terminó ${winnerScore}-${loserScore} a favor de los primeros.`,
      ]);
    case "comfortable":
    default:
      return pick([
        `${winner} manejó los tiempos del partido y terminó imponiéndose a ${loser} por ${winnerScore}-${loserScore}.`,
        `Victoria con autoridad de ${winner} sobre ${loser}, que nunca estuvo cerca de dar la sorpresa (${winnerScore}-${loserScore}).`,
      ]);
  }
}

function scorersParagraph(input: MatchArticleInput, mood: Mood): string | null {
  const namedByTeam = new Map<string, string[]>();
  for (const s of input.scorers) {
    if (!s.playerName) continue;
    namedByTeam.set(s.teamName, [...(namedByTeam.get(s.teamName) ?? []), s.playerName]);
  }
  const anyNamed = namedByTeam.size > 0;

  if (input.scorers.length === 0) {
    if (mood === "boring") return null; // el párrafo de apertura ya lo cubre
    return pick([
      "El acta no recoge quién anotó cada ensayo.",
      "Los cronistas de campo no dejaron constancia de la autoría de los touchdowns.",
    ]);
  }
  if (!anyNamed) {
    return "Ningún touchdown quedó atribuido a un jugador concreto en el acta del partido.";
  }

  const parts: string[] = [];
  for (const team of [input.homeTeamName, input.awayTeamName]) {
    const names = namedByTeam.get(team);
    if (!names || names.length === 0) continue;
    const list = names.length === 1 ? names[0] : `${names.slice(0, -1).join(", ")} y ${names[names.length - 1]}`;
    parts.push(
      pick([
        `Por ${team} firmaron el ensayo ${list}.`,
        `${list} se encargaron de anotar por ${team}.`,
        `La cuenta de ${team} corrió a cargo de ${list}.`,
      ])
    );
  }
  return parts.join(" ");
}

function seasonContextSentence(input: MatchArticleInput): string | null {
  const leaders = input.seasonTopScorers;
  if (!leaders || leaders.length === 0) return null;
  const leader = leaders[0];
  const scorerNames = new Set(input.scorers.map((s) => s.playerName).filter((n): n is string => !!n));

  if (scorerNames.has(leader.name)) {
    return pick([
      `Con este tanto, ${leader.name} amplía su ventaja al frente de la tabla de máximos anotadores de la competición, con ${leader.count} en su cuenta.`,
      `${leader.name} sigue intratable: suma otro más y afianza su liderato en la tabla de anotadores (${leader.count}).`,
    ]);
  }

  // Mención ocasional del liderato aunque no haya anotado hoy, para dar sensación de "temporada en marcha".
  if (Math.random() < 0.35) {
    return `Mientras tanto, la tabla de máximos anotadores de la competición la sigue liderando ${leader.name} (${leader.teamName}) con ${leader.count}.`;
  }
  return null;
}

function injuriesParagraph(input: MatchArticleInput): string | null {
  if (input.injuries.length === 0) return null;
  const sentences = input.injuries.slice(0, 6).map((inj) => {
    const attacker = inj.attackerPlayerName ?? `un jugador de ${inj.attackerTeamName}`;
    const victim = inj.victimPlayerName ?? `un jugador de ${inj.victimTeamName}`;
    const result = inj.injuryName ? ` (${inj.injuryName})` : "";
    return pick([
      `${attacker} dejó fuera de combate a ${victim}${result}.`,
      `${victim} cayó ante la dureza de ${attacker}${result}.`,
      `Camilla para ${victim} tras un golpe de ${attacker}${result}.`,
      `${attacker} no se anduvo con contemplaciones y se llevó por delante a ${victim}${result}.`,
    ]);
  });
  return sentences.join(" ");
}

const CLOSING_LINES: Record<Mood, readonly string[]> = {
  boring: [
    "Ni Jim ni Bob encontraron mucho que comentar al pitido final.",
    "Los aficionados ya están mirando el calendario de la próxima jornada, con la esperanza de algo más de sangre.",
    "Nuffle, dicen, se aburrió tanto como el público.",
  ],
  tenseDraw: [
    "Un punto que sabe a poco para los dos banquillos.",
    "Ninguno de los dos entrenadores quiso arriesgar más de la cuenta.",
  ],
  livelyDraw: [
    "Un partido para disfrutar, aunque nadie se lleve los tres puntos.",
    "El público salió del estadio con la voz ronca de tanto gritar.",
  ],
  shutout: [
    "Nuffle sonríe, como siempre, a los que más sangran.",
    "El vestuario perdedor tiene mucho que explicar esta semana.",
  ],
  blowout: [
    "Otro partido para los anales de la Nufflepedia.",
    "El público, como de costumbre, pidió más violencia — y la tuvo.",
  ],
  cagey: [
    "Los sanadores del estadio han tenido una tarde ocupada.",
    "Un partido que se recordará más por los golpes que por los touchdowns.",
  ],
  close: [
    "Las apuestas ya están abiertas para la próxima jornada.",
    "Un partido digno de repetirse en la revuelta.",
  ],
  comfortable: [
    "Otro paso adelante en la clasificación.",
    "El rival ya piensa en cómo maquillar el resultado en la rueda de prensa.",
  ],
};

export function buildMatchArticle(input: MatchArticleInput): MatchArticle {
  const mood = moodOf(input.homeScore, input.awayScore);
  const headline = buildHeadline(input, mood);
  const paragraphs = [
    openingParagraph(input, mood),
    scorersParagraph(input, mood),
    seasonContextSentence(input),
    injuriesParagraph(input),
    pick(CLOSING_LINES[mood]),
  ].filter((p): p is string => !!p);

  return { headline, article: paragraphs.join("\n\n") };
}
