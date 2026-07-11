import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type BootstrapStage = "bootstrap" | "auth" | "resources" | "hidden";

interface BootstrapContextValue {
  stage: BootstrapStage;
  setStage: (stage: BootstrapStage) => void;
}

const BootstrapContext = createContext<BootstrapContextValue | undefined>(
  undefined,
);

const STAGE_COPY: Record<
  Exclude<BootstrapStage, "hidden">,
  { title: string; subtitle: string }
> = {
  bootstrap: {
    title: "Завантаження застосунку",
    subtitle: "Підтягуємо інтерфейс, налаштування та дані сесії.",
  },
  auth: {
    title: "Перевірка авторизації",
    subtitle: "Підтверджуємо сесію та права доступу.",
  },
  resources: {
    title: "Завантаження ресурсів",
    subtitle: "Готуємо сторінку, модулі та потрібні дані інтерфейсу.",
  },
};

export function BootstrapProvider({ children }: { children: ReactNode }) {
  const [stage, setStage] = useState<BootstrapStage>("bootstrap");

  useEffect(() => {
    const bootstrapElement = document.getElementById("app-bootstrap");
    if (!bootstrapElement) return;

    if (stage === "hidden") {
      bootstrapElement.classList.add("is-hidden");
      return;
    }

    const titleElement = bootstrapElement.querySelector(".bootstrap-title");
    const subtitleElement = bootstrapElement.querySelector(".bootstrap-subtitle");
    const copy = STAGE_COPY[stage];

    if (titleElement) titleElement.textContent = copy.title;
    if (subtitleElement) subtitleElement.textContent = copy.subtitle;

    bootstrapElement.classList.remove("is-hidden");
  }, [stage]);

  const value = useMemo(() => ({ stage, setStage }), [stage]);

  return (
    <BootstrapContext.Provider value={value}>
      {children}
    </BootstrapContext.Provider>
  );
}

export function useBootstrap() {
  const context = useContext(BootstrapContext);

  if (!context) {
    throw new Error("useBootstrap must be used within BootstrapProvider");
  }

  return context;
}
