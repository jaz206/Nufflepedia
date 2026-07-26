"use client";

import { useState } from "react";

interface FaqItem {
  question: string;
  answer: string;
}

function FaqRow({ item, open, onToggle }: { item: FaqItem; open: boolean; onToggle: () => void }) {
  return (
    <div className="border-b py-3" style={{ borderColor: "var(--border)" }}>
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-3 text-left text-sm font-medium"
      >
        {item.question}
        <span style={{ color: "var(--ink-3)" }}>{open ? "−" : "+"}</span>
      </button>
      {open && (
        <p className="mt-2 text-sm" style={{ color: "var(--ink-2)" }}>
          {item.answer}
        </p>
      )}
    </div>
  );
}

export default function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  return (
    <div>
      {items.map((item, i) => (
        <FaqRow key={item.question} item={item} open={openIndex === i} onToggle={() => setOpenIndex(openIndex === i ? null : i)} />
      ))}
    </div>
  );
}
