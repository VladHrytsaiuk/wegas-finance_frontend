import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { AxiosError } from "axios";
import { useTranslation } from "react-i18next";
import { settingsService, type AppSettings } from "../services/apiSettings";
import { useTheme } from "./ThemeContext";

interface ErrorResponse {
  error?: string;
}

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
  const token = localStorage.getItem("token");

  // Дефолтні налаштування (поки не завантажили з БД)
  const [settings, setSettingsState] = useState<AppSettings>({
    base_currency: "UAH",
    language: (i18n.resolvedLanguage || i18n.language || "uk").split("-")[0],
    theme: "light",
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setIsLoading(false);
      return;
    }

    const load = async () => {
      try {
        const data = await settingsService.getSettings();
        // Normalize language from backend
        const normalizedLanguage = data.language?.split("-")[0] || "uk";
        const normalizedData = { ...data, language: normalizedLanguage };

        setSettingsState(normalizedData);

        // 1. Синхронізуємо мову
        if (normalizedLanguage !== i18n.language) {
          i18n.changeLanguage(normalizedLanguage);
        }

        // 2. Синхронізуємо тему
        if (data.theme) {
          setTheme(data.theme as "light" | "dark");
        }
      } catch (error) {
        const axiosError = error as AxiosError<ErrorResponse>;

        if (axiosError.response?.status === 401) {
          console.log("User not logged in, using default settings");
        } else {
          console.error("Failed to load settings:", axiosError);
        }
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [i18n, setTheme, token]); // Додав залежності для лінтера

  // Функція збереження
  const updateSettings = useCallback(
    async (newData: Partial<AppSettings>) => {
      const previousSettings = settings;
      const updated = { ...settings, ...newData };

      setSettingsState(updated);

      if (newData.language && newData.language !== i18n.language) {
        await i18n.changeLanguage(newData.language);
      }

      if (newData.theme) {
        setTheme(newData.theme as "light" | "dark");
      }

      try {
        await settingsService.saveSettings(updated);
      } catch (error) {
        console.error("Error saving settings:", error);
        setSettingsState(previousSettings);

        if (
          newData.language &&
          previousSettings.language !== i18n.language
        ) {
          await i18n.changeLanguage(previousSettings.language);
        }

        if (newData.theme) {
          setTheme(previousSettings.theme as "light" | "dark");
        }

        throw error;
      }
    },
    [i18n, setTheme, settings],
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

// eslint-disable-next-line react-refresh/only-export-components
export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
};
