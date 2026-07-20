# Blood Bowl Manager

Reconstrucción desde cero de Blood Bowl Manager: consultor de reglas Season
3, gestor de equipos y comisionado de ligas.

**Documento que gobierna el proyecto: [docs/MASTER_PLAN.md](docs/MASTER_PLAN.md)**
(visión, navegación, roadmap por fases, priorización, UX y tecnología).
Complementos: [docs/DESIGN_SYSTEM.md](docs/DESIGN_SYSTEM.md) (dirección de
arte y tokens), [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) (decisiones de
stack de la Fase 0) y [docs/DATA_MODEL.md](docs/DATA_MODEL.md) (modelo de
datos).

## Arrancar en local

```bash
npm install
cp .env.example .env.local   # y rellena las claves de Supabase
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) — el enlace "Ver la
Nufflepedia" muestra el catálogo de habilidades ya cargado desde el motor de
reglas, con buscador y descarga en Markdown.

## Comandos

- `npm run dev` — servidor de desarrollo.
- `npm run build` — build de producción.
- `npm test` — tests del motor de reglas (Vitest).
- `npm run lint` — ESLint.
- `npx prisma studio` — interfaz visual de la base de datos (requiere
  `DATABASE_URL` configurado).

## Qué es cada cosa

- `src/rules-engine/` — contenido oficial de reglas (habilidades, tablas),
  código puro sin dependencias de framework, con tests.
- `src/app/` — rutas de Next.js.
- `prisma/schema.prisma` — modelo de datos dinámicos (usuarios, equipos,
  ligas, partidos).
