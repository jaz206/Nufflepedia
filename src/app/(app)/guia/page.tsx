import Link from "next/link";
import { requireUser } from "@/server/auth/requireUser";
import { prisma } from "@/server/db/prisma";
import FaqAccordion from "./FaqAccordion";

export default async function GuiaPage() {
  await requireUser();

  const [sections, faq] = await Promise.all([
    prisma.masterGuideSection.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.masterGuideFaq.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);

  return (
    <div className="mx-auto w-full max-w-5xl space-y-8 px-6 py-10">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Guía de la app</h1>
        <p className="mt-1 text-sm" style={{ color: "var(--ink-3)" }}>
          Qué es cada apartado del menú y para qué sirve.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        {sections.map((s) => (
          <Link
            key={s.id}
            href={s.href}
            className="rounded-[3px] border-t-4 border-x border-b p-4 transition-colors"
            style={{ borderTopColor: s.color, borderColor: "var(--border)", background: "var(--surface-1)" }}
          >
            <p className="font-semibold" style={{ color: s.color }}>
              {s.emoji} {s.title}
            </p>
            <p className="mt-2 text-sm" style={{ color: "var(--ink-2)" }}>
              {s.description}
            </p>
          </Link>
        ))}
      </div>

      <section className="rounded-[3px] border p-5" style={{ borderColor: "var(--border)", background: "var(--surface-1)" }}>
        <h2 className="mb-3 text-lg font-semibold">Preguntas frecuentes</h2>
        <FaqAccordion items={faq.map((f) => ({ question: f.question, answer: f.answer }))} />
      </section>
    </div>
  );
}
