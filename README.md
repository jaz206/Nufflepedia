# Blood Bowl Manager

Reconstrucción desde cero de Blood Bowl Manager: consultor de reglas Season
3, gestor de equipos y comisionado de ligas. Ver [docs/ARCHITECTURA.md](docs/ARCHITECTURE.md)
para las decisiones de stack, [docs/ROADMAP.md](docs/ROADMAP.md) para los
hitos y [docs/DATA_MODEL.md](docs/DATA_MODEL.md) para el modelo de datos.

## Arrancar en local

```bash
npm install
cp .env.example .env.local   # y rellena las claves de Supabase
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) — el enlace "Ver el
Oráculo" muestra el catálogo de habilidades ya cargado desde el motor de
reglas.

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
