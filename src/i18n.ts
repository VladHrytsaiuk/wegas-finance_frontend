import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// 1. Імпорт перекладів
import translationEN from "./locales/en/translation.json";
import translationUK from "./locales/uk/translation.json";

const resources = {
  en: { translation: translationEN },
  uk: { translation: translationUK },
};

i18n
  .use(LanguageDetector) // 2. Визначення мови (бере з браузера або LocalStorage)
  .use(initReactI18next) // 3. Підключення до React
  .init({
    resources,
    lng: undefined, // Мова за замовчуванням (якщо детектор не спрацював)
    fallbackLng: "uk", // Якщо перекладу немає, повертаємось до української
    keySeparator: ".", // Використовуємо . для доступу до ключів (наприклад: general.dashboard)

    interpolation: {
      escapeValue: false, // React вже екранує, не потрібно робити це двічі
    },

    detection: {
      // Дозволяє збереження мови у LocalStorage
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
      lookupLocalStorage: "i18nextLng",
    },
  });

export default i18n;
