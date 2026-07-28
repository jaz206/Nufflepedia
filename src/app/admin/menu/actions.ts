"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/server/db/prisma";
import { requireAdmin } from "@/server/auth/requireAdmin";

export type ActionResult = { ok: true } | { ok: false; error: string };

export async function updateNavItemLabel(id: string, label: string): Promise<ActionResult> {
  await requireAdmin();
  const parsed = z.string().min(1, "El nombre no puede estar vacío").max(40, "Máximo 40 caracteres").safeParse(label);
  if (!parsed.success) return { ok: false, error: parsed.error.issues.map((i) => i.message).join(" · ") };

  await prisma.masterNavItem.update({ where: { id }, data: { label: parsed.data } });
  revalidatePath("/admin/menu");
  // Invalida el layout (app) donde vive el Sidebar — cualquier ruta bajo
  // ese grupo sirve, dashboard es la más estable como ancla.
  revalidatePath("/dashboard", "layout");
  return { ok: true };
}
