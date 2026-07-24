import { prisma } from "@/server/db/prisma";
import MatchSequenceEditor from "./MatchSequenceEditor";

export default async function AdminMatchSequencePage() {
  const sections = await prisma.masterMatchSection.findMany({
    orderBy: { sortOrder: "asc" },
    include: { steps: { orderBy: { sortOrder: "asc" } } },
  });

  return <MatchSequenceEditor sections={sections} />;
}
