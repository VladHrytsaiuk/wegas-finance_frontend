import { useState, useMemo, useEffect } from "react";
// 🔥 Імпортуємо нові скіни (хоча для логіки фільтрації вони менш важливі, ніж bank_name)
import { BANK_SKINS } from "../../components/accounts/bankSkins"; // Перевір шлях
import type { FilterConfig } from "../../components/shared/TableToolbar/types";
import { useTranslation } from "react-i18next";

export function useAccountsFilter(accounts: any[], users: any[]) {
  const { t } = useTranslation();

  // --- STATE ---
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("default");

  const [viewMode, setViewMode] = useState<"grid" | "table">(() => {
    const saved = localStorage.getItem("accountsViewMode");
    return saved === "table" ? "table" : "grid";
  });

  const [filters, setFilters] = useState({
    type: [] as string[],
    bank: [] as string[],
    currency: [] as string[],
    owner: [] as string[],
    status: [] as string[],
    balance: { min: "", max: "" },
  });

  useEffect(() => {
    localStorage.setItem("accountsViewMode", viewMode);
  }, [viewMode]);

  // --- HELPER: Визначення банку ---
  const identifyBank = (acc: any): string => {
    if (acc.type !== "card") return "";

    // 1. Дивимось на поле bank_name
    let bankId = acc.bank_name;

    // 2. Якщо пусто, пробуємо вгадати по іконці (стара логіка)
    if (!bankId && acc.icon) {
      const icon = acc.icon.toLowerCase();
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

  // --- CONFIGS ---
  const filtersConfig: FilterConfig[] = useMemo(() => {
    const userOptions = users.map((u: any) => ({
      value: u.id,
      label: u.name,
    }));

    // 🔥 ТЯГНЕМО З BANK_SKINS
    // 1. Беремо всі значення об'єкта BANK_SKINS
    // 2. Фільтруємо, щоб отримати тільки унікальні банки за їх bankId
    const bankOptionsMap = new Map();

    Object.values(BANK_SKINS).forEach((skin: any) => {
      // Ігноруємо дефолтний скін та готівку, якщо вони там є
      if (skin.bankId && skin.bankId !== "cash" && skin.bankId !== "other") {
        if (!bankOptionsMap.has(skin.bankId)) {
          bankOptionsMap.set(skin.bankId, {
            value: skin.bankId,
            // Спробуємо взяти назву банку (наприклад, з label або розпарсити)
            // Можна додати поле bankName в BANK_SKINS для чистоти,
            // або просто зробити першу літеру великою:
            label: skin.bankId.charAt(0).toUpperCase() + skin.bankId.slice(1),
            icon: skin.miniLogoFile, // Беремо іконку прямо зі скіна!
          });
        }
      }
    });

    // Перетворюємо Map у масив та додаємо "Інші"
    const bankOptions = [
      ...Array.from(bankOptionsMap.values()),
      {
        value: "other",
        label: t("accountsFilter.bank_other", "Інші"),
        // 🔥 Змінюємо icon_default на HiCreditCard
        // SmartIcon не знайде файл /banks/HiCreditCard.svg і автоматично
        // відмалює іконку HiCreditCard з вашого ICON_MAP
        icon: "HiCreditCard",
      },
    ];

    return [
      {
        key: "type",
        label: t("accountsFilter.type_label"),
        type: "toggle",
        options: [
          { value: "card", label: t("accountsFilter.type_card") },
          { value: "cash", label: t("accountsFilter.type_cash") },
          { value: "savings", label: t("accountsFilter.type_savings") },
        ],
      },
      {
        key: "bank",
        label: t("accountsFilter.bank_label"),
        type: "multi-select",
        options: bankOptions,
      },
      {
        key: "currency",
        label: t("accountsFilter.currency_label"),
        type: "multi-select",
        options: [
          { value: "UAH", label: "UAH" },
          { value: "USD", label: "USD" },
          { value: "EUR", label: "EUR" },
        ],
      },
      {
        key: "status",
        label: t("accountsFilter.status_label"),
        type: "multi-select",
        options: [
          { value: "positive", label: t("accountsFilter.status_positive") },
          { value: "negative", label: t("accountsFilter.status_negative") },
          { value: "zero", label: t("accountsFilter.status_zero") },
        ],
      },
      {
        key: "owner",
        label: t("accountsFilter.owner_label"),
        type: "multi-select",
        options: userOptions,
      },
      {
        key: "balance",
        label: t("accountsFilter.balance_label"),
        type: "range",
      },
    ];
  }, [users, t]);

  const sortOptions = [
    { value: "default", label: t("accountsFilter.sort_default") },
    { value: "balance-desc", label: t("accountsFilter.sort_balance_desc") },
    { value: "balance-asc", label: t("accountsFilter.sort_balance_asc") },
    { value: "name-asc", label: t("accountsFilter.sort_name_asc") },
    { value: "name-desc", label: t("accountsFilter.sort_name_desc") },
  ];

  // --- LOGIC (Фільтрація та Сортування) ---
  const filteredAccounts = useMemo(() => {
    // 1. Safe parsing
    const safeAccounts = accounts.map((acc: any) => ({
      ...acc,
      calculated_balance: Number(acc.calculated_balance ?? acc.balance ?? 0),
    }));

    // 2. Filter
    let result = safeAccounts.filter((acc: any) => {
      // Пошук за назвою
      if (
        searchQuery &&
        !acc.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
        return false;

      // Тип
      if (filters.type.length > 0 && !filters.type.includes(acc.type))
        return false;

      // Валюта
      if (
        filters.currency.length > 0 &&
        !filters.currency.includes(acc.currency)
      )
        return false;

      // Власник
      if (filters.owner.length > 0 && !filters.owner.includes(acc.user_id))
        return false;

      // 🔥 Банк (Виправлено)
      if (filters.bank.length > 0) {
        if (acc.type !== "card") return false;
        const bankId = identifyBank(acc);
        // Перевіряємо, чи є ID банку (напр. "monobank") у списку вибраних фільтрів
        if (!filters.bank.includes(bankId)) return false;
      }

      // Статус (позитивний/негативний)
      if (filters.status.length > 0) {
        const status =
          acc.calculated_balance > 0
            ? "positive"
            : acc.calculated_balance < 0
              ? "negative"
              : "zero";
        if (!filters.status.includes(status)) return false;
      }

      // Баланс (Діапазон)
      const balanceVal = acc.calculated_balance / 100;
      if (
        filters.balance.min !== "" &&
        balanceVal < Number(filters.balance.min)
      )
        return false;
      if (
        filters.balance.max !== "" &&
        balanceVal > Number(filters.balance.max)
      )
        return false;

      return true;
    });

    // 3. Sort
    result.sort((a: any, b: any) => {
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
  }, [accounts, searchQuery, sortBy, filters, t]);

  // --- GROUPING (Для відображення Grid, якщо використовується цей хук для групування) ---
  const groupedAccounts = useMemo(() => {
    const groups: Record<string, any[]> = {};

    // Ключі для груп (мають збігатися з тим, що очікує Grid, або просто для відображення)
    const KEY_OTHER = t("accountsFilter.group_other_cards");
    const KEY_CASH = t("accountsFilter.group_cash");
    const KEY_SAVINGS = t("accountsFilter.group_savings");

    // Ініціалізуємо основні групи, щоб вони були в певному порядку (опціонально)
    groups["Monobank"] = [];
    groups["PrivatBank"] = [];
    groups["Oschadbank"] = [];
    groups[KEY_OTHER] = [];
    groups[KEY_CASH] = [];
    groups[KEY_SAVINGS] = [];

    filteredAccounts.forEach((acc: any) => {
      if (acc.type === "card") {
        const bankId = identifyBank(acc);

        // Мапимо ID на красиву назву групи
        if (bankId === "monobank") groups["Monobank"].push(acc);
        else if (bankId === "privat") groups["PrivatBank"].push(acc);
        else if (bankId === "oschad") groups["Oschadbank"].push(acc);
        else if (bankId === "pumb") {
          if (!groups["PUMB"]) groups["PUMB"] = [];
          groups["PUMB"].push(acc);
        } else if (bankId === "sense") {
          if (!groups["Sense Bank"]) groups["Sense Bank"] = [];
          groups["Sense Bank"].push(acc);
        } else groups[KEY_OTHER].push(acc);
      } else if (acc.type === "cash") {
        groups[KEY_CASH].push(acc);
      } else {
        groups[KEY_SAVINGS].push(acc);
      }
    });

    // Очищаємо пусті групи, якщо треба (але Grid зазвичай сам фільтрує)
    return groups;
  }, [filteredAccounts, t]);

  const handleFilterChange = (key: string, value: any) => {
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
