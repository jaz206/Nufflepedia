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
  descriptionEn: z.string().optional(),
});

export type SkillInput = z.infer<typeof skillSchema>;
export type ActionResult = { ok: true } | { ok: false; error: string };

function formatZodError(error: z.ZodError): string {
  return error.issues.map((issue) => issue.message).join(" · ");
}

export async function createSkill(input: SkillInput): Promise<ActionResult> {
  await requireAdmin();
  const parsed = skillSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: formatZodError(parsed.error) };
  }
  await prisma.masterSkill.create({ data: parsed.data });
  revalidatePath("/admin/skills");
  revalidatePath("/nufflepedia");
  return { ok: true };
}

export async function updateSkill(id: string, input: SkillInput): Promise<ActionResult> {
  await requireAdmin();
  const parsed = skillSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: formatZodError(parsed.error) };
  }
  await prisma.masterSkill.update({ where: { id }, data: parsed.data });
  revalidatePath("/admin/skills");
  revalidatePath("/nufflepedia");
  return { ok: true };
}

export async function deleteSkill(id: string) {
  await requireAdmin();
  await prisma.masterSkill.delete({ where: { id } });
  revalidatePath("/admin/skills");
  revalidatePath("/nufflepedia");
}
