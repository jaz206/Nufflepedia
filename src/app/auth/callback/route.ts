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
      await prisma.user.upsert({
        where: { authId: data.user.id },
        update: { email: data.user.email },
        create: {
          authId: data.user.id,
          email: data.user.email,
          displayName: data.user.email.split("@")[0],
          role: existingCount === 0 ? "ADMIN" : "USER",
        },
      });

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
