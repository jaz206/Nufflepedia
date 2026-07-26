-- CreateEnum
CREATE TYPE "LiveMatchStatus" AS ENUM ('PRE_MATCH', 'IN_PROGRESS', 'FINISHED');

-- CreateEnum
CREATE TYPE "LiveMatchEventType" AS ENUM ('FAN_FACTOR', 'WEATHER_ROLL', 'KICKING_TEAM_ROLL', 'KICKOFF_EVENT', 'TURNOVER', 'TOUCHDOWN', 'COMPLETED_PASS', 'INTERCEPTION', 'CASUALTY', 'SENT_OFF', 'APOTHECARY_USED', 'SUBSTITUTION', 'PRAYER_TO_NUFFLE', 'KO_RECOVERY', 'HALF_END', 'NOTE');

-- AlterEnum
ALTER TYPE "MatchSource" ADD VALUE 'FRIENDLY';

-- AlterTable
ALTER TABLE "CompetitionEntry" ALTER COLUMN "competitionId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "ManagedTeam" ADD COLUMN     "isGuest" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "LiveMatch" (
    "id" TEXT NOT NULL,
    "status" "LiveMatchStatus" NOT NULL DEFAULT 'PRE_MATCH',
    "createdById" TEXT NOT NULL,
    "homeEntryId" TEXT NOT NULL,
    "awayEntryId" TEXT NOT NULL,
    "half" INTEGER NOT NULL DEFAULT 1,
    "turn" INTEGER NOT NULL DEFAULT 1,
    "homeScore" INTEGER NOT NULL DEFAULT 0,
    "awayScore" INTEGER NOT NULL DEFAULT 0,
    "fanFactorHome" INTEGER,
    "fanFactorAway" INTEGER,
    "weatherCode" TEXT,
    "kickingEntryId" TEXT,
    "matchReportId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LiveMatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LiveMatchEvent" (
    "id" TEXT NOT NULL,
    "liveMatchId" TEXT NOT NULL,
    "type" "LiveMatchEventType" NOT NULL,
    "half" INTEGER NOT NULL,
    "turn" INTEGER NOT NULL,
    "entryId" TEXT,
    "playerId" TEXT,
    "opponentEntryId" TEXT,
    "opponentPlayerId" TEXT,
    "payload" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LiveMatchEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LiveMatch_homeEntryId_key" ON "LiveMatch"("homeEntryId");

-- CreateIndex
CREATE UNIQUE INDEX "LiveMatch_awayEntryId_key" ON "LiveMatch"("awayEntryId");

-- CreateIndex
CREATE UNIQUE INDEX "LiveMatch_matchReportId_key" ON "LiveMatch"("matchReportId");

-- CreateIndex
CREATE INDEX "LiveMatch_createdById_idx" ON "LiveMatch"("createdById");

-- CreateIndex
CREATE INDEX "LiveMatchEvent_liveMatchId_idx" ON "LiveMatchEvent"("liveMatchId");

-- AddForeignKey
ALTER TABLE "LiveMatch" ADD CONSTRAINT "LiveMatch_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LiveMatch" ADD CONSTRAINT "LiveMatch_homeEntryId_fkey" FOREIGN KEY ("homeEntryId") REFERENCES "CompetitionEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LiveMatch" ADD CONSTRAINT "LiveMatch_awayEntryId_fkey" FOREIGN KEY ("awayEntryId") REFERENCES "CompetitionEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LiveMatchEvent" ADD CONSTRAINT "LiveMatchEvent_liveMatchId_fkey" FOREIGN KEY ("liveMatchId") REFERENCES "LiveMatch"("id") ON DELETE CASCADE ON UPDATE CASCADE;
