import EmptyState from "@/components/EmptyState";

export default function PizarraPage() {
  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 px-6 py-10">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Pizarra</h1>
        <p className="mt-1 text-sm" style={{ color: "var(--ink-3)" }}>
          Estrategia, reglas de pase/movimiento y cálculo de penalizaciones — Mesa Táctica.
        </p>
      </header>
      <EmptyState
        title="La Pizarra está en construcción"
        description="Un tablero de 26×15 para colocar hasta 11 fichas por equipo, formaciones preestablecidas y jugadas guardadas por equipo."
      />
    </div>
  );
}
