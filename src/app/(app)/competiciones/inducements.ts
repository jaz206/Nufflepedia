import type { Prisma } from "@prisma/client";
import { prisma } from "@/server/db/prisma";

/**
 * Compra de Incentivos para un partido: validación (antes de la
 * transacción, con lecturas normales) + escritura (dentro de la
 * transacción del resultado). Solo cubre Incentivos de coste fijo — los de
 * "precio variable" no se pueden comprar por aquí todavía (ver
 * MasterInducement.cost === null).
 */

export interface InducementPurchaseInput {
  entryId: string;
  inducementKey: string;
  quantity: number;
}

export interface PricedInducementPurchase extends InducementPurchaseInput {
  costPaid: number;
}

export interface EntryForInducements {
  id: string;
  specialRules: string[];
  snapshotTreasury: number;
}

type Tx = Prisma.TransactionClient;

export async function validateInducementPurchases(
  purchases: InducementPurchaseInput[],
  entries: EntryForInducements[]
): Promise<{ ok: true; priced: PricedInducementPurchase[] } | { ok: false; error: string }> {
  if (purchases.length === 0) return { ok: true, priced: [] };

  const entryById = new Map(entries.map((e) => [e.id, e]));
  const keys = [...new Set(purchases.map((p) => p.inducementKey))];
  const catalog = await prisma.masterInducement.findMany({ where: { key: { in: keys } } });
  const catalogByKey = new Map(catalog.map((c) => [c.key, c]));

  const spendByEntry = new Map<string, number>();
  const priced: PricedInducementPurchase[] = [];

  for (const purchase of purchases) {
    const entry = entryById.get(purchase.entryId);
    if (!entry) return { ok: false, error: "Equipo inválido para este partido" };

    const inducement = catalogByKey.get(purchase.inducementKey);
    if (!inducement) return { ok: false, error: "Incentivo no encontrado" };
    if (inducement.cost === null) {
      return { ok: false, error: `${inducement.name} tiene precio variable — todavía no se puede comprar desde aquí` };
    }
    if (purchase.quantity < 1 || purchase.quantity > inducement.maxCount) {
      return { ok: false, error: `${inducement.name}: cantidad fuera de rango (0-${inducement.maxCount})` };
    }
    if (inducement.restriction && !entry.specialRules.includes(inducement.restriction)) {
      return { ok: false, error: `${inducement.name} requiere la regla especial "${inducement.restriction}"` };
    }

    const costPaid = inducement.cost * purchase.quantity;
    spendByEntry.set(purchase.entryId, (spendByEntry.get(purchase.entryId) ?? 0) + costPaid);
    priced.push({ ...purchase, costPaid });
  }

  for (const [entryId, spend] of spendByEntry) {
    const entry = entryById.get(entryId)!;
    if (spend > entry.snapshotTreasury) {
      return { ok: false, error: "Presupuesto de la competición insuficiente para los Incentivos elegidos" };
    }
  }

  return { ok: true, priced };
}

export async function createInducementPurchases(tx: Tx, matchReportId: string, priced: PricedInducementPurchase[]): Promise<void> {
  if (priced.length === 0) return;

  await tx.matchInducementPurchase.createMany({
    data: priced.map((p) => ({
      matchReportId,
      entryId: p.entryId,
      inducementKey: p.inducementKey,
      quantity: p.quantity,
      costPaid: p.costPaid,
    })),
  });

  const spendByEntry = new Map<string, number>();
  for (const p of priced) spendByEntry.set(p.entryId, (spendByEntry.get(p.entryId) ?? 0) + p.costPaid);
  for (const [entryId, spend] of spendByEntry) {
    await tx.competitionEntry.update({ where: { id: entryId }, data: { snapshotTreasury: { decrement: spend } } });
  }
}
