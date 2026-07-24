-- CreateTable
CREATE TABLE "MasterInducement" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "cost" INTEGER,
    "maxCount" INTEGER NOT NULL,
    "restriction" TEXT,
    "effect" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MasterInducement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MasterSpecialRule" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MasterSpecialRule_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MasterInducement_key_key" ON "MasterInducement"("key");

-- CreateIndex
CREATE UNIQUE INDEX "MasterSpecialRule_key_key" ON "MasterSpecialRule"("key");
