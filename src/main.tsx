import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { registerSW } from "virtual:pwa-register";

const BOOT_HANG_TIMEOUT_MS = 12000;

function isStandalonePwa() {
  return (
    window.matchMedia?.("(display-mode: standalone)")?.matches === true ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

async function resetPwaStateAndReload() {
  try {
    if ("serviceWorker" in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map((registration) => registration.unregister()));
    }

    if ("caches" in window) {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map((cacheName) => caches.delete(cacheName)));
    }
  } catch (error) {
    console.error("Failed to reset PWA state", error);
  } finally {
    window.location.reload();
  }
}

function renderBootstrapError(options?: { allowCacheReset?: boolean }) {
  const bootstrapElement = document.getElementById("app-bootstrap");
  if (!bootstrapElement) return;

  bootstrapElement.classList.remove("is-hidden");
  bootstrapElement.innerHTML = `
    <div class="bootstrap-card">
      <div class="bootstrap-text">
        <div class="bootstrap-title">Застосунок не зміг запуститися</div>
        <div class="bootstrap-subtitle">
          Перевір з'єднання та спробуй перезапуск. На iPhone PWA також може допомогти очищення кешу застосунку.
        </div>
      </div>
      <div style="display:flex;gap:12px;flex-wrap:wrap;margin-top:8px;">
        <button id="bootstrap-retry" style="border:none;border-radius:999px;padding:12px 18px;background:#111827;color:#fff;font:inherit;cursor:pointer;">
          Перезапустити
        </button>
        ${
          options?.allowCacheReset
            ? '<button id="bootstrap-reset" style="border:1px solid rgba(17,24,39,.12);border-radius:999px;padding:12px 18px;background:#fff;color:#111827;font:inherit;cursor:pointer;">Очистити кеш</button>'
            : ""
        }
      </div>
    </div>
  `;

  document.getElementById("bootstrap-retry")?.addEventListener("click", () => {
    window.location.reload();
  });

  document.getElementById("bootstrap-reset")?.addEventListener("click", () => {
    void resetPwaStateAndReload();
  });
}

window.addEventListener("vite:preloadError", (event) => {
  event.preventDefault();
  window.location.reload();
});

if (import.meta.env.DEV && "serviceWorker" in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    registrations.forEach((registration) => {
      registration.unregister().catch(() => undefined);
    });
  });
} else {
  const updateSW = registerSW({
    immediate: true,
    onNeedRefresh() {
      updateSW(true);
    },
  });
}

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found");
}

const root = createRoot(rootElement);
const bootHangTimer = window.setTimeout(() => {
  renderBootstrapError({ allowCacheReset: isStandalonePwa() });
}, BOOT_HANG_TIMEOUT_MS);

window.addEventListener(
  "app:ready",
  () => {
    window.clearTimeout(bootHangTimer);
  },
  { once: true },
);

Promise.all([import("./i18n.ts"), import("./App.tsx")])
  .then(([, { default: App }]) => {
    root.render(
      <StrictMode>
        <App />
      </StrictMode>,
    );
  })
  .catch((error) => {
    window.clearTimeout(bootHangTimer);
    console.error("Application bootstrap failed", error);
    renderBootstrapError({ allowCacheReset: isStandalonePwa() });
  });
