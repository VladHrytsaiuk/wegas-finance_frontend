import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import {
  HiOutlineCurrencyDollar,
  HiOutlineCurrencyEuro,
  HiBanknotes,
  HiGlobeAlt,
} from "react-icons/hi2";

import { useTheme } from "../../context/ThemeContext";
import { useSettings } from "../../context/SettingsContext";
import { useSeedData } from "../useSeedData";

interface OptionType {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

export const useGeneralSettings = () => {
  // 👇 1. Дістаємо i18n з хука
  const { t, i18n } = useTranslation();
  const { seed, isSeeding } = useSeedData();
  const { theme, toggleTheme } = useTheme();

  const {
    currency = "UAH",
    language, // Тут може прийти "uk" з дефолтного стейту контексту
    updateSettings,
    isLoading,
  } = useSettings() || {};

  const [localCurrency, setLocalCurrency] = useState<string>(currency);

  // 👇 2. Ініціалізуємо локальний стейт тим, що ЗАРАЗ включено в i18n
  // Це гарантує, що випадалка покаже те, що юзер бачить очима
  const [localLanguage, setLocalLanguage] = useState<string>(i18n.language);

  useEffect(() => {
    // Синхронізуємо тільки коли дані реально завантажились
    if (!isLoading) {
      if (currency) setLocalCurrency(currency);
      // Якщо з бекенда прийшла мова, і вона відрізняється — оновлюємо,
      // але пріоритет при старті краще віддати i18n у useState вище
      if (language) setLocalLanguage(language);
    }
  }, [currency, language, isLoading]);

  // 👇 3. Додатковий ефект: якщо i18n змінився ззовні, підтягуємо випадалку
  useEffect(() => {
    setLocalLanguage(i18n.language);
  }, [i18n.language]);

  const currencyOptions: OptionType[] = [
    {
      value: "UAH",
      label: "Українська гривня (₴)",
      icon: <HiBanknotes size={18} />,
    },
    {
      value: "USD",
      label: "Долар США ($)",
      icon: <HiOutlineCurrencyDollar size={18} />,
    },
    {
      value: "EUR",
      label: "Євро (€)",
      icon: <HiOutlineCurrencyEuro size={18} />,
    },
  ];

  const languageOptions: OptionType[] = [
    { value: "uk", label: "🇺🇦 Українська", icon: <HiGlobeAlt size={18} /> },
    { value: "en", label: "🇺🇸 English", icon: <HiGlobeAlt size={18} /> },
  ];

  const handleSave = async () => {
    if (!updateSettings) return;

    const savePromise = updateSettings({
      base_currency: localCurrency,
      language: localLanguage,
      theme: theme,
    });

    toast.promise(savePromise, {
      loading: t("settings:settingsPage.toast_loading", "Збереження..."),
      success: t("settings:settingsPage.toast_success", "Налаштування збережено!"),
      error: t("settings:settingsPage.toast_error", "Помилка збереження"),
    });
  };

  return {
    state: {
      localCurrency,
      localLanguage,
      theme,
      isLoading,
      isSeeding,
      currencyOptions,
      languageOptions,
    },
    actions: {
      setLocalCurrency,
      setLocalLanguage,
      toggleTheme,
      handleSave,
      seedData: seed,
    },
    t,
  };
};
