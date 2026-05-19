import { useMemo } from "react";
import { useTranslation } from "react-i18next";
// 🔥 Додаємо імпорт скінів, щоб дерево знало про логотипи банків
import { BANK_SKINS } from "../../components/accounts/bankSkins";

export interface AccountTreeNode {
  id: string;
  originalId?: string;
  label: string;
  type: "user" | "group" | "account";
  children: AccountTreeNode[];
  icon?: string;
  color?: string;
  isBank?: boolean;
  data?: any;
}

interface UseAccountTreeProps {
  accounts: any[];
  users: any[];
  searchQuery?: string;
}

export function useAccountTree({
  accounts,
  users,
  searchQuery = "",
}: UseAccountTreeProps) {
  const { t } = useTranslation();

  return useMemo(() => {
    // 1. Фільтрація
    let filteredAccounts = accounts;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filteredAccounts = accounts.filter(
        (acc) =>
          acc.name.toLowerCase().includes(q) ||
          (acc.card_number && acc.card_number.includes(q)),
      );
    }

    if (filteredAccounts.length === 0) return [];

    // 2. Групування
    const groupedByUser: Record<string, any[]> = {};
    users.forEach((u) => {
      groupedByUser[u.id] = [];
    });
    groupedByUser["unknown"] = [];

    filteredAccounts.forEach((acc) => {
      const userId = acc.user_id || "unknown";
      if (!groupedByUser[userId]) groupedByUser[userId] = [];
      groupedByUser[userId].push(acc);
    });

    const tree: AccountTreeNode[] = [];

    Object.keys(groupedByUser).forEach((userId) => {
      const userAccounts = groupedByUser[userId];
      if (userAccounts.length === 0) return;

      const user = users.find((u) => u.id === userId);
      const userName = user
        ? user.name
        : t("accounts:accountsTable.owner_default_family");

      const groupedByType: Record<string, any[]> = {
        card: [],
        cash: [],
        savings: [],
      };

      userAccounts.forEach((acc) => {
        // 🔥 МАПІНГ: piggy_bank -> savings для коректного групування в UI
        const effectiveType = acc.type === "piggy_bank" ? "savings" : acc.type;

        if (groupedByType[effectiveType]) {
          groupedByType[effectiveType].push(acc);
        } else {
          if (!groupedByType["other"]) groupedByType["other"] = [];
          groupedByType["other"].push(acc);
        }
      });

      const typeChildren: AccountTreeNode[] = [];

      const createTypeNode = (
        key: string,
        label: string,
        icon: string,
        color: string,
      ) => {
        const accs = groupedByType[key];
        if (!accs || accs.length === 0) return null;

        return {
          id: `group_${key}_${userId}`,
          label: label,
          type: "group" as const,
          icon: icon,
          color: color,
          children: accs.map((acc) => {
            // 🔥 ВИПРАВЛЕНА ЛОГІКА ІКОНОК ДЛЯ РАХУНКІВ
            let accIcon = "HiBanknotes";

            if (acc.type === "card") {
              // 1. Шукаємо скін, як ми робили в таблиці
              const skinKey =
                acc.bank_name && acc.card_type
                  ? `${acc.bank_name}-${acc.card_type}`
                  : acc.icon;

              const skin = BANK_SKINS[skinKey] || BANK_SKINS["default"];

              // 2. Беремо miniLogoFile (icon_...) або фолбек на картку
              accIcon = skin.miniLogoFile || "HiCreditCard";
            } else if (acc.type === "savings") {
              accIcon = "HiCurrencyDollar";
            } else if (acc.type === "cash") {
              accIcon = "HiBanknotes";
            }

            return {
              id: acc.id,
              originalId: acc.id,
              label: acc.name,
              type: "account" as const,
              children: [],
              icon: accIcon, // Тепер тут буде "icon_monobank"
              color: acc.color,
              data: acc,
            };
          }),
        };
      };

      // Додаємо вузли
      const cardNode = createTypeNode(
        "card",
        t("accounts:accountsTable.type_card"),
        "HiCreditCard",
        "var(--color-brand-600)",
      );
      if (cardNode) typeChildren.push(cardNode);

      const cashNode = createTypeNode(
        "cash",
        t("accounts:accountsTable.type_cash"),
        "HiBanknotes",
        "var(--color-green-600)",
      );
      if (cashNode) typeChildren.push(cashNode);

      const savingsNode = createTypeNode(
        "savings",
        t("accounts:accountsTable.type_savings"),
        "HiCurrencyDollar",
        "var(--color-yellow-600)",
      );
      if (savingsNode) typeChildren.push(savingsNode);

      tree.push({
        id: `user_${userId}`,
        label: userName,
        type: "user",
        icon: "HiUser",
        color: "var(--color-text-secondary)",
        children: typeChildren,
      });
    });

    return tree;
  }, [accounts, users, searchQuery, t]);
}
