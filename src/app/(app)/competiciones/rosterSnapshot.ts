import type { Prisma } from "@prisma/client";

type Tx = Prisma.TransactionClient;

interface SourcePlayer {
  id: string;
  number: number;
  customName: string;
  positionKey: string | null;
  starKey: string | null;
  spp: number;
  status: "ACTIVE" | "MISS_NEXT_GAME" | "NIGGLING_INJURY" | "DEAD" | "RETIRED";
  maIncreases: number;
  stIncreases: number;
  agIncreases: number;
  paIncreases: number;
  avIncreases: number;
  skills: { skillKey: string; source: "ROSTER" | "LEVEL_UP" | "INDUCEMENT" | "STAR_PLAYER" }[];
}

/**
 * Clona la plantilla real (jugadores + habilidades) en una copia de trabajo
 * aislada a esta inscripción, y clona también la tesorería sobrante como
 * presupuesto para fichajes "solo de esta competición". A partir de aquí,
 * todo lo que pase en la competición (PE, subidas de nivel, lesiones,
 * fichajes) vive en CompetitionPlayer y nunca toca El Cuartel.
 */
export async function cloneRosterIntoEntry(
  tx: Tx,
  entryId: string,
  treasury: number,
  players: SourcePlayer[]
): Promise<void> {
  await tx.competitionEntry.update({ where: { id: entryId }, data: { snapshotTreasury: treasury } });

  for (const p of players) {
    const clone = await tx.competitionPlayer.create({
      data: {
        entryId,
        sourcePlayerId: p.id,
        number: p.number,
        customName: p.customName,
        positionKey: p.positionKey,
        starKey: p.starKey,
        spp: p.spp,
        status: p.status,
        maIncreases: p.maIncreases,
        stIncreases: p.stIncreases,
        agIncreases: p.agIncreases,
        paIncreases: p.paIncreases,
        avIncreases: p.avIncreases,
      },
    });
    if (p.skills.length > 0) {
      await tx.competitionPlayerSkill.createMany({
        data: p.skills.map((s) => ({ playerId: clone.id, skillKey: s.skillKey, source: s.source })),
      });
    }
  }
}
