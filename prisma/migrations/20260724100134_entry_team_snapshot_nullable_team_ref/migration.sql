-- DropForeignKey
ALTER TABLE "CompetitionEntry" DROP CONSTRAINT "CompetitionEntry_managedTeamId_fkey";

-- AlterTable
ALTER TABLE "CompetitionEntry" ADD COLUMN     "rosterKey" TEXT,
ADD COLUMN     "teamName" TEXT,
ALTER COLUMN "managedTeamId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "CompetitionEntry" ADD CONSTRAINT "CompetitionEntry_managedTeamId_fkey" FOREIGN KEY ("managedTeamId") REFERENCES "ManagedTeam"("id") ON DELETE SET NULL ON UPDATE CASCADE;
