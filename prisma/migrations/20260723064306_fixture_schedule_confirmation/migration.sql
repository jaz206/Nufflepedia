-- AlterTable
ALTER TABLE "CompetitionFixture" ADD COLUMN     "confirmedAt" TIMESTAMP(3),
ADD COLUMN     "proposedByEntryId" TEXT;

-- AddForeignKey
ALTER TABLE "CompetitionFixture" ADD CONSTRAINT "CompetitionFixture_proposedByEntryId_fkey" FOREIGN KEY ("proposedByEntryId") REFERENCES "CompetitionEntry"("id") ON DELETE SET NULL ON UPDATE CASCADE;
