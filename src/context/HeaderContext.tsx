import { createContext, useContext, useState, type ReactNode } from "react";

interface HeaderContextType {
  title: string;
  subtitle: string;
  setPageTitle: (title: string, subtitle?: string) => void;
  resetPageTitle: () => void;
}

const HeaderContext = createContext<HeaderContextType | undefined>(undefined);

export const HeaderProvider = ({ children }: { children: ReactNode }) => {
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");

  const setPageTitle = (newTitle: string, newSubtitle: string = "") => {
    setTitle(newTitle);
    setSubtitle(newSubtitle);
  };

  const resetPageTitle = () => {
    setTitle("");
    setSubtitle("");
  };

  return (
    <HeaderContext.Provider
      value={{ title, subtitle, setPageTitle, resetPageTitle }}
    >
      {children}
    </HeaderContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useHeader = () => {
  const context = useContext(HeaderContext);
  if (!context) {
    throw new Error("useHeader must be used within a HeaderProvider");
  }
  return context;
};
