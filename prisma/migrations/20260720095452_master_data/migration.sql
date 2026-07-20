-- CreateEnum
CREATE TYPE "SkillCategory" AS ENUM ('GENERAL', 'AGILIDAD', 'FUERZA', 'PASE', 'MUTACION', 'TRIQUINUELAS');

-- CreateEnum
CREATE TYPE "TraitCategory" AS ENUM ('GENERAL', 'RESISTENCIA', 'ATAQUE', 'ACCION_ESPECIAL', 'TAMANO', 'DESPLIEGUE', 'JUGADOR_ESTRELLA');

-- CreateTable
CREATE TABLE "MasterSkill" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "englishName" TEXT,
    "category" "SkillCategory" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "isElite" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MasterSkill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MasterTrait" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "englishName" TEXT,
    "category" "TraitCategory" NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MasterTrait_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MasterWeatherEntry" (
    "id" TEXT NOT NULL,
    "minRoll" INTEGER NOT NULL,
    "maxRoll" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "effect" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MasterWeatherEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MasterKickoffEntry" (
    "id" TEXT NOT NULL,
    "roll" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "effect" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MasterKickoffEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MasterInjuryEntry" (
    "id" TEXT NOT NULL,
    "minRoll" INTEGER NOT NULL,
    "maxRoll" INTEGER NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "missesNextGame" BOOLEAN NOT NULL DEFAULT false,
    "permanentStatLoss" BOOLEAN NOT NULL DEFAULT false,
    "isDeath" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MasterInjuryEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MasterSppValue" (
    "id" TEXT NOT NULL,
    "actionKey" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "standardValue" INTEGER NOT NULL,
    "brutosBrutalesValue" INTEGER,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MasterSppValue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MasterLevelUpConfig" (
    "id" TEXT NOT NULL,
    "configKey" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "sppCost" INTEGER NOT NULL,
    "tvImpactMinGp" INTEGER,
    "tvImpactMaxGp" INTEGER,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MasterLevelUpConfig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MasterSkill_key_key" ON "MasterSkill"("key");

-- CreateIndex
CREATE UNIQUE INDEX "MasterTrait_key_key" ON "MasterTrait"("key");

-- CreateIndex
CREATE UNIQUE INDEX "MasterKickoffEntry_roll_key" ON "MasterKickoffEntry"("roll");

-- CreateIndex
CREATE UNIQUE INDEX "MasterSppValue_actionKey_key" ON "MasterSppValue"("actionKey");

-- CreateIndex
CREATE UNIQUE INDEX "MasterLevelUpConfig_configKey_key" ON "MasterLevelUpConfig"("configKey");
