-- DropForeignKey
ALTER TABLE "MatchInjury" DROP CONSTRAINT "MatchInjury_attackerPlayerId_fkey";

-- DropForeignKey
ALTER TABLE "MatchInjury" DROP CONSTRAINT "MatchInjury_victimPlayerId_fkey";

-- DropForeignKey
ALTER TABLE "MatchScorer" DROP CONSTRAINT "MatchScorer_playerId_fkey";

-- AlterTable
ALTER TABLE "CompetitionEntry" ADD COLUMN     "snapshotTreasury" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "CompetitionPlayer" (
    "id" TEXT NOT NULL,
    "entryId" TEXT NOT NULL,
    "sourcePlayerId" TEXT,
    "number" INTEGER NOT NULL,
    "customName" TEXT NOT NULL,
    "positionKey" TEXT,
    "starKey" TEXT,
    "spp" INTEGER NOT NULL DEFAULT 0,
    "status" "RosterPlayerStatus" NOT NULL DEFAULT 'ACTIVE',
    "maIncreases" INTEGER NOT NULL DEFAULT 0,
    "stIncreases" INTEGER NOT NULL DEFAULT 0,
    "agIncreases" INTEGER NOT NULL DEFAULT 0,
    "paIncreases" INTEGER NOT NULL DEFAULT 0,
    "avIncreases" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CompetitionPlayer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompetitionPlayerSkill" (
    "id" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "skillKey" TEXT NOT NULL,
    "source" "SkillSource" NOT NULL,

    CONSTRAINT "CompetitionPlayerSkill_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CompetitionPlayer_entryId_idx" ON "CompetitionPlayer"("entryId");

-- CreateIndex
CREATE UNIQUE INDEX "CompetitionPlayerSkill_playerId_skillKey_key" ON "CompetitionPlayerSkill"("playerId", "skillKey");

-- AddForeignKey
ALTER TABLE "CompetitionPlayer" ADD CONSTRAINT "CompetitionPlayer_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "CompetitionEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompetitionPlayerSkill" ADD CONSTRAINT "CompetitionPlayerSkill_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "CompetitionPlayer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchScorer" ADD CONSTRAINT "MatchScorer_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "CompetitionPlayer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchInjury" ADD CONSTRAINT "MatchInjury_attackerPlayerId_fkey" FOREIGN KEY ("attackerPlayerId") REFERENCES "CompetitionPlayer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchInjury" ADD CONSTRAINT "MatchInjury_victimPlayerId_fkey" FOREIGN KEY ("victimPlayerId") REFERENCES "CompetitionPlayer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
