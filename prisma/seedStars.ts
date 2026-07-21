/**
 * Siembra los Jugadores Estrella (MasterStarPlayer) desde prisma/starsData.ts.
 * Resuelve cada nombre de habilidad contra el catálogo (por nombre y por
 * englishName, normalizando acentos/paréntesis) y AVISA de los que no resuelven.
 * skillKeys guarda el nombre tal cual (para mostrar "Solitario (4+)" etc.).
 */
import { PrismaClient } from "@prisma/client";
import { STARS } from "./starsData";

const prisma = new PrismaClient();

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\([^)]*\)/g, "")
    .replace(/[.,]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

const ALIASES: Record<string, string> = {
  "atacar y huir": "golpe a la carrera",
  "dump-off": "pase precipitado",
};

async function main() {
  const [skills, traits] = await Promise.all([
    prisma.masterSkill.findMany({ select: { key: true, name: true, englishName: true } }),
    prisma.masterTrait.findMany({ select: { key: true, name: true, englishName: true } }),
  ]);
  const nameToKey = new Map<string, string>();
  for (const s of [...skills, ...traits]) {
    nameToKey.set(normalize(s.name), s.key);
    if (s.englishName) nameToKey.set(normalize(s.englishName), s.key);
  }
  const resolve = (display: string): string | null => {
    const n = normalize(display);
    if (nameToKey.has(n)) return nameToKey.get(n)!;
    if (ALIASES[n] && nameToKey.has(ALIASES[n])) return nameToKey.get(ALIASES[n])!;
    return null;
  };

  const unresolved = new Map<string, string[]>();
  let count = 0;

  for (const star of STARS) {
    for (const skill of star.skills) {
      if (!resolve(skill)) {
        if (!unresolved.has(skill)) unresolved.set(skill, []);
        unresolved.get(skill)!.push(star.name);
      }
    }
    const data = {
      name: star.name,
      playerTags: star.tags,
      cost: star.cost,
      ma: star.ma, st: star.st, ag: star.ag, pa: star.pa, av: star.av,
      skillKeys: star.skills,
      playsForAny: star.playsForAny,
      leagues: star.leagues,
      specialRuleName: star.specialRuleName,
      specialRuleText: star.specialRuleText,
    };
    await prisma.masterStarPlayer.upsert({
      where: { key: star.key },
      update: data,
      create: { key: star.key, ...data },
    });
    count++;
  }

  console.log(`\nEstrellas sembradas: ${count}`);
  if (unresolved.size) {
    console.log(`\n⚠ Nombres de habilidad SIN RESOLVER (${unresolved.size}):`);
    for (const [name, where] of unresolved) console.log(`  - "${name}"  → en: ${where.join(", ")}`);
  } else {
    console.log("✓ Todas las habilidades de estrella resolvieron contra el catálogo.");
  }
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
