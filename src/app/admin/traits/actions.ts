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

export async function createTrait(input: TraitInput) {
  await requireAdmin();
  const data = traitSchema.parse(input);
  await prisma.masterTrait.create({ data });
  revalidatePath("/admin/traits");
  revalidatePath("/nufflepedia");
}

export async function updateTrait(id: string, input: TraitInput) {
  await requireAdmin();
  const data = traitSchema.parse(input);
  await prisma.masterTrait.update({ where: { id }, data });
  revalidatePath("/admin/traits");
  revalidatePath("/nufflepedia");
}

export async function deleteTrait(id: string) {
  await requireAdmin();
  await prisma.masterTrait.delete({ where: { id } });
  revalidatePath("/admin/traits");
  revalidatePath("/nufflepedia");
}
