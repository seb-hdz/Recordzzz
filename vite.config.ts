import { resolve } from "node:path";
import { defineConfig } from "vite";
import solidPlugin from "vite-plugin-solid";
import tailwindcss from "@tailwindcss/vite";
import generouted from "@generouted/solid-router/plugin";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    tailwindcss(),
    solidPlugin(),
    generouted(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: [
        "favicon.ico",
        "favicon.svg",
        "icons/*.png",
        "splash/*.png",
      ],
      manifest: {
        name: "Recordzzz",
        short_name: "Recordzzz",
        description: "Gestión y catálogo de colección de grabaciones y medios físicos",
        start_url: "/",
        scope: "/",
        display: "standalone",
        orientation: "portrait-primary",
        background_color: "#0F180F",
        theme_color: "#429D51",
        launch_handler: {
          client_mode: ["navigate-existing", "auto"],
        },
        icons: [
          {
            src: "/icons/icon-192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/icons/icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/icons/icon-192-maskable.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "maskable",
          },
          {
            src: "/icons/icon-512-maskable.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
        shortcuts: [
          {
            name: "Nuevo registro",
            short_name: "Nuevo",
            description: "Registra un nuevo artículo en la colección",
            url: "/records/new",
            icons: [
              {
                src: "/icons/shortcut-new.png",
                sizes: "192x192",
                type: "image/png",
              },
            ],
          },
          {
            name: "Reportes",
            short_name: "Reportes",
            description: "Visualiza estadísticas de tu colección",
            url: "/reports",
            icons: [
              {
                src: "/icons/shortcut-reports.png",
                sizes: "192x192",
                type: "image/png",
              },
            ],
          },
          {
            name: "Ajustes",
            short_name: "Ajustes",
            description: "Configura temas y copias de seguridad",
            url: "/settings",
            icons: [
              {
                src: "/icons/shortcut-settings.png",
                sizes: "192x192",
                type: "image/png",
              },
            ],
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,webp,woff2,ttf}"],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 3000,
    host: true,
  },
  build: {
    target: "esnext",
    minify: "esbuild",
  },
});
