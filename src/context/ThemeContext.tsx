import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void; // ⬅️ 1. ДОДАЛИ ТИП ФУНКЦІЇ
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// ➡️ ФУНКЦІЯ ДЛЯ СИНХРОННОЇ ІНІЦІАЛІЗАЦІЇ (Твій правильний код)
const getInitialTheme = (): Theme => {
  const savedTheme = localStorage.getItem("app-theme") as Theme;
  if (savedTheme) {
    document.documentElement.setAttribute("data-theme", savedTheme);
    return savedTheme;
  }

  const systemPrefersDark = window.matchMedia(
    "(prefers-color-scheme: dark)"
  ).matches;
  const initialTheme: Theme = systemPrefersDark ? "dark" : "light";

  document.documentElement.setAttribute("data-theme", initialTheme);

  return initialTheme;
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Тут ти вже маєш setTheme, його просто треба передати вниз!
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("app-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    // ⬅️ 2. ПЕРЕДАЄМО setTheme У VALUE
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
