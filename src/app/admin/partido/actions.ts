"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/server/db/prisma";
import { requireAdmin } from "@/server/auth/requireAdmin";

export type ActionResult = { ok: true } | { ok: false; error: string };

function fmt(e: z.ZodError): string {
  return e.issues.map((i) => i.message).join(" · ");
}

const sectionSchema = z.object({
  title: z.string().min(1, "El título es obligatorio"),
  intro: z.string().min(1, "La intro es obligatoria"),
  note: z.string().nullable(),
});

const stepSchema = z.object({
  title: z.string().min(1, "El título es obligatorio"),
  description: z.string().min(1, "La descripción es obligatoria"),
  dice: z.string().nullable(),
});

export async function updateMatchSection(id: string, input: z.infer<typeof sectionSchema>): Promise<ActionResult> {
  await requireAdmin();
  const parsed = sectionSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: fmt(parsed.error) };
  await prisma.masterMatchSection.update({ where: { id }, data: parsed.data });
  revalidatePath("/admin/partido");
  revalidatePath("/nufflepedia/partido");
  return { ok: true };
}

export async function updateMatchStep(id: string, input: z.infer<typeof stepSchema>): Promise<ActionResult> {
  await requireAdmin();
  const parsed = stepSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: fmt(parsed.error) };
  await prisma.masterMatchStep.update({ where: { id }, data: parsed.data });
  revalidatePath("/admin/partido");
  revalidatePath("/nufflepedia/partido");
  return { ok: true };
}
