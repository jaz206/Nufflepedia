import Link from "next/link";
import EmptyState from "@/components/EmptyState";

export default function ArenaPage() {
  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 px-6 py-10">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Arena</h1>
        <p className="mt-1 text-sm" style={{ color: "var(--ink-3)" }}>
          Gestor de partidos en vivo — Asistente de Partido (Fase 4).
        </p>
      </header>
      <EmptyState
        title="Más adelante"
        description="El registro en vivo de touchdowns, faltas, turnos y lesiones llega después de que Equipos y Competiciones estén terminados. Placeholder deliberado."
        actionLabel="Consultar la Secuencia de Partido"
        actionHref="/nufflepedia/partido"
      />
      <p className="text-sm" style={{ color: "var(--ink-3)" }}>
        Mientras tanto, la{" "}
        <Link href="/nufflepedia/partido" className="underline">
          chuleta de los pasos de Pre-Partido, Durante el Partido y Post-Partido
        </Link>{" "}
        ya está disponible en La Biblioteca.
      </p>
    </div>
  );
}
