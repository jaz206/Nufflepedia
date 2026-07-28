-- CreateEnum
CREATE TYPE "PresentialTournamentStatus" AS ENUM ('SETUP', 'IN_PROGRESS', 'FINISHED');

-- CreateTable
CREATE TABLE "PresentialTournament" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "commissionerId" TEXT NOT NULL,
    "status" "PresentialTournamentStatus" NOT NULL DEFAULT 'SETUP',
    "totalRounds" INTEGER NOT NULL,
    "currentRound" INTEGER NOT NULL DEFAULT 0,
    "pointsWin" INTEGER NOT NULL DEFAULT 2,
    "pointsDraw" INTEGER NOT NULL DEFAULT 1,
    "pointsLoss" INTEGER NOT NULL DEFAULT 0,
    "publicSlug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PresentialTournament_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PresentialEntrant" (
    "id" TEXT NOT NULL,
    "tournamentId" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "teamName" TEXT NOT NULL,
    "raceName" TEXT NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 0,
    "tdFor" INTEGER NOT NULL DEFAULT 0,
    "tdAgainst" INTEGER NOT NULL DEFAULT 0,
    "casFor" INTEGER NOT NULL DEFAULT 0,
    "casAgainst" INTEGER NOT NULL DEFAULT 0,
    "byes" INTEGER NOT NULL DEFAULT 0,
    "dropped" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PresentialEntrant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PresentialRound" (
    "id" TEXT NOT NULL,
    "tournamentId" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PresentialRound_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PresentialMatch" (
    "id" TEXT NOT NULL,
    "roundId" TEXT NOT NULL,
    "tableNumber" INTEGER NOT NULL,
    "entrantAId" TEXT NOT NULL,
    "entrantBId" TEXT,
    "scoreA" INTEGER,
    "scoreB" INTEGER,
    "casA" INTEGER NOT NULL DEFAULT 0,
    "casB" INTEGER NOT NULL DEFAULT 0,
    "reported" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "PresentialMatch_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PresentialTournament_publicSlug_key" ON "PresentialTournament"("publicSlug");

-- CreateIndex
CREATE INDEX "PresentialTournament_commissionerId_idx" ON "PresentialTournament"("commissionerId");

-- CreateIndex
CREATE INDEX "PresentialEntrant_tournamentId_idx" ON "PresentialEntrant"("tournamentId");

-- CreateIndex
CREATE UNIQUE INDEX "PresentialRound_tournamentId_number_key" ON "PresentialRound"("tournamentId", "number");

-- CreateIndex
CREATE INDEX "PresentialMatch_roundId_idx" ON "PresentialMatch"("roundId");

-- AddForeignKey
ALTER TABLE "PresentialTournament" ADD CONSTRAINT "PresentialTournament_commissionerId_fkey" FOREIGN KEY ("commissionerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PresentialEntrant" ADD CONSTRAINT "PresentialEntrant_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "PresentialTournament"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PresentialRound" ADD CONSTRAINT "PresentialRound_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "PresentialTournament"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PresentialMatch" ADD CONSTRAINT "PresentialMatch_roundId_fkey" FOREIGN KEY ("roundId") REFERENCES "PresentialRound"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PresentialMatch" ADD CONSTRAINT "PresentialMatch_entrantAId_fkey" FOREIGN KEY ("entrantAId") REFERENCES "PresentialEntrant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PresentialMatch" ADD CONSTRAINT "PresentialMatch_entrantBId_fkey" FOREIGN KEY ("entrantBId") REFERENCES "PresentialEntrant"("id") ON DELETE SET NULL ON UPDATE CASCADE;
