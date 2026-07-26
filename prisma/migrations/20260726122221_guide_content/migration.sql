-- CreateTable
CREATE TABLE "MasterGuideSection" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "emoji" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "href" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MasterGuideSection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MasterGuideFaq" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MasterGuideFaq_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MasterGuideSection_key_key" ON "MasterGuideSection"("key");

-- CreateIndex
CREATE UNIQUE INDEX "MasterGuideFaq_key_key" ON "MasterGuideFaq"("key");
