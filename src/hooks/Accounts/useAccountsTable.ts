import { useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { BANK_SKINS, type BankSkin } from "../../components/accounts/bankSkins";
import { formatMoney as formatMoneyHelper } from "../../utils/helpers";
import type { Account } from "../../services/apiAccounts";
import type { UserProfile } from "../../services/apiUsers";

// Можна додати мапу іконок для скарбничок

interface UseAccountsTableProps {
  accounts: Account[];
  users: UserProfile[];
}

export const useAccountsTable = ({
  accounts,
  users,
}: UseAccountsTableProps) => {
  const { t, i18n } = useTranslation();

  // 1. ГРУПУВАННЯ ТА СОРТУВАННЯ
  const { groupedAccounts, sortedKeys } = useMemo(() => {
    const groups: Record<string, Account[]> = {};

    accounts.forEach((acc) => {
      let key = acc.type; // 'cash', 'piggy_bank', 'card'

      if (acc.type === "card") {
        const rawString =
          `${acc.bank_name || ""} ${acc.icon || ""}`.toLowerCase();
        let bankId = "other";

        if (rawString.includes("mono")) bankId = "monobank";
        else if (rawString.includes("privat")) bankId = "privat";
        else if (rawString.includes("oschad")) bankId = "oschad";
        else if (rawString.includes("pumb")) bankId = "pumb";
        else if (rawString.includes("sense")) bankId = "sense";
        else if (rawString.includes("raif")) bankId = "raiffeisen";
        else if (rawString.includes("ukrsib")) bankId = "ukrsib";

        key = `card_${bankId}`;
      }

      // Мапимо "piggy_bank" на "savings" для групування (або залишаємо piggy_bank)
      if (acc.type === "piggy_bank" || acc.type === "savings") {
        key = "savings";
      }

      if (!groups[key]) groups[key] = [];
      groups[key].push(acc);
    });

    const sorted = Object.keys(groups).sort((a, b) => {
      const getPriority = (k: string) => {
        if (k === "card_monobank") return 1;
        if (k === "card_privat") return 2;
        if (k.startsWith("card_")) return 10;
        if (k === "cash") return 20;
        if (k === "savings") return 21; // Скарбнички в кінці
        return 99;
      };
      return getPriority(a) - getPriority(b);
    });

    return { groupedAccounts: groups, sortedKeys: sorted };
  }, [accounts]);

  // 2. ЗАГОЛОВКИ ГРУП
  const getGroupHeaderDetails = useCallback(
    (groupKey: string) => {
      if (groupKey.startsWith("card_")) {
        const bankId = groupKey.replace("card_", "");
        let label = t("accounts:accountsFilter.group_other_cards", "Інші картки");
        let color = "#6b7280";

        // Проста логіка кольорів (можна розширити)
        if (bankId === "monobank") {
          label = "Monobank";
          color = "#ea5353";
        }
        if (bankId === "privat") {
          label = "PrivatBank";
          color = "#7cb342";
        }

        return { label, color, isBank: true };
      }

      if (groupKey === "cash")
        return {
          label: t("accounts:accountsTable.type_cash"),
          color: "#10b981",
          isBank: false,
        };
      if (groupKey === "savings")
        return {
          label: t("accounts:accountsTable.type_savings"),
          color: "#8b5cf6",
          isBank: false,
        };

      return { label: groupKey, color: null, isBank: false };
    },
    [t],
  );

  // 3. ФОРМАТУВАННЯ ГРОШЕЙ
  const formatMoney = useCallback(
    (amount: number, currency: string) => {
      return formatMoneyHelper(amount, currency, i18n.language);
    },
    [i18n.language],
  );

  // 4. ІМ'Я ВЛАСНИКА
  const getOwnerName = useCallback(
    (userId: string) => {
      const u = users.find((user) => user.id === userId);
      return u ? u.name : t("accounts:accountsTable.owner_default_family");
    },
    [users, t],
  );

  // 5. 🔥 СТИЛІ ІКОНОК
  const getIconStyles = useCallback((acc: Account) => {
    // КАРТКИ
    if (acc.type === "card") {
      const bank = acc.bank_name;
      const design = acc.card_type || acc.card_design;
      let skin: BankSkin | undefined;

      if (bank && design) skin = BANK_SKINS[`${bank}-${design}`];
      if (!skin && acc.icon) skin = BANK_SKINS[acc.icon];

      const safeSkin = skin || BANK_SKINS["default"];

      return {
        bg: safeSkin.bg,
        color: safeSkin.color,
        miniLogo: safeSkin.miniLogoFile,
        iconType: null, // Не використовуємо іконку React
      };
    }

    // СКАРБНИЧКИ
    if (acc.type === "piggy_bank" || acc.type === "savings") {
      let iconType = "archive"; // default
      const slug = acc.storage_type?.slug;

      if (slug === "envelope") iconType = "envelope";
      if (slug === "safe") iconType = "safe";
      if (slug === "jar") iconType = "jar";

      return {
        bg: acc.color || "#8b5cf6",
        color: "#fff",
        miniLogo: null,
        iconType: iconType, // Повертаємо тип іконки
      };
    }

    // ГОТІВКА
    return {
      bg: acc.color || "#10b981",
      color: "#fff",
      miniLogo: null,
      iconType: "cash",
    };
  }, []);

  const translateAccountType = useCallback(
    (type: string) => {
      if (type === "card") return t("accounts:accountsTable.type_card");
      if (type === "cash") return t("accounts:accountsTable.type_cash");
      if (type === "savings" || type === "piggy_bank")
        return t("accounts:accountsTable.type_savings");
      return type;
    },
    [t],
  );

  return {
    groupedAccounts,
    sortedKeys,
    getGroupHeaderDetails,
    formatMoney,
    getOwnerName,
    getIconStyles,
    translateAccountType,
  };
};
