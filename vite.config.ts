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
      includeAssets: ["favicon.svg", "Logo.svg", "Logo_full.svg", "apple-icon-180.png", "icon-512.png"],
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
            src: "apple-icon-180.png?v=2",
            sizes: "180x180",
            type: "image/png",
          },
          {
            src: "icon-512.png?v=2",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "icon-512.png?v=2",
            sizes: "512x512",
            type: "image/png",
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
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return undefined;

          if (
            id.includes("/react/") ||
            id.includes("/react-dom/") ||
            id.includes("/scheduler/")
          ) {
            return "react-vendors";
          }

          if (id.includes("/react-router/") || id.includes("/react-router-dom/")) {
            return "router-vendors";
          }

          if (
            id.includes("@tanstack/react-query") ||
            id.includes("@tanstack/query-core")
          ) {
            return "query-vendors";
          }

          if (
            id.includes("/i18next/") ||
            id.includes("/react-i18next/") ||
            id.includes("/i18next-browser-languagedetector/")
          ) {
            return "i18n-vendors";
          }

          if (
            id.includes("/styled-components/")
          ) {
            return "styled-vendors";
          }

          if (id.includes("/react-icons/")) {
            return "icon-vendors";
          }

          if (id.includes("/react-hot-toast/")) {
            return "ui-vendors";
          }

          if (
            id.includes("exceljs")
          ) {
            return "excel-vendors";
          }

          if (
            id.includes("jspdf") ||
            id.includes("jspdf-autotable")
          ) {
            return "pdf-vendors";
          }

          if (id.includes("file-saver")) {
            return "export-vendors";
          }

          if (id.includes("recharts")) {
            return "chart-vendors";
          }

          if (id.includes("react-grid-layout") || id.includes("react-resizable")) {
            return "dashboard-vendors";
          }

          return undefined;
        },
      },
    },
  },
});
