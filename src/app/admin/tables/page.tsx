import { prisma } from "@/server/db/prisma";
import TablesEditor from "./TablesEditor";

export default async function AdminTablesPage() {
  const [weather, kickoff, prayers, injury, spp, levelUp, inducements, specialRules, playerStates] = await Promise.all([
    prisma.masterWeatherEntry.findMany({ orderBy: { minRoll: "asc" } }),
    prisma.masterKickoffEntry.findMany({ orderBy: { roll: "asc" } }),
    prisma.masterPrayerEntry.findMany({ orderBy: { roll: "asc" } }),
    prisma.masterInjuryEntry.findMany({ orderBy: { minRoll: "asc" } }),
    prisma.masterSppValue.findMany({ orderBy: { label: "asc" } }),
    prisma.masterLevelUpConfig.findMany({ orderBy: { label: "asc" } }),
    prisma.masterInducement.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.masterSpecialRule.findMany({ orderBy: { name: "asc" } }),
    prisma.masterPlayerState.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);

  return (
    <TablesEditor
      weather={weather}
      kickoff={kickoff}
      prayers={prayers}
      injury={injury}
      spp={spp}
      levelUp={levelUp}
      inducements={inducements}
      specialRules={specialRules}
      playerStates={playerStates}
    />
  );
}
