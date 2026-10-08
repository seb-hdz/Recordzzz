# Recordzzz

PWA offline-first para gestionar un catálogo de grabaciones y medios físicos (vinilos, CDs, boxsets, etc.). Los datos viven en el navegador con IndexedDB (Dexie); no hay backend.

Estado actual: **v0.1** (en desarrollo).

## Stack

- **SolidJS** + **Vite**
- **pnpm**
- **@generouted/solid-router** (routing por archivos en `src/pages/`)
- **Dexie.js** (almacenamiento local)
- **Tailwind CSS v4** (temas `noom` / `noom-dark`)
- **vite-plugin-pwa** (manifest + service worker)

Arquitectura Ports & Adapters: dominio en `src/domain/`, contratos en `src/ports/`, implementación Dexie en `src/adapters/`.

## Requisitos

- Node.js 22+
- pnpm 11 (`packageManager` del proyecto: `pnpm@11.1.1`)

## Setup

```bash
pnpm install
pnpm dev
```

La app queda en [http://localhost:3000](http://localhost:3000).

## Scripts

| Comando | Descripción |
| --- | --- |
| `pnpm dev` | Servidor de desarrollo |
| `pnpm build` | Build de producción |
| `pnpm preview` | Vista previa del build |
| `pnpm typecheck` | TypeScript sin emitir |
| `pnpm generate:assets` | Regenera iconos/splash PWA desde `brand/` |

## Versión

- **Semver:** campo `version` en `package.json` (bump manual).
- **Build:** en CI, `{run_number}-{unix_timestamp}` (ej. `3-1728345678`). El `run_id` de Actions queda en el log del job para correlacionar.
- En la home se muestra `v. 0.1.0 (build …)`; en local se añade ` - DEV`.

## Deploy (GitHub Pages)

Cada push a `main` ejecuta [`.github/workflows/deploy-pages.yml`](.github/workflows/deploy-pages.yml) y publica en:

`https://seb-hdz.github.io/Recordzzz/`

En el repo de GitHub: **Settings → Pages → Source: GitHub Actions**.

## Documentación

- [Esquema de datos](docs/schema.dbml)
- [Precios: artículo e importación](docs/domain-pricing.md)
- [Plan de implementación](docs/implementation_plan.md)
