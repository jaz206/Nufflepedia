/**
 * Puebla las tablas maestras editables a partir de la semilla versionada en
 * src/rules-engine/data. Es seguro ejecutarlo varias veces (upsert por key).
 */
import { PrismaClient } from "@prisma/client";
import { SKILLS } from "../src/rules-engine/data/skills";
import { TRAITS } from "../src/rules-engine/data/traits";
import { WEATHER_TABLE } from "../src/rules-engine/data/tables/weather";
import { KICKOFF_TABLE } from "../src/rules-engine/data/tables/kickoff";
import { PRAYERS_TO_NUFFLE_TABLE } from "../src/rules-engine/data/tables/prayersToNuffle";
import { INJURY_TABLE_D16 } from "../src/rules-engine/data/tables/injury";
import { SPP_VALUES, BRUTOS_BRUTALES_OVERRIDES } from "../src/rules-engine/data/tables/spp";
import { LEVEL_UP_SPP_COST, LEVEL_UP_TV_IMPACT_GP } from "../src/rules-engine/data/tables/levelUp";
import { MATCH_SEQUENCE } from "../src/rules-engine/data/matchSequence";
import { INDUCEMENTS_TABLE } from "../src/rules-engine/data/tables/inducements";
import { SPECIAL_RULES_TABLE } from "../src/rules-engine/data/tables/specialRules";

const prisma = new PrismaClient();

function toDbCategory(category: string): string {
  const map: Record<string, string> = {
    General: "GENERAL",
    Agilidad: "AGILIDAD",
    Fuerza: "FUERZA",
    Pase: "PASE",
    Mutacion: "MUTACION",
    Triquinuelas: "TRIQUINUELAS",
  };
  return map[category] ?? category.toUpperCase();
}

function toDbTraitCategory(category: string): string {
  const map: Record<string, string> = {
    General: "GENERAL",
    Resistencia: "RESISTENCIA",
    Ataque: "ATAQUE",
    AccionEspecial: "ACCION_ESPECIAL",
    Tamano: "TAMANO",
    Despliegue: "DESPLIEGUE",
    JugadorEstrella: "JUGADOR_ESTRELLA",
  };
  return map[category] ?? category.toUpperCase();
}

async function main() {
  console.log(`Sembrando ${SKILLS.length} habilidades...`);
  for (const skill of SKILLS) {
    await prisma.masterSkill.upsert({
      where: { key: skill.key },
      update: {
        name: skill.name,
        englishName: skill.englishName,
        category: toDbCategory(skill.category) as never,
        isActive: skill.isActive,
        isElite: skill.isElite ?? false,
        description: skill.description,
      },
      create: {
        key: skill.key,
        name: skill.name,
        englishName: skill.englishName,
        category: toDbCategory(skill.category) as never,
        isActive: skill.isActive,
        isElite: skill.isElite ?? false,
        description: skill.description,
      },
    });
  }

  console.log(`Sembrando ${TRAITS.length} rasgos...`);
  for (const trait of TRAITS) {
    await prisma.masterTrait.upsert({
      where: { key: trait.key },
      update: {
        name: trait.name,
        englishName: trait.englishName,
        category: toDbTraitCategory(trait.category) as never,
        description: trait.description,
      },
      create: {
        key: trait.key,
        name: trait.name,
        englishName: trait.englishName,
        category: toDbTraitCategory(trait.category) as never,
        description: trait.description,
      },
    });
  }

  console.log(`Sembrando tabla de Clima (${WEATHER_TABLE.length} filas)...`);
  await prisma.masterWeatherEntry.deleteMany();
  await prisma.masterWeatherEntry.createMany({
    data: WEATHER_TABLE.map((e) => ({
      minRoll: e.min,
      maxRoll: e.max,
      name: e.name,
      effect: e.effect,
    })),
  });

  console.log(`Sembrando tabla de Patada Inicial (${KICKOFF_TABLE.length} filas)...`);
  for (const entry of KICKOFF_TABLE) {
    await prisma.masterKickoffEntry.upsert({
      where: { roll: entry.roll },
      update: { name: entry.name, effect: entry.effect },
      create: { roll: entry.roll, name: entry.name, effect: entry.effect },
    });
  }

  console.log(`Sembrando tabla de Plegarias a Nuffle (${PRAYERS_TO_NUFFLE_TABLE.length} filas)...`);
  for (const entry of PRAYERS_TO_NUFFLE_TABLE) {
    await prisma.masterPrayerEntry.upsert({
      where: { roll: entry.roll },
      update: { name: entry.name, effect: entry.effect },
      create: { roll: entry.roll, name: entry.name, effect: entry.effect },
    });
  }

  console.log(`Sembrando tabla de Lesiones D16 (${INJURY_TABLE_D16.length} filas)...`);
  await prisma.masterInjuryEntry.deleteMany();
  await prisma.masterInjuryEntry.createMany({
    data: INJURY_TABLE_D16.map((e) => ({
      minRoll: e.min,
      maxRoll: e.max,
      code: e.code,
      name: e.name,
      // Magullado (1-8, BADLY_HURT) NO se pierde el siguiente partido: solo el
      // resto del actual. Oficial 2025: "no sufre efectos a largo plazo".
      missesNextGame: e.status === "MISS_NEXT_GAME",
      permanentStatLoss: e.permanentStatLoss ?? false,
      isDeath: e.status === "DEAD",
    })),
  });

  const sppLabels: Record<string, string> = {
    PASS_COMPLETE: "Pase completado",
    CASUALTY: "Baja (Casualty)",
    INTERCEPTION: "Intercepción",
    TOUCHDOWN: "Touchdown",
    MVP: "MVP",
  };
  console.log("Sembrando tabla de SPP...");
  for (const [actionKey, standardValue] of Object.entries(SPP_VALUES)) {
    await prisma.masterSppValue.upsert({
      where: { actionKey },
      update: {
        label: sppLabels[actionKey] ?? actionKey,
        standardValue,
        brutosBrutalesValue: BRUTOS_BRUTALES_OVERRIDES[actionKey as keyof typeof BRUTOS_BRUTALES_OVERRIDES] ?? null,
      },
      create: {
        actionKey,
        label: sppLabels[actionKey] ?? actionKey,
        standardValue,
        brutosBrutalesValue: BRUTOS_BRUTALES_OVERRIDES[actionKey as keyof typeof BRUTOS_BRUTALES_OVERRIDES] ?? null,
      },
    });
  }

  console.log("Sembrando configuración de Level Up...");
  const levelUpRows = [
    {
      configKey: "primarySkillRandom",
      label: "Habilidad Primaria (al azar)",
      sppCost: LEVEL_UP_SPP_COST.primarySkillRandom,
      tvImpactMinGp: LEVEL_UP_TV_IMPACT_GP.primarySkill,
      tvImpactMaxGp: LEVEL_UP_TV_IMPACT_GP.primarySkill,
    },
    {
      configKey: "primarySkillChosen",
      label: "Habilidad Primaria (elegida)",
      sppCost: LEVEL_UP_SPP_COST.primarySkillChosen,
      tvImpactMinGp: LEVEL_UP_TV_IMPACT_GP.primarySkill,
      tvImpactMaxGp: LEVEL_UP_TV_IMPACT_GP.primarySkill,
    },
    {
      configKey: "secondarySkillChosen",
      label: "Habilidad Secundaria (elegida)",
      sppCost: LEVEL_UP_SPP_COST.secondarySkillChosen,
      tvImpactMinGp: LEVEL_UP_TV_IMPACT_GP.secondarySkill,
      tvImpactMaxGp: LEVEL_UP_TV_IMPACT_GP.secondarySkill,
    },
    {
      configKey: "attributeRandom",
      label: "Mejora de Atributo (1D8 al azar)",
      sppCost: LEVEL_UP_SPP_COST.attributeRandom,
      tvImpactMinGp: LEVEL_UP_TV_IMPACT_GP.attribute.min,
      tvImpactMaxGp: LEVEL_UP_TV_IMPACT_GP.attribute.max,
    },
  ];
  for (const row of levelUpRows) {
    await prisma.masterLevelUpConfig.upsert({
      where: { configKey: row.configKey },
      update: row,
      create: row,
    });
  }

  console.log(`Sembrando Incentivos (${INDUCEMENTS_TABLE.length} filas)...`);
  for (const [i, entry] of INDUCEMENTS_TABLE.entries()) {
    await prisma.masterInducement.upsert({
      where: { key: entry.key },
      update: {
        name: entry.name,
        cost: entry.cost,
        maxCount: entry.maxCount,
        restriction: entry.restriction,
        effect: entry.effect,
        sortOrder: i,
      },
      create: {
        key: entry.key,
        name: entry.name,
        cost: entry.cost,
        maxCount: entry.maxCount,
        restriction: entry.restriction,
        effect: entry.effect,
        sortOrder: i,
      },
    });
  }

  console.log(`Sembrando Reglas especiales (${SPECIAL_RULES_TABLE.length} filas)...`);
  for (const entry of SPECIAL_RULES_TABLE) {
    await prisma.masterSpecialRule.upsert({
      where: { key: entry.key },
      update: { name: entry.name, description: entry.description },
      create: { key: entry.key, name: entry.name, description: entry.description },
    });
  }

  console.log(`Sembrando Secuencia de Partido (${MATCH_SEQUENCE.length} secciones)...`);
  for (const [i, section] of MATCH_SEQUENCE.entries()) {
    const dbSection = await prisma.masterMatchSection.upsert({
      where: { key: section.key },
      update: { title: section.title, intro: section.intro, note: section.note ?? null, sortOrder: i },
      create: { key: section.key, title: section.title, intro: section.intro, note: section.note ?? null, sortOrder: i },
    });
    await prisma.masterMatchStep.deleteMany({ where: { sectionId: dbSection.id } });
    await prisma.masterMatchStep.createMany({
      data: section.steps.map((s) => ({
        sectionId: dbSection.id,
        sortOrder: s.order,
        title: s.title,
        description: s.description,
        dice: s.dice ?? null,
      })),
    });
  }

  console.log("Listo.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
