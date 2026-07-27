import { prisma } from "@/server/db/prisma";
import StarsEditor from "./StarsEditor";

export default async function AdminStarsPage() {
  const stars = await prisma.masterStarPlayer.findMany({ orderBy: { name: "asc" } });

  return (
    <StarsEditor
      stars={stars.map((s) => ({
        id: s.id,
        name: s.name,
        playerTags: s.playerTags,
        cost: s.cost,
        ma: s.ma,
        st: s.st,
        ag: s.ag,
        pa: s.pa,
        av: s.av,
        skillKeys: s.skillKeys,
        playsForAny: s.playsForAny,
        leagues: s.leagues,
        specialRuleName: s.specialRuleName,
        specialRuleText: s.specialRuleText,
        lore: s.lore,
      }))}
    />
  );
}
