import { useState, useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { BANK_SKINS, type BankSkin } from "../../components/accounts/bankSkins";
import type {
  FilterConfig,
  FilterOption,
} from "../../components/shared/TableToolbar/types";
import { getCurrencyOptions } from "../../utils/currency";
import type { Account } from "../../services/apiAccounts";
import type { UserProfile } from "../../services/apiUsers";

type AccountFilterType = "card" | "cash" | "savings";

type FilterableAccount = Account & {
  calculated_balance: number;
};

type AccountFilterState = {
  type: AccountFilterType[];
  bank: string[];
  currency: string[];
  owner: string[];
  status: string[];
  balance: {
    min: string;
    max: string;
  };
};

export function useAccountsFilter(accounts: Account[], users: UserProfile[]) {
  const { t } = useTranslation();

  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("default");

  const [viewMode, setViewMode] = useState<"grid" | "table">(() => {
    const saved = localStorage.getItem("accountsViewMode");
    return saved === "table" ? "table" : "grid";
  });

  const [filters, setFilters] = useState<AccountFilterState>({
    type: [],
    bank: [],
    currency: [],
    owner: [],
    status: [],
    balance: { min: "", max: "" },
  });

  useEffect(() => {
    localStorage.setItem("accountsViewMode", viewMode);
  }, [viewMode]);

  const identifyBank = (account: Account): string => {
    if (account.type !== "card") return "";

    let bankId = account.bank_name;

    if (!bankId && account.icon) {
      const icon = account.icon.toLowerCase();
      if (icon.includes("mono")) bankId = "monobank";
      else if (icon.includes("privat")) bankId = "privat";
      else if (icon.includes("oschad")) bankId = "oschad";
      else if (icon.includes("pumb")) bankId = "pumb";
      else if (icon.includes("sense")) bankId = "sense";
      else if (icon.includes("raif")) bankId = "raiffeisen";
      else if (icon.includes("ukrsib")) bankId = "ukrsib";
    }

    return bankId || "other";
  };

  const filtersConfig: FilterConfig[] = useMemo(() => {
    const userOptions: FilterOption[] = users.map((user) => ({
      value: user.id,
      label: user.name,
    }));

    const bankOptionsMap = new Map<string, FilterOption>();

    const activeBankIds = new Set(
      accounts
        .filter((account) => account.type === "card")
        .map((account) => identifyBank(account))
        .filter(Boolean),
    );

    Object.values(BANK_SKINS).forEach((skin: BankSkin) => {
      if (skin.bankId && skin.bankId !== "cash" && skin.bankId !== "other") {
        if (!bankOptionsMap.has(skin.bankId) && activeBankIds.has(skin.bankId)) {
          bankOptionsMap.set(skin.bankId, {
            value: skin.bankId,
            label: skin.bankId.charAt(0).toUpperCase() + skin.bankId.slice(1),
            icon: skin.miniLogoFile,
          });
        }
      }
    });

    const bankOptions = Array.from(bankOptionsMap.values());

    if (activeBankIds.has("other")) {
      bankOptions.push({
        value: "other",
        label: t("accounts:accountsFilter.bank_other", "Інші"),
        icon: "HiCreditCard",
      });
    }

    return [
      {
        key: "type",
        label: t("accounts:accountsFilter.type_label"),
        type: "toggle",
        options: [
          { value: "card", label: t("accounts:accountsFilter.type_card") },
          { value: "cash", label: t("accounts:accountsFilter.type_cash") },
          { value: "savings", label: t("accounts:accountsFilter.type_savings") },
        ],
      },
      {
        key: "bank",
        label: t("accounts:accountsFilter.bank_label"),
        type: "multi-select",
        options: bankOptions,
      },
      {
        key: "currency",
        label: t("accounts:accountsFilter.currency_label"),
        type: "multi-select",
        options: getCurrencyOptions(),
      },
      {
        key: "status",
        label: t("accounts:accountsFilter.status_label"),
        type: "multi-select",
        options: [
          { value: "positive", label: t("accounts:accountsFilter.status_positive") },
          { value: "negative", label: t("accounts:accountsFilter.status_negative") },
          { value: "zero", label: t("accounts:accountsFilter.status_zero") },
        ],
      },
      {
        key: "owner",
        label: t("accounts:accountsFilter.owner_label"),
        type: "multi-select",
        options: userOptions,
      },
      {
        key: "balance",
        label: t("accounts:accountsFilter.balance_label"),
        type: "range",
      },
    ];
  }, [users, t, accounts]);

  const sortOptions = [
    { value: "default", label: t("accounts:accountsFilter.sort_default") },
    { value: "balance-desc", label: t("accounts:accountsFilter.sort_balance_desc") },
    { value: "balance-asc", label: t("accounts:accountsFilter.sort_balance_asc") },
    { value: "name-asc", label: t("accounts:accountsFilter.sort_name_asc") },
    { value: "name-desc", label: t("accounts:accountsFilter.sort_name_desc") },
  ];

  const filteredAccounts = useMemo(() => {
    const safeAccounts: FilterableAccount[] = accounts.map((account) => ({
      ...account,
      calculated_balance: Number(
        account.calculated_balance ?? account.balance ?? 0,
      ),
    }));

    const result = safeAccounts.filter((account) => {
      if (
        searchQuery &&
        !account.name.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }

      if (filters.type.length > 0) {
        const normalizedType = account.type === "piggy_bank" ? "savings" : account.type;
        if (!filters.type.includes(normalizedType)) return false;
      }

      if (
        filters.currency.length > 0 &&
        !filters.currency.includes(account.currency)
      ) {
        return false;
      }

      if (filters.owner.length > 0 && !filters.owner.includes(account.user_id)) {
        return false;
      }

      if (filters.bank.length > 0) {
        if (account.type !== "card") return false;
        const bankId = identifyBank(account);
        if (!filters.bank.includes(bankId)) return false;
      }

      if (filters.status.length > 0) {
        const status =
          account.calculated_balance > 0
            ? "positive"
            : account.calculated_balance < 0
              ? "negative"
              : "zero";
        if (!filters.status.includes(status)) return false;
      }

      const balanceValue = account.calculated_balance / 100;
      if (
        filters.balance.min !== "" &&
        balanceValue < Number(filters.balance.min)
      ) {
        return false;
      }
      if (
        filters.balance.max !== "" &&
        balanceValue > Number(filters.balance.max)
      ) {
        return false;
      }

      return true;
    });

    result.sort((a, b) => {
      switch (sortBy) {
        case "name-asc":
          return a.name.localeCompare(b.name);
        case "name-desc":
          return b.name.localeCompare(a.name);
        case "balance-desc":
          return b.calculated_balance - a.calculated_balance;
        case "balance-asc":
          return a.calculated_balance - b.calculated_balance;
        default:
          return 0;
      }
    });

    return result;
  }, [accounts, searchQuery, sortBy, filters]);

  const groupedAccounts = useMemo(() => {
    const groups: Record<string, FilterableAccount[]> = {};

    const keyOther = t("accounts:accountsFilter.group_other_cards");
    const keyCash = t("accounts:accountsFilter.group_cash");
    const keySavings = t("accounts:accountsFilter.group_savings");

    groups.Monobank = [];
    groups.PrivatBank = [];
    groups.Oschadbank = [];
    groups[keyOther] = [];
    groups[keyCash] = [];
    groups[keySavings] = [];

    filteredAccounts.forEach((account) => {
      if (account.type === "card") {
        const bankId = identifyBank(account);

        if (bankId === "monobank") groups.Monobank.push(account);
        else if (bankId === "privat") groups.PrivatBank.push(account);
        else if (bankId === "oschad") groups.Oschadbank.push(account);
        else if (bankId === "pumb") {
          if (!groups.PUMB) groups.PUMB = [];
          groups.PUMB.push(account);
        } else if (bankId === "sense") {
          if (!groups["Sense Bank"]) groups["Sense Bank"] = [];
          groups["Sense Bank"].push(account);
        } else {
          groups[keyOther].push(account);
        }
      } else if (account.type === "cash") {
        groups[keyCash].push(account);
      } else {
        groups[keySavings].push(account);
      }
    });

    return groups;
  }, [filteredAccounts, t]);

  const handleFilterChange = <K extends keyof AccountFilterState>(
    key: K,
    value: AccountFilterState[K],
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleClearAll = () => {
    setSearchQuery("");
    setFilters({
      type: [],
      bank: [],
      currency: [],
      owner: [],
      status: [],
      balance: { min: "", max: "" },
    });
    setSortBy("default");
  };

  return {
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    viewMode,
    setViewMode,
    filters,
    handleFilterChange,
    handleClearAll,
    filteredAccounts,
    groupedAccounts,
    filtersConfig,
    sortOptions,
  };
}
