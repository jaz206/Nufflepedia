-- DropForeignKey
ALTER TABLE "PresentialMatch" DROP CONSTRAINT "PresentialMatch_entrantAId_fkey";

-- DropForeignKey
ALTER TABLE "PresentialMatch" DROP CONSTRAINT "PresentialMatch_entrantBId_fkey";

-- AddForeignKey
ALTER TABLE "PresentialMatch" ADD CONSTRAINT "PresentialMatch_entrantAId_fkey" FOREIGN KEY ("entrantAId") REFERENCES "PresentialEntrant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PresentialMatch" ADD CONSTRAINT "PresentialMatch_entrantBId_fkey" FOREIGN KEY ("entrantBId") REFERENCES "PresentialEntrant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
