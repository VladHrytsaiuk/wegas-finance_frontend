import React, { useCallback, useMemo, useTransition } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";

import { useTheme } from "../../context/ThemeContext";
import { useSettings } from "../../context/SettingsContext";
import { useSeedData } from "../useSeedData";
import { CurrencySymbol } from "../../components/ui/CurrencySymbol";

// --- Components ---

const UKFlag = () => (
  <svg
    width="18"
    height="14"
    viewBox="0 0 20 15"
    style={{ borderRadius: "2px", display: "block" }}
  >
    <rect width="20" height="15" fill="#012169" />
    <path d="M0 0l20 15M20 0L0 15" stroke="#fff" strokeWidth="3" />
    <path d="M0 0l20 15M20 0L0 15" stroke="#C8102E" strokeWidth="2" />
    <path d="M10 0v15M0 7.5h20" stroke="#fff" strokeWidth="5" />
    <path d="M10 0v15M0 7.5h20" stroke="#C8102E" strokeWidth="3" />
  </svg>
);

const UAFlag = () => (
  <svg
    width="18"
    height="14"
    viewBox="0 0 20 15"
    style={{ borderRadius: "2px", display: "block" }}
  >
    <rect width="20" height="7.5" fill="#0057B7" />
    <rect y="7.5" width="20" height="7.5" fill="#FFD700" />
  </svg>
);

interface OptionType {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

export const useGeneralSettings = () => {
  const { t, i18n } = useTranslation();
  const { seed, isSeeding } = useSeedData();
  const { theme, toggleTheme } = useTheme();
  const [isPending, startTransition] = useTransition();

  const {
    currency = "UAH",
    updateSettings,
    isLoading,
  } = useSettings() || {};

  // --- Options ---

  const currencyOptions: OptionType[] = useMemo(
    () => [
      {
        value: "UAH",
        label: t("common:currencies.uah", "Українська гривня"),
        icon: <CurrencySymbol symbol="₴" size="20px" />,
      },
      {
        value: "USD",
        label: t("common:currencies.usd", "Долар США"),
        icon: <CurrencySymbol symbol="$" size="20px" />,
      },
      {
        value: "EUR",
        label: t("common:currencies.eur", "Євро"),
        icon: <CurrencySymbol symbol="€" size="20px" />,
      },
    ],
    [t],
  );

  const languageOptions: OptionType[] = useMemo(
    () => [
      {
        value: "uk",
        label: t("common:languages.uk", "Українська"),
        icon: <UAFlag />,
      },
      {
        value: "en",
        label: t("common:languages.en", "English"),
        icon: <UKFlag />,
      },
    ],
    [t],
  );

  // --- Auto-Save Actions ---

  const handleUpdate = useCallback(
    async (updates: {
      base_currency?: string;
      language?: string;
      theme?: string;
    }) => {
      if (!updateSettings) return;

      // Wrap in transition to prevent UI "jumping" or "blocking"
      startTransition(() => {
        const savePromise = updateSettings(updates);

        toast.promise(savePromise, {
          loading: t("settings:settingsPage.toast_loading", "Збереження..."),
          success: t(
            "settings:settingsPage.toast_success",
            "Налаштування збережено!",
          ),
          error: t("settings:settingsPage.toast_error", "Помилка збереження"),
        });
      });
    },
    [updateSettings, t],
  );

  const setLocalCurrency = useCallback(
    (val: string) => {
      if (val === currency) return;
      handleUpdate({ base_currency: val });
    },
    [currency, handleUpdate],
  );

  const setLocalLanguage = useCallback(
    (val: string) => {
      if (val === i18n.language) return;
      handleUpdate({ language: val });
    },
    [i18n.language, handleUpdate],
  );

  const handleToggleTheme = useCallback(() => {
    const newTheme = theme === "light" ? "dark" : "light";
    toggleTheme();
    handleUpdate({ theme: newTheme });
  }, [theme, toggleTheme, handleUpdate]);

  return {
    state: {
      localCurrency: currency,
      localLanguage: i18n.language,
      theme,
      isLoading,
      isPending,
      isSeeding,
      currencyOptions,
      languageOptions,
    },
    actions: {
      setLocalCurrency,
      setLocalLanguage,
      toggleTheme: handleToggleTheme,
      seedData: seed,
    },
    t,
  };
};
