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
  const startupRetriesRef = useRef(0); // 🔥 Лічильник спроб на старті
  const timerRef = useRef<number | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      const { data } = await axios.get<BackendSyncStatus>("/monobank/status");

      // === ЛОГІКА ЗАХИСТУ ВІД МИТТЄВОГО "ГОТОВО" ===
      // Якщо ми в фазі старту (isStartingRef), а сервер каже "я сплю" (false),
      // ми не віримо йому перші 3-4 запити (це десь 6-9 секунд).
      if (isStartingRef.current && !data.is_running) {
        startupRetriesRef.current += 1;

        if (startupRetriesRef.current < 4) {
          console.log(
            `⏳ Чекаємо на старт бекенда... спроба ${startupRetriesRef.current}`,
          );
          return; // ІГНОРУЄМО цю відповідь, залишаємо "З'єднання..."
        }

        // Якщо вже 4 рази сервер сказав ні - значить реально ні.
        // Знімаємо прапор старту.
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
      // Граємо тільки якщо процес БУВ (isRunningRef), а тепер СТАВ false
      // І ми точно не в фазі старту
      if (
        isRunningRef.current &&
        !data.is_running &&
        !isStartingRef.current &&
        !hasNotifiedRef.current
      ) {
        hasNotifiedRef.current = true;
        isRunningRef.current = false;

        console.log("✅ Синхронізація завершена");
        successSound.currentTime = 0;
        successSound.play().catch((e) => console.warn("Звук заблоковано:", e));
        toast.success("Дані оновлено!");
      }

      setStatusData(data);

      // 3. Автоматичне приховування
      if (!data.is_running && isPolling && !isStartingRef.current) {
        const timeoutId = setTimeout(() => {
          setIsPolling(false);
          setIsVisible(false);
        }, 5000);
        return () => clearTimeout(timeoutId);
      }
    } catch (error) {
      console.error("Помилка опитування статусу:", error);
      // Не вимикаємо поллінг одразу, даємо шанс відновитися
    }
  }, [isPolling]);

  // Ефект таймера
  useEffect(() => {
    if (isPolling) {
      // Робимо невелику затримку перед першим реальним запитом,
      // щоб дати UI показати "Підключення..."
      const firstRun = setTimeout(fetchStatus, 1000);

      timerRef.current = window.setInterval(fetchStatus, 3000);

      return () => clearTimeout(firstRun);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
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
      } catch (e) {
        /* мовчимо */
      }
    };
    checkOnMount();
  }, []);

  const startPolling = useCallback(() => {
    // Розблокувати звук
    successSound
      .play()
      .then(() => {
        successSound.pause();
        successSound.currentTime = 0;
      })
      .catch(() => {});

    // Скидаємо всі прапорці
    isStartingRef.current = true;
    isRunningRef.current = false;
    hasNotifiedRef.current = false;
    startupRetriesRef.current = 0; // 🔥 Скидаємо лічильник спроб

    setIsVisible(true);
    setIsPolling(true);

    // Ставимо початковий стан UI вручну
    setStatusData({
      is_running: true,
      message: "З'єднання з сервером...",
      total_imported: 0,
    });

    // Примітка: Ми НЕ викликаємо fetchStatus() тут вручну,
    // нехай це зробить useEffect з таймером, це дасть мікро-затримку.
  }, []);

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

export function useSync() {
  const context = useContext(SyncContext);
  if (context === undefined) {
    throw new Error("useSync must be used within a SyncProvider");
  }
  return context;
}
