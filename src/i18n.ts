import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// Import modular translations
import commonEN from "./locales/en/common.json";
import commonUK from "./locales/uk/common.json";
import navigationEN from "./locales/en/navigation.json";
import navigationUK from "./locales/uk/navigation.json";
import authEN from "./locales/en/auth.json";
import authUK from "./locales/uk/auth.json";
import dashboardEN from "./locales/en/dashboard.json";
import dashboardUK from "./locales/uk/dashboard.json";
import accountsEN from "./locales/en/accounts.json";
import accountsUK from "./locales/uk/accounts.json";
import transactionsEN from "./locales/en/transactions.json";
import transactionsUK from "./locales/uk/transactions.json";
import assetsEN from "./locales/en/assets.json";
import assetsUK from "./locales/uk/assets.json";
import categoriesEN from "./locales/en/categories.json";
import categoriesUK from "./locales/uk/categories.json";
import counterpartiesEN from "./locales/en/counterparties.json";
import counterpartiesUK from "./locales/uk/counterparties.json";
import goalsDebtsEN from "./locales/en/goals_debts.json";
import goalsDebtsUK from "./locales/uk/goals_debts.json";
import settingsEN from "./locales/en/settings.json";
import settingsUK from "./locales/uk/settings.json";
import exportImportEN from "./locales/en/export_import.json";
import exportImportUK from "./locales/uk/export_import.json";
import shoppingWishlistEN from "./locales/en/shopping_wishlist.json";
import shoppingWishlistUK from "./locales/uk/shopping_wishlist.json";
import statsUtilityEN from "./locales/en/stats_utility.json";
import statsUtilityUK from "./locales/uk/stats_utility.json";
import legacyEN from "./locales/en/legacy.json";
import legacyUK from "./locales/uk/legacy.json";

const resources = {
  en: {
    common: commonEN,
    navigation: navigationEN,
    auth: authEN,
    dashboard: dashboardEN,
    accounts: accountsEN,
    transactions: transactionsEN,
    assets: assetsEN,
    categories: categoriesEN,
    counterparties: counterpartiesEN,
    goals_debts: goalsDebtsEN,
    settings: settingsEN,
    export_import: exportImportEN,
    shopping_wishlist: shoppingWishlistEN,
    stats_utility: statsUtilityEN,
    legacy: legacyEN,
  },
  uk: {
    common: commonUK,
    navigation: navigationUK,
    auth: authUK,
    dashboard: dashboardUK,
    accounts: accountsUK,
    transactions: transactionsUK,
    assets: assetsUK,
    categories: categoriesUK,
    counterparties: counterpartiesUK,
    goals_debts: goalsDebtsUK,
    settings: settingsUK,
    export_import: exportImportUK,
    shopping_wishlist: shoppingWishlistUK,
    stats_utility: statsUtilityUK,
    legacy: legacyUK,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "uk",
    defaultNS: "common",
    ns: [
      "common",
      "navigation",
      "auth",
      "dashboard",
      "accounts",
      "transactions",
      "assets",
      "categories",
      "counterparties",
      "goals_debts",
      "settings",
      "export_import",
      "shopping_wishlist",
      "stats_utility",
      "legacy",
    ],
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
      lookupLocalStorage: "i18nextLng",
    },
  });

export default i18n;
