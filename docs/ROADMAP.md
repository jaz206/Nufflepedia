# Hoja de ruta

> ⚠️ SUPERADO: la planificación por fases vive ahora en
> [MASTER_PLAN.md](MASTER_PLAN.md) (§3 Roadmap). Este archivo se conserva
> como registro histórico del estado de los hitos M0-M1 iniciales.
>
> Estado real a 2026-07-25: **M0, M1, M2 y M3 completados**, más una ronda de
> correcciones/ampliaciones sobre M3 (compra real de Incentivos, multi-equipo
> por cuenta, varios bugs reales corregidos — ver §11.4 de MASTER_PLAN.md) y
> **primer despliegue público**: [nufflepedia.vercel.app](https://nufflepedia.vercel.app),
> repo [`github.com/jaz206/Nufflepedia`](https://github.com/jaz206/Nufflepedia).
> M4 (Asistente de partido en vivo + IA) es el siguiente.

## M0 — Cimientos (hecho)
- Next.js + TypeScript estricto + Tailwind, ESLint limpio.
- Vitest configurado, motor de reglas con tests en verde.
- Esquema de Prisma inicial (usuarios, equipos, ligas, partidos).
- Documentación de arquitectura y modelo de datos.

**Pendiente para cerrar M0**: crear el proyecto en Supabase y conectar
`DATABASE_URL` / claves de Auth y Storage; primera migración de Prisma;
deploy inicial en Vercel.

## M1 — Pilar 1: La Biblioteca (motor de reglas y consulta)
- Catálogo de habilidades completo: 72/72, las 12 oficiales de cada una de
  las 6 categorías (hecho, transcrito de COMPENDIO 2025 Third Season + NAF).
- Catálogo de rasgos generales: 40, incluida traducción al inglés en curso
  desde el admin (hecho el contenido en español; faltan 4 sin verificar
  todavía — Right Stuff, Swarming y los 3 exclusivos de Jugador Estrella,
  pendientes del capítulo de razas/Jugadores Estrella del manual).
- Portar rosters de las 29 razas (costes, límites 0-16/0-2, primarias/secundarias).
- Portar Jugadores Estrella con coste y reglas de "Plays For".
- Tablas interactivas navegables en la Nufflepedia: Clima, Patada Inicial,
  Lesiones (D16), Errores Costosos, Plegarias a Nuffle.
- UI de búsqueda/filtro sobre habilidades y rasgos (hecho) y descarga del
  catálogo en Markdown (hecho); falta extender a las tablas.

## M2 — Pilar 2: Gestor de Equipos
- Creador de equipo: presupuesto inicial (1,000,000 MO), cálculo de TV en vivo.
- Compra/gestión de plantilla: jugadores, rerolls, animadoras, entrenadores
  asistentes, apotecario, fans dedicados.
- Persistencia en Postgres vía Prisma, ligada al usuario autenticado.
- Mercado de Jugadores Estrella con reglas de "Plays For" según liga de origen.

## M3 — Pilar 3: Gestor de Ligas y Torneos
- Crear ligas con divisiones y fase de playoffs.
- Panel de invitaciones (por email/usuario).
- Automatización de la secuencia post-partido: ganancias, fans dedicados,
  asignación de SPP, tiradas de mejora de nivel (tabla 2025).

## M4 — Visión de futuro
- Match Assistant en tiempo real (Supabase Realtime): registro de
  Touchdowns, Bajas y Faltas durante el partido.
- Generador de crónicas con IA, tono Jim & Bob, a partir del log de eventos
  del partido.

## Nota
Este proyecto se intentó antes varias veces sin llegar a estar terminado
(hay tres intentos previos relacionados en carpetas vecinas). La prioridad es
tener el Pilar 1 usable pronto en vez de perseguir una arquitectura perfecta
antes de mostrar nada funcionando.
