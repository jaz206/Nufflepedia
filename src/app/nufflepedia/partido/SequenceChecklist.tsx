"use client";

import { useState } from "react";

interface Step {
  id: string;
  sortOrder: number;
  title: string;
  description: string;
  dice: string | null;
}
interface Section {
  key: string;
  title: string;
  intro: string;
  note: string | null;
  steps: Step[];
}

export default function SequenceChecklist({ sections }: { sections: Section[] }) {
  const [checked, setChecked] = useState<Set<string>>(new Set());

  function toggle(id: string) {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function reset() {
    setChecked(new Set());
  }

  const totalSteps = sections.reduce((n, s) => n + s.steps.length, 0);

  return (
    <div className="space-y-10">
      {checked.size > 0 && (
        <div
          className="flex items-center justify-between rounded-[3px] border px-4 py-2 text-sm"
          style={{ borderColor: "var(--border)", background: "var(--surface-1)" }}
        >
          <span style={{ color: "var(--ink-3)" }}>
            {checked.size} / {totalSteps} pasos marcados
          </span>
          <button type="button" onClick={reset} className="underline" style={{ color: "var(--ink-3)" }}>
            Reiniciar
          </button>
        </div>
      )}

      {sections.map((section) => {
        const doneInSection = section.steps.filter((s) => checked.has(s.id)).length;
        return (
          <section key={section.key} className="rounded-[3px] border overflow-hidden" style={{ borderColor: "var(--border)" }}>
            <header className="px-5 py-4 border-b" style={{ background: "var(--surface-2)", borderColor: "var(--border)" }}>
              <div className="flex items-baseline justify-between gap-3 flex-wrap">
                <h2 className="text-xl font-semibold" style={{ color: "var(--gold)" }}>
                  {section.title}
                </h2>
                <span className="text-xs font-mono" style={{ color: "var(--ink-3)" }}>
                  {doneInSection}/{section.steps.length}
                </span>
              </div>
              <p className="mt-1 text-sm" style={{ color: "var(--ink-3)" }}>
                {section.intro}
              </p>
            </header>

            <ol className="divide-y" style={{ borderColor: "var(--border)" }}>
              {section.steps.map((step) => {
                const done = checked.has(step.id);
                return (
                  <li key={step.id} className="px-5 py-4">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={done}
                        onChange={() => toggle(step.id)}
                        className="mt-1 size-4 shrink-0 accent-[var(--accent)]"
                      />
                      <span className="flex-1 min-w-0">
                        <span className="flex items-baseline gap-2 flex-wrap">
                          <span className="text-xs font-mono" style={{ color: "var(--ink-3)" }}>
                            Paso {step.sortOrder}
                          </span>
                          <span
                            className="font-semibold"
                            style={done ? { textDecoration: "line-through", color: "var(--ink-3)" } : undefined}
                          >
                            {step.title}
                          </span>
                          {step.dice && (
                            <span
                              className="text-[10px] font-mono uppercase tracking-wide px-1.5 py-0.5 rounded-[3px]"
                              style={{ background: "var(--surface-2)", color: "var(--ink-3)" }}
                            >
                              {step.dice}
                            </span>
                          )}
                        </span>
                        <span className="block mt-1 text-sm" style={{ color: done ? "var(--ink-3)" : "var(--ink-2)" }}>
                          {step.description}
                        </span>
                      </span>
                    </label>
                  </li>
                );
              })}
            </ol>

            {section.note && (
              <p className="px-5 py-3 text-xs border-t" style={{ color: "var(--ink-3)", background: "var(--surface-2)", borderColor: "var(--border)" }}>
                {section.note}
              </p>
            )}
          </section>
        );
      })}
    </div>
  );
}
