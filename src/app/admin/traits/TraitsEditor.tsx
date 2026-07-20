"use client";

import { useState, useTransition } from "react";
import { createTrait, deleteTrait, updateTrait, type TraitInput } from "./actions";
import { TRAIT_CATEGORY_LABELS as CATEGORY_LABELS, TRAIT_CATEGORY_VALUES as CATEGORIES } from "@/lib/categoryLabels";

type Trait = TraitInput & { id: string };

const EMPTY_FORM: TraitInput = {
  key: "",
  name: "",
  englishName: "",
  category: "GENERAL",
  description: "",
  descriptionEn: "",
};

function TraitForm({
  initial,
  onSubmit,
  onCancel,
  submitLabel,
  lockKey,
  error,
}: {
  initial: TraitInput;
  onSubmit: (input: TraitInput) => void;
  onCancel?: () => void;
  submitLabel: string;
  lockKey?: boolean;
  error?: string;
}) {
  const [form, setForm] = useState<TraitInput>(initial);
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
        placeholder="Nombre"
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
        onChange={(e) => setForm({ ...form, category: e.target.value as TraitInput["category"] })}
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

export default function TraitsEditor({ initialTraits }: { initialTraits: Trait[] }) {
  const [traits, setTraits] = useState(initialTraits);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [formError, setFormError] = useState<string | undefined>(undefined);
  const [isPending, startTransition] = useTransition();

  const grouped = CATEGORIES.map((category) => ({
    category,
    items: traits.filter((t) => t.category === category),
  }));

  function handleCreate(input: TraitInput) {
    setFormError(undefined);
    startTransition(async () => {
      const result = await createTrait(input);
      if (!result.ok) {
        setFormError(result.error);
        return;
      }
      setTraits([...traits, { ...input, id: crypto.randomUUID() }]);
      setShowNewForm(false);
    });
  }

  function handleUpdate(id: string, input: TraitInput) {
    setFormError(undefined);
    startTransition(async () => {
      const result = await updateTrait(id, input);
      if (!result.ok) {
        setFormError(result.error);
        return;
      }
      setTraits(traits.map((t) => (t.id === id ? { ...input, id } : t)));
      setEditingId(null);
    });
  }

  function handleDelete(id: string) {
    if (!confirm("¿Borrar este rasgo?")) return;
    startTransition(async () => {
      await deleteTrait(id);
      setTraits(traits.filter((t) => t.id !== id));
    });
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Rasgos ({traits.length})</h1>
        <button
          className="btn-primary"
          onClick={() => {
            setFormError(undefined);
            setShowNewForm((v) => !v);
          }}
        >
          {showNewForm ? "Cerrar" : "+ Nuevo rasgo"}
        </button>
      </div>

      {showNewForm && (
        <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-4">
          <TraitForm
            initial={EMPTY_FORM}
            submitLabel="Crear"
            onSubmit={handleCreate}
            onCancel={() => setShowNewForm(false)}
            error={formError}
          />
        </div>
      )}

      {grouped.map(({ category, items }) => (
        <section key={category}>
          <h2 className="text-lg font-semibold border-b border-zinc-200 dark:border-zinc-800 pb-2 mb-3">
            {CATEGORY_LABELS[category]} ({items.length})
          </h2>
          <div className="space-y-2">
            {items.map((trait) =>
              editingId === trait.id ? (
                <div key={trait.id} className="rounded-lg border border-zinc-300 dark:border-zinc-700 p-4">
                  <TraitForm
                    initial={trait}
                    submitLabel="Guardar"
                    onSubmit={(input) => handleUpdate(trait.id, input)}
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
                  key={trait.id}
                  className="flex items-start justify-between gap-4 rounded-lg border border-zinc-200 dark:border-zinc-800 p-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{trait.name}</span>
                      <span
                        className={`text-[10px] uppercase ${
                          trait.descriptionEn?.trim() ? "text-emerald-600 dark:text-emerald-400" : "text-zinc-400"
                        }`}
                        title={trait.descriptionEn?.trim() ? "Tiene descripción en inglés" : "Falta descripción en inglés"}
                      >
                        EN {trait.descriptionEn?.trim() ? "✓" : "—"}
                      </span>
                      <span className="text-xs text-zinc-400">{trait.key}</span>
                    </div>
                    <p className="text-sm text-zinc-500 mt-1">{trait.description}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      className="btn-secondary"
                      onClick={() => {
                        setFormError(undefined);
                        setEditingId(trait.id);
                      }}
                      disabled={isPending}
                    >
                      Editar
                    </button>
                    <button className="btn-danger" onClick={() => handleDelete(trait.id)} disabled={isPending}>
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
