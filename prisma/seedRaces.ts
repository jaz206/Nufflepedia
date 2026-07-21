/**
 * Siembra las 29 razas (MasterRace + MasterPosition) desde prisma/racesData.ts.
 * Resuelve los nombres de habilidad iniciales contra el catálogo (MasterSkill +
 * MasterTrait) con normalización (acentos, paréntesis) + alias, y AVISA de los
 * que no resuelven. startingSkillKeys guarda el nombre tal cual aparece en el
 * roster (para mostrar "Solitario (4+)" etc.); la validación solo comprueba que
 * cada nombre corresponda a una entrada del catálogo.
 */
import { PrismaClient } from "@prisma/client";
import { RACES } from "./racesData";
import { TRAITS } from "../src/rules-engine/data/traits";

const prisma = new PrismaClient();

const CATEGORY: Record<string, string> = {
  A: "AGILIDAD",
  F: "FUERZA",
  G: "GENERAL",
  M: "MUTACION",
  P: "PASE",
  T: "TRIQUINUELAS",
};

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
};

async function main() {
  // 1) Asegurar los rasgos nuevos (Sed de sangre, Furia asesina) en la BD.
  for (const t of TRAITS.filter((x) => x.key === "sed-de-sangre" || x.key === "furia-asesina")) {
    await prisma.masterTrait.upsert({
      where: { key: t.key },
      update: { name: t.name, englishName: t.englishName ?? null, category: "GENERAL" as never, description: t.description },
      create: { key: t.key, name: t.name, englishName: t.englishName ?? null, category: "GENERAL" as never, description: t.description },
    });
  }

  // 2) Resolver nombre -> key desde el catálogo.
  const [skills, traits] = await Promise.all([
    prisma.masterSkill.findMany({ select: { key: true, name: true } }),
    prisma.masterTrait.findMany({ select: { key: true, name: true } }),
  ]);
  const nameToKey = new Map<string, string>();
  for (const s of [...skills, ...traits]) nameToKey.set(normalize(s.name), s.key);

  const resolve = (display: string): string | null => {
    const n = normalize(display);
    if (nameToKey.has(n)) return nameToKey.get(n)!;
    if (ALIASES[n] && nameToKey.has(ALIASES[n])) return nameToKey.get(ALIASES[n])!;
    return null;
  };

  // 3) Sembrar razas y posiciones.
  const unresolved = new Map<string, string[]>();
  let raceCount = 0;
  let posCount = 0;

  for (const [i, race] of RACES.entries()) {
    const dbRace = await prisma.masterRace.upsert({
      where: { key: race.key },
      update: {
        name: race.name, pageRef: race.pageRef, leagues: race.leagues, specialRules: race.specialRules,
        rerollCost: race.rerollCost, rerollMax: race.rerollMax, allowsApothecary: race.allowsApothecary, sortOrder: i,
      },
      create: {
        key: race.key, name: race.name, pageRef: race.pageRef, leagues: race.leagues, specialRules: race.specialRules,
        rerollCost: race.rerollCost, rerollMax: race.rerollMax, allowsApothecary: race.allowsApothecary, sortOrder: i,
      },
    });

    await prisma.masterPosition.deleteMany({ where: { raceId: dbRace.id } });

    for (const [j, p] of race.positions.entries()) {
      for (const skill of p.skills) {
        if (!resolve(skill)) {
          if (!unresolved.has(skill)) unresolved.set(skill, []);
          unresolved.get(skill)!.push(`${race.name} · ${p.name}`);
        }
      }
      await prisma.masterPosition.create({
        data: {
          raceId: dbRace.id,
          name: p.name,
          playerTags: p.tags,
          quantityMin: p.min ?? 0,
          quantityMax: p.max,
          cost: p.cost,
          ma: p.ma, st: p.st, ag: p.ag, pa: p.pa, av: p.av,
          startingSkillKeys: p.skills,
          primaryCategories: p.primary.map((l) => CATEGORY[l]) as never,
          secondaryCategories: p.secondary.map((l) => CATEGORY[l]) as never,
          sortOrder: j,
        },
      });
      posCount++;
    }
    raceCount++;
  }

  console.log(`\nRazas sembradas: ${raceCount} · posiciones: ${posCount}`);
  if (unresolved.size) {
    console.log(`\n⚠ Nombres de habilidad SIN RESOLVER (${unresolved.size}):`);
    for (const [name, where] of unresolved) console.log(`  - "${name}"  → en: ${where.join(", ")}`);
  } else {
    console.log("✓ Todas las habilidades iniciales resolvieron contra el catálogo.");
  }
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
