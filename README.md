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

## Documentación

- [Esquema de datos](docs/schema.dbml)
- [Precios: artículo e importación](docs/domain-pricing.md)
- [Plan de implementación](docs/implementation_plan.md)
