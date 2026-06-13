import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      devOptions: {
        enabled: true // Дозволяє тестувати PWA на localhost під час розробки
      },
      includeAssets: ["favicon.svg", "Logo.svg", "Logo_full.svg", "favicon_phone.png"],
      manifest: {
        name: "FERP Finance System",
        short_name: "FERP",
        description: "Financial Enterprise Resource Planning System",
        theme_color: "#ffffff",
        background_color: "#ffffff",
        display: "standalone",
        orientation: "portrait",
        scope: "/",
        start_url: "/",
        icons: [
          {
            src: "favicon_phone.png?v=1",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "favicon_phone.png?v=1",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "Logo.svg?v=1",
            sizes: "512x512",
            type: "image/svg+xml",
            purpose: "any maskable",
          },
        ],
      },
    }),
  ],
  server: {
    // 👇 ДОДАЙТЕ ЦЕЙ БЛОК
    proxy: {
      "/uploads": {
        target: "http://localhost:8080", // Адреса вашого Go сервера
        changeOrigin: true,
      },
      // Якщо у вас API теж на 8080, можна і його проксувати:
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
      },
    },
    // 👆 КІНЕЦЬ БЛОКУ
  },
});
