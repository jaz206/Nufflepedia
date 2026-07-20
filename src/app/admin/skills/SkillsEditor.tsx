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
  descriptionEn: "",
};

function SkillForm({
  initial,
  onSubmit,
  onCancel,
  submitLabel,
  lockKey,
  error,
}: {
  initial: SkillInput;
  onSubmit: (input: SkillInput) => void;
  onCancel?: () => void;
  submitLabel: string;
  lockKey?: boolean;
  error?: string;
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
      {lockKey ? (
        <div className="input flex items-center bg-zinc-100 dark:bg-zinc-900 text-zinc-500 cursor-not-allowed" title="La clave no se puede cambiar una vez creada">
          {form.key}
        </div>
      ) : (
        <input
          className="input"
          placeholder="clave-unica"
          value={form.key}
          onChange={(e) => setForm({ ...form, key: e.target.value })}
          required
        />
      )}
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
        placeholder="Descripción (ES)"
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
        rows={2}
        required
      />
      <textarea
        className="input sm:col-span-2"
        placeholder="Descripción (EN) — opcional"
        value={form.descriptionEn ?? ""}
        onChange={(e) => setForm({ ...form, descriptionEn: e.target.value })}
        rows={2}
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
      <div className="sm:col-span-2 flex items-center gap-3">
        <button type="submit" disabled={isPending} className="btn-primary">
          {isPending ? "Guardando..." : submitLabel}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn-secondary">
            Cancelar
          </button>
        )}
        {error && <span className="text-sm text-red-600 dark:text-red-400">{error}</span>}
      </div>
    </form>
  );
}

type EnFilter = "all" | "yes" | "no";

function hasEn(skill: Skill) {
  return Boolean(skill.descriptionEn?.trim());
}

export default function SkillsEditor({ initialSkills }: { initialSkills: Skill[] }) {
  const [skills, setSkills] = useState(initialSkills);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [formError, setFormError] = useState<string | undefined>(undefined);
  const [enFilter, setEnFilter] = useState<EnFilter>("all");
  const [isPending, startTransition] = useTransition();

  const missingEnCount = skills.filter((s) => !hasEn(s)).length;

  const filteredSkills = skills.filter((s) => {
    if (enFilter === "yes") return hasEn(s);
    if (enFilter === "no") return !hasEn(s);
    return true;
  });

  const grouped = CATEGORIES.map((category) => ({
    category,
    items: filteredSkills.filter((s) => s.category === category),
  }));

  function handleCreate(input: SkillInput) {
    setFormError(undefined);
    startTransition(async () => {
      const result = await createSkill(input);
      if (!result.ok) {
        setFormError(result.error);
        return;
      }
      setSkills([...skills, { ...input, id: crypto.randomUUID() }]);
      setShowNewForm(false);
    });
  }

  function handleUpdate(id: string, input: SkillInput) {
    setFormError(undefined);
    startTransition(async () => {
      const result = await updateSkill(id, input);
      if (!result.ok) {
        setFormError(result.error);
        return;
      }
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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">
          Habilidades ({skills.length})
          <span className="ml-2 align-middle text-sm font-normal text-zinc-500">{missingEnCount} sin inglés</span>
        </h1>
        <button
          className="btn-primary"
          onClick={() => {
            setFormError(undefined);
            setShowNewForm((v) => !v);
          }}
        >
          {showNewForm ? "Cerrar" : "+ Nueva habilidad"}
        </button>
      </div>

      <div className="flex items-center gap-2 text-sm">
        <span className="text-zinc-500">Inglés:</span>
        {([
          ["all", "Todas"],
          ["no", "Sin inglés"],
          ["yes", "Con inglés"],
        ] as [EnFilter, string][]).map(([value, label]) => (
          <button
            key={value}
            onClick={() => setEnFilter(value)}
            className={
              enFilter === value
                ? "rounded-full bg-foreground px-3 py-1 text-background"
                : "rounded-full border border-zinc-300 dark:border-zinc-700 px-3 py-1 text-zinc-500 hover:text-foreground"
            }
          >
            {label}
          </button>
        ))}
      </div>

      {showNewForm && (
        <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-4">
          <SkillForm
            initial={EMPTY_FORM}
            submitLabel="Crear"
            onSubmit={handleCreate}
            onCancel={() => setShowNewForm(false)}
            error={formError}
          />
        </div>
      )}

      {grouped.map(({ category, items }) => (
        <section key={category} className={items.length === 0 ? "hidden" : undefined}>
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
                    onCancel={() => {
                      setFormError(undefined);
                      setEditingId(null);
                    }}
                    lockKey
                    error={formError}
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
                      <span
                        className={`text-[10px] uppercase ${
                          skill.descriptionEn?.trim() ? "text-emerald-600 dark:text-emerald-400" : "text-zinc-400"
                        }`}
                        title={skill.descriptionEn?.trim() ? "Tiene descripción en inglés" : "Falta descripción en inglés"}
                      >
                        EN {skill.descriptionEn?.trim() ? "✓" : "—"}
                      </span>
                      <span className="text-xs text-zinc-400">{skill.key}</span>
                    </div>
                    <p className="text-sm text-zinc-500 mt-1">{skill.description}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      className="btn-secondary"
                      onClick={() => {
                        setFormError(undefined);
                        setEditingId(skill.id);
                      }}
                      disabled={isPending}
                    >
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
