"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/server/db/prisma";
import { requireAdmin } from "@/server/auth/requireAdmin";
import { SKILL_CATEGORY_VALUES } from "@/lib/categoryLabels";

const skillSchema = z.object({
  key: z
    .string()
    .min(1, "La clave es obligatoria")
    .regex(/^[a-z0-9-]+$/, "Solo minusculas, numeros y guiones"),
  name: z.string().min(1, "El nombre es obligatorio"),
  englishName: z.string().optional(),
  category: z.enum(SKILL_CATEGORY_VALUES),
  isActive: z.boolean(),
  isElite: z.boolean(),
  description: z.string().min(1, "La descripcion es obligatoria"),
});

export type SkillInput = z.infer<typeof skillSchema>;

export async function createSkill(input: SkillInput) {
  await requireAdmin();
  const data = skillSchema.parse(input);
  await prisma.masterSkill.create({ data });
  revalidatePath("/admin/skills");
  revalidatePath("/nufflepedia");
}

export async function updateSkill(id: string, input: SkillInput) {
  await requireAdmin();
  const data = skillSchema.parse(input);
  await prisma.masterSkill.update({ where: { id }, data });
  revalidatePath("/admin/skills");
  revalidatePath("/nufflepedia");
}

export async function deleteSkill(id: string) {
  await requireAdmin();
  await prisma.masterSkill.delete({ where: { id } });
  revalidatePath("/admin/skills");
  revalidatePath("/nufflepedia");
}
