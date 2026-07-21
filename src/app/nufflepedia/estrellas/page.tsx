import { prisma } from "@/server/db/prisma";
import EstrellasBrowser from "./EstrellasBrowser";

export default async function EstrellasPage() {
  const stars = await prisma.masterStarPlayer.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Jugadores Estrella</h1>
        <p className="mt-2 text-zinc-500">
          Los {stars.length} Jugadores Estrella oficiales, con atributos, habilidades, coste y su
          regla especial única.
        </p>
      </div>
      <EstrellasBrowser
        stars={stars.map((s) => ({
          id: s.id,
          name: s.name,
          playerTags: s.playerTags,
          cost: s.cost,
          ma: s.ma,
          st: s.st,
          ag: s.ag,
          pa: s.pa,
          av: s.av,
          skillKeys: s.skillKeys,
          playsForAny: s.playsForAny,
          leagues: s.leagues,
          specialRuleName: s.specialRuleName,
          specialRuleText: s.specialRuleText,
        }))}
      />
    </div>
  );
}
