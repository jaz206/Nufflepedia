"use client";

import { useState, useTransition } from "react";
import { createSkill, deleteSkill, updateSkill, type SkillInput } from "./actions";
import { SKILL_CATEGORY_LABELS as CATEGORY_LABELS, SKILL_CATEGORY_VALUES as CATEGORIES } from "@/lib/categoryLabels";

type Skill = SkillInput & { id: string };

const EMPTY_FORM: SkillInput = {
  key: "",
  name: "",
  englishName: "",
  category: "GENERAL",
  isActive: false,
  isElite: false,
  description: "",
};

function SkillForm({
  initial,
  onSubmit,
  onCancel,
  submitLabel,
}: {
  initial: SkillInput;
  onSubmit: (input: SkillInput) => void;
  onCancel?: () => void;
  submitLabel: string;
}) {
  const [form, setForm] = useState<SkillInput>(initial);
  const [isPending, startTransition] = useTransition();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        startTransition(() => onSubmit(form));
      }}
      className="grid gap-3 sm:grid-cols-2"
    >
      <input
        className="input"
        placeholder="clave-unica"
        value={form.key}
        onChange={(e) => setForm({ ...form, key: e.target.value })}
        required
      />
      <input
        className="input"
        placeholder="Nombre (ES)"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        required
      />
      <input
        className="input"
        placeholder="Nombre en inglés (opcional)"
        value={form.englishName ?? ""}
        onChange={(e) => setForm({ ...form, englishName: e.target.value })}
      />
      <select
        className="input"
        value={form.category}
        onChange={(e) => setForm({ ...form, category: e.target.value as SkillInput["category"] })}
      >
        {CATEGORIES.map((c) => (
          <option key={c} value={c}>
            {CATEGORY_LABELS[c]}
          </option>
        ))}
      </select>
      <textarea
        className="input sm:col-span-2"
        placeholder="Descripción"
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
        rows={2}
        required
      />
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={form.isActive}
          onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
        />
        Activa (acción declarada)
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={form.isElite}
          onChange={(e) => setForm({ ...form, isElite: e.target.checked })}
        />
        Élite (+10,000 MO)
      </label>
      <div className="sm:col-span-2 flex gap-2">
        <button type="submit" disabled={isPending} className="btn-primary">
          {isPending ? "Guardando..." : submitLabel}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn-secondary">
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}

export default function SkillsEditor({ initialSkills }: { initialSkills: Skill[] }) {
  const [skills, setSkills] = useState(initialSkills);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [isPending, startTransition] = useTransition();

  const grouped = CATEGORIES.map((category) => ({
    category,
    items: skills.filter((s) => s.category === category),
  }));

  function handleCreate(input: SkillInput) {
    startTransition(async () => {
      await createSkill(input);
      setSkills([...skills, { ...input, id: crypto.randomUUID() }]);
      setShowNewForm(false);
    });
  }

  function handleUpdate(id: string, input: SkillInput) {
    startTransition(async () => {
      await updateSkill(id, input);
      setSkills(skills.map((s) => (s.id === id ? { ...input, id } : s)));
      setEditingId(null);
    });
  }

  function handleDelete(id: string) {
    if (!confirm("¿Borrar esta habilidad?")) return;
    startTransition(async () => {
      await deleteSkill(id);
      setSkills(skills.filter((s) => s.id !== id));
    });
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Habilidades ({skills.length})</h1>
        <button className="btn-primary" onClick={() => setShowNewForm((v) => !v)}>
          {showNewForm ? "Cerrar" : "+ Nueva habilidad"}
        </button>
      </div>

      {showNewForm && (
        <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-4">
          <SkillForm
            initial={EMPTY_FORM}
            submitLabel="Crear"
            onSubmit={handleCreate}
            onCancel={() => setShowNewForm(false)}
          />
        </div>
      )}

      {grouped.map(({ category, items }) => (
        <section key={category}>
          <h2 className="text-lg font-semibold border-b border-zinc-200 dark:border-zinc-800 pb-2 mb-3">
            {CATEGORY_LABELS[category]} ({items.length})
          </h2>
          <div className="space-y-2">
            {items.map((skill) =>
              editingId === skill.id ? (
                <div key={skill.id} className="rounded-lg border border-zinc-300 dark:border-zinc-700 p-4">
                  <SkillForm
                    initial={skill}
                    submitLabel="Guardar"
                    onSubmit={(input) => handleUpdate(skill.id, input)}
                    onCancel={() => setEditingId(null)}
                  />
                </div>
              ) : (
                <div
                  key={skill.id}
                  className="flex items-start justify-between gap-4 rounded-lg border border-zinc-200 dark:border-zinc-800 p-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{skill.name}</span>
                      {skill.isElite && (
                        <span className="text-[10px] uppercase text-amber-600 dark:text-amber-400">Élite</span>
                      )}
                      {skill.isActive && (
                        <span className="text-[10px] uppercase text-sky-600 dark:text-sky-400">Activa</span>
                      )}
                      <span className="text-xs text-zinc-400">{skill.key}</span>
                    </div>
                    <p className="text-sm text-zinc-500 mt-1">{skill.description}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button className="btn-secondary" onClick={() => setEditingId(skill.id)} disabled={isPending}>
                      Editar
                    </button>
                    <button className="btn-danger" onClick={() => handleDelete(skill.id)} disabled={isPending}>
                      Borrar
                    </button>
                  </div>
                </div>
              )
            )}
          </div>
        </section>
      ))}
    </div>
  );
}
