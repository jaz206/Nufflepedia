import { prisma } from "@/server/db/prisma";
import GuideEditor from "./GuideEditor";

export default async function AdminGuidePage() {
  const [sections, faq] = await Promise.all([
    prisma.masterGuideSection.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.masterGuideFaq.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);

  return (
    <GuideEditor
      sections={sections.map((s) => ({ id: s.id, emoji: s.emoji, title: s.title, href: s.href, description: s.description }))}
      faq={faq.map((f) => ({ id: f.id, question: f.question, answer: f.answer }))}
    />
  );
}
