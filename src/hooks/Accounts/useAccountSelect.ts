import { useState, useEffect, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";

const STORAGE_KEY = "last_selected_account_id";

interface UseAccountSelectProps {
  accounts: any[];
  users: any[];
  value: string;
  onChange: (id: string) => void;
  currentUserId?: string; // 🔥 Додано для сортування "моїх" рахунків
}

export const useAccountSelect = ({
  accounts,
  users,
  value,
  onChange,
  currentUserId,
}: UseAccountSelectProps) => {
  const { t } = useTranslation();
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

  // --- Helper: Icon Resolver ---
  const getAccountIcon = useCallback((acc: any) => {
    if (acc.type === "piggy_bank" || acc.type === "savings") return "HiCircleStack";
    if (acc.type === "cash") return "HiBanknotes";
    if (acc.type === "card") return "HiCreditCard";
    return "HiQuestionMarkCircle";
  }, []);

  // --- 5. Групування рахунків (Tree Structure) ---
  const treeData = useMemo(() => {
    const ownerMap: Record<string, any> = {};

    searchedAccounts.forEach((acc: any) => {
      // Пріоритет: дані з об'єкта users або fallback на user_id/owner_name
      const ownerObj = users.find((u) => u.id === acc.user_id);
      const ownerName =
        ownerObj?.name ||
        acc.owner_name ||
        t("accounts:accountForm.owner_other", "Інші");
      const ownerId = `owner-${acc.user_id || "fallback"}`;

      if (!ownerMap[ownerId]) {
        ownerMap[ownerId] = {
          id: ownerId,
          name: ownerName,
          isOwner: true,
          children: {},
        };
      }

      // Нормалізуємо тип для перекладу та іконки
      const rawType = acc.type || "other";
      const typeId = `${ownerId}-type-${rawType}`;

      if (!ownerMap[ownerId].children[typeId]) {
        // Отримуємо переклад для типу
        let typeLabel = rawType;
        let typeIcon = "HiQuestionMarkCircle";

        switch (rawType) {
          case "card":
            typeLabel = t("accounts:accountForm.type_card");
            typeIcon = "HiCreditCard";
            break;
          case "cash":
            typeLabel = t("accounts:accountForm.type_cash");
            typeIcon = "HiBanknotes";
            break;
          case "piggy_bank":
          case "savings":
            typeLabel = t("accounts:accountForm.type_savings", "Скарбничка");
            typeIcon = "HiCircleStack";
            break;
          default:
            typeLabel = rawType;
        }

        ownerMap[ownerId].children[typeId] = {
          id: typeId,
          name: typeLabel,
          icon: typeIcon,
          isType: true,
          children: [],
        };
      }

      // Додаємо рахунок з уже розрахунковою іконкою
      ownerMap[ownerId].children[typeId].children.push({
        ...acc,
        resolvedIcon: getAccountIcon(acc)
      });
    });

    // Перетворюємо об'єкти в масиви
    return Object.values(ownerMap).map((owner: any) => ({
      ...owner,
      children: Object.values(owner.children).map((typeNode: any) => ({
        ...typeNode,
        children: typeNode.children,
      })),
    }));
  }, [searchedAccounts, users, t, getAccountIcon]);

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
      treeData,
    },
    actions: {
      setSearch,
      handleSelect,
      handleClear,
    },
  };
};
