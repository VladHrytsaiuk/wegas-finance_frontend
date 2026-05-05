import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
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
