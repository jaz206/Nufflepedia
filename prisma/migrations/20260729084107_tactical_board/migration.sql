-- CreateTable
CREATE TABLE "TacticalPlay" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TacticalPlay_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TacticalToken" (
    "id" TEXT NOT NULL,
    "playId" TEXT NOT NULL,
    "playerId" TEXT,
    "side" TEXT NOT NULL,
    "x" INTEGER NOT NULL,
    "y" INTEGER NOT NULL,
    "label" TEXT,

    CONSTRAINT "TacticalToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TacticalPlay_teamId_idx" ON "TacticalPlay"("teamId");

-- CreateIndex
CREATE INDEX "TacticalToken_playId_idx" ON "TacticalToken"("playId");

-- AddForeignKey
ALTER TABLE "TacticalPlay" ADD CONSTRAINT "TacticalPlay_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "ManagedTeam"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TacticalToken" ADD CONSTRAINT "TacticalToken_playId_fkey" FOREIGN KEY ("playId") REFERENCES "TacticalPlay"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TacticalToken" ADD CONSTRAINT "TacticalToken_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "ManagedPlayer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
