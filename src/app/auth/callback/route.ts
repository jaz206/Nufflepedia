import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/server/db/prisma";

/**
 * Destino del enlace mágico de login. Intercambia el código por una sesión
 * y crea/actualiza el usuario en Postgres. El primer usuario que exista se
 * convierte automáticamente en ADMIN (bootstrap de un proyecto nuevo).
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user?.email) {
      const existingCount = await prisma.user.count();
      const meta = data.user.user_metadata ?? {};
      await prisma.user.upsert({
        where: { authId: data.user.id },
        update: {
          email: data.user.email,
          // Solo pisa el nombre/avatar si Google los trae; el login por
          // email no tiene metadata y no debe borrar lo que ya hubiera.
          ...(meta.avatar_url ? { avatarUrl: meta.avatar_url } : {}),
        },
        create: {
          authId: data.user.id,
          email: data.user.email,
          displayName: meta.full_name ?? meta.name ?? data.user.email.split("@")[0],
          avatarUrl: meta.avatar_url ?? null,
          role: existingCount === 0 ? "ADMIN" : "USER",
        },
      });

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
