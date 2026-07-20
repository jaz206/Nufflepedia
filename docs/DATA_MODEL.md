# Modelo de datos

## Atributos (5)
`MA` (Movimiento), `ST` (Fuerza), `AG+` (Agilidad, "para superar"),
`PA+` (Pase, "para superar"), `AV+` (Armadura, "para superar").

## Estado de un jugador

Se distinguen dos tipos de estado, con dueños distintos en el sistema:

- **Estado de partido en curso** (Tumbado, Aturdido, Inconsciente,
  Expulsado): transitorio, dura lo que dura el partido. Lo gestionará el
  futuro Match Assistant (M4), probablemente en memoria/Realtime, no como
  columna persistente por jugador.
- **Estado de plantilla entre partidos** (`RosterPlayerStatus` en
  `prisma/schema.prisma`): `ACTIVE`, `MISS_NEXT_GAME` (Apaleado/Herida
  Grave), `NIGGLING_INJURY` (secuela permanente pero sigue jugando),
  `DEAD`, `RETIRED`. Esto sí es persistente porque afecta a si el jugador
  está disponible para el próximo partido.

El motor de reglas (`src/rules-engine/types.ts`) define `PlayerStatus` con
ambos mundos unificados a nivel conceptual (para que el futuro Match
Assistant tenga un único vocabulario), pero la base de datos solo persiste
el subconjunto de "entre partidos".

## Habilidades: activas vs. pasivas

Cada `SkillDefinition` tiene `isActive: boolean`:
- `true` = el entrenador la declara como acción (p. ej. Falta rápida,
  Multiplicar bloqueo, Saltar).
- `false` = se aplica automáticamente cuando corresponde (p. ej. Esquivar,
  Defensa, Garras).

## Habilidades Élite (Season 3)

`Placar`, `Esquivar`, `Defensa` y `Golpe mortífero` llevan `isElite: true` y
un recargo de +10,000 MO acumulable al coste normal de mejora
(`ELITE_SKILL_SURCHARGE_GP` en `data/tables/levelUp.ts`).

## Reglas especiales de equipo

Se modelan como *flags* sobre `ManagedTeam`/reglas de roster en vez de
lógica hardcodeada, para poder añadir más sin tocar el motor:
- **Brutos Brutales**: más PE por Baja, menos por Touchdown
  (`BRUTOS_BRUTALES_OVERRIDES` en `data/tables/spp.ts`).
- **Capitán del Equipo** y otras reglas de roster: pendiente de portar junto
  con el catálogo completo de las 29 razas (M2).

## Nueva acción: Asegurar el Balón

Acción S3 que permite recoger el balón a 2+ sin importar la Agilidad del
jugador, si no hay rivales marcando la casilla. Los jugadores con el rasgo
`Tembloroso` (`Unsteady`) tienen prohibido declararla — ver
`src/rules-engine/data/traits.ts`. Pendiente de implementar como acción en
el motor de partido (M4); de momento solo está documentada como regla.

## Jugadores Estrella y "Plays For"

Cada Jugador Estrella tendrá un campo `playsFor: string[]` con las claves de
roster/liga que pueden contratarlo, más su coste y su set de rasgos propios
(ver `TraitCategory: "JugadorEstrella"` en `traits.ts` para rasgos ya
portados como Incorporeal, Blind Rage, Tasty Morsel). El catálogo completo
de estrellas se porta en M2.
