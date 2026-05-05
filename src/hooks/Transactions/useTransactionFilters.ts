import { useState, useMemo, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { startOfDay, endOfDay } from "date-fns";

// API
import { getCategoriesApi } from "../../services/apiCategories";
import { getAccountsApi } from "../../services/apiAccounts";
import { getCounterpartiesApi } from "../../services/apiCounterparties";
import { getUsersApi } from "../../services/apiUsers";

import type { FilterConfig } from "../../components/shared/TableToolbar/types";
import { BANK_SKINS } from "../../components/accounts/bankSkins";

const PAGE_SIZE = 20;

export function useTransactionFilters() {
  const { t } = useTranslation();

  // --- 1. STATE ---
  const [page, setPage] = useState(1);

  // 🔥 1. Розділяємо стейт: один для Інпуту (швидкий), один для API (повільний)
  const [searchQuery, setSearchQuery] = useState(""); // Те, що бачить користувач
  const [debouncedSearch, setDebouncedSearch] = useState(""); // Те, що йде на бекенд

  const [sortValue, setSortValue] = useState("date-desc");

  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined,
  });

  const [filterValues, setFilterValues] = useState<Record<string, any>>({
    type: [],
    account: [],
    category: [],
    counterparty: [],
    amount: { min: "", max: "" },
  });

  // --- 2. DEBOUNCE EFFECT ---
  // 🔥 Цей ефект чекає 500мс після того, як ви перестали друкувати
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Коли змінюється реальний пошуковий запит - скидаємо сторінку
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  // --- 3. REFERENCE DATA ---
  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategoriesApi,
    staleTime: 5 * 60 * 1000,
  });
  const { data: accounts = [] } = useQuery({
    queryKey: ["accounts"],
    queryFn: getAccountsApi,
    staleTime: 5 * 60 * 1000,
  });
  const { data: counterparties = [] } = useQuery({
    queryKey: ["counterparties"],
    queryFn: getCounterpartiesApi,
    staleTime: 5 * 60 * 1000,
  });
  const { data: users = [] } = useQuery({
    queryKey: ["users"],
    queryFn: getUsersApi,
    staleTime: 5 * 60 * 1000,
  });

  // --- 4. HANDLERS ---
  const handleFilterChange = useCallback((key: string, val: any) => {
    setFilterValues((prev) => ({ ...prev, [key]: val }));
    setPage(1);
  }, []);

  const handleSearchChange = useCallback((val: string) => {
    // Оновлюємо тільки UI стейт миттєво
    setSearchQuery(val);
    // setPage(1) прибрали звідси, воно тепер в useEffect
  }, []);

  const handleSortChange = useCallback((val: string) => {
    setSortValue(val);
    setPage(1);
  }, []);

  const handleDateRangeChange = useCallback(
    (range: { from: Date | undefined; to: Date | undefined }) => {
      setDateRange(range);
      setPage(1);
    },
    [],
  );

  const handleClearAll = useCallback(() => {
    setFilterValues({
      type: [],
      account: [],
      category: [],
      counterparty: [],
      amount: { min: "", max: "" },
    });
    setDateRange({ from: undefined, to: undefined });
    setSearchQuery(""); // Очищаємо інпут
    setDebouncedSearch(""); // Очищаємо API запит
    setSortValue("date-desc");
    setPage(1);
  }, []);

  // --- 5. API PARAMS ---
  const apiParams = useMemo(() => {
    const fromTs = dateRange.from
      ? startOfDay(dateRange.from).getTime()
      : undefined;
    const toTs = dateRange.to ? endOfDay(dateRange.to).getTime() : undefined;

    return {
      page,
      limit: PAGE_SIZE,
      // 🔥 Використовуємо debouncedSearch замість searchQuery
      // Також важливо: якщо рядок порожній, передаємо undefined, щоб бекенд не шукав ""
      search: debouncedSearch || undefined,
      sort: sortValue,

      date_from: fromTs,
      date_to: toTs,

      type: filterValues.type.length ? filterValues.type[0] : undefined,
      account_id: filterValues.account.length
        ? filterValues.account
        : undefined,
      category_id: filterValues.category.length
        ? filterValues.category
        : undefined,
      counterparty_id: filterValues.counterparty.length
        ? filterValues.counterparty
        : undefined,

      min_amount: filterValues.amount.min
        ? Number(filterValues.amount.min) * 100
        : undefined,
      max_amount: filterValues.amount.max
        ? Number(filterValues.amount.max) * 100
        : undefined,
    };
  }, [page, debouncedSearch, sortValue, filterValues, dateRange]); // ⬅️ Тут залежність від debouncedSearch

  // --- 6. CONFIGS ---
  const filtersConfig: FilterConfig[] = useMemo(() => {
    const config: FilterConfig[] = [
      {
        key: "type",
        label: t("legacy:transactionFiltersHook.filter_type_label", "Тип"),
        type: "toggle",
        options: [
          {
            value: "expense",
            label: t(
              "legacy:transactionFiltersHook.filter_type_expense",
              "Витрати",
            ),
          },
          {
            value: "income",
            label: t(
              "legacy:transactionFiltersHook.filter_type_income",
              "Доходи",
            ),
          },
          {
            value: "transfer",
            label: t(
              "legacy:transactionFiltersHook.filter_type_transfer",
              "Перекази",
            ),
          },
        ],
      },
      {
        key: "account",
        label: t(
          "legacy:transactionFiltersHook.filter_account_label",
          "Рахунок",
        ),
        type: "multi-select",
        treeType: "accounts",
        rawData: accounts.map((acc: any) => {
          if (acc.type !== "card") return acc;
          const skinKey =
            acc.bank_name && acc.card_type
              ? `${acc.bank_name}-${acc.card_type}`
              : acc.icon;
          const skin = BANK_SKINS[skinKey] || BANK_SKINS["default"];
          return { ...acc, icon: skin.miniLogoFile || "HiCreditCard" };
        }),
        relatedData: users,
      },
    ];

    if (categories.length > 0) {
      config.push({
        key: "category",
        label: t(
          "legacy:transactionFiltersHook.filter_category_label",
          "Категорія",
        ),
        type: "multi-select",
        treeType: "categories",
        rawData: categories,
        options: categories.map((cat: any) => ({
          value: cat.id,
          label: cat.name,
          icon: cat.icon,
          color: cat.color,
        })),
      });
    }

    if (counterparties.length > 0) {
      const extractedCategoriesMap = new Map();
      counterparties.forEach((cp: any) => {
        if (cp.category && cp.category.id)
          extractedCategoriesMap.set(cp.category.id, cp.category);
      });
      config.push({
        key: "counterparty",
        label: t(
          "transactionFiltersHook.filter_counterparty_label",
          "Контрагент",
        ),
        type: "multi-select",
        treeType: "counterparties",
        rawData: counterparties,
        relatedData: Array.from(extractedCategoriesMap.values()),
      });
    }

    config.push({
      key: "amount",
      label: t("legacy:transactionFiltersHook.filter_amount_label", "Сума"),
      type: "range",
    });

    return config;
  }, [accounts, categories, counterparties, users, t]);

  const sortOptions = [
    {
      value: "date-desc",
      label: t("legacy:transactionFiltersHook.sort_date_desc", "Спочатку нові"),
    },
    {
      value: "date-asc",
      label: t("legacy:transactionFiltersHook.sort_date_asc", "Спочатку старі"),
    },
    {
      value: "amount-desc",
      label: t("legacy:transactionFiltersHook.sort_amount_desc", "Більша сума"),
    },
    {
      value: "amount-asc",
      label: t("legacy:transactionFiltersHook.sort_amount_asc", "Менша сума"),
    },
  ];

  return {
    page,
    setPage,
    searchQuery, // Повертаємо миттєве значення для інпуту
    sortValue,
    filterValues,
    dateRange,
    apiParams, // Тут вже зашито debounced значення
    filtersConfig,
    sortOptions,
    categories,
    accounts,
    pageSize: PAGE_SIZE,
    handleSearchChange,
    handleFilterChange,
    handleSortChange,
    handleDateRangeChange,
    handleClearAll,
  };
}
