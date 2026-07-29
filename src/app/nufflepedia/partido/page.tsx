import { prisma } from "@/server/db/prisma";
import SequenceChecklist from "./SequenceChecklist";

export default async function SecuenciaPartidoPage() {
  const sections = await prisma.masterMatchSection.findMany({
    orderBy: { sortOrder: "asc" },
    include: { steps: { orderBy: { sortOrder: "asc" } } },
  });

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight" style={{ color: "var(--gold)" }}>
          Secuencia de Partido
        </h1>
        <p className="mt-2" style={{ color: "var(--ink-3)" }}>
          Los pasos oficiales de Pre-Partido, Durante el Partido y Post-Partido, con su
          explicación — márcalos según los vayas resolviendo en mesa para no saltarte
          ninguno. Para el registro en vivo de touchdowns, faltas y turnos, usa el
          Asistente de Partido en <code>/arena</code>.
        </p>
      </div>
      <SequenceChecklist sections={sections} />
    </div>
  );
}
