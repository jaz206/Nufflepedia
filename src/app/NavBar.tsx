import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/server/db/prisma";
import { signOut } from "./actions";

export default async function NavBar() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const dbUser = user
    ? await prisma.user.findUnique({ where: { authId: user.id } })
    : null;

  return (
    <header className="border-b border-zinc-200 dark:border-zinc-800 px-6 py-3 flex items-center justify-between text-sm">
      <Link href="/" className="font-semibold">
        Blood Bowl Manager
      </Link>
      <nav className="flex items-center gap-4">
        <Link href="/nufflepedia" className="text-zinc-500 hover:text-foreground">
          Nufflepedia
        </Link>
        {dbUser?.role === "ADMIN" && (
          <Link href="/admin" className="text-zinc-500 hover:text-foreground">
            Admin
          </Link>
        )}
        {dbUser ? (
          <form action={signOut} className="flex items-center gap-3">
            <span className="text-zinc-500">{dbUser.email}</span>
            <button type="submit" className="text-zinc-500 hover:text-foreground underline">
              Salir
            </button>
          </form>
        ) : (
          <Link href="/login" className="text-zinc-500 hover:text-foreground">
            Entrar
          </Link>
        )}
      </nav>
    </header>
  );
}
