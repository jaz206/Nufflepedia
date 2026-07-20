import { prisma } from "@/server/db/prisma";
import TablesEditor from "./TablesEditor";

export default async function AdminTablesPage() {
  const [weather, kickoff, injury, spp, levelUp] = await Promise.all([
    prisma.masterWeatherEntry.findMany({ orderBy: { minRoll: "asc" } }),
    prisma.masterKickoffEntry.findMany({ orderBy: { roll: "asc" } }),
    prisma.masterInjuryEntry.findMany({ orderBy: { minRoll: "asc" } }),
    prisma.masterSppValue.findMany({ orderBy: { label: "asc" } }),
    prisma.masterLevelUpConfig.findMany({ orderBy: { label: "asc" } }),
  ]);

  return <TablesEditor weather={weather} kickoff={kickoff} injury={injury} spp={spp} levelUp={levelUp} />;
}
