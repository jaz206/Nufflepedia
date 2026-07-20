import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-zinc-50 px-6 text-center dark:bg-black">
      <h1 className="text-4xl font-bold tracking-tight">Blood Bowl Manager</h1>
      <p className="max-w-md text-zinc-500">
        Reconstrucción desde cero: motor de reglas Season 3, gestor de equipos y comisionado de ligas.
      </p>
      <Link
        href="/oraculo"
        className="rounded-full bg-foreground px-6 py-3 text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc]"
      >
        Ver el Oráculo (Pilar 1)
      </Link>
    </div>
  );
}
