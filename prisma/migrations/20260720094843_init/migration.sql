-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "RosterPlayerStatus" AS ENUM ('ACTIVE', 'MISS_NEXT_GAME', 'NIGGLING_INJURY', 'DEAD', 'RETIRED');

-- CreateEnum
CREATE TYPE "SkillSource" AS ENUM ('ROSTER', 'LEVEL_UP', 'INDUCEMENT', 'STAR_PLAYER');

-- CreateEnum
CREATE TYPE "CompetitionFormat" AS ENUM ('LEAGUE', 'TOURNAMENT');

-- CreateEnum
CREATE TYPE "CompetitionVisibility" AS ENUM ('PUBLIC', 'PRIVATE');

-- CreateEnum
CREATE TYPE "CompetitionStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'FINISHED');

-- CreateEnum
CREATE TYPE "InvitationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "authId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ManagedTeam" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "rosterKey" TEXT NOT NULL,
    "treasury" INTEGER NOT NULL DEFAULT 0,
    "rerolls" INTEGER NOT NULL DEFAULT 0,
    "cheerleaders" INTEGER NOT NULL DEFAULT 0,
    "assistantCoaches" INTEGER NOT NULL DEFAULT 0,
    "hasApothecary" BOOLEAN NOT NULL DEFAULT false,
    "fanFactor" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ManagedTeam_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ManagedPlayer" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "customName" TEXT NOT NULL,
    "positionKey" TEXT NOT NULL,
    "spp" INTEGER NOT NULL DEFAULT 0,
    "status" "RosterPlayerStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ManagedPlayer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlayerSkillAssignment" (
    "id" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "skillKey" TEXT NOT NULL,
    "source" "SkillSource" NOT NULL,

    CONSTRAINT "PlayerSkillAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Competition" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "format" "CompetitionFormat" NOT NULL,
    "commissionerId" TEXT NOT NULL,
    "visibility" "CompetitionVisibility" NOT NULL DEFAULT 'PRIVATE',
    "maxTeams" INTEGER NOT NULL,
    "status" "CompetitionStatus" NOT NULL DEFAULT 'OPEN',
    "rulesConfig" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Competition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompetitionEntry" (
    "id" TEXT NOT NULL,
    "competitionId" TEXT NOT NULL,
    "managedTeamId" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "division" TEXT,
    "played" INTEGER NOT NULL DEFAULT 0,
    "won" INTEGER NOT NULL DEFAULT 0,
    "drawn" INTEGER NOT NULL DEFAULT 0,
    "lost" INTEGER NOT NULL DEFAULT 0,
    "tdFor" INTEGER NOT NULL DEFAULT 0,
    "tdAgainst" INTEGER NOT NULL DEFAULT 0,
    "casFor" INTEGER NOT NULL DEFAULT 0,
    "casAgainst" INTEGER NOT NULL DEFAULT 0,
    "points" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "CompetitionEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MatchReport" (
    "id" TEXT NOT NULL,
    "competitionId" TEXT,
    "homeEntryId" TEXT,
    "awayEntryId" TEXT,
    "homeScore" INTEGER NOT NULL,
    "awayScore" INTEGER NOT NULL,
    "gameLog" JSONB NOT NULL DEFAULT '[]',
    "headline" TEXT,
    "article" TEXT,
    "playedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MatchReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Invitation" (
    "id" TEXT NOT NULL,
    "competitionId" TEXT NOT NULL,
    "invitedEmail" TEXT NOT NULL,
    "invitedById" TEXT NOT NULL,
    "status" "InvitationStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Invitation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_authId_key" ON "User"("authId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "ManagedTeam_ownerId_idx" ON "ManagedTeam"("ownerId");

-- CreateIndex
CREATE INDEX "ManagedPlayer_teamId_idx" ON "ManagedPlayer"("teamId");

-- CreateIndex
CREATE UNIQUE INDEX "PlayerSkillAssignment_playerId_skillKey_key" ON "PlayerSkillAssignment"("playerId", "skillKey");

-- CreateIndex
CREATE INDEX "Competition_commissionerId_idx" ON "Competition"("commissionerId");

-- CreateIndex
CREATE INDEX "CompetitionEntry_competitionId_idx" ON "CompetitionEntry"("competitionId");

-- CreateIndex
CREATE UNIQUE INDEX "CompetitionEntry_competitionId_managedTeamId_key" ON "CompetitionEntry"("competitionId", "managedTeamId");

-- CreateIndex
CREATE INDEX "MatchReport_competitionId_idx" ON "MatchReport"("competitionId");

-- CreateIndex
CREATE INDEX "Invitation_competitionId_idx" ON "Invitation"("competitionId");

-- AddForeignKey
ALTER TABLE "ManagedTeam" ADD CONSTRAINT "ManagedTeam_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ManagedPlayer" ADD CONSTRAINT "ManagedPlayer_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "ManagedTeam"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerSkillAssignment" ADD CONSTRAINT "PlayerSkillAssignment_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "ManagedPlayer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Competition" ADD CONSTRAINT "Competition_commissionerId_fkey" FOREIGN KEY ("commissionerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompetitionEntry" ADD CONSTRAINT "CompetitionEntry_competitionId_fkey" FOREIGN KEY ("competitionId") REFERENCES "Competition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompetitionEntry" ADD CONSTRAINT "CompetitionEntry_managedTeamId_fkey" FOREIGN KEY ("managedTeamId") REFERENCES "ManagedTeam"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompetitionEntry" ADD CONSTRAINT "CompetitionEntry_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchReport" ADD CONSTRAINT "MatchReport_competitionId_fkey" FOREIGN KEY ("competitionId") REFERENCES "Competition"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchReport" ADD CONSTRAINT "MatchReport_homeEntryId_fkey" FOREIGN KEY ("homeEntryId") REFERENCES "CompetitionEntry"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchReport" ADD CONSTRAINT "MatchReport_awayEntryId_fkey" FOREIGN KEY ("awayEntryId") REFERENCES "CompetitionEntry"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invitation" ADD CONSTRAINT "Invitation_competitionId_fkey" FOREIGN KEY ("competitionId") REFERENCES "Competition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invitation" ADD CONSTRAINT "Invitation_invitedById_fkey" FOREIGN KEY ("invitedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
