-- AlterTable
ALTER TABLE "Competition" ADD COLUMN     "bracket" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "groupCount" INTEGER,
ADD COLUMN     "groups" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "hasGroupStage" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "phase" TEXT;
