/**
 * Generador de nombres aleatorios con sabor racial para jugadores nuevos.
 * Contenido puro (sin imports de React/Next/Prisma ni del resto de la app),
 * como el resto de rules-engine. Inspirado en el prototipo anterior
 * (data/randomNames.ts) y en su guía Name_players.md, que documentaba que
 * dentro de un mismo equipo conviven varias razas reales: un Grandullón
 * "Troll" en un equipo de Orcos, un "Vampiro" en un equipo de Vampiros
 * (mientras la línea es Humana/No Muerta), etc.
 *
 * En vez de usar siempre la raza del EQUIPO, se deriva la raza real de
 * cada PUESTO a partir de `MasterPosition.playerTags` (p.ej.
 * `["Troll", "Grandullón"]`), que ya captura esto en racesData.ts.
 */

interface NameFamily {
  first: string[];
  last: string[];
  /** Sin espacio entre nombre y apellido (p.ej. orcos: "Grimruk"). */
  joinTight?: boolean;
}

const humano: NameFamily = {
  first: ["Griff", "Eldric", "Luther", "Markus", "Wilhelm", "Jurgen", "Dieter", "Konrad", "Helena", "Greta"],
  last: ["Oberwald", "Swift", "von Kill", "Wulf", "Schwartz", "Hoffman", "Bauer"],
};

const enano: NameFamily = {
  first: ["Gotrek", "Thorgrim", "Durin", "Bardin", "Borin", "Dwalin", "Balin", "Oin", "Gloin"],
  last: ["Stoneaxe", "Ironbeard", "Goldhelm", "Bronzefist", "Steelbrow", "Silverhand", "Grimfoot"],
};

const orco: NameFamily = {
  first: ["Ghaz", "Grimgor", "Morglum", "Azhag", "Gor", "Bad", "Urg", "Nazgob"],
  last: ["ruk", "fang", "jaw", "snik", "gash", "smasha", "rippa"],
  joinTight: true,
};

const goblin: NameFamily = {
  first: ["Skrag", "Grom", "Sniv", "Grot", "Skarsnik", "Gobbla", "Fizzle"],
  last: ["el Matón", "el Panzudo", "Muerdeingles", "el Sucio", "da Gobbo"],
};

const snotling: NameFamily = {
  first: ["Snot", "Fungo", "Stilty", "Pump", "Tiny", "Squig"],
  last: ["Flinga", "Hoppa", "Runna", "Wagon", "el Pequeño"],
};

const elfo: NameFamily = {
  first: ["Eldril", "Jordell", "Lucien", "Valen", "Gloriel", "Rowana", "Ariel", "Elara"],
  last: ["Vientolátigo", "Brisafresca", "el Veloz", "Floreciente", "Rompeestrellas", "Manosegura"],
};

const skaven: NameFamily = {
  first: ["Skritch", "Kreek", "Queek", "Ikit", "Thanquol", "Snikch", "Verminik"],
  last: ["Garrafuerte", "Puñal-Puñal", "Roeoxido", "Cazacabezas", "Garra", "Cola-Larga"],
};

const lagarto: NameFamily = {
  first: ["Kroq", "Mazda", "Gor-Rok", "Nakai", "Itzi", "Xili"],
  last: ["Gar", "mundi", "el Gran Lagarto Blanco", "Bok", "Topec"],
  joinTight: true,
};

const nomuerto: NameFamily = {
  first: ["Ramut", "Nekaph", "Setep", "Kemmler", "Osiris", "Anket"],
  last: ["von Muerto", "el Marchito", "Hueso-Frío", "el Silente", "de la Tumba"],
};

const vampiro: NameFamily = {
  first: ["Vlad", "Isabella", "Konrad", "Mannfred", "Ushoran", "Nefera"],
  last: ["von Carstein", "el Eterno", "Sangre Fría", "de la Noche", "el Insaciable"],
};

const nurgle: NameFamily = {
  first: ["Guffle", "Bilerot", "Fester", "Pus", "Rot", "Bloat"],
  last: ["Pusmaw", "Vomitasco", "Espuma", "Gusanera", "la Peste"],
};

const khorne: NameFamily = {
  first: ["Khargul", "Skarr", "Bloodfang", "Skulmar", "Gorehowl"],
  last: ["Sedienta de Sangre", "el Cráneo", "Furia Roja", "el Devoto", "Hacha Carmesí"],
};

const caos: NameFamily = {
  first: ["Archaon", "Khorgor", "Slambo", "Vorgar", "Zar", "Gorth"],
  last: ["el Elegido", "Rompecráneos", "el Renegado", "el Despiadado", "el Vil"],
};

const ogro: NameFamily = {
  first: ["Bomgrot", "Gutrot", "Tenderizer", "Grubnutz", "Bruiser"],
  last: ["Tripasllenas", "el Grande", "Puñoduro", "Machacahuesos"],
};

const troll: NameFamily = {
  first: ["Grug", "Bolg", "Krum", "Ock", "Mog", "Durf"],
  last: ["Trituraentrañas", "el Baboso", "Rompesesos", "el Hambriento"],
};

const minotauro: NameFamily = {
  first: ["Bull-Gor", "Kroshak", "Thargor", "Mazhrak"],
  last: ["Cuernorroto", "el Embestidor", "Pezuña de Hierro", "el Furioso"],
};

const hombreArbol: NameFamily = {
  first: ["Viejo Roble", "Sombra Verde", "Raíz Honda", "Corteza Gris"],
  last: ["del Bosque Eterno", "Guardián de las Hojas", "el Centenario"],
};

const hombreLobo: NameFamily = {
  first: ["Fenrir", "Garmr", "Ulfgar", "Skoll"],
  last: ["Colmillo de Plata", "Aullido de Luna", "el Feroz"],
};

const halfling: NameFamily = {
  first: ["Puggy", "Cindy", "Rumbelow", "Gaffer", "Bramwell", "Poppy"],
  last: ["Aliento de Tocino", "Silbaempanadas", "Pielborrego", "Trotamundos"],
};

const gnomo: NameFamily = {
  first: ["Fizzwick", "Nibbleton", "Bramble", "Twinkle", "Pockets"],
  last: ["el Ingenioso", "Chispatuerca", "Bolsillo Hondo", "el Travieso"],
};

const amazona: NameFamily = {
  first: ["Xantippa", "Zara", "Valeria", "Ithil", "Sarya", "Morrigan"],
  last: ["Lanza Certera", "Corazón de León", "la Indomable", "Escudo Ardiente"],
};

const norse: NameFamily = {
  first: ["Bjorn", "Ragnar", "Ulfric", "Sigrid", "Freya", "Halvar"],
  last: ["Rompehielos", "Hijo de Nuffle", "el Bárbaro", "Barbaroja", "el Salvaje"],
};

/**
 * Tags de `MasterPosition.playerTags` → familia de nombres, de más a menos
 * específico. `resolveFamily` recorre esta lista en orden y usa la primera
 * que encuentre en los tags del puesto — así un Vampiro en un equipo de
 * Vampiros (tags: ["No muerto", "Vampiro", ...]) coge nombres de vampiro y
 * no los genéricos de "No muerto", pero un Zombi (tags: ["Humano", "No
 * muerto", "Zombi", ...]) sigue distinguiéndose de un Esqueleto.
 */
const TAG_PRIORITY: [string, NameFamily][] = [
  ["vampiro", vampiro],
  ["zombi", nomuerto],
  ["esqueleto", nomuerto],
  ["momia", nomuerto],
  ["espectro", nomuerto],
  ["necrofago", nomuerto],
  ["hombre lobo", hombreLobo],
  ["yhetee", norse],
  ["troll", troll],
  ["ogro", ogro],
  ["minotauro", minotauro],
  ["constructo", enano],
  ["engendro", caos],
  ["hombre arbol", hombreArbol],
  ["hombre bestia", caos],
  ["no muerto", nomuerto],
  ["skaven", skaven],
  ["goblin", goblin],
  ["snotling", snotling],
  ["gnoblar", goblin],
  ["gnomo", gnomo],
  ["halfling", halfling],
  ["enano", enano],
  ["elfo", elfo],
  ["hombre lagarto", lagarto],
  ["animal", norse],
  ["orco", orco],
  ["humano", humano],
  ["amazona", amazona],
  ["norse", norse],
  ["nurgle", nurgle],
  ["khorne", khorne],
  ["caos", caos],
];

/** Tags que, cuando son la raza resuelta de un puesto, merecen mostrarse
 * como insignia («es de otra raza dentro de este equipo») — Grandullones y
 * las sub-criaturas de No Muertos, no los puestos normales de la raza base. */
const NOTABLE_FLAVOR_TAGS = new Set([
  "troll",
  "ogro",
  "minotauro",
  "vampiro",
  "zombi",
  "esqueleto",
  "momia",
  "espectro",
  "necrofago",
  "hombre lobo",
  "yhetee",
  "constructo",
  "engendro",
  "hombre arbol",
  "hombre bestia",
  "gnoblar",
  "animal",
]);

function normalizeTag(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim();
}

function resolveFamily(playerTags: string[]): NameFamily {
  const normalized = playerTags.map(normalizeTag);
  for (const [tag, family] of TAG_PRIORITY) {
    if (normalized.includes(tag)) return family;
  }
  return humano;
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function buildName(family: NameFamily): string {
  const first = pick(family.first);
  const last = pick(family.last);
  return family.joinTight ? `${first}${last}` : `${first} ${last}`;
}

/**
 * Genera un nombre aleatorio acorde a la raza REAL del puesto (no la del
 * equipo), evitando repetir uno ya usado en el equipo. Si el fondo de
 * nombres se agota, añade un sufijo " (n)" — mismo patrón que las copias
 * de Jugador Estrella — para garantizar unicidad sin bloquear el fichaje.
 */
export function generatePlayerName(playerTags: string[], existingNames: Iterable<string>): string {
  const family = resolveFamily(playerTags);
  const used = new Set(existingNames);

  for (let attempt = 0; attempt < 40; attempt++) {
    const name = buildName(family);
    if (!used.has(name)) return name;
  }

  const base = buildName(family);
  let n = 2;
  while (used.has(`${base} (${n})`)) n++;
  return `${base} (${n})`;
}

/**
 * Etiqueta de raza a mostrar junto al jugador cuando su puesto es de una
 * especie distinta a la del equipo (Grandullones, sub-criaturas de No
 * Muertos...). `null` si el puesto es simplemente la raza base del equipo
 * — no hace falta señalar que un Linorc es un Orco en un equipo de Orcos.
 */
export function getPositionFlavorLabel(playerTags: string[]): string | null {
  const normalized = playerTags.map(normalizeTag);
  for (const [tag] of TAG_PRIORITY) {
    if (NOTABLE_FLAVOR_TAGS.has(tag) && normalized.includes(tag)) {
      // Devuelve el tag tal como viene en los datos (conserva mayúsculas
      // originales) para mostrarlo, no la versión normalizada de búsqueda.
      const original = playerTags.find((t) => normalizeTag(t) === tag);
      return original ?? null;
    }
  }
  return null;
}
