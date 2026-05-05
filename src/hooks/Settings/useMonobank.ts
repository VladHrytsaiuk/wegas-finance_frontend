import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useSync } from "../../context/SyncContext";
import { monobankApi, type MonoAccount } from "../../services/apiMonobank";
import toast from "react-hot-toast";

export interface AccountMapping {
  isEnabled: boolean;
  name: string;
  internalId?: string; // ID існуючого рахунку в FERP
  syncFrom: string; // YYYY-MM-DD
  cardNumber?: string;
  createGoal?: boolean; // 🔥 Тільки для банок
}

export type StepType =
  | "input"
  | "loading"
  | "selection"
  | "active"
  | "rate_limit";

// --- Helpers ---
const getLast4Digits = (acc: MonoAccount) => {
  if (!acc.maskedPan || acc.maskedPan.length === 0) return "";
  const pan = acc.maskedPan[0];
  return pan.length >= 4 ? pan.slice(-4) : "";
};

export function useMonobank() {
  const { t } = useTranslation();
  const { startPolling, statusData } = useSync();
  const isGlobalSyncing = statusData.is_running;

  // Стан кроків
  const [step, setStep] = useState<StepType>("loading");

  // Чи це повторне налаштування вже підключеного юзера?
  const [hasExistingConnection, setHasExistingConnection] = useState(false);

  // Дані форми
  const [token, setToken] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [accounts, setAccounts] = useState<MonoAccount[]>([]);
  const [mapping, setMapping] = useState<Record<string, AccountMapping>>({});
  const [error, setError] = useState<string | null>(null);

  // --- 1. ІНІЦІАЛІЗАЦІЯ ---
  useEffect(() => {
    const initModal = async () => {
      try {
        setStep("loading");
        setError(null);

        // Перевіряємо статус підключення
        try {
          await monobankApi.getSettings();
          setHasExistingConnection(true);
        } catch (e: any) {
          if (e.response && e.response.status === 404) {
            // Користувач ще не підключений
            setHasExistingConnection(false);
            setStep("input");
            return;
          }
          throw e; // Інша помилка — обробляємо нижче
        }

        // Отримуємо свіжі дані з Mono
        const freshData = await monobankApi.refresh();
        setAccounts(freshData.accounts);

        // Формуємо Initial Mapping
        const newMapping: Record<string, AccountMapping> = {};
        const defaultDateStr = "2024-01-01";

        freshData.accounts.forEach((acc) => {
          // Шукаємо, чи цей рахунок вже був налаштований раніше
          const existingConfig = freshData.mappings?.find(
            (m) => m.external_id === acc.id,
          );

          const currency =
            acc.currencyCode === 980
              ? "UAH"
              : acc.currencyCode === 840
                ? "USD"
                : "EUR";

          const last4 = getLast4Digits(acc);
          const cardName = last4 ? `Mono *${last4}` : "Mono Account";
          const isJar = acc.type === "jar";

          if (existingConfig) {
            // Відновлюємо налаштування
            let dateStr = defaultDateStr;
            if (existingConfig.sync_from > 0) {
              dateStr = new Date(existingConfig.sync_from)
                .toISOString()
                .split("T")[0];
            }

            // 🔥 Парсимо createGoal з raw_data, якщо він там є (безпечно)
            let existingCreateGoal = false;
            try {
              if (existingConfig.raw_data) {
                const parsed = JSON.parse(existingConfig.raw_data);
                existingCreateGoal = parsed.createGoal === true;
              }
            } catch (e) {
              // ignore json error
            }

            newMapping[acc.id] = {
              isEnabled: true,
              name: existingConfig.name || `${cardName} (${currency})`,
              internalId: existingConfig.internal_account_id,
              syncFrom: dateStr,
              cardNumber: last4,
              createGoal: isJar ? existingCreateGoal : false, // Тільки якщо це банка
            };
          } else {
            // Дефолтні налаштування для нових рахунків
            newMapping[acc.id] = {
              isEnabled: false,
              name: `${cardName} (${currency})`,
              internalId: "",
              syncFrom: defaultDateStr,
              cardNumber: last4,
              createGoal: false, // За замовчуванням false навіть для банок
            };
          }
        });

        setMapping(newMapping);
        setStep(isGlobalSyncing ? "active" : "selection");
      } catch (err: any) {
        console.error("Monobank Init Error:", err);

        if (err.response && err.response.status === 429) {
          setStep("rate_limit");
        } else if (
          err.response &&
          (err.response.status === 401 || err.response.status === 403)
        ) {
          // Токен протух -> кидаємо на ввід нового
          setHasExistingConnection(false);
          setStep("input");
          setError("Токен недійсний або застарів. Введіть новий.");
        } else {
          setStep("input");
          setError(err.response?.data?.error || "Помилка завантаження даних.");
        }
      }
    };

    initModal();
  }, [isGlobalSyncing]);

  // --- 2. ДІЇ (ACTIONS) ---

  const handleConnect = async () => {
    if (!token) return;
    setIsPending(true);
    setError(null);
    setStep("loading");

    try {
      const data = await monobankApi.connect(token);
      setAccounts(data.accounts);
      setHasExistingConnection(false); // Ми щойно підключились вручну

      const initialMapping: Record<string, AccountMapping> = {};
      const defaultDateStr = "2024-01-01";

      data.accounts.forEach((acc) => {
        const currency =
          acc.currencyCode === 980
            ? "UAH"
            : acc.currencyCode === 840
              ? "USD"
              : "EUR";
        const last4 = getLast4Digits(acc);
        const cardName = last4 ? `Mono *${last4}` : "Mono Account";
        const isJar = acc.type === "jar";

        initialMapping[acc.id] = {
          isEnabled: true, // При першому підключенні активуємо все
          name: `${cardName} (${currency})`,
          internalId: "",
          syncFrom: defaultDateStr,
          cardNumber: last4,
          createGoal: false, // User сам має вирішити, чи створювати ціль
        };
      });

      setMapping(initialMapping);
      setStep("selection");
    } catch (err: any) {
      if (err.response && err.response.status === 429) {
        setError("⏳ Monobank: Зачекайте 1 хвилину (Rate Limit).");
      } else {
        setError(
          err.response?.data?.error || "Помилка підключення. Перевірте токен.",
        );
      }
      setStep("input");
    } finally {
      setIsPending(false);
    }
  };

  // Хендлери для UI
  const toggleAccount = (id: string, cardNumber?: string) => {
    setMapping((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        isEnabled: !prev[id].isEnabled,
        cardNumber: cardNumber || prev[id].cardNumber,
      },
    }));
  };

  const toggleCreateGoal = (id: string) => {
    setMapping((prev) => ({
      ...prev,
      [id]: { ...prev[id], createGoal: !prev[id].createGoal },
    }));
  };

  const updateAccountName = (id: string, newName: string) => {
    setMapping((prev) => ({
      ...prev,
      [id]: { ...prev[id], name: newName },
    }));
  };

  const setInternalId = (id: string, internalId: string) => {
    setMapping((prev) => ({
      ...prev,
      [id]: { ...prev[id], internalId },
    }));
  };

  const setAccountSyncDate = (id: string, date: string) => {
    setMapping((prev) => ({
      ...prev,
      [id]: { ...prev[id], syncFrom: date },
    }));
  };

  // --- 3. CONFIRM SYNC (Головний Save) ---
  const confirmSync = async () => {
    if (isGlobalSyncing) {
      setStep("active");
      return;
    }

    const selectedAccounts = Object.entries(mapping)
      .filter(([_, conf]) => conf.isEnabled)
      .map(([externalId, conf]) => {
        const originalAcc = accounts.find((a) => a.id === externalId);

        // Формуємо raw_data JSON
        const rawDataPayload = JSON.stringify({
          maskedPan: originalAcc?.maskedPan || [],
          type: originalAcc?.type || "black",
          createGoal: conf.createGoal, // 🔥 Важливий прапорець
          creditLimit: originalAcc?.creditLimit || 0,
        });

        // Конвертація дати в timestamp
        const [year, month, day] = conf.syncFrom.split("-").map(Number);
        // Важливо: місяці в JS 0-indexed
        const dateObj = new Date(year, month - 1, day);
        const syncFromTimestamp = dateObj.getTime();

        const currencyStr =
          originalAcc?.currencyCode === 980
            ? "UAH"
            : originalAcc?.currencyCode === 840
              ? "USD"
              : "EUR";

        return {
          external_id: externalId,
          internal_account_id: conf.internalId || "", // Якщо пусто - створиться новий рахунок
          name: conf.name,
          is_enabled: true,
          currency: currencyStr,
          sync_from: syncFromTimestamp,
          raw_data: rawDataPayload,
          card_number: conf.cardNumber || "",
        };
      });

    if (selectedAccounts.length === 0) {
      toast.error("Оберіть хоча б один рахунок");
      return;
    }

    setIsPending(true);
    try {
      await monobankApi.confirmSync(selectedAccounts);
      startPolling();
      setStep("active");
    } catch (err: any) {
      if (err.response && err.response.status === 429) {
        setStep("rate_limit");
      } else {
        toast.error("Не вдалося зберегти налаштування");
      }
    } finally {
      setIsPending(false);
    }
  };

  const handleDisconnect = async () => {
    if (isGlobalSyncing) {
      toast.error("Дочекайтеся завершення синхронізації!");
      return;
    }
    try {
      await monobankApi.disconnect();
      setToken("");
      setAccounts([]);
      setMapping({});
      setHasExistingConnection(false);
      setStep("input");
    } catch (e) {
      toast.error("Не вдалося відключити інтеграцію");
    }
  };

  return {
    state: {
      step,
      token,
      isPending,
      accounts,
      mapping,
      error,
      isGlobalSyncing,
      hasExistingConnection,
    },
    actions: {
      setToken,
      setStep,
      handleConnect,
      toggleAccount,
      toggleCreateGoal,
      updateAccountName,
      setInternalId,
      setAccountSyncDate,
      confirmSync,
      handleDisconnect,
    },
    t,
  };
}
