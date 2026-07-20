import { prisma } from "@/server/db/prisma";
import TraitsEditor from "./TraitsEditor";

export default async function AdminTraitsPage() {
  const traits = await prisma.masterTrait.findMany({ orderBy: { name: "asc" } });

  return (
    <TraitsEditor
      initialTraits={traits.map((t) => ({
        id: t.id,
        key: t.key,
        name: t.name,
        englishName: t.englishName ?? "",
        category: t.category,
        description: t.description,
        descriptionEn: t.descriptionEn ?? "",
      }))}
    />
  );
}
