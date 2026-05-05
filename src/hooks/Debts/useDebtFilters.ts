import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import type { FilterConfig } from "../../components/shared/TableToolbar/types";

export function useDebtFilters(availableCurrencies: string[]) {
  const { t } = useTranslation();

  // --- STATE ---
  const [searchQuery, setSearchQuery] = useState("");
  const [sortValue, setSortValue] = useState("name-asc");
  const [filterValues, setFilterValues] = useState<Record<string, any>>({
    type: [], // 'debtor' (мені винні) або 'creditor' (я винен)
    currency: [],
  });

  // --- HANDLERS ---
  const handleSearchChange = (val: string) => setSearchQuery(val);
  const handleSortChange = (val: string) => setSortValue(val);

  const handleFilterChange = (key: string, val: any) => {
    setFilterValues((prev) => ({ ...prev, [key]: val }));
  };

  const handleClearAll = () => {
    setSearchQuery("");
    setSortValue("name-asc");
    setFilterValues({ type: [], currency: [] });
  };

  // --- CONFIG ---
  const filtersConfig: FilterConfig[] = useMemo(() => {
    return [
      {
        key: "type",
        // Використовуємо існуючий ключ "Тип" з сторінки контрагентів
        label: t("counterpartiesPage.filter_type_label"),
        type: "toggle",
        options: [
          {
            value: "debtor",
            // "Мені винні" (з блоку Summary)
            label: t("debtsPage.summary_owed_to_me"),
          },
          {
            value: "creditor",
            // "Я винен" (з блоку Summary)
            label: t("debtsPage.summary_i_owe"),
          },
        ],
      },
      {
        key: "currency",
        // "Валюта" (з фільтру рахунків)
        label: t("accountsFilter.currency_label"),
        type: "multi-select",
        options: availableCurrencies.map((c) => ({ value: c, label: c })),
      },
    ];
  }, [availableCurrencies, t]);

  const sortOptions = [
    // Використовуємо стандартні ключі сортування з counterpartiesPage
    { value: "name-asc", label: t("counterpartiesPage.sort_name_asc") },
    { value: "name-desc", label: t("counterpartiesPage.sort_name_desc") },
  ];

  return {
    searchQuery,
    sortValue,
    filterValues,
    filtersConfig,
    sortOptions,
    handleSearchChange,
    handleSortChange,
    handleFilterChange,
    handleClearAll,
  };
}
