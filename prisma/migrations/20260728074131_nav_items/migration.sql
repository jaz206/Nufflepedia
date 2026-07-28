-- CreateTable
CREATE TABLE "MasterNavItem" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "href" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MasterNavItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MasterNavItem_key_key" ON "MasterNavItem"("key");
