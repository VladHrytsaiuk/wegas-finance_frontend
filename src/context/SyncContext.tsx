import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  type ReactNode,
  useMemo,
} from "react";
import axios from "../services/Axios";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";

// Типи статусів з бекенду
interface BackendSyncStatus {
  is_running: boolean;
  message: string;
  total_imported: number;
}

interface SyncContextType {
  statusData: BackendSyncStatus;
  isVisible: boolean;
  startPolling: () => void;
  stopPolling: () => void;
  closeWidget: () => void;
}

const SyncContext = createContext<SyncContextType | undefined>(undefined);

// Створюємо аудіо-об'єкт поза компонентом
const successSound = new Audio("/sounds/successSync.mp3");

export function SyncProvider({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  const [statusData, setStatusData] = useState<BackendSyncStatus>({
    is_running: false,
    message: "",
    total_imported: 0,
  });

  const [isPolling, setIsPolling] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // --- REFS ---
  const isRunningRef = useRef(false); // Чи реально йде процес
  const isStartingRef = useRef(false); // Чи ми в фазі запуску
  const hasNotifiedRef = useRef(false); // Щоб не було подвійних звуків
  const startupRetriesRef = useRef(0); // Лічильник спроб на старті
  const timerRef = useRef<number | null>(null);
  const autoHideTimeoutRef = useRef<number | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      const { data } = await axios.get<BackendSyncStatus>("/monobank/status");

      // === ЛОГІКА ЗАХИСТУ ВІД МИТТЄВОГО "ГОТОВО" ===
      if (isStartingRef.current && !data.is_running) {
        startupRetriesRef.current += 1;

        if (startupRetriesRef.current < 4) {
          return; // ІГНОРУЄМО цю відповідь, залишаємо "З'єднання..."
        }

        isStartingRef.current = false;
      }

      // 1. Якщо сервер прокинувся (is_running = true)
      if (data.is_running) {
        isRunningRef.current = true;
        isStartingRef.current = false; // Фаза старту завершена успішно
        hasNotifiedRef.current = false;
        setIsVisible(true);
      }

      // 2. Логіка фінішу (Звук + Тост)
      if (
        isRunningRef.current &&
        !data.is_running &&
        !isStartingRef.current &&
        !hasNotifiedRef.current
      ) {
        hasNotifiedRef.current = true;
        isRunningRef.current = false;

        successSound.currentTime = 0;
        successSound.play().catch((e) => console.warn("Звук заблоковано:", e));
        toast.success(t("common:sync_widget.toast_sync_success"));
      }

      setStatusData(data);

      // 3. Автоматичне приховування
      if (!data.is_running && isPolling && !isStartingRef.current) {
        if (!autoHideTimeoutRef.current) {
          autoHideTimeoutRef.current = window.setTimeout(() => {
            setIsPolling(false);
            setIsVisible(false);
            autoHideTimeoutRef.current = null;
          }, 5000);
        }
      }
    } catch (error) {
      console.error("Помилка опитування статусу:", error);
    }
  }, [isPolling, t]);

  // Ефект таймера
  useEffect(() => {
    if (isPolling) {
      const firstRun = setTimeout(fetchStatus, 1000);
      timerRef.current = window.setInterval(fetchStatus, 3000);

      return () => {
        clearTimeout(firstRun);
        if (timerRef.current) clearInterval(timerRef.current);
        if (autoHideTimeoutRef.current)
          clearTimeout(autoHideTimeoutRef.current);
      };
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  }, [isPolling, fetchStatus]);

  // Перевірка при завантаженні (F5)
  useEffect(() => {
    const checkOnMount = async () => {
      try {
        const { data } = await axios.get<BackendSyncStatus>("/monobank/status");
        if (data.is_running) {
          isRunningRef.current = true;
          setStatusData(data);
          setIsVisible(true);
          setIsPolling(true);
        }
      } catch {
        /* мовчимо */
      }
    };
    checkOnMount();
  }, []);

  const startPolling = useCallback(() => {
    successSound
      .play()
      .then(() => {
        successSound.pause();
        successSound.currentTime = 0;
      })
      .catch(() => {});

    isStartingRef.current = true;
    isRunningRef.current = false;
    hasNotifiedRef.current = false;
    startupRetriesRef.current = 0;

    setIsVisible(true);
    setIsPolling(true);

    setStatusData({
      is_running: true,
      message: t("common:sync_widget.msg_connecting"),
      total_imported: 0,
    });
  }, [t]);

  const stopPolling = useCallback(() => {
    setIsPolling(false);
  }, []);

  const closeWidget = useCallback(() => {
    setIsVisible(false);
  }, []);

  const value = useMemo(
    () => ({
      statusData,
      isVisible,
      startPolling,
      stopPolling,
      closeWidget,
    }),
    [statusData, isVisible, startPolling, stopPolling, closeWidget],
  );

  return <SyncContext.Provider value={value}>{children}</SyncContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useSync() {
  const context = useContext(SyncContext);
  if (context === undefined) {
    throw new Error("useSync must be used within a SyncProvider");
  }
  return context;
}
