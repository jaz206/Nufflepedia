-- CreateEnum
CREATE TYPE "MatchSource" AS ENUM ('FIXTURE', 'GROUP', 'BRACKET');

-- AlterTable
ALTER TABLE "MatchReport" ADD COLUMN     "editedAt" TIMESTAMP(3),
ADD COLUMN     "editedById" TEXT,
ADD COLUMN     "source" "MatchSource" NOT NULL DEFAULT 'GROUP';

-- AddForeignKey
ALTER TABLE "MatchReport" ADD CONSTRAINT "MatchReport_editedById_fkey" FOREIGN KEY ("editedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
