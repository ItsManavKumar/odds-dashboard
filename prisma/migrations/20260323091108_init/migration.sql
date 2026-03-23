-- CreateTable
CREATE TABLE "OddsSnapshot" (
    "id" SERIAL NOT NULL,
    "sport" TEXT NOT NULL,
    "homeTeam" TEXT NOT NULL,
    "awayTeam" TEXT NOT NULL,
    "commenceTime" TIMESTAMP(3) NOT NULL,
    "bookmaker" TEXT NOT NULL,
    "market" TEXT NOT NULL,
    "homeOdds" DOUBLE PRECISION NOT NULL,
    "awayOdds" DOUBLE PRECISION NOT NULL,
    "drawOdds" DOUBLE PRECISION,
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OddsSnapshot_pkey" PRIMARY KEY ("id")
);
