# Modelo de datos: Razas, Puestos y Jugadores Estrella (Fase 1)

> IMPLEMENTADO (2026-07-21) y en uso activo desde Fase 2 (El Cuartel,
> 2026-07-22): 29 razas / 155 puestos / 68 Jugadores Estrella transcritos y
> sembrados; el esquema de abajo es el real de `prisma/schema.prisma`, no
> una propuesta. Basado en la estructura real de las plantillas del
> reglamento oficial 2025 (BB2025_crap_v1.pdf).

## Qué dice el manual (estructura real de una plantilla)

A nivel de **equipo/raza** (ej. Humanos, pág. 172):
- Ligas a las que pertenece: `Clásica del Viejo Mundo` → determina qué
  Jugadores Estrella puede fichar ("juega para").
- Reglas especiales: `Capitán del Equipo`, `Brutos Brutales`, `Elegidos de…`
  (nombres sueltos en `MasterRace.specialRules`; el texto completo de cada
  una vive en `MasterSpecialRule` desde 2026-07-23 — ver `DATA_MODEL.md`).
- Segundas oportunidades (rerolls): coste (`50 000 MO`) y límite (`0-8`).
- Apotecario: Sí / No.

A nivel de **puesto** (cada fila de la tabla):
- Cantidad permitida: `0-16`, `0-2`, `0-1`.
- Nombre + palabras clave entre paréntesis: `Blitzer Humano (Humano, Blitzer)`
  → la clave racial (Humano) y la posicional (Blitzer / Grandullón / Especial).
- Coste, y los 5 atributos: MV, FU, AG+, PA+, AV+ (PA puede ser `–` = no pasa).
- Habilidades y rasgos iniciales.
- Categorías Primarias y Secundarias (A/F/G/M/P/T) para subir de nivel.

A nivel de **Jugador Estrella** (ej. Akhorne, pág. 105 del PDF):
- Nombre + paréntesis (`Blitzer, Ardilla`), 5 atributos, habilidades/rasgos,
  coste, "Juega para" (`Cualquier equipo` o ligas concretas), y su regla
  especial única (`Furia ciega: …`).

## Esquema Prisma propuesto

```prisma
// SkillCategory ya existe (GENERAL/AGILIDAD/FUERZA/PASE/MUTACION/TRIQUINUELAS)

model MasterRace {
  id               String   @id @default(uuid())
  key              String   @unique         // "humanos"
  name             String                   // "Humanos"
  pageRef          Int?
  tier             Int?                      // opcional (no siempre en el manual)
  specialRules     String[]                 // ["Capitán del Equipo"]
  leagues          String[]                 // ["Clásica del Viejo Mundo"]
  rerollCost       Int                      // 50000
  rerollMax        Int      @default(8)
  allowsApothecary Boolean  @default(true)
  sortOrder        Int      @default(0)
  positions        MasterPosition[]
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
}

model MasterPosition {
  id                  String        @id @default(uuid())
  raceId              String
  race                MasterRace    @relation(fields: [raceId], references: [id], onDelete: Cascade)
  name                String        // "Blitzer Humano"
  playerTags          String[]      // ["Humano","Blitzer"] · "Grandullón"=Big Guy
  quantityMin         Int           @default(0)
  quantityMax         Int           // 16 / 2 / 1
  cost                Int
  ma                  Int
  st                  Int
  ag                  Int           // "para superar" (3 = 3+)
  pa                  Int?          // null = no puede pasar ("–")
  av                  Int
  startingSkillKeys   String[]      // claves del catálogo de habilidades/rasgos
  primaryCategories   SkillCategory[]
  secondaryCategories SkillCategory[]
  sortOrder           Int           @default(0)
  @@index([raceId])
}

model MasterStarPlayer {
  id              String   @id @default(uuid())
  key             String   @unique
  name            String              // "Akhorne La Ardilla"
  playerTags      String[]            // ["Blitzer","Ardilla"]
  cost            Int
  ma              Int
  st              Int
  ag              Int
  pa              Int?
  av              Int
  skillKeys       String[]            // claves del catálogo
  playsForAny     Boolean  @default(false)   // "Cualquier equipo"
  leagues         String[]            // ["Selectiva de Sylvania"] (si no es "any")
  specialRuleName String?             // "Furia ciega"
  specialRuleText String?             // texto completo de la regla única
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}
```

## Decisiones de diseño (y por qué)

1. **Ligas como `String[]`, no tabla aparte.** Son ~10 grupos fijos. La
   consulta "¿qué estrellas puede fichar este equipo?" es:
   `star.playsForAny OR (star.leagues ∩ race.leagues ≠ ∅)`, que Postgres
   resuelve con solape de arrays (`hasSome` en Prisma) sin tablas de unión.
   Evita construir una pantalla de gestión de ligas para un dato que casi
   nunca cambia. (Si más adelante duele, se normaliza.)

2. **Habilidades iniciales como `String[]` de claves.** Un puesto arranca con
   una mezcla de habilidades (`Placar`) y rasgos (`Escurridizo`), que viven en
   catálogos distintos. Guardamos las claves y las resolvemos contra ambos
   catálogos al leer — mismo patrón flexible que ya usa `PlayerSkillAssignment`.

3. **`pa` anulable.** Algunas fichas tienen `–` en Pase (no pueden pasar):
   `null` lo representa limpio; el resto de atributos siempre tienen valor.

4. **`playerTags`.** Guardamos las palabras clave del paréntesis (racial +
   posicional). Sirven para reglas que dependen de la clave (`Animosidad (X)`,
   `Odio (X)`) y para marcar `Grandullón` (Big Guy) y `Especial` (estrella).

5. **Categorías primarias/secundarias reutilizan `SkillCategory`.** Ya existe;
   son las mismas 6 letras A/F/G/M/P/T del manual.

## Qué desbloqueó (estado real)

- **Fase 1** ✅: Nufflepedia tiene secciones de **Razas** y **Estrellas**
  (fichas navegables + buscador en `/nufflepedia/razas` y `/nufflepedia/estrellas`),
  y `/admin/races` + `/admin/stars` para editarlas igual que habilidades/rasgos.
- **Fase 2** ✅ (2026-07-22): El Cuartel (`/equipos`) usa `MasterPosition`
  para límites/costes/roster, y el Mercado de Estrellas de cada equipo usa
  la elegibilidad por ligas (`playsForAny || leagues ∩ race.leagues`).
- **`playerTags` resultó tener un segundo uso no previsto aquí**: además de
  Animosidad/Odio, sirve para derivar la raza REAL de cada puesto a efectos
  de nombre aleatorio y de la insignia "es de otra raza" — ver
  `docs/DATA_MODEL.md` § Nombres de jugador y `src/rules-engine/data/playerNames.ts`.

## Decisiones que estaban pendientes (ya resueltas)

- **`tier`**: se incluyó (`Int?`), relleno para las 29 razas.
- Transcripción: se hizo raza a raza empezando por Humanos, luego el resto;
  el proceso se documentó en la memoria de sesión, no hace falta repetirlo.
