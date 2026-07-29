"use client";

import { useEffect, useRef } from "react";

/** Componente del inventario de DESIGN_SYSTEM.md §7: overlay + panel, cierra con Escape o clic fuera. */
export default function Modal({
  open,
  onClose,
  title,
  children,
  maxWidthClassName = "max-w-md",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  /** Ancho del panel — por defecto max-w-md; algunos contenidos (listas con más columnas de info) piden más sitio. */
  maxWidthClassName?: string;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    closeRef.current?.focus();
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="absolute inset-0"
        style={{ background: "color-mix(in srgb, var(--ink) 45%, transparent)" }}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full ${maxWidthClassName} rounded-[3px] border p-5`}
        style={{
          borderColor: "var(--border-strong)",
          background: "var(--surface-1)",
          boxShadow: "0 12px 40px rgba(0,0,0,0.3)",
        }}
      >
        <div className="mb-3 flex items-start justify-between gap-4">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="btn-secondary"
            style={{ padding: "2px 8px", fontSize: "14px" }}
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
