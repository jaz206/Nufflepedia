"use client";

import { useState, useTransition } from "react";
import { updateNavItemLabel } from "./actions";

interface NavItem {
  id: string;
  href: string;
  label: string;
}

function NavItemRow({ item }: { item: NavItem }) {
  const [label, setLabel] = useState(item.label);
  const [, startTransition] = useTransition();
  const [err, setErr] = useState<string | undefined>();

  function save(value: string) {
    setLabel(value);
    startTransition(async () => {
      const res = await updateNavItemLabel(item.id, value);
      setErr(res.ok ? undefined : res.error);
    });
  }

  return (
    <div className="flex items-center gap-3 rounded-md border border-[var(--border-strong)] px-4 py-2">
      <input
        className="input flex-1 py-1.5 text-sm"
        defaultValue={label}
        onBlur={(e) => e.target.value !== label && save(e.target.value)}
      />
      <span className="w-48 shrink-0 truncate font-mono text-xs text-zinc-400">{item.href}</span>
      {err && <p className="text-xs text-[var(--danger)]">{err}</p>}
    </div>
  );
}

export default function MenuEditor({ items }: { items: NavItem[] }) {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Menú lateral ({items.length})</h1>
        <p className="text-sm text-zinc-500 mt-1">
          Cambia el nombre que ve cada entrenador para cada apartado. Se guarda al salir del
          campo. El enlace (a la derecha) y el orden no son editables aquí.
        </p>
      </div>
      <div className="space-y-2">
        {items.map((item) => (
          <NavItemRow key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
