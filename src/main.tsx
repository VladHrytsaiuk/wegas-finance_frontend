import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { registerSW } from "virtual:pwa-register";

import "./i18n.ts"; // ⬅️ Імпортуємо конфігурацію, щоб вона спрацювала

// Реєстрація Service Worker для PWA
registerSW({ immediate: true });

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
