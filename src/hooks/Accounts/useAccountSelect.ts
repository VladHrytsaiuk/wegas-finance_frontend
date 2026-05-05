import { useState, useEffect, useMemo, useCallback } from "react";

const STORAGE_KEY = "last_selected_account_id";

interface UseAccountSelectProps {
  accounts: any[];
  value: string;
  onChange: (id: string) => void;
  currentUserId?: string; // 🔥 Додано для сортування "моїх" рахунків
}

export const useAccountSelect = ({
  accounts,
  value,
  onChange,
  currentUserId,
}: UseAccountSelectProps) => {
  const [search, setSearch] = useState("");

  // --- 1. Логіка авто-вибору при завантаженні ---
  useEffect(() => {
    if (!value && accounts && accounts.length > 0) {
      const savedId = localStorage.getItem(STORAGE_KEY);

      if (savedId) {
        const accountExists = accounts.find(
          (a: any) => String(a.id) === String(savedId),
        );

        // Авто-вибираємо тільки якщо рахунок існує і він НЕ синхронізований
        if (accountExists && !Boolean(accountExists.is_synced)) {
          onChange(String(savedId));
        }
      }
    }
  }, [accounts, value, onChange]);

  // --- 2. Сортування рахунків ---
  // Сортуємо: спочатку "мої", потім за типом (не синхронізовані вище), потім за алфавітом
  const sortedAccounts = useMemo(() => {
    return [...accounts].sort((a, b) => {
      // Пріоритет 1: Рахунки поточного користувача
      if (currentUserId) {
        const aIsMine = a.user_id === currentUserId ? 1 : 0;
        const bIsMine = b.user_id === currentUserId ? 1 : 0;
        if (aIsMine !== bIsMine) return bIsMine - aIsMine;
      }

      // Пріоритет 2: Звичайні рахунки вище за синхронізовані
      const aSynced = Boolean(a.is_synced) ? 1 : 0;
      const bSynced = Boolean(b.is_synced) ? 1 : 0;
      if (aSynced !== bSynced) return aSynced - bSynced;

      // Пріоритет 3: Алфавітний порядок
      return a.name.localeCompare(b.name);
    });
  }, [accounts, currentUserId]);

  // --- 3. Поточний вибраний рахунок ---
  const selectedAccount = useMemo(() => {
    return accounts.find((a: any) => String(a.id) === String(value));
  }, [accounts, value]);

  // --- 4. Фільтрація за пошуком ---
  const searchedAccounts = useMemo(() => {
    if (!search) return sortedAccounts;
    const q = search.toLowerCase();
    return sortedAccounts.filter((acc: any) =>
      acc.name.toLowerCase().includes(q),
    );
  }, [sortedAccounts, search]);

  // --- 5. Групування рахунків ---
  const groupedAccounts = useMemo(() => {
    return {
      regular: searchedAccounts.filter((acc) => !Boolean(acc.is_synced)),
      synced: searchedAccounts.filter((acc) => Boolean(acc.is_synced)),
    };
  }, [searchedAccounts]);

  // --- 6. Обробники подій ---
  const handleSelect = useCallback(
    (id: string) => {
      onChange(String(id));
      localStorage.setItem(STORAGE_KEY, String(id));
      setSearch(""); // Очищуємо пошук після вибору
    },
    [onChange],
  );

  const handleClear = useCallback(() => {
    onChange("");
  }, [onChange]);

  return {
    state: {
      search,
      selectedAccount,
      groupedAccounts,
    },
    actions: {
      setSearch,
      handleSelect,
      handleClear,
    },
  };
};
