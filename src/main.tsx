import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { registerSW } from "virtual:pwa-register";

// Реєстрація Service Worker для PWA
registerSW({ immediate: true });

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found");
}

const root = createRoot(rootElement);

Promise.all([import("./i18n.ts"), import("./App.tsx")])
  .then(([, { default: App }]) => {
    root.render(
      <StrictMode>
        <App />
      </StrictMode>,
    );
  })
  .catch((error) => {
    console.error("Application bootstrap failed", error);

    const bootstrapElement = document.getElementById("app-bootstrap");
    if (bootstrapElement) {
      bootstrapElement.innerHTML = `
        <div class="bootstrap-card">
          <div class="bootstrap-text">
            <div class="bootstrap-title">Не вдалося завантажити застосунок</div>
            <div class="bootstrap-subtitle">Оновіть сторінку та спробуйте ще раз.</div>
          </div>
        </div>
      `;
    }
  });
