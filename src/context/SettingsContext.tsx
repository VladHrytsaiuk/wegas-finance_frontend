import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query"; // ⬅️ 1. Імпорт
import { settingsService, type AppSettings } from "../services/apiSettings";
import { useTheme } from "./ThemeContext";

interface SettingsContextType {
  currency: string;
  language: string;
  theme: string;
  isLoading: boolean;
  updateSettings: (newSettings: Partial<AppSettings>) => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined,
);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { i18n } = useTranslation();
  const { setTheme } = useTheme();
  const queryClient = useQueryClient(); // ⬅️ 2. Ініціалізація клієнта

  // Дефолтні налаштування (поки не завантажили з БД)
  const [settings, setSettingsState] = useState<AppSettings>({
    base_currency: "UAH",
    language: i18n.language || "uk", // Якщо i18n вже визначив мову (з localStorage), беремо її
    theme: "light",
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await settingsService.getSettings();
        setSettingsState(data);

        // 1. Синхронізуємо мову
        if (data.language && data.language !== i18n.language) {
          i18n.changeLanguage(data.language);
        }

        // 2. Синхронізуємо тему
        if (data.theme) {
          setTheme(data.theme as "light" | "dark");
        }
      } catch (error: any) {
        if (error.response?.status === 401) {
          console.log("User not logged in, using default settings");
        } else {
          console.error("Failed to load settings:", error);
        }
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [i18n, setTheme]); // Додав залежності для лінтера

  // Функція збереження
  const updateSettings = useCallback(
    async (newData: Partial<AppSettings>) => {
      let updated: AppSettings;

      // Оновлюємо стейт оптимістично (щоб UI відреагував миттєво)
      setSettingsState((prev) => {
        updated = { ...prev, ...newData };

        // side effects
        if (newData.language && newData.language !== i18n.language) {
          i18n.changeLanguage(newData.language);
        }
        if (newData.theme) {
          setTheme(newData.theme as "light" | "dark");
        }

        // save to backend
        settingsService.saveSettings(updated).catch((err) => {
          console.error("Error saving settings:", err);
        });

        return updated;
      });

      // 🔥 3. ГОЛОВНЕ ВИПРАВЛЕННЯ:
      // Скидаємо весь кеш React Query.
      await queryClient.invalidateQueries();
    },
    [i18n, queryClient, setTheme],
  );

  const value = React.useMemo(
    () => ({
      currency: settings.base_currency,
      language: settings.language,
      theme: settings.theme,
      isLoading,
      updateSettings,
    }),
    [
      settings.base_currency,
      settings.language,
      settings.theme,
      isLoading,
      updateSettings,
    ],
  );

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
};
