"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/server/db/prisma";
import { requireAdmin } from "@/server/auth/requireAdmin";
import { SKILL_CATEGORY_VALUES } from "@/lib/categoryLabels";

export type ActionResult = { ok: true } | { ok: false; error: string };

function fmt(e: z.ZodError): string {
  return e.issues.map((i) => i.message).join(" · ");
}

const raceSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio"),
  pageRef: z.number().int().nullable(),
  tier: z.number().int().min(1).max(5).nullable(),
  playstyle: z.string().nullable(),
  leagues: z.array(z.string()),
  specialRules: z.array(z.string()),
  rerollCost: z.number().int().min(0),
  rerollMax: z.number().int().min(0),
  allowsApothecary: z.boolean(),
});
export type RaceInput = z.infer<typeof raceSchema>;

const positionSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio"),
  playerTags: z.array(z.string()),
  quantityMin: z.number().int().min(0),
  quantityMax: z.number().int().min(0),
  cost: z.number().int().min(0),
  ma: z.number().int(),
  st: z.number().int(),
  ag: z.number().int(),
  pa: z.number().int().nullable(),
  av: z.number().int(),
  startingSkillKeys: z.array(z.string()),
  primaryCategories: z.array(z.enum(SKILL_CATEGORY_VALUES)),
  secondaryCategories: z.array(z.enum(SKILL_CATEGORY_VALUES)),
});
export type PositionInput = z.infer<typeof positionSchema>;

export async function updateRace(id: string, input: RaceInput): Promise<ActionResult> {
  await requireAdmin();
  const parsed = raceSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: fmt(parsed.error) };
  await prisma.masterRace.update({ where: { id }, data: parsed.data });
  revalidatePath("/admin/races");
  revalidatePath("/nufflepedia/razas");
  revalidatePath("/equipos/nuevo");
  return { ok: true };
}

export async function updatePosition(id: string, input: PositionInput): Promise<ActionResult> {
  await requireAdmin();
  const parsed = positionSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: fmt(parsed.error) };
  await prisma.masterPosition.update({ where: { id }, data: parsed.data });
  revalidatePath("/admin/races");
  revalidatePath("/nufflepedia/razas");
  revalidatePath("/equipos/nuevo");
  return { ok: true };
}
