import { prisma } from "@/server/db/prisma";
import SkillsEditor from "./SkillsEditor";

export default async function AdminSkillsPage() {
  const skills = await prisma.masterSkill.findMany({ orderBy: { name: "asc" } });

  return (
    <SkillsEditor
      initialSkills={skills.map((s) => ({
        id: s.id,
        key: s.key,
        name: s.name,
        englishName: s.englishName ?? "",
        category: s.category,
        isActive: s.isActive,
        isElite: s.isElite,
        description: s.description,
        descriptionEn: s.descriptionEn ?? "",
      }))}
    />
  );
}
