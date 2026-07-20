import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/server/db/prisma";
import type { User } from "@prisma/client";

/**
 * Usar al principio de cualquier Server Component o Server Action que solo
 * puede ejecutar un admin. Redirige a /login si no hay sesión, a / si el
 * usuario no es ADMIN.
 */
export async function requireAdmin(): Promise<User> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const dbUser = await prisma.user.findUnique({ where: { authId: user.id } });

  if (!dbUser || dbUser.role !== "ADMIN") {
    redirect("/");
  }

  return dbUser;
}
