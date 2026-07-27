"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/server/db/prisma";
import { requireAdmin } from "@/server/auth/requireAdmin";

export type ActionResult = { ok: true } | { ok: false; error: string };

function fmt(e: z.ZodError): string {
  return e.issues.map((i) => i.message).join(" · ");
}

const starSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio"),
  playerTags: z.array(z.string()),
  cost: z.number().int().min(0),
  ma: z.number().int(),
  st: z.number().int(),
  ag: z.number().int(),
  pa: z.number().int().nullable(),
  av: z.number().int(),
  skillKeys: z.array(z.string()),
  playsForAny: z.boolean(),
  leagues: z.array(z.string()),
  specialRuleName: z.string().nullable(),
  specialRuleText: z.string().nullable(),
  lore: z.string().nullable(),
});
export type StarInput = z.infer<typeof starSchema>;

export async function updateStar(id: string, input: StarInput): Promise<ActionResult> {
  await requireAdmin();
  const parsed = starSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: fmt(parsed.error) };
  await prisma.masterStarPlayer.update({ where: { id }, data: parsed.data });
  revalidatePath("/admin/stars");
  revalidatePath("/nufflepedia/estrellas");
  return { ok: true };
}
