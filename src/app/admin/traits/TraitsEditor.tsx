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
};

function TraitForm({
  initial,
  onSubmit,
  onCancel,
  submitLabel,
}: {
  initial: TraitInput;
  onSubmit: (input: TraitInput) => void;
  onCancel?: () => void;
  submitLabel: string;
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
      <input
        className="input"
        placeholder="clave-unica"
        value={form.key}
        onChange={(e) => setForm({ ...form, key: e.target.value })}
        required
      />
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
        placeholder="Descripción"
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
        rows={2}
        required
      />
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

export default function TraitsEditor({ initialTraits }: { initialTraits: Trait[] }) {
  const [traits, setTraits] = useState(initialTraits);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [isPending, startTransition] = useTransition();

  const grouped = CATEGORIES.map((category) => ({
    category,
    items: traits.filter((t) => t.category === category),
  }));

  function handleCreate(input: TraitInput) {
    startTransition(async () => {
      await createTrait(input);
      setTraits([...traits, { ...input, id: crypto.randomUUID() }]);
      setShowNewForm(false);
    });
  }

  function handleUpdate(id: string, input: TraitInput) {
    startTransition(async () => {
      await updateTrait(id, input);
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
        <button className="btn-primary" onClick={() => setShowNewForm((v) => !v)}>
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
                    onCancel={() => setEditingId(null)}
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
                      <span className="text-xs text-zinc-400">{trait.key}</span>
                    </div>
                    <p className="text-sm text-zinc-500 mt-1">{trait.description}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button className="btn-secondary" onClick={() => setEditingId(trait.id)} disabled={isPending}>
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
