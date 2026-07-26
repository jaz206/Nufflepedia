# Documento Maestro — Blood Bowl Assistant

> Versión 1.0 · 2026-07-20 · Este documento gobierna el proyecto. Ninguna
> funcionalidad nueva se implementa sin estar reflejada aquí (o sin que
> decidamos conscientemente actualizarlo). Complementa, no sustituye, a
> `ARCHITECTURE.md` (decisiones técnicas ya tomadas), `DATA_MODEL.md` y
> `DESIGN_SYSTEM.md`.

---

## 1. Visión del proyecto

**Objetivo principal.** Ser el centro de operaciones digital de un entrenador
de Blood Bowl: consultar reglas al instante, gestionar equipos con las
matemáticas hechas, y llevar ligas y torneos sin hojas de cálculo.

**Público objetivo**, por orden de prioridad:
1. *El entrenador de liga local* (nuestro usuario 0: tú y tu grupo). Juega
   con miniaturas en mesa, necesita consultar reglas rápido y llevar su
   equipo entre partidos.
2. *El comisario de liga*: organiza la competición, necesita calendario,
   clasificación e inscripciones sin trabajo manual.
3. *El jugador de torneo NAF*: necesita construir listas legales según
   reglas de torneo y consultarlas offline el día del evento.

**Problemas que resuelve.**
- Las reglas 2025/S3 + erratas NAF están dispersas en PDFs; encontrar una
  habilidad concreta en mesa es lento.
- La gestión de equipo entre partidos (SPP, lesiones, tesorería, VAE) es
  contabilidad manual propensa a errores.
- Llevar una liga implica hojas de cálculo compartidas que siempre acaba
  manteniendo una sola persona.
- Las herramientas existentes están en inglés, desactualizadas o dispersas
  en webs distintas que no comparten datos.

**Filosofía del producto.**
- *El dato oficial es sagrado*: todo el contenido de reglas se transcribe de
  fuentes oficiales y es editable solo por admins. Nunca inventamos reglas.
- *En mesa manda la velocidad*: cada consulta a menos de 3 segundos y 2
  clics. La app se usa con un dado en la otra mano.
- *Bilingüe de nacimiento*: contenido ES/EN a nivel de dato (ya en el
  modelo), no como traducción de interfaz pegada después.
- *Un solo lugar*: cada módulo nuevo se integra con los datos existentes
  (el gestor de equipos usa el catálogo de habilidades; la liga usa los
  equipos; el asistente de partido usa la liga).

**Qué la hace diferente.** La combinación de: contenido S3+NAF al día y
curado a mano en español, herramientas integradas sobre una única base de
datos, y una estética de producto AAA en un nicho acostumbrado a webs de
los 2000.

---

## 2. Arquitectura general (árbol de navegación)

Nombres temáticos pero descriptivos — el usuario nuevo debe entender qué es
cada sección sin glosario:

```
/                       Landing (visitante) · CTA a /dashboard si hay sesión  [HECHO]
├── /login              Enlace mágico por email + Google OAuth  [HECHO]
├── /dashboard           DASHBOARD (autenticado, sidebar persistente)  [HECHO]
│   ├── Buscador Rápido  live sobre habilidades/rasgos, abre en Modal  [HECHO]
│   ├── Mis Equipos      grid + EmptyState                     [HECHO]
│   ├── Mis Competiciones lista + EmptyState                   [HECHO]
│   └── El Heraldo de Nuffle  gaceta rotativa de Estrellas      [HECHO]
├── /nufflepedia        LA BIBLIOTECA (pública, es el gancho de entrada)
│   ├── habilidades     72 habilidades, 6 categorías, buscador  [HECHO]
│   ├── rasgos          40 rasgos                               [HECHO]
│   ├── tablas          Clima, Patada, Plegarias, Lesiones...   [HECHO]
│   ├── razas           29 rosters oficiales                    [HECHO]
│   ├── estrellas       68 Jugadores Estrella + "juega para"    [HECHO]
│   └── descargar .md   exporta el catálogo                     [HECHO]
├── /equipos            EL CUARTEL — gestión de equipos          [HECHO]
│   ├── /               Lista de mis equipos + fundar nuevo
│   ├── /nuevo           Elegir raza + nombre → funda con 1M MO
│   └── /[id]            Ficha: presupuesto en vivo, roster con
│                        nombres/insignia de raza real por puesto,
│                        personal de banquillo, Mercado de Estrellas
│                        ("plays for"), plantilla editable (nombre/
│                        dorsal), disolver equipo
├── /competiciones      LA ARENA — ligas y torneos                [HECHO, Fase 3]
│   ├── /               Mis ligas (activas) + Histórico + Descubrir públicas
│   ├── /nueva           Liga o torneo (con/sin fase de grupos), pública/privada
│   └── /[id]            Clasificación, calendario a doble vuelta (ligas),
│                        cuadro de eliminatoria (torneos), plantilla-copia
│                        aislada por competición, subida de nivel, fichajes
│                        de Estrella solo-para-esta-competición, estadísticas
│                        (goleadores/bajas/lesiones), crónica automática
├── /pizarra            Mesa Táctica (26×15, jugadas guardadas)  [placeholder, idea futura]
├── /arena              Asistente de partido en vivo             [placeholder, Fase 4]
├── /calculadoras       Probabilidades, incentivos               [Por hacer]
├── /admin              Contenido maestro (solo ADMIN)           [HECHO]
└── /perfil             Cuenta, preferencias                     [Por hacer]
```

> Nota de nombres (2026-07-22): el árbol original de este documento llamaba
> `/arena` a "ligas y torneos". En la implementación real esa sección se
> montó como `/competiciones`, dejando `/arena` para el futuro asistente de
> partido en vivo (lo que aquí se llamaba `/partido`) — más intuitivo, ya
> que "la Arena" evoca el partido en sí, no la burocracia de la liga.

Reglas de navegación:
- **Nufflepedia es pública** (SEO + utilidad sin registro): es la puerta de
  entrada. El resto de `/dashboard` en adelante requiere cuenta (`requireUser`).
- **Sidebar persistente** en la zona autenticada (grupo de rutas `(app)`),
  con las secciones + estado "Futuro" en Arena. Nufflepedia queda fuera de
  ese grupo a propósito: sigue pública, sin guard.
- **Nada a más de 2 clics** desde el dashboard.

---

## 3. Roadmap de desarrollo

| Fase | Nombre | Contenido | Dificultad | Depende de | Valor |
|---|---|---|---|---|---|
| **0** | Cimientos | Stack, auth, admin, motor de reglas, habilidades/rasgos/tablas | — | — | ✅ HECHO |
| **1** | Nufflepedia completa | 29 razas, star players, buscador global, identidad visual v1, i18n de interfaz | Media | Fase 0 | ✅ HECHO — referencia completa usable y compartible |
| **2** | Cuartel General | Constructor de equipos (presupuesto, VAE en vivo, validación de roster), Mercado de Estrellas, personal de banquillo, nombres por raza real del puesto | Media-Alta | Razas de F1 | ✅ HECHO (2026-07-22) — el usuario *guarda* algo suyo: retención. Quedan sueltos: Perfil de usuario, Calculadora de probabilidades, Ficha imprimible, Mejoras/nivel (ver tarjetas Trello) |
| **3** | Arena (Competiciones) | Crear liga, invitar, calendario round-robin, clasificación, secuencia post-partido (SPP, ganancias, lesiones, mejoras) | Alta | Equipos de F2 | ✅ HECHO (2026-07-23) — ver §11.3. Ruta real: `/competiciones` (ver nota de nombres en §2) |
| **4** | Asistente + IA | Registro de partido en vivo (Realtime), crónicas Jim & Bob generadas por IA, preguntas de reglas con IA (RAG sobre Nufflepedia) | Alta | F3 + log de eventos | El "wow": diferenciador absoluto |
| **5** | Comunidad | Perfiles públicos, compartir equipos por enlace/QR, exportar/imprimir hojas, logros | Media | F2-F3 | Crecimiento orgánico fuera del grupo |
| **6** | Versión definitiva | PWA offline completa, API pública, rendimiento, accesibilidad AA, pulido final | Media | Todo | Producto "terminado" |

**Regla de hierro del roadmap:** cada fase termina con algo desplegado y
usable por tu grupo real. Si una fase lleva más de ~4-6 semanas de trabajo
real, se parte en dos. (Motivo: historial de tres proyectos previos
abandonados por crecer antes de terminar.)

---

## 4. Priorización global

**Imprescindibles** (sin esto no hay producto):
razas + star players en Nufflepedia · buscador global · constructor de
equipos con validación · secuencia post-partido · clasificación de liga.

**Importantes** (elevan el producto a "profesional"):
identidad visual completa · i18n interfaz ES/EN · calculadora de
probabilidades · calendario automático · exportar equipo (PDF/imagen) ·
PWA instalable.

**Opcionales** (deseables, no bloquean nada):
crónicas IA · asistente de partido en vivo · logros · temas claro/oscuro
configurables · gaceta de liga.

**Ideas futuras** (banco de ideas, sin compromiso):
simulador de partidos · IA experta en reglas conversacional · API pública ·
torneos suizos · integración con NAF rankings · marketplace de escudos ·
modo espectador en vivo.

---

## 5. Diseño visual (dirección de arte)

Objetivo: un producto digital premium, no web corporativa ni parodia del
estilo oficial de GW. **Dirección elegida (2026-07-20): «Pergamino y
sangre».** Especificada en detalle en `DESIGN_SYSTEM.md`.

**«Pergamino y sangre» (light-first).** La app es el tomo de reglas oficial
reimaginado como producto digital de lujo: base pergamino, tinta sepia,
rojo sangre como acento de acción y oro viejo para lo épico/élite. El tema
oscuro es una variante cálida ("tomo a la luz de las velas"), no un
rediseño. Se eligió sobre las alternativas dark («Estadio de medianoche») y
broadcast («Cabalvision») por su legibilidad en mesa con mala luz y su
encaje con la idea de "reglamento digitalizado".

- **Personalidad**: épica, socarrona, violenta con humor (el tono Jim &
  Bob). Los textos de interfaz pueden tener sabor ("¡Nuffle lo ha querido!")
  pero nunca a costa de la claridad.
- **Tipografía**: serif para el contenido (Cinzel display + Spectral cuerpo)
  y sans/mono para mandos y datos. El contraste serif-contenido /
  sans-mandos es deliberado.
- **Iconografía**: línea gruesa, consistente (una sola librería + iconos
  propios para conceptos del juego: dados de placaje, balón, casillas).
- **Ilustración**: escudos y viñetas con estética "grabado/xilografía";
  nada de clipart ni IA genérica sin dirección.
- **Fondos**: pergamino con grano de fibra sutil; nunca fotos.
- **Animación**: micro y con propósito — impacto al confirmar acciones
  destructivas, tiradas de dado con física breve, transiciones de 150-250ms.
  `prefers-reduced-motion` siempre respetado. Prohibido: parallax gratuito,
  loaders largos, animación que retrase una consulta de reglas.

---

## 6. Experiencia de usuario

- **Visitante** aterriza en una landing corta (qué es + búsqueda directa en
  la Nufflepedia sin registrarse). La Nufflepedia ES el marketing.
- **Usuario autenticado** aterriza en su dashboard: su(s) equipo(s), próxima
  jornada, accesos directos, y el buscador.
- **Siempre visible**: barra superior (secciones + buscador + perfil).
  En móvil: barra inferior de 4 iconos (patrón app nativa).
- **Buscador global** (atajo `/` y `Ctrl+K`): busca habilidades, rasgos,
  razas, estrellas y — si tienes cuenta — tus equipos y ligas. Es el camino
  rápido universal; ninguna consulta de reglas debe requerir navegar menús.
- **Regla de los 2 clics** para consultas; máximo 3 para acciones de
  gestión. Las acciones frecuentes de la secuencia post-partido se agrupan
  en un asistente paso a paso (wizard) para no perderse nada.
- **Mobile-first en consulta** (en mesa se usa el móvil), desktop-first en
  gestión de liga (el comisario trabaja en pantalla grande).

---

## 7. Componentes reutilizables (inventario)

**Estructura**: Navbar · BottomNav (móvil) · Sidebar de admin · Breadcrumbs
· Footer mínimo.
**Contenido**: Card base · PlayerCard (jugador con stats) · TeamCard ·
SkillPill (píldora de habilidad con tooltip de descripción) · StatBlock
(MA/ST/AG/PA/AV) · RosterTable · StandingsTable · DataTable genérica con
orden/filtro · RuleTable (tablas de dados 2D6/1D16).
**Interacción**: SearchCommand (buscador global) · Filters/Chips · Modal ·
ConfirmDialog · Tooltip · Toast/Notificaciones · Tabs · Collapsible ·
Stepper/Wizard (post-partido) · Pagination.
**Feedback**: Badge de estado (Activa/Élite/EN✓...) · ProgressBar (SPP
hasta siguiente mejora) · EmptyState ilustrado · Skeletons de carga ·
DiceRoller (visual de tiradas).
**Formularios**: Input · Select · Textarea bilingüe (ES/EN lado a lado) ·
NumberStepper (tesorería, rerolls) · Switch · FormError inline.

Muchos ya existen en versión primitiva en `/admin` — la Fase 1 los
consolida como sistema (ver §10).

---

## 8. Tecnologías

Las decisiones de base **ya están tomadas, justificadas y en producción**
(ver `ARCHITECTURE.md`): Next.js 16 + TS estricto, Supabase (Postgres,
Auth por enlace mágico, Storage, Realtime), Prisma, Tailwind v4, Vitest,
Zod. No se reabren salvo dolor real.

Decisiones nuevas que este plan añade:

| Necesidad | Elección | Justificación / alternativas descartadas |
|---|---|---|
| Base de componentes | **shadcn/ui** sobre Radix | Accesibilidad resuelta, el código vive en nuestro repo (personalizable al 100% para la dirección de arte). Alternativas: MUI/Mantine (estética impuesta, difícil de "des-corporativizar"). |
| i18n interfaz | **next-intl** | Integración nativa App Router. El *contenido* ya es bilingüe a nivel de dato; esto cubre solo la interfaz. |
| Buscador | **Postgres full-text** (F1) → Meilisearch si duele | Cero infraestructura extra; nuestro corpus es pequeño (cientos de filas). Algolia: coste injustificado hoy. |
| IA (F4) | **Claude API** vía Vercel AI SDK | Crónicas narrativas y RAG de reglas sobre nuestra propia base. Se decide en F4, no antes. |
| PWA | **Serwist** en F6 (manifest básico antes) | Offline real solo cuando el contenido esté estable. |
| Hosting | **Vercel** (app) + Supabase (datos) | Deploy por push, preview deployments, cero DevOps. |
| Temas | Tokens CSS custom properties, **claro por defecto** (pergamino) | La dirección «Pergamino y sangre» es light-first; el tema oscuro es una variante cálida de tokens, no un rediseño. |

---

## 9. Organización del código

Estructura actual, consolidada como convención:

```
src/
├── app/                # Rutas (App Router). Solo composición de página.
│   └── [seccion]/      # page.tsx + componentes específicos de esa ruta
├── components/         # [F1] Componentes compartidos entre rutas
│   └── ui/             # [F1] Primitivas del design system (shadcn)
├── rules-engine/       # Contenido/lógica pura de reglas. CERO imports de
│   └── data/           # React/Next/Prisma. Testeado con Vitest.
├── server/             # Código solo-servidor (prisma, auth guards)
├── lib/                # Utilidades isomorfas (categorías, markdown...)
prisma/                 # Schema + migraciones + seed
docs/                   # Este plan, arquitectura, design system
```

**Convenciones** (las que ya venimos aplicando, ahora escritas):
- Identificadores de código en inglés; contenido y UI en español (con EN
  como dato).
- Server Actions junto a su ruta (`actions.ts`), siempre con guard
  (`requireAdmin`/`requireUser`) + validación Zod al principio.
- El rules-engine nunca importa del resto de la app (es extraíble a
  paquete si algún día hay app móvil).
- Migraciones de Prisma siempre versionadas; scripts de datos puntuales se
  ejecutan y se borran (no quedan en el repo).
- Un commit por cambio coherente, mensaje en español explicando el porqué.
- Tests obligatorios en rules-engine y lib; opcionales en UI hasta F6.

---

## 10. Sistema de diseño

Definido en detalle en **`DESIGN_SYSTEM.md`** (tokens de color, escala
tipográfica, espaciado, radios, sombras, estados y especificación de cada
componente del inventario del §7). Resumen operativo:

- Todo color/espaciado/tamaño sale de un token; prohibidos los valores
  mágicos en componentes.
- Cada componente define sus 5 estados: normal, hover, focus (visible
  siempre), disabled, loading.
- El design system se construye en Fase 1 *sobre* las pantallas reales de
  la Nufflepedia (no en abstracto), y `/admin` se migra a él en F2.

---

## 11. Banco de ideas futuras

Constructor de equipos con sugerencias por presupuesto · gestor de
temporadas multi-año con narrativa de franquicia · calculadora de
probabilidades de secuencias completas (estilo "¿qué probabilidad tiene
esta jugada entera?") · estadísticas avanzadas por jugador/carrera ·
manual interactivo enlazado desde cada término · IA árbitro ("¿puedo hacer
esto?") · simulador de partidos Montecarlo · gestor de torneos suizos ·
export/import JSON · compartir equipo por QR para torneos · perfiles
públicos con palmarés · logros ("Primera muerte", "Liga invicta") ·
comunidad/comentarios en la gaceta · API pública para otras herramientas ·
sincronización offline multi-dispositivo · modo proyector para finales.

### 11.1 Paridad funcional con el prototipo anterior (revisión 2026-07-22)

El prototipo React/Firebase (`BloodBowlManager`, dejado como referencia)
tenía una estructura que el usuario quiere conservar en este rebuild. La
mayoría ya está cubierta por el roadmap (Oráculo→Nufflepedia F1 ✅,
Gremio→Cuartel F2, Arena→Arena F3, dashboard de inicio→§6). Cuatro piezas
concretas de ese prototipo NO estaban anotadas aquí y se incorporan:

- **Heraldo de Nuffle** — ✅ HECHO (2026-07-22): `HeraldoDeNuffle.tsx` en
  `/dashboard`, rota cada 30s entre los 68 Jugadores Estrella (orden por
  coste), con habilidades mostradas vía `SkillPillList` compartido.
- **Mesa Táctica** (Cuartel, F2 o idea futura si se retrasa): pizarra
  drag-and-drop de 26×15 con hasta 11 fichas por equipo, formaciones
  preestablecidas (defensa estándar, jaula, presión lateral), guardado de
  jugadas nombradas ligadas a un equipo.
- **Mi Referencia** (Nufflepedia, F1 polish o F2): lista personal de
  habilidades/rasgos fijados por el usuario, accesible desde cualquier
  vista de La Biblioteca.
- **Calculadora de Incentivos** (`/calculadoras`, F2-F3): introduces el VAE
  de ambos equipos, calcula el presupuesto de incentivos (diferencia × 1000)
  y lista qué se puede pagar con ese presupuesto.

---

## Decisiones tomadas (v1.0, 2026-07-20)

1. El proyecto existente ES el proyecto: este plan lo gobierna, no lo
   reinicia. El stack de Fase 0 queda ratificado.
2. Nufflepedia pública como puerta de entrada; gestión tras login.
3. Roadmap de 6 fases pequeñas, cada una termina desplegada y usable.
4. shadcn/ui + next-intl + Postgres FTS como nuevas incorporaciones.
5. El design system se construye sobre pantallas reales en Fase 1.
6. **Nombre público: "Nufflepedia"** como marca de toda la app; la sección
   de consulta pasa a llamarse "La Biblioteca". (Evita usar la marca
   registrada de GW en el nombre.)
7. **Interfaz solo en español hasta Fase 5**; el contenido sigue siendo
   bilingüe a nivel de dato desde ya.
8. **Fase 1 incluye las 29 razas completas** (transcripción del Compendio
   + revisión del admin), no un subconjunto.
9. **Dirección de arte: «Pergamino y sangre»** (light-first). Elegida sobre
   «Estadio de medianoche» y «Cabalvision». Especificada en
   `DESIGN_SYSTEM.md`.

### 11.2 Fase 2 (El Cuartel) y Dashboard — completados (2026-07-22)

Resumen operativo de lo construido en esta sesión larga, para no tener que
re-derivarlo en la siguiente:

- **Auth**: Google OAuth añadido junto al enlace mágico (`LoginForm.tsx`).
  Nuevo guard `requireUser()` (sesión sin exigir ADMIN) protegiendo el grupo
  de rutas `(app)`. Campo `User.avatarUrl` (viene de Google).
- **Dashboard** (`/dashboard`): sidebar persistente + Buscador Rápido
  (abre resultados en `Modal`, no navega fuera) + Mis Equipos + Mis
  Competiciones + Heraldo de Nuffle.
- **El Cuartel** (`/equipos`): creación de equipo (raza + nombre + 1M MO),
  ficha con 3 columnas independientes (Roster · Mercado de Estrellas ·
  Plantilla — así fichar no desplaza los botones al hacer varios clics
  seguidos), personal de banquillo (relanzamientos/animadoras/entrenadores/
  aficionados/apotecario), Mercado de Estrellas con regla "plays for" (máx.
  2 copias), plantilla con nombre/dorsal editables inline.
- **Nombres de jugador acordes a la raza real del puesto** (no la del
  equipo): `src/rules-engine/data/playerNames.ts` deriva la familia de
  nombres de `MasterPosition.playerTags` (ej. un Grandullón "Troll" en un
  equipo de Orcos recibe nombres de trol). Insignia dorada junto al nombre
  quan el puesto es de otra raza (Grandullones, sub-criaturas de No
  Muertos). Nunca repite nombre dentro del equipo.
- **Todas las acciones de El Cuartel usan actualización optimista**
  (`useOptimistic`) — el clic se siente instantáneo aunque el servidor
  tarde; si falla, se revierte solo y se muestra el error.
- **Componentes compartidos nuevos** (inventario de `DESIGN_SYSTEM.md` §7,
  antes solo especificados): `SkillPill` (tooltip de habilidad al
  hover/focus), `SkillPillList` (fila de pills desde nombres+catálogo, en
  `src/components/`), `Modal` (overlay, cierra con Escape/clic
  fuera/botón), `EmptyState`.
- **Rendimiento**: `requireUser()` hacía un `prisma.user.count()` de tabla
  completa en cada llamada (cada página y cada Server Action) — se cambió a
  un `SELECT` por PK en el camino normal. Las consultas de `addPlayer`/
  `hireStar` van en paralelo (`Promise.all`) en vez de en serie.
- **Naming de rutas real vs. plan original**: ver nota en §2 — `/arena` en
  este documento originalmente era "ligas y torneos"; en el código real esa
  sección es `/competiciones` y `/arena` quedó para el futuro asistente de
  partido en vivo.
- **Pendiente detectado, no bloqueante**: `docs/DATA_MODEL.md`,
  `docs/ARCHITECTURE.md` y `docs/RACES_DATA_MODEL.md` tenían lenguaje de
  "pendiente/M2/propuesta" ya superado — actualizados en la misma revisión
  que esta sección.

### 11.3 Fase 3 (La Arena) y contenido oficial ampliado — completados (2026-07-23)

Resumen operativo de una sesión larga, para no tener que re-derivarlo:

- **Arena v1**: crear liga/torneo (con o sin fase de grupos), inscripción,
  clasificación, torneos con cuadro de eliminatoria (`src/lib/tournamentBracket.ts`,
  con bug de byes emparejados entre sí encontrado y corregido vía test antes
  de llegar a producción). Bug real corregido: "Descubrir ligas públicas"
  filtraba por `status: OPEN` y ocultaba ligas ya `IN_PROGRESS`.
- **Calendario de liga a doble vuelta**: al marcar una liga "en curso" se
  genera automáticamente vía `src/lib/roundRobinSchedule.ts` (método del
  círculo), invirtiendo local/visitante en la vuelta. Cada jornada admite
  **proponer y confirmar** una fecha (`CompetitionFixture.proposedByEntryId`/
  `confirmedAt` — evita que cada entrenador vea una hora distinta) + enlace
  "Añadir a Google Calendar" y descarga `.ics` (`src/lib/calendarLinks.ts`,
  sin pedir ningún permiso nuevo de Google a propósito).
- **Detalle de partido (box score)**: registrar un resultado permite indicar
  opcionalmente quién anotó cada touchdown y quién causó/recibió cada
  lesión (`MatchScorer`, `MatchInjury`, formulario compartido
  `MatchDetailsForm.tsx`). Reparte SPP real (`MasterSppValue`) y cambia el
  estado del jugador lesionado (`MasterInjuryEntry`) — conecta por fin
  tablas de Fase 1 que estaban sin usar. Lógica centralizada en
  `competiciones/boxScore.ts`.
- **Crónica automática del partido**: cada resultado genera un titular +
  artículo por plantillas (`src/lib/matchArticle.ts`, con tests) usando el
  marcador, anotadores y lesiones — se guarda en `MatchReport.headline`/
  `article` (campos que ya existían sin usar) y se ve en "Últimos partidos"
  como tarjeta desplegable.
- **Subida de nivel**: cada jugador de roster (no los Estrella) puede gastar
  PE según la Tabla de Mejoras oficial (`LEVEL_UP_SPP_COST_TABLE`, ya
  verificada en sesiones anteriores) — habilidad primaria al azar/elegida,
  secundaria elegida, o mejora de atributo. La mejora de atributo **no
  simula la tirada de 1D8** (no se tiene la tabla oficial verificada con
  certeza): el entrenador tira físicamente y solo le dice a la app qué
  característica subió, mismo patrón que los resultados de partido. Nuevos
  campos en `ManagedPlayer`: `maIncreases`/`stIncreases`/`agIncreases`/
  `paIncreases`/`avIncreases`. Componente compartido `components/LevelUpPanel.tsx`
  y `src/lib/playerStats.ts` (`effectiveStats`/`statLine`).
- **Plantilla-copia aislada por competición** (la pieza grande): al
  inscribirse en cualquier liga o torneo se clona la plantilla real
  (jugadores + habilidades + tesorería sobrante) en una copia de trabajo
  ligada solo a esa inscripción (`CompetitionPlayer`/`CompetitionPlayerSkill`,
  `competiciones/rosterSnapshot.ts`). A partir de ahí, PE, subidas de nivel,
  lesiones y fichajes de Estrella "solo para esta competición"
  (`competiciones/rosterActions.ts`, descuentan de `CompetitionEntry.snapshotTreasury`)
  afectan solo a la copia — la plantilla real en El Cuartel nunca se entera.
  `MatchScorer`/`MatchInjury` apuntan a `CompetitionPlayer`, no a
  `ManagedPlayer`, desde este cambio. Inscripciones creadas antes de esta
  pieza se rellenan solas (clonado perezoso) la próxima vez que se abre la
  ficha de la competición.
- **Estadísticas de competición**: máximos anotadores, carniceros (bajas
  causadas) y últimas lesiones, agregados en tiempo real desde
  `MatchScorer`/`MatchInjury` de esa competición (`CompetitionStats.tsx`).
- **Histórico**: el Dashboard y `/competiciones` ya no mezclan competiciones
  `FINISHED` con las activas — sección "Histórico" separada.
- **Home directa al Dashboard**: `/` ya no es una landing — redirige a
  `/dashboard` (con sesión) o `/login` (sin ella).
- **Catálogo de Incentivos y Reglas especiales de equipo**: transcritos
  directamente del reglamento oficial en PDF que compartió el usuario
  (`blood-bowl-edicion-3t.pdf`, págs. 140-149 y 154-155). Nuevas tablas
  `MasterInducement` (18 filas) y `MasterSpecialRule` (7 filas), seed en
  `src/rules-engine/data/tables/inducements.ts`/`specialRules.ts`, visibles
  en `/nufflepedia` y editables en `/admin/tables`. **Todavía no
  conectadas** a la compra real dentro de una competición (contenido de
  consulta por ahora, mismo punto de partida que tuvieron el resto de
  tablas antes de engancharse al resto de la app).
- **Migraciones de esta sesión** (orden): `fixtures_scorers_injuries`,
  `fixture_schedule_confirmation`, `player_stat_increases`,
  `competition_player_snapshot`, `inducements_and_special_rules`.
- **Aviso de datos de prueba**: al aplicar `competition_player_snapshot` fue
  necesario poner a `null` el "quién anotó/quién lesionó" de los resultados
  de prueba ya registrados en la liga "PRUEBA I" (el marcador y las
  estadísticas de equipo no se tocaron).

### 11.4 Incentivos de verdad, realismo y estabilidad de La Arena — completados (2026-07-24/25)

Resumen operativo de una sesión larga de correcciones y ampliaciones sobre
Fase 3, más el primer despliegue público:

- **Compra real de Incentivos**: el catálogo de §11.3 (solo consulta) se
  conectó al registro de resultados — cada equipo puede comprar Incentivos
  de coste fijo (`MasterInducement.cost`) antes de un partido, descontando
  de `snapshotTreasury` de esa competición; queda registrado en
  `MatchInducementPurchase`. Los Incentivos de coste variable (mercenarios,
  Jugadores Estrella prestados, árbitro, mago) siguen sin implementar — el
  esquema de coste fijo era el caso simple y de más valor inmediato.
- **Crónica más realista**: `src/lib/matchArticle.ts` ahora consulta la
  tabla de anotadores de la temporada para dar contexto ("su tercer
  touchdown esta temporada") en vez de solo narrar el partido aislado.
- **Lesión permanente = elegir qué característica baja**: al marcar una
  lesión con secuela permanente, la app pregunta qué atributo se ve
  afectado (mismo patrón "consulta, no simulación" que la subida de nivel)
  — nuevo campo `MatchInjury.statLoss`, migración `injury_stat_loss`.
- **Varios equipos propios en una misma competición**: un usuario puede
  inscribir más de un equipo suyo en la misma liga/torneo (caso real:
  torneo casero con varios equipos de la familia, una sola cuenta). Afectó
  a toda la lectura de "mi equipo" en `/competiciones/[id]`, que pasó de
  singular a lista (`myEntries`/`myRosters`).
- **Bug real corregido — no se podía disolver un equipo inscrito**:
  `deleteTeam` fallaba con violación de clave foránea si el equipo había
  estado alguna vez en una competición. Se congelan `teamName`/`rosterKey`
  como columnas propias de `CompetitionEntry` (ya no dependen de leer
  `ManagedTeam` en vivo) y `managedTeamId` pasa a ser opcional con
  `ON DELETE SET NULL` — ver `DATA_MODEL.md`.
- **Bug real corregido — "ese equipo ya está inscrito" en falso**: el
  desplegable de "unirme con este equipo" guardaba en `useState` el primer
  equipo disponible solo al montar el componente; tras cada inscripción la
  lista se acortaba pero el estado no se resincronizaba. Se sustituyó por
  un valor derivado (`effectiveJoinTeamId`) que valida el estado guardado
  contra la lista actual en cada render.
- **Rediseño de la fase de grupos**: el desplegable libre Local/Visitante
  para registrar resultados de grupo no dejaba ver ni acceder con claridad
  al segundo grupo. Sustituido por `GroupMatchList.tsx`: lista de todos los
  enfrentamientos posibles agrupada visualmente por grupo, un botón de
  registrar por pareja (ya jugada = solo marcador, no se puede duplicar).
- **Validación de número de grupos vs. equipos inscritos**: el formulario
  de creación clampa el número de grupos al máximo de equipos permitido, y
  `startTournament` rechaza arrancar si al final se inscribieron menos
  equipos de los que hacen falta para ese número de grupos.
- **Bug real corregido — claves duplicadas en "Mis ligas"**: con varios
  equipos propios en la misma competición, la consulta generaba una fila
  por equipo en vez de una por competición (React avisaba de claves
  repetidas). Deduplicado por id de competición.
- **Primer despliegue público**: repositorio nuevo
  [`github.com/jaz206/Nufflepedia`](https://github.com/jaz206/Nufflepedia)
  (el proyecto viejo `BloodBowlManager`/Vite se deja intacto como archivo,
  con su propio Vercel sin tocar) conectado a un proyecto de Vercel nuevo
  con despliegue automático en cada push. Variables de entorno de
  producción = las mismas de Supabase que se usan en desarrollo (todavía
  **una sola base de datos** para local y producción — pendiente decidir
  si se separa). Corregido: la URL "Site URL" de Supabase Auth apuntaba a
  `localhost:3000`, así que el login con Google en producción redirigía de
  vuelta a local — se actualizó a la URL real de Vercel y se añadieron
  ambas (`localhost` y producción) a "Redirect URLs".

### 11.5 Asistente de Partido en vivo — v1 (2026-07-26)

Primera versión de Fase 4, alcance deliberadamente acotado tras planificarlo
con el usuario (referencia estudiada: el módulo "Colisep" del prototipo
anterior — ver `ARCHITECTURE.md` para qué se rescató y qué se descartó de
ahí). Decisiones cerradas con el usuario:

- **Tiradas físicas, no simuladas**: el asistente dice qué tirada toca
  (Clima, Patada Inicial, Plegaria...) y el usuario introduce el resultado
  ya decidido en mesa — mismo patrón "consulta, no simulación" del resto
  de la app.
- **Un solo dispositivo por ahora**, pero el estado del partido vive en
  Postgres desde el primer evento (no solo en memoria del navegador), para
  que el día de mañana cada móvil pueda suscribirse al mismo partido por
  Realtime sin rediseñar nada.
- **Vale para amistosos Y para equipos de un amigo**: puedes jugar contra
  otro de tus equipos, contra el equipo real de un amigo con cuenta
  (buscado por nombre), o crear al vuelo un equipo "invitado" para alguien
  sin cuenta (elige raza + nombre, monta la plantilla, y ya se puede jugar).
- **Alcance de "qué se registra"**: nada de tirar dados táctico a mano en
  la app (esquivar, forzar la marcha, empujones...) — eso pasa en la mesa.
  Los "botones" son los eventos que de verdad generan estadística/PE o
  cambian el estado de un jugador: Touchdown, Pase completado, Intercepción,
  Baja causada, Expulsión, Cambio de turno, Uso de Apotecario, Cambio de
  banquillo, Plegaria a Nuffle, Evento de Patada Inicial, Recuperación K.O.

**Modelo de datos**: `CompetitionEntry.competitionId` pasó a ser opcional —
un amistoso suelto crea dos `CompetitionEntry` (una por equipo) con
`competitionId: null`, reutilizando TAL CUAL toda la maquinaria ya existente
de plantilla-copia (`cloneRosterIntoEntry`) y box score (`applyBoxScore`) que
antes solo servían a competiciones. `MatchSource` ganó el valor `FRIENDLY`.
Nuevo `ManagedTeam.isGuest` para los equipos creados al vuelo (se ocultan de
"Mis equipos" pero son equipos normales en todo lo demás). Nuevos modelos
`LiveMatch` (estado derivado: marcador, mitad/turno, clima, quién patea) y
`LiveMatchEvent` (registro append-only — cada botón pulsado es una fila).
"Finalizar partido" reconstruye el `MatchReport` a partir de ese registro
(nadie vuelve a teclear el resultado), y **a diferencia de una competición**
sincroniza PE/estado/atributos de vuelta a la plantilla real de El Cuartel —
un amistoso sí hace progresar al equipo.

**Deliberadamente fuera de esta v1** (quedan para cuando se pruebe en mesa
y se vea qué falta): enganchar el asistente a partidos de competición
(jornadas de liga/grupos/cuadro — hoy siguen usando el formulario post-hoc
de `MatchDetailsForm`); sincronización Realtime multi-dispositivo; gating
fino de qué acciones puede hacer un jugador según su posición/habilidades
(hoy todos los botones están siempre disponibles para cualquier jugador
seleccionado); "quién está en el campo ahora mismo" es solo un estado visual
del cliente (no persiste, se pierde al recargar).

## Cuestiones abiertas

Ninguna bloqueante. Detalles a concretar sobre la marcha: elección final de
librería de iconos (sigue sin decidirse — hoy no hay ninguna, los pocos
iconos son SVG a mano), y si se adopta shadcn/ui de verdad o se sigue con
componentes propios (hasta ahora, propios, y funcionan bien).
