-- CreateTable
CREATE TABLE "CompetitionFixture" (
    "id" TEXT NOT NULL,
    "competitionId" TEXT NOT NULL,
    "round" INTEGER NOT NULL,
    "homeEntryId" TEXT NOT NULL,
    "awayEntryId" TEXT NOT NULL,
    "scheduledAt" TIMESTAMP(3),
    "matchReportId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CompetitionFixture_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MatchScorer" (
    "id" TEXT NOT NULL,
    "matchReportId" TEXT NOT NULL,
    "entryId" TEXT NOT NULL,
    "playerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MatchScorer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MatchInjury" (
    "id" TEXT NOT NULL,
    "matchReportId" TEXT NOT NULL,
    "attackerEntryId" TEXT NOT NULL,
    "attackerPlayerId" TEXT,
    "victimEntryId" TEXT NOT NULL,
    "victimPlayerId" TEXT,
    "injuryCode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MatchInjury_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CompetitionFixture_matchReportId_key" ON "CompetitionFixture"("matchReportId");

-- CreateIndex
CREATE INDEX "CompetitionFixture_competitionId_idx" ON "CompetitionFixture"("competitionId");

-- CreateIndex
CREATE INDEX "MatchScorer_matchReportId_idx" ON "MatchScorer"("matchReportId");

-- CreateIndex
CREATE INDEX "MatchInjury_matchReportId_idx" ON "MatchInjury"("matchReportId");

-- AddForeignKey
ALTER TABLE "CompetitionFixture" ADD CONSTRAINT "CompetitionFixture_competitionId_fkey" FOREIGN KEY ("competitionId") REFERENCES "Competition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompetitionFixture" ADD CONSTRAINT "CompetitionFixture_homeEntryId_fkey" FOREIGN KEY ("homeEntryId") REFERENCES "CompetitionEntry"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompetitionFixture" ADD CONSTRAINT "CompetitionFixture_awayEntryId_fkey" FOREIGN KEY ("awayEntryId") REFERENCES "CompetitionEntry"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompetitionFixture" ADD CONSTRAINT "CompetitionFixture_matchReportId_fkey" FOREIGN KEY ("matchReportId") REFERENCES "MatchReport"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchScorer" ADD CONSTRAINT "MatchScorer_matchReportId_fkey" FOREIGN KEY ("matchReportId") REFERENCES "MatchReport"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchScorer" ADD CONSTRAINT "MatchScorer_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "CompetitionEntry"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchScorer" ADD CONSTRAINT "MatchScorer_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "ManagedPlayer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchInjury" ADD CONSTRAINT "MatchInjury_matchReportId_fkey" FOREIGN KEY ("matchReportId") REFERENCES "MatchReport"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchInjury" ADD CONSTRAINT "MatchInjury_attackerEntryId_fkey" FOREIGN KEY ("attackerEntryId") REFERENCES "CompetitionEntry"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchInjury" ADD CONSTRAINT "MatchInjury_attackerPlayerId_fkey" FOREIGN KEY ("attackerPlayerId") REFERENCES "ManagedPlayer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchInjury" ADD CONSTRAINT "MatchInjury_victimEntryId_fkey" FOREIGN KEY ("victimEntryId") REFERENCES "CompetitionEntry"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchInjury" ADD CONSTRAINT "MatchInjury_victimPlayerId_fkey" FOREIGN KEY ("victimPlayerId") REFERENCES "ManagedPlayer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
