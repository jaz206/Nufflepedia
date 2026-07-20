-- CreateTable
CREATE TABLE "MasterPrayerEntry" (
    "id" TEXT NOT NULL,
    "roll" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "effect" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MasterPrayerEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MasterPrayerEntry_roll_key" ON "MasterPrayerEntry"("roll");
