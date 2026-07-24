"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/server/db/prisma";
import { requireAdmin } from "@/server/auth/requireAdmin";

const weatherSchema = z.object({ name: z.string().min(1), effect: z.string().min(1) });
const kickoffSchema = z.object({ name: z.string().min(1), effect: z.string().min(1) });
const prayerSchema = z.object({ name: z.string().min(1), effect: z.string().min(1) });
const injurySchema = z.object({
  name: z.string().min(1),
  missesNextGame: z.boolean(),
  permanentStatLoss: z.boolean(),
  isDeath: z.boolean(),
});
const sppSchema = z.object({
  label: z.string().min(1),
  standardValue: z.number().int().min(0),
  brutosBrutalesValue: z.number().int().min(0).nullable(),
});
const levelUpSchema = z.object({
  label: z.string().min(1),
  sppCost: z.number().int().min(0),
  tvImpactMinGp: z.number().int().min(0).nullable(),
  tvImpactMaxGp: z.number().int().min(0).nullable(),
});
const inducementSchema = z.object({
  name: z.string().min(1),
  cost: z.number().int().min(0).nullable(),
  maxCount: z.number().int().min(0),
  restriction: z.string().nullable(),
  effect: z.string().min(1),
});
const specialRuleSchema = z.object({ name: z.string().min(1), description: z.string().min(1) });

export async function updateWeatherEntry(id: string, input: z.infer<typeof weatherSchema>) {
  await requireAdmin();
  await prisma.masterWeatherEntry.update({ where: { id }, data: weatherSchema.parse(input) });
  revalidatePath("/admin/tables");
  revalidatePath("/nufflepedia");
}

export async function updateKickoffEntry(id: string, input: z.infer<typeof kickoffSchema>) {
  await requireAdmin();
  await prisma.masterKickoffEntry.update({ where: { id }, data: kickoffSchema.parse(input) });
  revalidatePath("/admin/tables");
  revalidatePath("/nufflepedia");
}

export async function updatePrayerEntry(id: string, input: z.infer<typeof prayerSchema>) {
  await requireAdmin();
  await prisma.masterPrayerEntry.update({ where: { id }, data: prayerSchema.parse(input) });
  revalidatePath("/admin/tables");
  revalidatePath("/nufflepedia");
}

export async function updateInjuryEntry(id: string, input: z.infer<typeof injurySchema>) {
  await requireAdmin();
  await prisma.masterInjuryEntry.update({ where: { id }, data: injurySchema.parse(input) });
  revalidatePath("/admin/tables");
  revalidatePath("/nufflepedia");
}

export async function updateSppValue(id: string, input: z.infer<typeof sppSchema>) {
  await requireAdmin();
  await prisma.masterSppValue.update({ where: { id }, data: sppSchema.parse(input) });
  revalidatePath("/admin/tables");
  revalidatePath("/nufflepedia");
}

export async function updateLevelUpConfig(id: string, input: z.infer<typeof levelUpSchema>) {
  await requireAdmin();
  await prisma.masterLevelUpConfig.update({ where: { id }, data: levelUpSchema.parse(input) });
  revalidatePath("/admin/tables");
  revalidatePath("/nufflepedia");
}

export async function updateInducement(id: string, input: z.infer<typeof inducementSchema>) {
  await requireAdmin();
  await prisma.masterInducement.update({ where: { id }, data: inducementSchema.parse(input) });
  revalidatePath("/admin/tables");
  revalidatePath("/nufflepedia");
}

export async function updateSpecialRule(id: string, input: z.infer<typeof specialRuleSchema>) {
  await requireAdmin();
  await prisma.masterSpecialRule.update({ where: { id }, data: specialRuleSchema.parse(input) });
  revalidatePath("/admin/tables");
  revalidatePath("/nufflepedia");
}
