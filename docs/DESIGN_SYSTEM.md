# Design System — «Pergamino y sangre» v1.0

> Dirección de arte **elegida** (2026-07-20). La app es un tomo de reglas
> oficial reimaginado como producto digital premium: base pergamino, tinta
> sepia, rojo sangre como acento de acción y oro viejo para lo épico/élite.
> **Light-first**; el tema oscuro es una variante cálida ("tomo a la luz de
> las velas"), no un rediseño.
>
> Los tokens se implementarán en `globals.css` como custom properties durante
> la Fase 1, sustituyendo a los grises Tailwind por defecto que usa la app hoy.

## 1. Principios

1. **Legibilidad de manual antes que ambientación.** Es un libro de reglas:
   el texto largo se lee cómodo en pantalla y en mesa. La estética nunca
   reduce el contraste de una regla.
2. **Un acento, un significado.** El rojo sangre es *acción/interactivo*. El
   oro viejo es *hito/élite/épico*. Verde/ámbar/azul semánticos son *estado*
   (éxito/aviso/info) y no se mezclan con el acento.
3. **Serif para el contenido, sans para los mandos.** El cuerpo y los
   titulares son serif (el "tomo"); los controles funcionales, badges y
   datos usan sans/mono (claridad). Este contraste es deliberado, no ruido.
4. **Todo desde tokens.** Ningún componente usa un hex o un px suelto.
5. **La sensación "videojuego AAA" en esta dirección viene de la
   profundidad y el detalle**, no del neón: capas de pergamino con sombras
   sutiles, ilustración rica (escudos, viñetas grabadas), micro-movimiento
   con peso. No de fondos oscuros ni luces de discoteca.

## 2. Color (tokens)

### Tema claro (por defecto)
| Token | Valor | Uso |
|---|---|---|
| `--bg` | `#F1EBDD` | Fondo de página (pergamino) |
| `--surface-1` | `#F9F5EB` | Paneles, cards (pergamino claro) |
| `--surface-2` | `#EAE2CF` | Filas alternas, elementos hundidos |
| `--surface-3` | `#FDFBF5` | Popovers, modales (elevado, casi blanco) |
| `--border` | `#D6CCB4` | Bordes sutiles |
| `--border-strong` | `#B8AB8C` | Bordes de inputs, divisores fuertes |
| `--ink` | `#2B241C` | Texto principal (sepia casi negro, no #000) |
| `--ink-2` | `#5C5344` | Texto secundario |
| `--ink-3` | `#8B8069` | Texto terciario, placeholders |
| `--accent` | `#8E1E1E` | Rojo sangre: botones primarios, enlaces, foco |
| `--accent-hover` | `#A82828` | Hover del acento |
| `--accent-ink` | `#FBF1E9` | Texto sobre acento |
| `--gold` | `#7A5C12` | Oro viejo: élite, hitos, MVP, medallas |
| `--gold-soft` | `#9A7A24` | Oro atenuado (iconos, bordes de énfasis) |

### Semánticos (estado; nunca decorativos)
| Token | Valor (claro) | Uso |
|---|---|---|
| `--ok` | `#2E6B41` | Éxito, "EN ✓", validación |
| `--warn` | `#9A6B15` | Avisos, lesión MNG |
| `--info` | `#2F5D84` | Información neutra |
| `--danger` | `#B5322E` | Error, muerte, borrado |

> Nota: `--danger` y `--accent` son ambos rojos y en esta dirección se
> parecen a propósito (el rojo es el color del juego). Se distinguen por
> **contexto e icono**, no por tono: el acento aparece en acciones primarias
> positivas (Guardar, Ver); el danger siempre acompaña a un icono de
> alerta/papelera y a texto explícito ("Borrar", "Muerto").

### Tema oscuro (variante cálida — "tomo a la luz de las velas")
| Token | Valor | Notas |
|---|---|---|
| `--bg` | `#1A1611` | Cuero envejecido, marrón casi negro |
| `--surface-1` | `#221D16` | Paneles |
| `--surface-2` | `#2B241B` | Filas/hundido |
| `--surface-3` | `#332B20` | Modales |
| `--border` | `#3A3226` | — |
| `--border-strong` | `#4E4432` | — |
| `--ink` | `#EFE7D6` | Pergamino cálido |
| `--ink-2` | `#B5A98F` | — |
| `--ink-3` | `#7E735C` | — |
| `--accent` | `#CF4436` | Sangre elevada para contraste en oscuro |
| `--accent-hover` | `#E15748` | — |
| `--gold` | `#C9A227` | Oro brillante que resalta en oscuro |
| `--ok` `--warn` `--info` `--danger` | `#5FB07C` `#D2A24B` `#6FA0CE` `#E0655A` | Versiones elevadas |

El toggle de tema estampa `data-theme` en `:root` y gana sobre
`prefers-color-scheme` en ambos sentidos (patrón de token, ya usado en la app).

## 3. Tipografía

| Rol | Fuente (self-hosted) | Uso |
|---|---|---|
| Display | **Cinzel** (600/700) | H1-H2 y etiquetas en versalitas. Capitales romanas talladas: épico y "manual antiguo", muy legible en tiradas cortas. |
| Cuerpo / UI legible | **Spectral** (400/500/600) | Todo el texto de lectura, botones, campos de formulario. Serif diseñada para pantalla. |
| Datos / dados | **JetBrains Mono** | Stats (MA/ST/AG/PA/AV), notación de dados (2D6, 4+), claves. |

Tres familias, coherentes. Cinzel es all-caps por naturaleza, así que sirve
también para badges pequeños ("ÉLITE", "ACTIVA") y cabeceras de tabla.

Escala (rem): 12 · 13.5 · 15 (base) · 17 · 20 · 24 · 30 · 38 · 48.
Line-height: 1.6 cuerpo (es un libro, respira), 1.1 display.
Números tabulares (`tabular-nums`) en toda tabla y stat.

Reglas: máx. ~66ch en lectura larga; versalitas Cinzel con
`letter-spacing: 0.04em`; nunca justificar; `text-wrap: balance` en titulares.

**Rendimiento**: las 3 fuentes se subsetean (latín + signos del juego) y se
autoalojan con `font-display: swap`. Sin CDN de fuentes.

## 4. Espaciado, radios, sombras, textura

- **Espaciado**: escala 4px — `4 8 12 16 24 32 48 64`. Gap de grid/flex, no
  márgenes sueltos entre hermanos.
- **Radios**: `3px` (inputs, chips, cards — esquinas apenas suavizadas, sabor
  impreso) · `999px` solo en píldoras de habilidad. Nada de `rounded-lg`
  genérico: la dirección es "papel", no "app de gradientes".
- **Sombras**: en claro, sombra de *offset impreso* `2px 2px 0
  rgba(43,36,28,.08)` en cards (como tinta que traspasa el papel); halo
  suave para modales. En oscuro, elevación por superficie + borde, apenas
  sombra.
- **Textura**: grano/fibra de papel al 3-4% sobre `--bg` (imagen tileable o
  SVG de ruido), nunca sobre texto. Filetes dobles (`double`) como divisores
  de sección — guiño a la maquetación de reglamento.

## 5. Estados obligatorios

Todo componente interactivo define y verifica visualmente:

| Estado | Especificación |
|---|---|
| Hover | Cambio de superficie o subrayado; transición 150ms |
| Focus | Anillo `2px` en `--accent`, `offset 2px`, SIEMPRE visible con teclado |
| Active | Compresión sutil (`scale .98`) |
| Disabled | `opacity .5` + `cursor: not-allowed`, nunca solo color |
| Loading | Texto "Guardando…" o skeleton de tono pergamino; conserva el ancho |

## 6. Componentes (especificación breve)

- **Button**: primario (sangre, texto Spectral), secundario (borde
  `--border-strong`, texto tinta), fantasma (texto), peligro (danger + icono
  papelera). Altura 36/40px.
- **SkillPill**: ✅ HECHO (`src/components/SkillPill.tsx` +
  `SkillPillList.tsx`). Nombre de habilidad como píldora bordeada; hover/
  focus abre tooltip con la descripción completa. Élite lleva punto oro.
  En uso en El Cuartel y el Heraldo de Nuffle. Pendiente: variante EN
  (hoy siempre muestra la descripción en español).
- **StatBlock**: fila MA/ST/AG/PA/AV en JetBrains Mono, "+" pegado al número,
  sobre `--surface-2` con filetes verticales. Variante compacta (tabla) y
  grande (ficha).
- **PlayerCard**: escudo/retrato con borde grabado, nombre en Cinzel,
  StatBlock, SkillPills, SPP con ProgressBar hasta la próxima mejora, badges
  de estado (lesionado/muerto/MNG).
- **RuleTable**: tabla de dados; columna de tirada en mono/oro, filas
  alternas `--surface-2`, resaltado al pasar. Variantes 2D6 y 1D16.
- **SearchCommand**: overlay `Ctrl+K` / `/`, resultados agrupados por tipo
  (Habilidad/Rasgo/Raza/Estrella/Mi equipo), navegación por teclado.
- **Wizard**: pasos numerados en Cinzel con estado (hecho/actual/pendiente),
  botón atrás siempre, resumen antes de confirmar. Post-partido y creación de
  equipo.
- **Toast**: pendiente de construir (aún no hay ninguna acción que lo necesite;
  los errores de Server Action se muestran inline con `useOptimistic` + un
  `<p>` de error, ver El Cuartel).
- **EmptyState**: ✅ HECHO (`src/components/EmptyState.tsx`), sin viñeta
  ilustrada todavía (solo texto + acción). En uso en Dashboard, Equipos,
  Competiciones/Pizarra/Arena (placeholders).
- **Modal**: ✅ HECHO, no estaba en el inventario original
  (`src/components/Modal.tsx`) — overlay + panel, cierra con Escape/clic
  fuera/botón. En uso en el Buscador Rápido del Dashboard.

## 7. Movimiento

- Duraciones: 150ms (micro) · 250ms (paneles) · 400ms máx (overlays).
- Easing: `ease-out` al entrar, `ease-in` al salir.
- Momentos "de juego" permitidos: tirada de dado (sacudida breve con peso),
  confirmación de touchdown/muerte en el asistente.
- `prefers-reduced-motion`: todo pasa a fundidos de opacidad.

## 8. Proceso de adopción

1. **F1**: tokens en `globals.css` + shadcn/ui tematizado a «Pergamino y
   sangre» + se construyen las pantallas nuevas de La Biblioteca (razas,
   estrellas, buscador) ya con el sistema. Las pantallas actuales de la
   Biblioteca se migran.
2. **F2**: se migra `/admin` y se construye el Cuartel con el sistema.
3. Cada componente nuevo entra aquí documentado ANTES de usarse en una
   segunda pantalla (la primera vez puede nacer junto a su pantalla).
