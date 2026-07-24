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
        <div className="flex items-center justify-between rounded-lg border border-zinc-200 dark:border-zinc-800 px-4 py-2 text-sm">
          <span className="text-zinc-500">
            {checked.size} / {totalSteps} pasos marcados
          </span>
          <button
            type="button"
            onClick={reset}
            className="text-zinc-500 hover:text-foreground underline"
          >
            Reiniciar
          </button>
        </div>
      )}

      {sections.map((section) => {
        const doneInSection = section.steps.filter((s) => checked.has(s.id)).length;
        return (
          <section
            key={section.key}
            className="rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden"
          >
            <header className="px-5 py-4 bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex items-baseline justify-between gap-3 flex-wrap">
                <h2 className="text-xl font-semibold">{section.title}</h2>
                <span className="text-xs text-zinc-500 font-mono">
                  {doneInSection}/{section.steps.length}
                </span>
              </div>
              <p className="mt-1 text-sm text-zinc-500">{section.intro}</p>
            </header>

            <ol className="divide-y divide-zinc-200 dark:divide-zinc-800">
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
                          <span className="text-xs font-mono text-zinc-400">Paso {step.sortOrder}</span>
                          <span className={`font-semibold ${done ? "line-through text-zinc-400" : ""}`}>
                            {step.title}
                          </span>
                          {step.dice && (
                            <span className="text-[10px] font-mono uppercase tracking-wide px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
                              {step.dice}
                            </span>
                          )}
                        </span>
                        <span className={`block mt-1 text-sm ${done ? "text-zinc-400" : "text-zinc-600 dark:text-zinc-300"}`}>
                          {step.description}
                        </span>
                      </span>
                    </label>
                  </li>
                );
              })}
            </ol>

            {section.note && (
              <p className="px-5 py-3 text-xs text-zinc-500 bg-zinc-50 dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800">
                {section.note}
              </p>
            )}
          </section>
        );
      })}
    </div>
  );
}
