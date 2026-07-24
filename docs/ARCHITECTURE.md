# Arquitectura

Reconstrucción completa de Blood Bowl Manager. Sin código heredado del
proyecto anterior; el contenido de reglas (habilidades, tablas) se ha portado
como datos desde la documentación de investigación ya existente, no como código.

## Stack

| Capa | Elección | Por qué |
| --- | --- | --- |
| Framework | Next.js 16 (App Router) + TypeScript estricto | Un solo repo full-stack, buen rendimiento, fácil de desplegar en Vercel. |
| Estilos | Tailwind CSS v4 | Ya validado en el proyecto anterior, buena velocidad de desarrollo. |
| Base de datos | PostgreSQL vía Supabase | Modela bien relaciones complejas (ligas, divisiones, playoffs, standings) que Firestore (proyecto anterior) manejaba mal. |
| Auth | Supabase Auth (enlace mágico + Google OAuth) | Passwordless por defecto; Google añadido en Fase 2 como alternativa. |
| Storage | Supabase Storage | Reservado para Fase de identidad visual (escudos/colores) — todavía sin usar. |
| Tiempo real | Supabase Realtime | Deja listo el terreno para el futuro Match Assistant en vivo sin infraestructura extra. |
| ORM | Prisma 6 | Migraciones claras + Prisma Studio (interfaz visual de la base de datos, útil sin saber SQL). |
| Tests | Vitest + Testing Library | Centrados en el motor de reglas: es lo que más duele si se rompe sin darse cuenta. |
| Datos/fetch | TanStack Query (instalado, sin usar todavía) | Toda la app hasta ahora es Server Components + Server Actions + `revalidatePath` — no ha hecho falta cache de cliente. Se activará cuando haya datos que se actualicen fuera de la interacción del propio usuario (Realtime, partido en vivo). |
| Validación | Zod | Validación de formularios y de entrada en server actions/API routes. |

### Nota importante: por qué no hay políticas RLS (2026-07-22)

Prisma se conecta a Postgres por `DATABASE_URL` **directo** (pooler de
Supabase), no a través de PostgREST/el cliente JS con `anon key`. Eso
significa que las políticas RLS de Postgres nunca ven esa conexión — el
filtrado por dueño (`ownerId === dbUser.id`) se hace en código, en cada
Server Action y cada query, respaldado por el guard `requireUser()`/
`requireAdmin()` al principio de cada una. Si en el futuro algo consulta
Postgres con el cliente Supabase del navegador (anon key), ahí sí haría
falta RLS — hoy no hace falta.

## Dos capas de datos, deliberadamente separadas

1. **Contenido oficial de reglas** (`src/rules-engine/`): habilidades, rosters,
   tablas de clima/patada/lesiones/plegarias. Es la verdad que viene del
   manual, no datos de usuario. Vive como módulos TypeScript puros — cero
   dependencias de React o Next — para que:
   - se pueda testear de forma aislada (ver `rules-engine.test.ts`),
   - no dependa de la base de datos para funcionar (el catálogo de
     habilidades no necesita ir a Postgres a preguntarse a sí mismo qué es),
   - se pueda extraer a un paquete independiente el día que exista una app
     Android u otro cliente, sin arrastrar Next.js.
2. **Datos dinámicos de usuario** (`prisma/schema.prisma`): equipos
   gestionados, jugadores, ligas, partidos. Esto sí vive en Postgres porque
   cambia con el uso y necesita relaciones, permisos por usuario y consultas
   (standings, cruces de playoffs).

## Estructura de carpetas (real, 2026-07-22)

```
src/
  app/
    page.tsx, layout.tsx, NavBar.tsx    Landing + shell global
    login/, auth/callback/               Auth (enlace mágico + Google)
    nufflepedia/                         Pública, fuera del guard de sesión
    admin/                               Contenido maestro, requireAdmin()
    (app)/                               Grupo con guard requireUser() + sidebar
      layout.tsx, Sidebar.tsx
      dashboard/                         page.tsx, QuickSearch.tsx, HeraldoDeNuffle.tsx
      equipos/                           page.tsx, actions.ts (Server Actions)
        nuevo/                           Wizard de creación
        [id]/                            TeamBuilder.tsx (roster/estrellas/plantilla/subida de nivel)
      competiciones/                     actions.ts, boxScore.ts, rosterActions.ts,
                                          rosterSnapshot.ts (La Arena, Fase 3, HECHO)
        nueva/                           Wizard de creación (liga/torneo)
        [id]/                            CompetitionDetail.tsx, FixtureList.tsx,
                                          BracketView.tsx, CompetitionRoster.tsx,
                                          CompetitionStats.tsx, MatchDetailsForm.tsx
      pizarra/, arena/                   Placeholders (idea futura / Fase 4)
  components/                            Compartidos entre rutas: SkillPill,
                                          SkillPillList, Modal, EmptyState, LevelUpPanel
  lib/                                   Utilidades isomorfas: resolveSkillName.ts,
                                          categoryLabels.ts, markdownExport.ts,
                                          roundRobinSchedule.ts, tournamentBracket.ts,
                                          calendarLinks.ts, matchArticle.ts, playerStats.ts
  server/
    db/prisma.ts
    auth/                                requireUser.ts, requireAdmin.ts
  rules-engine/                          Contenido y lógica pura de reglas (sin framework)
    data/
      skills.ts, traits.ts, playerNames.ts, matchSequence.ts
      tables/        weather.ts, kickoff.ts, prayersToNuffle.ts, injury.ts,
                     spp.ts, levelUp.ts, inducements.ts, specialRules.ts
    types.ts
    index.ts          Barrel export
prisma/
  schema.prisma       Modelo de datos dinámicos
  seed.ts, seedRaces.ts, seedStars.ts
  migrations/
docs/                 Este documento, plan maestro, modelo de datos
```

Convención confirmada en la práctica: el `rules-engine` nunca importa de
`src/lib`, `src/components` ni Prisma — `playerNames.ts` duplica su propio
`normalizeTag()` en vez de reutilizar el de `lib/resolveSkillName.ts` por
esta regla.

## Patrón: consulta, no simulación (2026-07-23)

La app deliberadamente **no simula dados que ya tienen una tabla oficial no
verificada con certeza en el repo** (p. ej. la tabla 1D8 de mejora de
atributo al azar). En vez de arriesgarse a inventar un dato que afecte de
verdad a una partida, sigue el mismo patrón que ya usaba para resultados de
partido: el usuario tira físicamente y la app solo registra la decisión ya
tomada. Aplica también a lesiones (`MasterInjuryEntry.code` se elige a
mano, no se tira en la app) y a Plegarias a Nuffle. Si en el futuro se
verifica una tabla contra el manual, se puede pasar a simulación real sin
romper el modelo de datos (el campo ya existe, solo cambiaría quién decide
el valor).

## Patrón: copia de trabajo por competición (2026-07-23)

Ver `docs/DATA_MODEL.md` ("Plantilla-copia aislada por competición"). Nota
de arquitectura: se eligió clonar filas completas (`CompetitionPlayer`)
sobre alternativas como "diffs" superpuestos a `ManagedPlayer`, porque es
más simple de razonar (una competición = una copia congelada en el momento
de inscribirse, sin lógica de fusión) aunque cueste algo más de espacio en
BD — irrelevante al volumen de datos actual.

## Decisiones pendientes de tu parte (no técnicas)

- Crear un proyecto en [supabase.com](https://supabase.com) (gratis) y pegar
  las claves en `.env.local` (plantilla en `.env.example`).
- Todo lo demás (stack, estructura, modelo de datos) ya está decidido para
  que puedas centrarte en decir "esto me gusta" / "esto no".
