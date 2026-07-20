import { SKILLS, type SkillCategory } from "@/rules-engine";

const CATEGORIES: SkillCategory[] = ["General", "Agilidad", "Fuerza", "Pase", "Mutacion", "Triquinuelas"];

const CATEGORY_LABELS: Record<SkillCategory, string> = {
  General: "General",
  Agilidad: "Agilidad",
  Fuerza: "Fuerza",
  Pase: "Pase",
  Mutacion: "Mutación",
  Triquinuelas: "Triquiñuelas",
};

export default function OraculoPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="text-3xl font-bold tracking-tight">El Oráculo — Catálogo de Habilidades</h1>
      <p className="mt-2 text-zinc-500">
        Motor de reglas Season 3. {SKILLS.length} habilidades cargadas en {CATEGORIES.length} categorías.
      </p>

      <div className="mt-10 space-y-10">
        {CATEGORIES.map((category) => {
          const skills = SKILLS.filter((s) => s.category === category);
          return (
            <section key={category}>
              <h2 className="text-xl font-semibold border-b border-zinc-200 dark:border-zinc-800 pb-2">
                {CATEGORY_LABELS[category]}{" "}
                <span className="text-sm font-normal text-zinc-500">({skills.length})</span>
              </h2>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {skills.map((skill) => (
                  <li
                    key={skill.key}
                    className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-3"
                  >
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="font-medium">{skill.name}</span>
                      {skill.isElite && (
                        <span className="text-[10px] uppercase tracking-wide text-amber-600 dark:text-amber-400">
                          Élite
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-zinc-500">{skill.description}</p>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}
