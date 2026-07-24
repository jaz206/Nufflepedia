import { requireUser } from "@/server/auth/requireUser";
import NewCompetitionForm from "./NewCompetitionForm";

export default async function NuevaCompeticionPage() {
  await requireUser();

  return (
    <div className="mx-auto w-full max-w-md space-y-6 px-6 py-10">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Crear competición</h1>
        <p className="mt-1 text-sm" style={{ color: "var(--ink-3)" }}>
          Tú serás el comisario: decides cuándo empieza y cuándo termina.
        </p>
      </header>

      <div className="rounded-[3px] border p-4 text-sm" style={{ borderColor: "var(--border)", background: "var(--surface-1)" }}>
        <p className="mb-2 font-semibold">Cómo funcionan los estados</p>
        <ul className="space-y-2" style={{ color: "var(--ink-2)" }}>
          <li>
            <span className="font-medium" style={{ color: "var(--ok)" }}>
              Abierta
            </span>{" "}
            — se puede crear e inscribir equipos. Así nace toda competición nueva.
          </li>
          <li>
            <span className="font-medium" style={{ color: "var(--warn)" }}>
              En curso
            </span>{" "}
            — la marcas tú cuando quieras empezar a jugar.{" "}
            <strong>A partir de ahí ya no se pueden inscribir más equipos.</strong> En
            Torneo, este paso también reparte los grupos o genera el cuadro.
          </li>
          <li>
            <span className="font-medium" style={{ color: "var(--ink-3)" }}>
              Finalizada
            </span>{" "}
            — cierra la competición del todo; ya no se pueden registrar más resultados.
          </li>
        </ul>
      </div>

      <NewCompetitionForm />
    </div>
  );
}
