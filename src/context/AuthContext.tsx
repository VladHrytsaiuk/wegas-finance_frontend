import { createContext, useContext, useState, ReactNode } from "react";

interface AuthContextType {
  isUnlocked: boolean;
  unlock: () => void;
  lock: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  // Повертаємо sessionStorage: він переживає перезавантаження (це лікує баг симулятора),
  // але очищується при закритті вкладки/додатка (це важливо для безпеки).
  const [isUnlocked, setIsUnlocked] = useState(() => {
    return sessionStorage.getItem("is_unlocked") === "true";
  });

  const unlock = () => {
    setIsUnlocked(true);
    sessionStorage.setItem("is_unlocked", "true");
  };

  const lock = () => {
    setIsUnlocked(false);
    sessionStorage.removeItem("is_unlocked");
  };

  return (
    <AuthContext.Provider value={{ isUnlocked, unlock, lock }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
