# Modelo de datos: Razas, Puestos y Jugadores Estrella (Fase 1)

> PROPUESTA — pendiente de validar antes de migrar. Basado en la estructura
> real de las plantillas del reglamento oficial 2025 (BB2025_crap_v1.pdf).

## Qué dice el manual (estructura real de una plantilla)

A nivel de **equipo/raza** (ej. Humanos, pág. 172):
- Ligas a las que pertenece: `Clásica del Viejo Mundo` → determina qué
  Jugadores Estrella puede fichar ("juega para").
- Reglas especiales: `Capitán del Equipo`, `Brutos Brutales`, `Elegidos de…`.
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

## Qué desbloquea

- **Fase 1 (ahora):** Nufflepedia gana secciones de **Razas** y **Estrellas**
  (fichas navegables + buscador), y el admin gana pestañas para editarlas
  igual que habilidades/rasgos.
- **Fase 2 (después):** el constructor de equipos usa `MasterPosition`
  (límites, costes, cálculo de TV) y el mercado de estrellas usa la eligibilidad
  por ligas.

## Pendiente de decidir contigo

- ¿Incluimos `tier`? El reglamento no lo trae explícito; la NAF sí publica
  tiers. Lo dejo opcional (`Int?`) y lo rellenamos si quieres, o lo omitimos.
- Orden de transcripción: propongo hacer **1 raza completa primero** (Humanos)
  para que valides que la ficha se ve y edita bien, y luego las 28 restantes.
