import { useState, useEffect, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import type { Account } from "../../services/apiAccounts";
import type { UserProfile } from "../../services/apiUsers";

const STORAGE_KEY = "last_selected_account_id";

interface UseAccountSelectProps {
  accounts: Account[];
  users: UserProfile[];
  value: string;
  onChange: (id: string) => void;
  currentUserId?: string;
}

export interface AccountSelectItem extends Account {
  resolvedIcon: string;
}

export interface AccountSelectTypeNode {
  id: string;
  name: string;
  icon: string;
  isType: true;
  children: AccountSelectItem[];
}

export interface AccountSelectOwnerNode {
  id: string;
  name: string;
  isOwner: true;
  children: AccountSelectTypeNode[];
}

type AccountSelectOwnerGroup = Omit<AccountSelectOwnerNode, "children"> & {
  children: Record<string, AccountSelectTypeNode>;
};

export const useAccountSelect = ({
  accounts,
  users,
  value,
  onChange,
  currentUserId,
}: UseAccountSelectProps) => {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!value && accounts.length > 0) {
      const savedId = localStorage.getItem(STORAGE_KEY);

      if (savedId) {
        const accountExists = accounts.find(
          (account) => String(account.id) === String(savedId),
        );

        if (accountExists && !accountExists.is_synced) {
          onChange(String(savedId));
        }
      }
    }
  }, [accounts, value, onChange]);

  const sortedAccounts = useMemo(() => {
    return [...accounts].sort((a, b) => {
      if (currentUserId) {
        const aIsMine = a.user_id === currentUserId ? 1 : 0;
        const bIsMine = b.user_id === currentUserId ? 1 : 0;
        if (aIsMine !== bIsMine) return bIsMine - aIsMine;
      }

      const aSynced = a.is_synced ? 1 : 0;
      const bSynced = b.is_synced ? 1 : 0;
      if (aSynced !== bSynced) return aSynced - bSynced;

      return a.name.localeCompare(b.name);
    });
  }, [accounts, currentUserId]);

  const selectedAccount = useMemo(() => {
    return accounts.find((account) => String(account.id) === String(value));
  }, [accounts, value]);

  const searchedAccounts = useMemo(() => {
    if (!search) return sortedAccounts;
    const query = search.toLowerCase();
    return sortedAccounts.filter((account) =>
      account.name.toLowerCase().includes(query),
    );
  }, [sortedAccounts, search]);

  const getAccountIcon = useCallback((account: Account) => {
    if (account.type === "piggy_bank") return "HiCircleStack";
    if (account.type === "cash") return "HiBanknotes";
    if (account.type === "card") return "HiCreditCard";
    return "HiQuestionMarkCircle";
  }, []);

  const treeData = useMemo(() => {
    const ownerMap: Record<string, AccountSelectOwnerGroup> = {};

    searchedAccounts.forEach((account) => {
      const ownerObj = users.find((user) => user.id === account.user_id);
      const ownerName =
        ownerObj?.name || t("accounts:accountForm.owner_other", "Інші");
      const ownerId = `owner-${account.user_id || "fallback"}`;

      if (!ownerMap[ownerId]) {
        ownerMap[ownerId] = {
          id: ownerId,
          name: ownerName,
          isOwner: true,
          children: {},
        };
      }

      const rawType = account.type || "other";
      const typeId = `${ownerId}-type-${rawType}`;

      if (!ownerMap[ownerId].children[typeId]) {
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

      ownerMap[ownerId].children[typeId].children.push({
        ...account,
        resolvedIcon: getAccountIcon(account),
      });
    });

    return Object.values(ownerMap).map((owner) => ({
      ...owner,
      children: Object.values(owner.children),
    }));
  }, [searchedAccounts, users, t, getAccountIcon]);

  const handleSelect = useCallback(
    (id: string) => {
      onChange(String(id));
      localStorage.setItem(STORAGE_KEY, String(id));
      setSearch("");
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
