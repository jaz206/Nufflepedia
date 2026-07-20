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
| Auth | Supabase Auth | Integra con Row Level Security de Postgres: permisos reales a nivel de base de datos, no reglas de aplicación. |
| Storage | Supabase Storage | Sustituye el hack de leer imágenes desde un repo de GitHub del proyecto anterior. |
| Tiempo real | Supabase Realtime | Deja listo el terreno para el futuro Match Assistant en vivo sin infraestructura extra. |
| ORM | Prisma 6 | Migraciones claras + Prisma Studio (interfaz visual de la base de datos, útil sin saber SQL). |
| Tests | Vitest + Testing Library | Centrados en el motor de reglas: es lo que más duele si se rompe sin darse cuenta. |
| Datos/fetch | TanStack Query | Cache y sincronización en cliente, encaja con Realtime más adelante. |
| Validación | Zod | Validación de formularios y de entrada en server actions/API routes. |

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

## Estructura de carpetas

```
src/
  app/              Rutas de Next.js (App Router)
  rules-engine/      Contenido y lógica pura de reglas (sin framework)
    data/
      skills.ts
      traits.ts
      tables/        weather.ts, kickoff.ts, injury.ts, spp.ts, levelUp.ts
    types.ts
    index.ts          Barrel export
prisma/
  schema.prisma       Modelo de datos dinámicos
docs/                 Este documento, roadmap, modelo de datos
```

## Decisiones pendientes de tu parte (no técnicas)

- Crear un proyecto en [supabase.com](https://supabase.com) (gratis) y pegar
  las claves en `.env.local` (plantilla en `.env.example`).
- Todo lo demás (stack, estructura, modelo de datos) ya está decidido para
  que puedas centrarte en decir "esto me gusta" / "esto no".
