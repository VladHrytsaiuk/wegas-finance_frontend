import { useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { BANK_SKINS, type BankSkin } from "../../components/accounts/bankSkins";
import type { Account } from "../../services/apiAccounts";
import type { UserProfile } from "../../services/apiUsers";

type GridAccount = Account & {
  owner_name?: string;
};

type GridSkin = BankSkin & {
  iconType?: string;
};

interface UseAccountsGridProps {
  groupedAccounts: Record<string, Account[]>;
  users: UserProfile[];
}

export const useAccountsGrid = ({
  groupedAccounts,
  users,
}: UseAccountsGridProps) => {
  const { t } = useTranslation();

  // 1. Логіка скіна (ОНОВЛЕНА)
  const getSkin = useCallback(
    (account: Account): GridSkin => {
      // --- КАРТКИ (Банківські) ---
      if (account.type === "card") {
        const bank = account.bank_name;
        const design = account.card_type || account.card_design;

        if (bank && design) {
          const key = `${bank}-${design}`;
          if (BANK_SKINS[key]) return BANK_SKINS[key];
        }
        if (account.icon && BANK_SKINS[account.icon]) {
          return BANK_SKINS[account.icon];
        }
        // Дефолтна картка, якщо скін не знайдено
        return BANK_SKINS["default"] || BANK_SKINS["monobank-black"];
      }

      // --- СКАРБНИЧКИ (Piggy Bank) ---
      if (account.type === "piggy_bank" || account.type === "savings") {
        return {
          id: "savings-custom",
          bg: account.color || "#8b5cf6", // Фіолетовий дефолт для цілей
          color: "#ffffff",
          bankId: "savings",
          logoFile: "",
          // 🔥 Передаємо тип іконки (envelope, safe, jar)
          iconType: account.storage_type?.slug || "archive",
          label: t("accounts:accountsTable.type_savings"),
        };
      }

      // --- ГОТІВКА (Cash) ---
      return {
        id: "cash-custom",
        bg: account.color || "#10b981", // Зелений дефолт
        color: "#ffffff",
        bankId: "cash",
        logoFile: "",
        iconType: "cash", // Маркер для іконки готівки
        label: t("accounts:accountsTable.type_cash"),
      };
    },
    [t],
  );

  // 2. Групування (Залишається як було в попередньому кроці)
  const processedGroups = useMemo(() => {
    const allAccounts = Object.values(groupedAccounts).flat();
    const newGroups: Record<string, GridAccount[]> = {};

    allAccounts.forEach((acc) => {
      let key = "other";

      if (acc.type === "card") {
        let bankId = acc.bank_name || "other";
        if (!acc.bank_name && acc.icon) {
          if (acc.icon.includes("mono")) bankId = "monobank";
          else if (acc.icon.includes("privat")) bankId = "privat";
          else if (acc.icon.includes("oschad")) bankId = "oschad";
          else if (acc.icon.includes("pumb")) bankId = "pumb";
          else if (acc.icon.includes("sense")) bankId = "sense";
          else if (acc.icon.includes("raif")) bankId = "raiffeisen";
          else if (acc.icon.includes("ukrsib")) bankId = "ukrsib";
        }
        key = `card_${bankId}`;
      } else if (acc.type === "piggy_bank" || acc.type === "savings") {
        key = "savings";
      } else {
        key = "cash";
      }

      if (!newGroups[key]) newGroups[key] = [];
      newGroups[key].push(acc);
    });

    const sortedKeys = Object.keys(newGroups).sort((a, b) => {
      const getPriority = (k: string) => {
        if (k.includes("monobank")) return 1;
        if (k.includes("privat")) return 2;
        if (k.startsWith("card_")) return 10;
        if (k === "cash") return 20;
        if (k === "savings") return 21;
        return 99;
      };
      return getPriority(a) - getPriority(b);
    });

    return sortedKeys.map((key) => {
      let groupName = t("accounts:accountsFilter.group_other_cards");

      if (key.startsWith("card_")) {
        const bankId = key.replace("card_", "");
        if (bankId === "monobank") groupName = "Monobank";
        else if (bankId === "privat") groupName = "PrivatBank";
        else if (bankId === "oschad") groupName = "Oschadbank";
        else if (bankId === "pumb") groupName = "PUMB";
        else if (bankId === "sense") groupName = "Sense Bank";
        else if (bankId === "raiffeisen") groupName = "Raiffeisen Bank";
        else if (bankId === "ukrsib") groupName = "Ukrsibbank";
      } else if (key === "cash") {
        groupName = t("accounts:accountsTable.type_cash");
      } else if (key === "savings") {
        groupName = t("accounts:accountsTable.type_savings");
      }

      const enhancedAccounts = newGroups[key].map((account) => {
        const user = users?.find((u) => u.id === account.user_id);
        return {
          ...account,
          owner_name: user ? user.name : undefined,
        };
      });

      return {
        name: groupName,
        accounts: enhancedAccounts,
      };
    });
  }, [groupedAccounts, users, t]);

  return {
    getSkin,
    processedGroups,
  };
};
