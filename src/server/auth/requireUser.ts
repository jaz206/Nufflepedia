import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/server/db/prisma";
import type { User } from "@prisma/client";

/**
 * Usar al principio de cualquier Server Component o Server Action que solo
 * requiere sesión (no rol de admin). Redirige a /login si no hay sesión.
 *
 * Toda consulta que filtre por "mis equipos" / "mis competiciones" debe
 * usar el `id` (o `authId`) devuelto aquí como criterio `ownerId` — es el
 * equivalente de `auth.uid()` en esta arquitectura: como Prisma habla con
 * Postgres por conexión directa (no vía PostgREST), el filtrado por dueño
 * se hace en este guard + en cada query, no en políticas RLS.
 */
export async function requireUser(): Promise<User> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.email) {
    redirect("/login");
  }

  // Camino rápido: en el 99% de las llamadas la fila ya existe. Un solo
  // SELECT por PK evita el upsert (y el count() que llevaba dentro) en el
  // camino caliente — esto se ejecuta en cada página y cada Server Action.
  const existing = await prisma.user.findUnique({ where: { authId: user.id } });
  if (existing) return existing;

  // Red de seguridad: si por lo que sea no existe fila en Postgres todavía
  // (p.ej. sesión antigua, o el upsert de /auth/callback no llegó a correr),
  // la creamos aquí con los mismos datos que usaría el callback.
  const existingCount = await prisma.user.count();
  return prisma.user.upsert({
    where: { authId: user.id },
    update: {},
    create: {
      authId: user.id,
      email: user.email,
      displayName:
        user.user_metadata?.full_name ??
        user.user_metadata?.name ??
        user.email.split("@")[0],
      avatarUrl: user.user_metadata?.avatar_url ?? null,
      role: existingCount === 0 ? "ADMIN" : "USER",
    },
  });
}
