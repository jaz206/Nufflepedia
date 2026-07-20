# Hoja de ruta

## M0 — Cimientos (hecho)
- Next.js + TypeScript estricto + Tailwind, ESLint limpio.
- Vitest configurado, motor de reglas con tests en verde.
- Esquema de Prisma inicial (usuarios, equipos, ligas, partidos).
- Documentación de arquitectura y modelo de datos.

**Pendiente para cerrar M0**: crear el proyecto en Supabase y conectar
`DATABASE_URL` / claves de Auth y Storage; primera migración de Prisma;
deploy inicial en Vercel.

## M1 — Pilar 1: La Biblioteca (motor de reglas y consulta)
- Completar el catálogo de habilidades hasta el listado oficial completo
  (72+, 6 categorías) — ahora mismo hay un núcleo ya portado y verificado
  con tests, pero falta ampliarlo.
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
