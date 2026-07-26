"use client";

import { useState, useTransition } from "react";
import { updateGuideSection, updateGuideFaq } from "./actions";

interface SectionRow {
  id: string;
  emoji: string;
  title: string;
  href: string;
  description: string;
}
interface FaqRow {
  id: string;
  question: string;
  answer: string;
}

export default function GuideEditor({ sections, faq }: { sections: SectionRow[]; faq: FaqRow[] }) {
  const [sectionItems, setSectionItems] = useState(sections);
  const [faqItems, setFaqItems] = useState(faq);
  const [isPending, startTransition] = useTransition();

  function saveSection(id: string, title: string, description: string) {
    startTransition(async () => {
      await updateGuideSection(id, { title, description });
      setSectionItems((items) => items.map((r) => (r.id === id ? { ...r, title, description } : r)));
    });
  }
  function saveFaq(id: string, question: string, answer: string) {
    startTransition(async () => {
      await updateGuideFaq(id, { question, answer });
      setFaqItems((items) => items.map((r) => (r.id === id ? { ...r, question, answer } : r)));
    });
  }

  return (
    <div className="space-y-10">
      <h1 className="text-2xl font-bold">Guía</h1>
      <p className="text-sm text-zinc-500 -mt-6">
        Edita el texto y haz clic fuera del campo para guardar. El emoji, el color y el enlace de cada tarjeta son
        fijos (no se editan aquí).
      </p>

      <section>
        <h2 className="text-lg font-semibold border-b border-zinc-200 dark:border-zinc-800 pb-2 mb-3">Tarjetas de sección</h2>
        <div className="space-y-3">
          {sectionItems.map((row) => (
            <div key={row.id} className="flex items-start gap-3">
              <span className="mt-2 w-8 shrink-0 text-center text-lg">{row.emoji}</span>
              <div className="flex-1 space-y-1">
                <input
                  className="input w-full"
                  defaultValue={row.title}
                  onBlur={(e) => e.target.value !== row.title && saveSection(row.id, e.target.value, row.description)}
                />
                <p className="text-[11px] text-zinc-400">{row.href}</p>
              </div>
              <textarea
                className="input flex-[2]"
                rows={2}
                defaultValue={row.description}
                disabled={isPending}
                onBlur={(e) => e.target.value !== row.description && saveSection(row.id, row.title, e.target.value)}
              />
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold border-b border-zinc-200 dark:border-zinc-800 pb-2 mb-3">Preguntas frecuentes</h2>
        <div className="space-y-3">
          {faqItems.map((row) => (
            <div key={row.id} className="flex items-start gap-3">
              <input
                className="input flex-1"
                defaultValue={row.question}
                onBlur={(e) => e.target.value !== row.question && saveFaq(row.id, e.target.value, row.answer)}
              />
              <textarea
                className="input flex-[2]"
                rows={2}
                defaultValue={row.answer}
                disabled={isPending}
                onBlur={(e) => e.target.value !== row.answer && saveFaq(row.id, row.question, e.target.value)}
              />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
