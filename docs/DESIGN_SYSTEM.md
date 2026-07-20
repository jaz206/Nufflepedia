# Design System — «Estadio de medianoche» v0.1

> Estado: PROPUESTA (pendiente de validar la dirección de arte, ver
> Cuestiones abiertas del `MASTER_PLAN.md`). Los tokens se implementarán en
> `globals.css` como custom properties durante la Fase 1, sustituyendo a los
> grises Tailwind por defecto que usa la app hoy.

## 1. Principios

1. **Legibilidad antes que ambientación.** El sabor visual nunca reduce el
   contraste de una regla que alguien lee en mesa con mala luz.
2. **Un acento, un significado.** El carmesí es *acción/interactivo*. El
   latón es *hito/élite/épico*. Verde/ámbar/rojo semánticos son *estado*
   (éxito/aviso/peligro) y no se mezclan con el acento.
3. **Todo desde tokens.** Ningún componente usa un hex o un px suelto.
4. **Dark es el hogar, light es variante.** Se diseña primero en oscuro;
   el tema claro redefine tokens, no componentes.

## 2. Color (tokens propuestos)

### Fondos y superficies (dark)
| Token | Valor | Uso |
|---|---|---|
| `--bg` | `#0E0D10` | Fondo de página (carbón casi negro) |
| `--surface-1` | `#16151A` | Paneles, cards |
| `--surface-2` | `#1E1C23` | Elementos elevados, hover de filas |
| `--surface-3` | `#26232C` | Popovers, modales |
| `--border` | `#2E2B36` | Bordes sutiles |
| `--border-strong` | `#413D4C` | Bordes de inputs, divisores fuertes |

### Tinta
| Token | Valor | Uso |
|---|---|---|
| `--ink` | `#EDEAE4` | Texto principal (blanco hueso, no #FFF) |
| `--ink-2` | `#A8A3B0` | Texto secundario |
| `--ink-3` | `#6F6A7A` | Texto terciario, placeholders |

### Acentos
| Token | Valor | Uso |
|---|---|---|
| `--accent` | `#C22E2E` | Carmesí sangre: botones primarios, enlaces, foco |
| `--accent-hover` | `#DA4040` | Hover del acento |
| `--accent-ink` | `#FBEFEF` | Texto sobre acento |
| `--brass` | `#C9A227` | Latón: élite, hitos, MVP, medallas |
| `--brass-soft` | `#8A7420` | Latón atenuado (bordes, iconos) |

### Semánticos (estado, nunca decorativos)
| Token | Valor | Uso |
|---|---|---|
| `--ok` | `#4CAF6E` | Éxito, "EN ✓", validación |
| `--warn` | `#D9A13B` | Avisos, lesiones MNG |
| `--danger` | `#E05252` | Errores, muerte, borrado |
| `--info` | `#5B9BD5` | Información neutra |

El **tema claro** redefine: fondo pergamino frío (`#F4F1EA` aprox), tinta
carbón, mismo carmesí ligeramente oscurecido para contraste AA. Se
especifica al implementarlo en F1 validando contraste real.

## 3. Tipografía

| Rol | Fuente (propuesta) | Uso |
|---|---|---|
| Display | **Archivo Expanded/Black** (o similar condensada-contundente, self-hosted) | H1-H2, marcadores, números grandes |
| Interfaz/lectura | **Inter** (ya conocida, excelente en tamaños pequeños) | Todo el cuerpo y controles |
| Datos/mono | **JetBrains Mono** | Claves, tiradas (2D6, 4+), tablas de dados |

Escala (rem): 12 · 13.5 · 15 (base) · 17 · 20 · 24 · 30 · 38 · 48.
Line-height: 1.5 cuerpo, 1.15 display. Números tabulares
(`font-variant-numeric: tabular-nums`) en toda tabla y stat.

Reglas: máx. ~68ch de ancho en lectura larga; MAYÚSCULAS solo en etiquetas
pequeñas con `letter-spacing: 0.06em`; nunca justificar texto.

## 4. Espaciado, radios, sombras

- **Espaciado**: escala 4px — `4 8 12 16 24 32 48 64`. Gap de grid/flex,
  no márgenes sueltos entre hermanos.
- **Radios**: `4px` (inputs, chips) · `8px` (cards, modales) · `999px`
  (píldoras). Nada de esquinas mixtas en un mismo componente.
- **Sombras** (en dark las sombras casi no se ven: se eleva con
  `--surface-*` + borde): `shadow-1` borde sutil, `shadow-2` para
  popover/modal con halo negro 40%.
- **Textura**: grano de ruido al 2-3% de opacidad solo en `--bg`, nunca
  sobre texto.

## 5. Estados obligatorios

Todo componente interactivo define y testea visualmente:

| Estado | Especificación |
|---|---|
| Hover | Cambio de superficie o acento, transición 150ms |
| Focus | Anillo `2px` en `--accent`, `offset 2px`, SIEMPRE visible con teclado |
| Active | Compresión sutil (`scale .98`) o superficie más oscura |
| Disabled | `opacity .5` + `cursor: not-allowed`, nunca solo color |
| Loading | Texto "Guardando…" o skeleton; el botón conserva su ancho |

## 6. Componentes (especificación breve)

- **Button**: primario (carmesí), secundario (borde), fantasma (texto),
  peligro (danger). Altura 36/40px, icono opcional a la izquierda.
- **SkillPill**: nombre de habilidad como píldora; hover/focus abre tooltip
  con la descripción completa (ES u EN según idioma). Élite lleva punto
  latón. Es EL componente puente entre módulos (rosters, equipos, partido).
- **StatBlock**: fila MA/ST/AG/PA/AV en mono, con el "+" pegado al número.
  Variante compacta (tabla) y grande (ficha de jugador).
- **PlayerCard**: retrato/escudo, nombre, posición, StatBlock, SkillPills,
  SPP con ProgressBar hasta la siguiente mejora, badges de estado
  (lesionado/muerto/MNG).
- **RuleTable**: tabla de dados con columna de tirada en mono y resaltado
  de fila al pasar; variante 2D6 y 1D16.
- **SearchCommand**: overlay `Ctrl+K`/`/`, resultados agrupados por tipo
  (Habilidad/Rasgo/Raza/Estrella/Mi equipo), navegación por teclado.
- **Wizard**: pasos numerados con estado (hecho/actual/pendiente), botón
  atrás siempre, resumen final antes de confirmar. Usado en post-partido
  y creación de equipo.
- **Toast**: esquina inferior, autodismiss 4.5s, variantes ok/danger, cola
  máxima de 3.
- **EmptyState**: ilustración pequeña + una frase con sabor + acción
  primaria ("Aún no tienes equipo. Recluta a tus primeros desgraciados →").

## 7. Movimiento

- Duraciones: 150ms (micro) · 250ms (paneles) · 400ms máx (overlays).
- Easing: `ease-out` al entrar, `ease-in` al salir.
- Momentos "de juego" permitidos: tirada de dado (una sacudida breve),
  confirmación de touchdown/muerte en el asistente de partido.
- `prefers-reduced-motion`: todo pasa a fundidos de opacidad.

## 8. Proceso de adopción

1. **F1**: tokens en `globals.css` + shadcn/ui tematizado + se construyen
   las pantallas nuevas de Nufflepedia (razas, estrellas, buscador) ya con
   el sistema. Las pantallas viejas de Nufflepedia se migran.
2. **F2**: se migra `/admin` y se construye Cuartel con el sistema.
3. Cada componente nuevo entra aquí documentado ANTES de usarse en una
   segunda pantalla (la primera vez puede nacer junto a su pantalla).
