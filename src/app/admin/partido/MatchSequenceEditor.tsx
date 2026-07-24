"use client";

import { useState, useTransition } from "react";
import { updateMatchSection, updateMatchStep } from "./actions";

interface Step {
  id: string;
  sortOrder: number;
  title: string;
  description: string;
  dice: string | null;
}
interface Section {
  id: string;
  key: string;
  title: string;
  intro: string;
  note: string | null;
  steps: Step[];
}

function StepRow({ step }: { step: Step }) {
  const [s, setS] = useState(step);
  const [, startTransition] = useTransition();
  const [err, setErr] = useState<string | undefined>();

  function save(patch: Partial<Step>) {
    const next = { ...s, ...patch };
    setS(next);
    startTransition(async () => {
      const res = await updateMatchStep(step.id, { title: next.title, description: next.description, dice: next.dice });
      setErr(res.ok ? undefined : res.error);
    });
  }

  return (
    <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-4 space-y-2">
      <div className="flex items-center gap-3">
        <span className="text-xs font-mono text-zinc-400 shrink-0">Paso {s.sortOrder}</span>
        <input
          className="input flex-1 font-medium"
          defaultValue={s.title}
          onBlur={(e) => e.target.value !== s.title && save({ title: e.target.value })}
        />
        <input
          className="input w-28 text-center font-mono text-xs"
          placeholder="dados"
          defaultValue={s.dice ?? ""}
          onBlur={(e) => {
            const v = e.target.value.trim() === "" ? null : e.target.value.trim();
            if (v !== s.dice) save({ dice: v });
          }}
        />
      </div>
      <textarea
        className="input w-full"
        rows={2}
        defaultValue={s.description}
        onBlur={(e) => e.target.value !== s.description && save({ description: e.target.value })}
      />
      {err && <p className="text-xs text-red-500">{err}</p>}
    </div>
  );
}

function SectionBlock({ section }: { section: Section }) {
  const [s, setS] = useState({ title: section.title, intro: section.intro, note: section.note });
  const [, startTransition] = useTransition();
  const [err, setErr] = useState<string | undefined>();

  function save(patch: Partial<typeof s>) {
    const next = { ...s, ...patch };
    setS(next);
    startTransition(async () => {
      const res = await updateMatchSection(section.id, next);
      setErr(res.ok ? undefined : res.error);
    });
  }

  return (
    <section className="space-y-3">
      <div className="border-b border-zinc-200 dark:border-zinc-800 pb-3 space-y-2">
        <input
          className="input text-lg font-semibold"
          defaultValue={s.title}
          onBlur={(e) => e.target.value !== s.title && save({ title: e.target.value })}
        />
        <textarea
          className="input w-full text-sm"
          rows={2}
          defaultValue={s.intro}
          onBlur={(e) => e.target.value !== s.intro && save({ intro: e.target.value })}
          placeholder="Intro de la sección"
        />
        <textarea
          className="input w-full text-sm"
          rows={2}
          defaultValue={s.note ?? ""}
          onBlur={(e) => {
            const v = e.target.value.trim() === "" ? null : e.target.value;
            if (v !== s.note) save({ note: v });
          }}
          placeholder="Nota final de la sección (opcional)"
        />
        {err && <p className="text-xs text-red-500">{err}</p>}
      </div>
      <div className="space-y-2">
        {section.steps.map((step) => (
          <StepRow key={step.id} step={step} />
        ))}
      </div>
    </section>
  );
}

export default function MatchSequenceEditor({ sections }: { sections: Section[] }) {
  return (
    <div className="space-y-10">
      <h1 className="text-2xl font-bold">Secuencia de Partido</h1>
      <p className="text-sm text-zinc-500 -mt-6">
        Edita el texto y haz clic fuera del campo para guardar. Se refleja en{" "}
        <code>/nufflepedia/partido</code>.
      </p>
      {sections.map((section) => (
        <SectionBlock key={section.id} section={section} />
      ))}
    </div>
  );
}
