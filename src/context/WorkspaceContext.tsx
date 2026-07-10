import React, {
  createContext,
  useContext,
  useState,
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
  const [modeState, setModeState] = useState<WorkspaceMode>(() => {
    // Якщо в URL є слово investments — це залізно investments
    if (location.pathname.includes("/investments")) {
      return "investments";
    }
    // Інакше беремо з пам'яті або дефолт
    const saved = localStorage.getItem("app_mode");
    return saved === "finance" || saved === "investments" ? saved : "finance";
  });

  const mode = React.useMemo<WorkspaceMode>(() => {
    if (location.pathname.includes("/investments")) {
      return !isLoading && isStartupper ? "finance" : "investments";
    }

    if (!location.pathname.includes("/settings")) {
      return "finance";
    }

    if (!isLoading && isStartupper && modeState === "investments") {
      return "finance";
    }

    return modeState;
  }, [isLoading, isStartupper, location.pathname, modeState]);

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

// eslint-disable-next-line react-refresh/only-export-components
export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error("useWorkspace must be used within a WorkspaceProvider");
  }
  return context;
};
