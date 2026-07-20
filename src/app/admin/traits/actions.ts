"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/server/db/prisma";
import { requireAdmin } from "@/server/auth/requireAdmin";
import { TRAIT_CATEGORY_VALUES } from "@/lib/categoryLabels";

const traitSchema = z.object({
  key: z
    .string()
    .min(1, "La clave es obligatoria")
    .regex(/^[a-z0-9-]+$/, "Solo minusculas, numeros y guiones"),
  name: z.string().min(1, "El nombre es obligatorio"),
  englishName: z.string().optional(),
  category: z.enum(TRAIT_CATEGORY_VALUES),
  description: z.string().min(1, "La descripcion es obligatoria"),
  descriptionEn: z.string().optional(),
});

export type TraitInput = z.infer<typeof traitSchema>;
export type ActionResult = { ok: true } | { ok: false; error: string };

function formatZodError(error: z.ZodError): string {
  return error.issues.map((issue) => issue.message).join(" · ");
}

export async function createTrait(input: TraitInput): Promise<ActionResult> {
  await requireAdmin();
  const parsed = traitSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: formatZodError(parsed.error) };
  }
  await prisma.masterTrait.create({ data: parsed.data });
  revalidatePath("/admin/traits");
  revalidatePath("/nufflepedia");
  return { ok: true };
}

export async function updateTrait(id: string, input: TraitInput): Promise<ActionResult> {
  await requireAdmin();
  const parsed = traitSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: formatZodError(parsed.error) };
  }
  await prisma.masterTrait.update({ where: { id }, data: parsed.data });
  revalidatePath("/admin/traits");
  revalidatePath("/nufflepedia");
  return { ok: true };
}

export async function deleteTrait(id: string) {
  await requireAdmin();
  await prisma.masterTrait.delete({ where: { id } });
  revalidatePath("/admin/traits");
  revalidatePath("/nufflepedia");
}
