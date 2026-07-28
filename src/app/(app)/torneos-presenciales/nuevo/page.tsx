import { requireUser } from "@/server/auth/requireUser";
import NewTournamentForm from "./NewTournamentForm";

export default async function NewPresentialTournamentPage() {
  await requireUser();
  return (
    <div className="mx-auto w-full max-w-lg space-y-6 px-6 py-10">
      <h1 className="text-2xl font-bold tracking-tight">Nuevo Torneo Presencial</h1>
      <NewTournamentForm />
    </div>
  );
}
