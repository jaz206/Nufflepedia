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
/                       Landing (visitante) · Dashboard (autenticado)
├── /nufflepedia        LA BIBLIOTECA (pública, es el gancho de entrada)
│   ├── habilidades     72 habilidades, 6 categorías, buscador  [HECHO]
│   ├── rasgos          38 rasgos                               [HECHO]
│   ├── tablas          Clima, Patada, Plegarias, Lesiones...   [HECHO]
│   ├── razas           29 rosters oficiales                    [Fase 1]
│   ├── estrellas       Star Players + "juega para"             [Fase 1]
│   └── buscador        Búsqueda global unificada               [Fase 1]
├── /cuartel            GESTIÓN DE EQUIPOS (requiere cuenta)    [Fase 2]
│   ├── mis-equipos     Lista + creación guiada
│   └── [equipo]        Ficha: plantilla, tesorería, historial
├── /arena              LIGAS Y TORNEOS                         [Fase 3]
│   ├── mis-ligas       Competiciones donde participo
│   ├── descubrir       Ligas públicas
│   └── [liga]          Clasificación, calendario, gaceta
├── /calculadoras       Probabilidades, secuencias de dados     [Fase 2-3]
├── /partido            ASISTENTE DE PARTIDO en vivo            [Fase 4]
├── /admin              Contenido maestro (solo ADMIN)          [HECHO]
├── /perfil             Cuenta, preferencias, idioma, tema      [Fase 2]
└── /login              Acceso sin contraseña                   [HECHO]
```

Reglas de navegación:
- **Nufflepedia es pública** (SEO + utilidad sin registro): es la puerta de
  entrada. Cuartel/Arena requieren cuenta.
- **Barra superior persistente** con las 4 secciones + buscador global.
- **Nada a más de 2 clics** desde el dashboard.

---

## 3. Roadmap de desarrollo

| Fase | Nombre | Contenido | Dificultad | Depende de | Valor |
|---|---|---|---|---|---|
| **0** | Cimientos | Stack, auth, admin, motor de reglas, habilidades/rasgos/tablas | — | — | ✅ HECHO |
| **1** | Nufflepedia completa | 29 razas, star players, buscador global, identidad visual v1, i18n de interfaz | Media | Fase 0 | Referencia completa usable y compartible: primer "producto" enseñable |
| **2** | Cuartel General | Constructor de equipos (presupuesto, VAE en vivo, validación de roster), ficha de equipo, perfil de usuario, calculadora de probabilidades | Media-Alta | Razas de F1 | El usuario *guarda* algo suyo: retención |
| **3** | Arena | Crear liga, invitar, calendario round-robin, clasificación, secuencia post-partido (SPP, ganancias, lesiones, mejoras) | Alta | Equipos de F2 | El grupo entero entra: efecto red local |
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

Objetivo: *videojuego moderno*, no web corporativa ni parodia del estilo
oficial de GW. La dirección elegida (pendiente de validar contigo, ver
Cuestiones abiertas) es:

**«Estadio de medianoche» (dark-first).** La app es la retransmisión
nocturna de un deporte brutal en un mundo de fantasía: fondos casi negros
con textura sutil de metal/piedra, información sobre "paneles de marcador",
un acento carmesí sangre y un secundario latón/oro viejo para lo épico.
Legibilidad de lectura larga sobre superficies "pergamino oscuro".

- **Personalidad**: épica, socarrona, violenta con humor (el tono Jim &
  Bob). Los textos de interfaz pueden tener sabor ("¡Nuffle lo ha querido!")
  pero nunca a costa de la claridad.
- **Color**: ver tokens en `DESIGN_SYSTEM.md`. Base carbón (#0E0D10 aprox),
  carmesí como acento único de acción, latón para hitos/élite, verdes/rojos
  semánticos aparte del acento.
- **Tipografía**: una display condensada y contundente para titulares y
  números de marcador (sabor deportivo-brutal), una sans neutra y muy
  legible para interfaz y lectura, una mono para dados/claves/datos.
- **Iconografía**: línea gruesa, esquinas talladas, consistente (una sola
  librería + iconos propios para conceptos del juego: dados de placaje,
  balón, casillas).
- **Ilustración**: escudos y viñetas con estética "grabado/xilografía
  moderna"; nada de clipart ni IA genérica sin dirección.
- **Fondos**: gradientes muy oscuros + grano sutil; nunca fotos.
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
| Temas | Tokens CSS custom properties, **dark por defecto** | Ya funciona así; el tema claro es variante de tokens, no rediseño. |

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

---

## Decisiones tomadas en esta versión

1. El proyecto existente ES el proyecto: este plan lo gobierna, no lo
   reinicia. El stack de Fase 0 queda ratificado.
2. Nufflepedia pública como puerta de entrada; gestión tras login.
3. Roadmap de 6 fases pequeñas, cada una termina desplegada y usable.
4. Dirección de arte propuesta: «Estadio de medianoche» dark-first.
5. shadcn/ui + next-intl + Postgres FTS como nuevas incorporaciones.
6. El design system se construye sobre pantallas reales en Fase 1.

## Cuestiones abiertas (necesitan tu decisión)

1. **Dirección de arte**: ¿validas «Estadio de medianoche» o quieres ver
   1-2 direcciones alternativas maquetadas antes (p. ej. «Pergamino y
   sangre» claro-medieval, o «Retransmisión Cabalvision» estilo broadcast
   ochentero)?
2. **Nombre público**: ¿"Blood Bowl Assistant", "Nufflepedia" como marca
   general, u otro? (Afecta a logo, dominio y landing de F1.)
3. **Idiomas**: ¿interfaz ES ahora + EN en F5, o bilingüe desde F1?
4. **Alcance F1 exacto**: ¿las 29 razas de golpe, o primero las ~8 de
   vuestra liga para desplegar antes?
