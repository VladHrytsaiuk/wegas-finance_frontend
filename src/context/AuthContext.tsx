import { createContext, useContext, useState, ReactNode } from "react";

interface AuthContextType {
  isUnlocked: boolean;
  unlock: () => void;
  lock: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  // We use useState(false) to ensure the PIN is requested every time the app is loaded/refreshed.
  // Using sessionStorage would persist the unlock state as long as the tab is open.
  const [isUnlocked, setIsUnlocked] = useState(false);

  const unlock = () => {
    setIsUnlocked(true);
  };

  const lock = () => {
    setIsUnlocked(false);
  };

  return (
    <AuthContext.Provider value={{ isUnlocked, unlock, lock }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
