import Link from "next/link";

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
}

/** Componente del inventario de DESIGN_SYSTEM.md §7: viñeta + frase + acción primaria. */
export default function EmptyState({ title, description, actionLabel, actionHref }: EmptyStateProps) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-3 rounded-[3px] border border-dashed p-10 text-center"
      style={{ borderColor: "var(--border-strong)" }}
    >
      <p className="font-medium" style={{ color: "var(--ink)" }}>
        {title}
      </p>
      <p className="max-w-sm text-sm" style={{ color: "var(--ink-3)" }}>
        {description}
      </p>
      {actionLabel && actionHref && (
        <Link href={actionHref} className="btn-primary mt-2">
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
