# Plan de Inicialización: Recordzzz (Web PWA con Vite + SolidJS)

Plan técnico detallado para la inicialización y estructuración del proyecto **Recordzzz** en `/Users/sebastian/Desktop/Proyectos/JSNode/Recordzzz`. El proyecto es una aplicación web PWA moderna, reactiva y offline-first (estrictamente web, sin Capacitor), utilizando **SolidJS**, **pnpm**, **@generouted/solid-router** (file-based routing), arquitectura **Ports & Adapters (Hexagonal)** para desacoplar Dexie.js, el esquema de datos tipado en [schema.dbml](file:///Users/sebastian/Desktop/Proyectos/JSNode/Recordzzz/docs/schema.dbml), y un sistema de theming por tokens con los temas **`noom`** y **`noom-dark`** (sin dependencia de DaisyUI).

---

## Decisiones de Diseño y Arquitectura Aprobadas

1. **Gestor de Paquetes:** `pnpm` exclusivamente (`pnpm install`, `pnpm dev`, `pnpm build`).
2. **Estrategia de Routing:** File-based routing automático mediante `@generouted/solid-router` y `@solidjs/router` en el directorio `src/pages/`.
3. **Esquema de Dominio (DBML de Recordzzz):**
   - Basado en [Recordzzz/docs/schema.dbml](file:///Users/sebastian/Desktop/Proyectos/JSNode/Recordzzz/docs/schema.dbml).
   - **Enums:**
     - `ItemCategory`: `'cd' | 'vinyl' | 'boxset' | 'other'`
     - `ItemStatus`: `'new' | 'openbox' | 'used'`
     - `Currency`: `'EUR' | 'PEN' | 'JPY' | 'USD' | 'CAD' | 'AUD' | 'GBP'`
   - **Entidad `Item`:** `id`, `name`, `categories`, `status`, `price_currency`, `price_amount_cents`, `price_includes_taxes`, `price_tax_amount_cents`, `price_tax_percentage`, `purchase_datetime`, `photo_urls`, `tags`, `created_at`, `updated_at`.
4. **Patrón Ports & Adapters para Almacenamiento:**
   - **Dominio / Ports:** Interfaces puras (`src/ports/item.repository.port.ts`, `src/ports/config.repository.port.ts`, `src/ports/backup.port.ts`).
   - **Adapters:** Implementación concreta con **Dexie.js** (`src/adapters/storage/dexie/`), desacoplando completamente la UI y la lógica de negocio de las tablas de base de datos.
   - **Reactividad:** Hook `useDexieQuery` para convertir `liveQuery` de Dexie en signals de grano fino de SolidJS con limpieza en `onCleanup`.
5. **Theming basado en Tokens (Sin DaisyUI):**
   - Creación de `src/assets/themes/noom.css` (tema claro) y `src/assets/themes/noom-dark.css` (tema oscuro) basados en la paleta verde/obsidiana de [finanzzz/src/app/globals.css](file:///Users/sebastian/Desktop/Proyectos/JSNode/finanzzz/src/app/globals.css) y la estructura de tokens semánticos de [hubbler](file:///Users/sebastian/Desktop/Proyectos/JSNode/hubbler/src/assets/themes).
   - Mapeo nativo en Tailwind CSS v4 con `@theme inline`.
   - Soporte para selector de tema, sincronización con el sistema y programación automática (`autoDarkAt`).
6. **Pipeline de Assets y Brand:**
   - Archivos maestros ubicados en [brand/](file:///Users/sebastian/Desktop/Proyectos/JSNode/Recordzzz/brand):
     - `brand/icon.png`: Icono maestro con fondo.
     - `brand/icon-transparent.png`: Icono transparente para splash screen y favicons.
   - Script `scripts/generate-pwa-assets.ts` con `sharp` para procesar `brand/` y generar:
     - Iconos PWA: 192x192, 512x512, maskable 192/512, apple-touch-icon 180x180.
     - Favicons: `favicon.ico`, `favicon.svg`.
     - Iconos de accesos directos (Shortcuts): `shortcut-new.png`, `shortcut-reports.png`, `shortcut-settings.png`.
     - Splash screens de iOS para todas las resoluciones con degradado Noom.
7. **PWA Completa & Shortcuts:**
   - Web App Manifest con atajos a `/records/new`, `/reports` y `/settings`.
   - Service worker con caché offline generado vía `vite-plugin-pwa`.

---

## Estructura del Proyecto

```
Recordzzz/
├── brand/
│   ├── icon.png                      # Icono maestro con fondo
│   └── icon-transparent.png          # Icono maestro transparente
├── docs/
│   └── schema.dbml                   # Esquema de datos DBML
├── scripts/
│   └── generate-pwa-assets.ts        # Generador de assets PWA con Sharp desde brand/
├── src/
│   ├── assets/
│   │   └── themes/
│   │       ├── noom.css              # Tokens tema Noom (Light)
│   │       └── noom-dark.css         # Tokens tema Noom Dark
│   ├── css/
│   │   └── style.css                 # Tailwind v4, fuentes, tokens @theme, safe-areas
│   ├── domain/                       # Modelos de dominio puros
│   │   ├── types.ts                  # Interfaces Item, Enums, Config
│   │   └── money.ts                  # Helpers para cálculo de montos en centavos y tasas
│   ├── ports/                        # Interfaces y contratos
│   │   ├── item.repository.port.ts
│   │   ├── config.repository.port.ts
│   │   └── backup.port.ts
│   ├── adapters/                     # Implementación de infraestructura
│   │   └── storage/
│   │       └── dexie/
│   │           ├── db.ts             # Instancia Dexie (RecordzzzDB)
│   │           ├── dexie-item.repository.ts
│   │           ├── dexie-config.repository.ts
│   │           ├── dexie-backup.adapter.ts
│   │           └── useDexieQuery.ts  # Bridge reactivo LiveQuery -> SolidJS Signal
│   ├── application/                  # Servicios y Casos de uso
│   │   ├── context.tsx               # Service Provider / Dependency Injection
│   │   ├── item.service.ts
│   │   └── theme.service.ts
│   ├── components/                   # Componentes UI reutilizables
│   │   ├── layout/
│   │   │   ├── AppHeader.tsx
│   │   │   └── BottomNavigation.tsx
│   │   ├── pwa/
│   │   │   ├── PwaUpdatePrompt.tsx
│   │   │   └── InstallPromptBanner.tsx
│   │   └── ui/                       # Componentes base estilizados con tokens
│   │       ├── Button.tsx
│   │       ├── Card.tsx
│   │       ├── Input.tsx
│   │       ├── Select.tsx
│   │       ├── Modal.tsx
│   │       └── Badge.tsx
│   ├── pages/                        # File-based routing (@generouted/solid-router)
│   │   ├── _app.tsx                  # Layout raíz y Shell de la PWA
│   │   ├── 404.tsx                   # Página no encontrada
│   │   ├── index.tsx                 # Dashboard resumen
│   │   ├── records/
│   │   │   ├── index.tsx             # Listado de artículos (filtros por categoría/estado)
│   │   │   ├── new.tsx               # Crear artículo (PWA Shortcut)
│   │   │   └── [id].tsx              # Detalle / Edición de artículo
│   │   ├── reports/
│   │   │   └── index.tsx             # Estadísticas y desglose de colección (PWA Shortcut)
│   │   └── settings/
│   │       └── index.tsx             # Ajustes, temas y backup JSON (PWA Shortcut)
│   ├── main.tsx                      # Punto de entrada de la aplicación
│   └── vite-env.d.ts
├── public/                           # Assets estáticos generados
│   ├── favicon.ico
│   ├── icons/                        # Iconos PWA y shortcuts
│   └── splash/                       # Splash screens iOS
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## Proposed Changes (Paso a Paso)

### 1. Inicialización de Paquetes y Configuración Base

#### [NEW] [package.json](file:///Users/sebastian/Desktop/Proyectos/JSNode/Recordzzz/package.json)
- Configuración con `"name": "recordzzz"`, `"type": "module"`, `"packageManager": "pnpm@11.1.1"`.
- Dependencias:
  - `solid-js` (`^1.9.12`)
  - `@solidjs/router` (`^0.16.1`)
  - `@generouted/solid-router` (`^0.8.0`)
  - `dexie` (`^4.4.2`)
  - `lucide-solid` (`^1.14.0`)
  - `date-fns` (`^4.1.0`)
  - `clsx` (`^2.1.1`), `tailwind-merge` (`^3.5.0`)
- Dependencias de desarrollo:
  - `vite` (`^7.3.1`)
  - `vite-plugin-solid` (`^2.11.12`)
  - `vite-plugin-pwa` (`^1.2.0`)
  - `@tailwindcss/vite` (`^4.2.4`)
  - `tailwindcss` (`^4.2.4`)
  - `sharp` (`^0.33.5`)
  - `tsx` (`^4.19.3`)
  - `typescript` (`~5.9.3`)

#### [NEW] [tsconfig.json](file:///Users/sebastian/Desktop/Proyectos/JSNode/Recordzzz/tsconfig.json)
- Configuración con `jsxImportSource: "solid-js"`, path aliases (`@/*` -> `./src/*`).

#### [NEW] [vite.config.ts](file:///Users/sebastian/Desktop/Proyectos/JSNode/Recordzzz/vite.config.ts)
- Configuración con plugins `tailwindcss()`, `solidPlugin()`, `generouted()`, y `VitePWA()` con atajos PWA y Service Worker.

#### [NEW] [index.html](file:///Users/sebastian/Desktop/Proyectos/JSNode/Recordzzz/index.html)
- Shell HTML con meta tags para PWA, viewport con `viewport-fit=cover`, link a manifest y fonts.

---

### 2. Theming con Tokens Noom & Noom Dark

#### [NEW] [src/assets/themes/noom.css](file:///Users/sebastian/Desktop/Proyectos/JSNode/Recordzzz/src/assets/themes/noom.css)
- Variables CSS para el tema claro verde fresco / menta de Finanzzz.

#### [NEW] [src/assets/themes/noom-dark.css](file:///Users/sebastian/Desktop/Proyectos/JSNode/Recordzzz/src/assets/themes/noom-dark.css)
- Variables CSS para el tema oscuro obsidiana / verde neón.

#### [NEW] [src/css/style.css](file:///Users/sebastian/Desktop/Proyectos/JSNode/Recordzzz/src/css/style.css)
- Configuración de `@import "tailwindcss";`, tokens `@theme inline`, safe-areas, reset de scrollbars y transiciones.

---

### 3. Dominio, Ports y Adapters (Dexie)

#### [NEW] [src/domain/types.ts](file:///Users/sebastian/Desktop/Proyectos/JSNode/Recordzzz/src/domain/types.ts)
- Tipos basados en `schema.dbml`: `ItemCategory`, `ItemStatus`, `Currency`, `Item`, `AppConfig`.

#### [NEW] [src/domain/money.ts](file:///Users/sebastian/Desktop/Proyectos/JSNode/Recordzzz/src/domain/money.ts)
- Utilidades para formateo de moneda (`formatCentsToCurrency`, `centsToDecimal`, `decimalToCents`).

#### [NEW] [src/ports/item.repository.port.ts](file:///Users/sebastian/Desktop/Proyectos/JSNode/Recordzzz/src/ports/item.repository.port.ts)
- Contrato del repositorio de artículos.

#### [NEW] [src/ports/config.repository.port.ts](file:///Users/sebastian/Desktop/Proyectos/JSNode/Recordzzz/src/ports/config.repository.port.ts)
- Contrato para persistencia de configuración de la app.

#### [NEW] [src/ports/backup.port.ts](file:///Users/sebastian/Desktop/Proyectos/JSNode/Recordzzz/src/ports/backup.port.ts)
- Contrato para importación y exportación de datos en JSON.

#### [NEW] [src/adapters/storage/dexie/db.ts](file:///Users/sebastian/Desktop/Proyectos/JSNode/Recordzzz/src/adapters/storage/dexie/db.ts)
- Definición de Dexie (`RecordzzzDB`) con índices para `name`, `status`, `price_currency`, `purchase_datetime`, `*categories`, `*tags`, `created_at`.

#### [NEW] [src/adapters/storage/dexie/dexie-item.repository.ts](file:///Users/sebastian/Desktop/Proyectos/JSNode/Recordzzz/src/adapters/storage/dexie/dexie-item.repository.ts)
- Implementación concreta de `ItemRepositoryPort`.

#### [NEW] [src/adapters/storage/dexie/dexie-config.repository.ts](file:///Users/sebastian/Desktop/Proyectos/JSNode/Recordzzz/src/adapters/storage/dexie/dexie-config.repository.ts)
- Implementación concreta de `ConfigRepositoryPort`.

#### [NEW] [src/adapters/storage/dexie/dexie-backup.adapter.ts](file:///Users/sebastian/Desktop/Proyectos/JSNode/Recordzzz/src/adapters/storage/dexie/dexie-backup.adapter.ts)
- Implementación de `BackupPort`.

#### [NEW] [src/adapters/storage/dexie/useDexieQuery.ts](file:///Users/sebastian/Desktop/Proyectos/JSNode/Recordzzz/src/adapters/storage/dexie/useDexieQuery.ts)
- Adaptador reactivo `useDexieQuery` para SolidJS.

---

### 4. Capa de Aplicación y Contexto

#### [NEW] [src/application/theme.service.ts](file:///Users/sebastian/Desktop/Proyectos/JSNode/Recordzzz/src/application/theme.service.ts)
- Gestión reactiva del tema: `theme`, `themeMode` (`noom` | `noom-dark` | `auto`), `autoDarkAt`, `toggleTheme()`.

#### [NEW] [src/application/context.tsx](file:///Users/sebastian/Desktop/Proyectos/JSNode/Recordzzz/src/application/context.tsx)
- Proveedor de dependencias `AppProvider` y hook `useApp()`.

---

### 5. File-Based Routing & Páginas UI

#### [NEW] [src/pages/_app.tsx](file:///Users/sebastian/Desktop/Proyectos/JSNode/Recordzzz/src/pages/_app.tsx)
- Shell principal: `AppProvider`, `AppHeader`, área de contenido con scroll suave, `BottomNavigation`, y `PwaUpdatePrompt`.

#### [NEW] [src/pages/index.tsx](file:///Users/sebastian/Desktop/Proyectos/JSNode/Recordzzz/src/pages/index.tsx)
- Dashboard principal: estadísticas de colección (total artículos, valor total por moneda, desglose por categoría CD/Vinyl/Boxset), accesos rápidos y últimos artículos agregados.

#### [NEW] [src/pages/records/index.tsx](file:///Users/sebastian/Desktop/Proyectos/JSNode/Recordzzz/src/pages/records/index.tsx)
- Vista completa de artículos con barra de búsqueda, chips de filtrado por categoría (`cd`, `vinyl`, `boxset`, `other`) y estado (`new`, `openbox`, `used`).

#### [NEW] [src/pages/records/new.tsx](file:///Users/sebastian/Desktop/Proyectos/JSNode/Recordzzz/src/pages/records/new.tsx)
- Formulario de creación rápida (PWA Shortcut) con campos tipados: nombre, categorías múltiples, estado, moneda, monto en centavos, impuestos, fecha de compra y tags.

#### [NEW] [src/pages/records/[id].tsx](file:///Users/sebastian/Desktop/Proyectos/JSNode/Recordzzz/src/pages/records/[id].tsx)
- Detalle y edición del artículo con soporte para eliminar y actualizar.

#### [NEW] [src/pages/reports/index.tsx](file:///Users/sebastian/Desktop/Proyectos/JSNode/Recordzzz/src/pages/reports/index.tsx)
- Gráficos y métricas de valor de colección, distribución por categorías y estados (PWA Shortcut).

#### [NEW] [src/pages/settings/index.tsx](file:///Users/sebastian/Desktop/Proyectos/JSNode/Recordzzz/src/pages/settings/index.tsx)
- Selector de tema (`Noom`, `Noom Dark`, `Automático`), programador de hora de cambio oscuro, exportar/importar backup JSON de la base de datos (PWA Shortcut).

---

### 6. Pipeline de Assets desde brand/

#### [NEW] [scripts/generate-pwa-assets.ts](file:///Users/sebastian/Desktop/Proyectos/JSNode/Recordzzz/scripts/generate-pwa-assets.ts)
- Script en TypeScript que lee [brand/icon.png](file:///Users/sebastian/Desktop/Proyectos/JSNode/Recordzzz/brand/icon.png) e [brand/icon-transparent.png](file:///Users/sebastian/Desktop/Proyectos/JSNode/Recordzzz/brand/icon-transparent.png) para generar:
  - `public/favicon.ico`, `public/favicon.png`
  - `public/icons/icon-192.png`, `public/icons/icon-512.png`
  - `public/icons/icon-192-maskable.png`, `public/icons/icon-512-maskable.png`
  - `public/icons/apple-touch-icon.png` (180x180)
  - `public/icons/shortcut-new.png`, `public/icons/shortcut-reports.png`, `public/icons/shortcut-settings.png`
  - `public/splash/apple-*.png` (todas las resoluciones de pantalla iOS con degradado Noom).

---

## Verification Plan

### Automated Verification
```bash
# 1. Instalar dependencias con pnpm
pnpm install

# 2. Generar todos los assets PWA (iconos, splash screens, shortcuts) desde brand/
pnpm run generate:assets

# 3. Validar tipado TypeScript
pnpm run typecheck

# 4. Validar build de producción con Vite
pnpm run build
```

### Manual Verification
- Iniciar `pnpm run dev` y navegar por las rutas generadas automáticamente por `@generouted/solid-router`.
- Probar el formulario de nuevo registro (`/records/new`), crear varios artículos (CD, Vinyl, Boxset) con diferentes monedas y verificar que se persistan en Dexie y aparezcan reactivamente en el Dashboard y la lista.
- Cambiar entre temas `Noom` y `Noom Dark` y verificar la aplicación de tokens.
- Probar la exportación de backup JSON e importación.
- Verificar el Web App Manifest y sus accesos directos (Shortcuts) en Chrome DevTools.
