-- AlterTable
ALTER TABLE "MasterStarPlayer" ADD COLUMN     "lore" TEXT;

-- CreateTable
CREATE TABLE "MagazineIssue" (
    "id" TEXT NOT NULL,
    "competitionId" TEXT NOT NULL,
    "issueNumber" INTEGER NOT NULL,
    "kind" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "newsRoundup" TEXT NOT NULL,
    "featuredMatchTitle" TEXT NOT NULL,
    "featuredMatchBody" TEXT NOT NULL,
    "nextTargetText" TEXT NOT NULL,
    "legendStarKey" TEXT,
    "legendText" TEXT NOT NULL,
    "standings" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MagazineIssue_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MagazineIssue_competitionId_idx" ON "MagazineIssue"("competitionId");

-- CreateIndex
CREATE UNIQUE INDEX "MagazineIssue_competitionId_issueNumber_key" ON "MagazineIssue"("competitionId", "issueNumber");

-- AddForeignKey
ALTER TABLE "MagazineIssue" ADD CONSTRAINT "MagazineIssue_competitionId_fkey" FOREIGN KEY ("competitionId") REFERENCES "Competition"("id") ON DELETE CASCADE ON UPDATE CASCADE;
