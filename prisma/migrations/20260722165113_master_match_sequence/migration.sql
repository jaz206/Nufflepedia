-- CreateTable
CREATE TABLE "MasterMatchSection" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "intro" TEXT NOT NULL,
    "note" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MasterMatchSection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MasterMatchStep" (
    "id" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "dice" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MasterMatchStep_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MasterMatchSection_key_key" ON "MasterMatchSection"("key");

-- CreateIndex
CREATE INDEX "MasterMatchStep_sectionId_idx" ON "MasterMatchStep"("sectionId");

-- AddForeignKey
ALTER TABLE "MasterMatchStep" ADD CONSTRAINT "MasterMatchStep_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "MasterMatchSection"("id") ON DELETE CASCADE ON UPDATE CASCADE;
