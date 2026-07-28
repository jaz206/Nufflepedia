# Modelo de datos

## Usuario (`User`)

Identidad = `authId` (UID de Supabase Auth). El primer usuario que se
registra se auto-promociona a `ADMIN` (`requireUser.ts`/`auth/callback`).
`avatarUrl` es opcional — solo lo rellena Google OAuth (`user_metadata`);
el login por enlace mágico no trae foto y no la borra si ya existía.

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

## Jugadores Estrella y "Plays For" — IMPLEMENTADO (Fase 1-2)

`MasterStarPlayer.leagues: String[]` + `playsForAny: Boolean`. La regla de
elegibilidad (`star.playsForAny || star.leagues ∩ race.leagues ≠ ∅`) se
resuelve en `equipos/[id]/page.tsx` filtrando en JS tras traer ambas listas
(los conjuntos son pequeños, no hace falta `hasSome` de Prisma). El Mercado
de Estrellas de El Cuartel (`/equipos/[id]`) permite fichar hasta 2 copias
del mismo Jugador Estrella; sus habilidades (`skillKeys`, nombres display
igual que `startingSkillKeys`) se resuelven y persisten como
`PlayerSkillAssignment` con `source: STAR_PLAYER`.

## `ManagedPlayer`: roster normal vs. Jugador Estrella (2026-07-22)

`positionKey` y `starKey` son ambos `String?`, mutuamente excluyentes —
exactamente uno debe estar relleno:
- **Jugador de roster**: `positionKey` = id de `MasterPosition` (no hay
  campo `key` de texto en posiciones, a diferencia de habilidades/rasgos,
  así que el `id` hace ese papel). `starKey` es `null`.
- **Jugador Estrella fichado**: `starKey` = `MasterStarPlayer.key`.
  `positionKey` es `null`.

Migración `20260722130445_managed_player_star_key`.

## Nombres de jugador acordes a la raza real del puesto (2026-07-22)

## Plantilla-copia aislada por competición (`CompetitionPlayer`) — 2026-07-23

Cuando un usuario se inscribe en una liga o torneo (`joinCompetition`), la
plantilla real (`ManagedPlayer` + `PlayerSkillAssignment`) se clona en una
copia de trabajo (`CompetitionPlayer` + `CompetitionPlayerSkill`) ligada
solo a esa `CompetitionEntry` (`competiciones/rosterSnapshot.ts`). La
tesorería sobrante del equipo también se clona en
`CompetitionEntry.snapshotTreasury`. A partir de ahí:

- Los resultados de partido (`MatchScorer.playerId`, `MatchInjury.attackerPlayerId`/
  `victimPlayerId`) apuntan a `CompetitionPlayer`, **no** a `ManagedPlayer`.
- Las subidas de nivel dentro de una competición (`levelUpCompetitionPlayer`
  en `competiciones/rosterActions.ts`) actualizan la copia.
- Fichar una Estrella "solo para esta competición" (`hireCompetitionStar`)
  descuenta de `snapshotTreasury`, nunca de `ManagedTeam.treasury`.

La plantilla real en El Cuartel **nunca se entera** de nada de esto — solo
cambia si el usuario la edita a mano ahí. Motivo: el usuario quería poder
reutilizar la misma plantilla base en varias ligas/torneos sin que el
progreso de uno contaminara a los demás. Inscripciones creadas antes de que
existiera este mecanismo se rellenan solas (clonado perezoso) la primera vez
que se abre la ficha de esa competición tras la migración
(`competition_player_snapshot`).

## Mejora de atributo (subida de nivel) — 2026-07-23

`ManagedPlayer`/`CompetitionPlayer` tienen 5 contadores
(`maIncreases`/`stIncreases`/`agIncreases`/`paIncreases`/`avIncreases`) que
registran cuántas veces se ha comprado esa mejora con PE. MO/FU/AR suman
directamente; AG/PA **restan** al número "para superar" (mínimo 1) — ver
`src/lib/playerStats.ts::effectiveStats`. La app no simula la tirada de 1D8
oficial para decidir qué atributo mejora al azar (no se tiene esa tabla
verificada con certeza): el entrenador tira físicamente y la app solo
registra el resultado ya decidido, igual que con los resultados de partido.

## Calendario e Incentivos de competición — 2026-07-23

- `CompetitionFixture`: calendario fijo de una liga, generado a doble vuelta
  al marcarla "en curso" (`src/lib/roundRobinSchedule.ts`). Cada jornada
  tiene `scheduledAt` + `proposedByEntryId`/`confirmedAt` (una parte
  propone, la otra confirma, evita desacuerdos de zona horaria).
- `MasterInducement`/`MasterSpecialRule`: catálogo de referencia (contenido
  oficial, no lógica de compra todavía) transcrito del reglamento — ver
  §11.3 de `MASTER_PLAN.md`.

## Contenido de la página Guía (`MasterGuideSection`/`MasterGuideFaq`) — 2026-07-26

`/guia` explica qué es y para qué sirve cada apartado del menú lateral, más
un FAQ. Su contenido (título/descripción de cada tarjeta, pregunta/respuesta
de cada FAQ) vive en estas dos tablas y es editable desde `/admin/guia` —
emoji/color/href de cada tarjeta son estructurales (enlazan a una ruta real)
y no se editan desde el admin, solo el texto. Semilla en
`prisma/guideData.ts`, no en `src/rules-engine/` porque es copy propio de la
app, no contenido de reglas oficiales.

## Asistente de Partido en vivo (`LiveMatch`/`LiveMatchEvent`) — 2026-07-26

Un amistoso reutiliza `CompetitionEntry`/`CompetitionPlayer` con
`competitionId: null` (ver más abajo por qué es opcional) en vez de inventar
un modelo paralelo — así `cloneRosterIntoEntry`/`applyBoxScore` funcionan
igual que en una competición sin tocarlos. `LiveMatch` guarda el estado
derivado del partido (marcador, mitad/turno, clima, quién patea,
`matchReportId` una vez cerrado); `LiveMatchEvent` es un registro
append-only — cada botón que se pulsa durante el partido (Touchdown, Baja,
Cambio de turno...) es una fila, con el partido ya persistido en Postgres
desde el primer evento (no solo en memoria del navegador). Al "Finalizar
partido" se reconstruye el `MatchReport` a partir de ese registro y, a
diferencia de una competición, se sincroniza PE/estado/atributos de vuelta a
`ManagedPlayer` (vía `CompetitionPlayer.sourcePlayerId`) — un amistoso sí
hace progresar al equipo real.

## `CompetitionEntry.competitionId` opcional — 2026-07-26

Pasó de obligatorio a `String?` para que un `LiveMatch` (amistoso suelto)
pueda crear sus propias `CompetitionEntry` sin pertenecer a ninguna
`Competition`. Cualquier lectura que asuma "toda inscripción pertenece a una
competición" (listados de "Mis ligas" en `/competiciones` y `/dashboard`)
filtra explícitamente `competitionId: { not: null }` para no mezclar
amistosos con competiciones reales.

## `ManagedTeam.isGuest` — equipos creados al vuelo — 2026-07-26

Un equipo invitado (`isGuest: true`) es un `ManagedTeam` normal en todo lo
demás — mismo constructor, misma ficha, misma plantilla — pero se oculta de
"Mis equipos" y de la lista de equipos que se pueden inscribir en una
competición. Existe para que alguien sin cuenta pueda jugar un amistoso: se
crea su equipo (raza + nombre), se monta la plantilla, y ya se puede usar
como rival en el Asistente de Partido en vivo.

## Estados de un jugador durante el partido (`MasterPlayerState`) — 2026-07-25

Los 4 estados oficiales (En pie, Distraído, Tumbado boca arriba, Aturdido —
Compendio 2025 pág. 38-39) no son ni habilidades ni rasgos, así que tienen su
propia tabla de referencia (mismo patrón que Clima/Patada Inicial: seed en
`src/rules-engine/data/tables/playerStates.ts` → `MasterPlayerState`,
editable en `/admin/tables`, visible en `/nufflepedia/tablas`). `sortOrder`
fija el orden oficial de la lista en vez de alfabético. `PlayerStatus` en
`rules-engine/types.ts` ganó el valor `DISTRACTED` que le faltaba — sigue
siendo solo un tipo de código sin persistencia propia hasta que exista el
Match Assistant (Fase 4), igual que el resto de estados "de partido en
curso" descritos más abajo.

## Instantánea congelada de identidad por inscripción (2026-07-24)

`CompetitionEntry.teamName`/`rosterKey` son copias congeladas del nombre y
la raza del equipo en el momento de inscribirse (además de `snapshotTreasury`
y la plantilla-copia ya descritos arriba). `managedTeamId` pasó de
obligatorio a `String?` con `onDelete: SetNull`. Motivo: disolver un equipo
(`deleteTeam`) fallaba con violación de clave foránea si ese equipo había
estado alguna vez inscrito en una competición — la copia de plantilla ya
existía, pero la *identidad* (nombre/raza) todavía se leía en vivo desde
`ManagedTeam`. Ahora toda lectura de nombre/raza en una competición usa
`entry.teamName`/`entry.rosterKey` directamente, nunca
`entry.managedTeam.name`. Migraciones `entry_team_snapshot_nullable_team_ref`
→ backfill → `entry_team_snapshot_required`.

## Varios equipos propios en una misma competición (2026-07-24)

`CompetitionEntry.ownerId` nunca fue único por competición — un mismo
usuario puede tener varias inscripciones en la misma liga/torneo (caso
real: torneo casero con varios equipos de la familia gestionados desde una
cuenta). `/competiciones/[id]/page.tsx` calcula `myEntries` (lista, no un
único "mi inscripción") y `myRosters` (una ficha de "Mi plantilla" por
inscripción propia, cacheada por `rosterKey` para no repetir consultas si
dos equipos propios comparten raza).

## Compra de Incentivos de coste fijo (`MatchInducementPurchase`) — 2026-07-24

Antes de registrar un resultado, cada lado puede comprar Incentivos de
`MasterInducement.cost` fijo (no null), descontando de
`CompetitionEntry.snapshotTreasury`. Cada compra queda como una fila en
`MatchInducementPurchase` (equipo, incentivo, coste pagado). Los Incentivos
de coste variable (mercenarios, Jugador Estrella prestado, árbitro, mago)
siguen sin implementar — quedan como contenido de catálogo únicamente.

## Auditoría de edición de resultados (`MatchReport.source`/`editedAt`) — 2026-07-24

`MatchReport.source` (`FIXTURE`/`GROUP`/`BRACKET`) distingue de qué parte
del flujo vino un resultado. `editedAt`/`editedById` (+ relación
`MatchReportEditor`) registran si un comisario corrigió un resultado ya
registrado vía `editMatchResult`, y quién.

## Lesión permanente: qué atributo baja (`MatchInjury.statLoss`) — 2026-07-24

Al registrar una lesión con secuela permanente, se pregunta qué atributo se
ve afectado (mismo patrón "consulta, no simulación" que la subida de
nivel — ver `ARCHITECTURE.md`) y se guarda en `MatchInjury.statLoss`. La
app no decide esto sola: no hay tabla oficial de asignación
lesión→atributo verificada con certeza en el repo.

## Balonazo Sangriento (`MagazineIssue`) — 2026-07-28

Revista de competición generada con IA (Gemini), un número por jornada de
liga terminada, fase de grupos cerrada, o ronda de eliminatoria completada.
Cada número guarda ya el texto final de sus 5 secciones (`newsRoundup`,
`featuredMatchTitle`/`Body`, `nextTargetText`, `legendStarKey`/`legendText`)
más una `standings` congelada en JSON (la clasificación en el momento de
publicarse, no se actualiza después aunque la real siga cambiando) —
releer un número no vuelve a llamar a la IA. Generación disparada desde
`recordFixtureResult`/`closeGroupStage`/`recordBracketResult`
(`competiciones/magazine.ts`), best-effort: cualquier fallo se traga y se
registra en consola, nunca rompe el registro del resultado que lo dispara.
`MasterStarPlayer.lore` (biografía para la sección "Leyendas vivas") se
genera una sola vez por estrella y se reutiliza en los números siguientes;
`prisma/gemini.ts`/`src/lib/gemini.ts` es la primera integración de IA
generativa del proyecto (REST directa a `gemini-2.5-flash`, sin SDK).

## Dificultad y estilo de juego de cada raza (`MasterRace.tier`/`playstyle`) — 2026-07-28

`tier` (ya existía, sin usar) se reinterpretó como "dificultad recomendada
para elegirla" (1 fácil – 5 difícil) y se le sumó `playstyle` (frase de
estilo de juego). **Deliberadamente no es un tier competitivo oficial** —
es guía propia para quien funda su primer equipo, transcrita a mano en
`prisma/racePlaystyle.ts` (separado de `racesData.ts` a propósito: ese
archivo es transcripción fiel del reglamento, esto es opinión del
proyecto) para las 31 razas. Se muestra en `/equipos/nuevo` (tarjeta +
ficha completa al pinchar) y `/nufflepedia/razas`; editable en
`/admin/races`.

## Torneos Presenciales (`PresentialTournament`/`Entrant`/`Round`/`Match`) — 2026-07-28

Modelo deliberadamente separado de `Competition`/`CompetitionEntry`: un
evento de un día con muchas mesas a la vez, no una temporada larga.
`PresentialEntrant` es solo nombre + equipo + raza escritos a mano por el
organizador — sin `User` ni `ManagedTeam` asociados, para que valga con
gente que solo viene al torneo. **A propósito sin puntos/TD/bajas/nº de
byes guardados en el propio inscrito**: la clasificación se calcula
siempre en vivo agregando `PresentialMatch` (`src/lib/presentialStandings.ts`)
para que nunca pueda desincronizarse de los resultados reales, ni haga
falta lógica de "deshacer" al corregir un marcador. `PresentialMatch`
tiene `entrantBId` nullable = bye (descanso, se abonan los puntos de
victoria). El emparejamiento de cada ronda (`src/lib/swissPairing.ts`, sin
dependencias, con tests) evita repetir rival cuando hay alternativa y
reparte el bye priorizando a quien no haya descansado ya. `publicSlug`
(UUID) es la clave de la pantalla pública sin login
(`/torneo-en-directo/[slug]`). **Bug real encontrado antes de producción**:
`PresentialMatch.entrantAId`/`entrantBId` no tenían `onDelete: Cascade`
hacia `PresentialEntrant` — borrar un torneo con partidos ya jugados
fallaba por violación de clave foránea; corregido en la migración
`presential_match_cascade`.

## Menú lateral editable (`MasterNavItem`) — 2026-07-28

Las entradas del menú lateral, antes un array fijo en `Sidebar.tsx`, viven
ahora en esta tabla (semilla en `prisma/navData.ts`). Solo `label` es
editable desde `/admin/menu` — `href` y `sortOrder` se quedan fijos a
propósito (evita que un despiste rompa la navegación). `AppLayout`
((app)/layout.tsx) los consulta y se los pasa a `Sidebar` como prop; antes
`Sidebar` era enteramente autónomo con la lista hardcodeada dentro.

## Nombres de jugador acordes a la raza real del puesto (2026-07-22)

Al fichar (`addPlayer` en `equipos/actions.ts`), el nombre se genera con
`generatePlayerName(position.playerTags, existingNames)`
(`src/rules-engine/data/playerNames.ts`) — deriva la familia de nombres del
tag más específico de `playerTags` (ej. `["Troll", "Grandullón"]` → nombres
de trol), no de la raza del equipo. Esto importa porque un mismo roster
puede mezclar razas reales: un Grandullón "Troll" en un equipo de Orcos, un
"Vampiro" en un equipo de Vampiros (mientras la línea es Humana/No Muerta),
etc. — ver `Name_players.md` del prototipo anterior, que documentaba esta
correspondencia puesto→raza. Nunca repite un nombre ya usado en el equipo
(sufijo " (n)" si el fondo se agota). `getPositionFlavorLabel()` devuelve
una etiqueta visual solo para los casos "notables" (Grandullones,
sub-criaturas de No Muertos) — los puestos normales de la raza base del
equipo no se marcan.
