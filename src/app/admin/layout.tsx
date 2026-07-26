import Link from "next/link";
import { requireAdmin } from "@/server/auth/requireAdmin";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-10">
      <div className="flex items-center gap-6 mb-8 text-sm">
        <Link href="/admin" className="font-semibold">
          Panel de Admin
        </Link>
        <Link href="/admin/skills" className="text-zinc-500 hover:text-foreground">
          Habilidades
        </Link>
        <Link href="/admin/traits" className="text-zinc-500 hover:text-foreground">
          Rasgos
        </Link>
        <Link href="/admin/races" className="text-zinc-500 hover:text-foreground">
          Razas
        </Link>
        <Link href="/admin/stars" className="text-zinc-500 hover:text-foreground">
          Estrellas
        </Link>
        <Link href="/admin/tables" className="text-zinc-500 hover:text-foreground">
          Tablas
        </Link>
        <Link href="/admin/partido" className="text-zinc-500 hover:text-foreground">
          Secuencia de Partido
        </Link>
        <Link href="/admin/guia" className="text-zinc-500 hover:text-foreground">
          Guía
        </Link>
      </div>
      {children}
    </div>
  );
}
