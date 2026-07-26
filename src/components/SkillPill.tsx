"use client";

import { useId, useRef, useState } from "react";

/**
 * Componente del inventario de DESIGN_SYSTEM.md §7: nombre de habilidad
 * como píldora bordeada; hover/focus abre un tooltip con la descripción
 * completa. Élite lleva punto oro. Es el puente visual entre módulos
 * (Cuartel, Estrellas, futura Nufflepedia con buscador global).
 */
export default function SkillPill({
  label,
  description,
  elite = false,
  onClick,
}: {
  label: string;
  description?: string;
  elite?: boolean;
  /** Si se indica, la píldora también es clicable (ej. saltar a la ficha de esa habilidad/rasgo/estado). */
  onClick?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [placement, setPlacement] = useState<"top" | "bottom">("bottom");
  const tooltipId = useId();
  const anchorRef = useRef<HTMLButtonElement>(null);

  function show() {
    // Si no cabe debajo (ej. está cerca del borde inferior de un modal o de
    // la ventana), la abre hacia arriba en su lugar.
    const rect = anchorRef.current?.getBoundingClientRect();
    const estimatedHeight = 160;
    if (rect && window.innerHeight - rect.bottom < estimatedHeight && rect.top > estimatedHeight) {
      setPlacement("top");
    } else {
      setPlacement("bottom");
    }
    setOpen(true);
  }

  return (
    <span className="relative inline-block">
      <button
        ref={anchorRef}
        type="button"
        className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs"
        style={{
          borderColor: "var(--border-strong)",
          color: "var(--ink-2)",
          background: "var(--surface-2)",
          cursor: onClick ? "pointer" : description ? "help" : "default",
        }}
        onMouseEnter={show}
        onMouseLeave={() => setOpen(false)}
        onFocus={show}
        onBlur={() => setOpen(false)}
        onClick={onClick}
        aria-describedby={description ? tooltipId : undefined}
      >
        {elite && <span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--gold)" }} />}
        {label}
      </button>

      {open && description && (
        <span
          id={tooltipId}
          role="tooltip"
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={() => setOpen(false)}
          className="absolute left-0 z-20 w-64 overflow-y-auto rounded-[3px] border p-2 text-xs leading-relaxed"
          style={{
            [placement === "top" ? "bottom" : "top"]: "100%",
            [placement === "top" ? "marginBottom" : "marginTop"]: "4px",
            maxHeight: "50vh",
            borderColor: "var(--border-strong)",
            background: "var(--surface-3)",
            color: "var(--ink-2)",
            boxShadow: "var(--shadow-print, 2px 2px 0 rgba(43,36,28,0.08))",
          }}
        >
          {description}
        </span>
      )}
    </span>
  );
}
