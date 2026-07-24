-- CreateTable
CREATE TABLE "MatchInducementPurchase" (
    "id" TEXT NOT NULL,
    "matchReportId" TEXT NOT NULL,
    "entryId" TEXT NOT NULL,
    "inducementKey" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "costPaid" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MatchInducementPurchase_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MatchInducementPurchase_matchReportId_idx" ON "MatchInducementPurchase"("matchReportId");

-- AddForeignKey
ALTER TABLE "MatchInducementPurchase" ADD CONSTRAINT "MatchInducementPurchase_matchReportId_fkey" FOREIGN KEY ("matchReportId") REFERENCES "MatchReport"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchInducementPurchase" ADD CONSTRAINT "MatchInducementPurchase_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "CompetitionEntry"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
