/*
  Warnings:

  - Made the column `rosterKey` on table `CompetitionEntry` required. This step will fail if there are existing NULL values in that column.
  - Made the column `teamName` on table `CompetitionEntry` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "CompetitionEntry" ALTER COLUMN "rosterKey" SET NOT NULL,
ALTER COLUMN "teamName" SET NOT NULL;
