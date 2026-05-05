import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useLocation } from "react-router-dom"; // 👈 Додано
import { useUserRole } from "../hooks/useUserRole";

export type WorkspaceMode = "finance" | "investments";

interface WorkspaceContextType {
  mode: WorkspaceMode;
  setMode: (mode: WorkspaceMode) => void;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(
  undefined,
);

export const WorkspaceProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { isStartupper, isLoading } = useUserRole(); // 👈 Обов'язково беремо isLoading
  const location = useLocation();

  // 1. Ініціалізація (Правильна)
  const [mode, setModeState] = useState<WorkspaceMode>(() => {
    // Якщо в URL є слово investments — це залізно investments
    if (location.pathname.includes("/investments")) {
      return "investments";
    }
    // Інакше беремо з пам'яті або дефолт
    const saved = localStorage.getItem("app_mode");
    return saved === "finance" || saved === "investments" ? saved : "finance";
  });

  // 2. Слідкуємо за URL (щоб кнопка "Назад" в браузері теж перемикала світчер)
  useEffect(() => {
    if (location.pathname.includes("/investments")) {
      setModeState("investments");
    } else if (
      !location.pathname.includes("/investments") &&
      !location.pathname.includes("/settings") // Налаштування спільні, не чіпаємо
    ) {
      setModeState("finance");
    }
  }, [location.pathname]);

  // 3. Захист від дітей (ТІЛЬКИ КОЛИ ЗАВАНТАЖИЛОСЬ)
  useEffect(() => {
    if (!isLoading && isStartupper && mode === "investments") {
      setModeState("finance");
    }
  }, [isStartupper, mode, isLoading]);

  const setMode = useCallback((newMode: WorkspaceMode) => {
    setModeState(newMode);
    localStorage.setItem("app_mode", newMode);
  }, []);

  const value = React.useMemo(() => ({ mode, setMode }), [mode, setMode]);

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error("useWorkspace must be used within a WorkspaceProvider");
  }
  return context;
};
