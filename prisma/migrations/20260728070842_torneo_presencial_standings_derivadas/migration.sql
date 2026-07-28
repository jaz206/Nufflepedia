/*
  Warnings:

  - You are about to drop the column `byes` on the `PresentialEntrant` table. All the data in the column will be lost.
  - You are about to drop the column `casAgainst` on the `PresentialEntrant` table. All the data in the column will be lost.
  - You are about to drop the column `casFor` on the `PresentialEntrant` table. All the data in the column will be lost.
  - You are about to drop the column `points` on the `PresentialEntrant` table. All the data in the column will be lost.
  - You are about to drop the column `tdAgainst` on the `PresentialEntrant` table. All the data in the column will be lost.
  - You are about to drop the column `tdFor` on the `PresentialEntrant` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "PresentialEntrant" DROP COLUMN "byes",
DROP COLUMN "casAgainst",
DROP COLUMN "casFor",
DROP COLUMN "points",
DROP COLUMN "tdAgainst",
DROP COLUMN "tdFor";
