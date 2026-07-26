"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/server/db/prisma";
import { requireAdmin } from "@/server/auth/requireAdmin";

const sectionSchema = z.object({ title: z.string().min(1), description: z.string().min(1) });
const faqSchema = z.object({ question: z.string().min(1), answer: z.string().min(1) });

export async function updateGuideSection(id: string, input: z.infer<typeof sectionSchema>) {
  await requireAdmin();
  await prisma.masterGuideSection.update({ where: { id }, data: sectionSchema.parse(input) });
  revalidatePath("/admin/guia");
  revalidatePath("/guia");
}

export async function updateGuideFaq(id: string, input: z.infer<typeof faqSchema>) {
  await requireAdmin();
  await prisma.masterGuideFaq.update({ where: { id }, data: faqSchema.parse(input) });
  revalidatePath("/admin/guia");
  revalidatePath("/guia");
}
