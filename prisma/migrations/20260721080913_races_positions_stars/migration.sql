-- CreateTable
CREATE TABLE "MasterRace" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "pageRef" INTEGER,
    "tier" INTEGER,
    "specialRules" TEXT[],
    "leagues" TEXT[],
    "rerollCost" INTEGER NOT NULL,
    "rerollMax" INTEGER NOT NULL DEFAULT 8,
    "allowsApothecary" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MasterRace_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MasterPosition" (
    "id" TEXT NOT NULL,
    "raceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "playerTags" TEXT[],
    "quantityMin" INTEGER NOT NULL DEFAULT 0,
    "quantityMax" INTEGER NOT NULL,
    "cost" INTEGER NOT NULL,
    "ma" INTEGER NOT NULL,
    "st" INTEGER NOT NULL,
    "ag" INTEGER NOT NULL,
    "pa" INTEGER,
    "av" INTEGER NOT NULL,
    "startingSkillKeys" TEXT[],
    "primaryCategories" "SkillCategory"[],
    "secondaryCategories" "SkillCategory"[],
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "MasterPosition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MasterStarPlayer" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "playerTags" TEXT[],
    "cost" INTEGER NOT NULL,
    "ma" INTEGER NOT NULL,
    "st" INTEGER NOT NULL,
    "ag" INTEGER NOT NULL,
    "pa" INTEGER,
    "av" INTEGER NOT NULL,
    "skillKeys" TEXT[],
    "playsForAny" BOOLEAN NOT NULL DEFAULT false,
    "leagues" TEXT[],
    "specialRuleName" TEXT,
    "specialRuleText" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MasterStarPlayer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MasterRace_key_key" ON "MasterRace"("key");

-- CreateIndex
CREATE INDEX "MasterPosition_raceId_idx" ON "MasterPosition"("raceId");

-- CreateIndex
CREATE UNIQUE INDEX "MasterStarPlayer_key_key" ON "MasterStarPlayer"("key");

-- AddForeignKey
ALTER TABLE "MasterPosition" ADD CONSTRAINT "MasterPosition_raceId_fkey" FOREIGN KEY ("raceId") REFERENCES "MasterRace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
