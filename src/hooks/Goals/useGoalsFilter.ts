import React, { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import type { FilterConfig } from "../../components/shared/TableToolbar/types";
import { getCurrencyOptions } from "../../utils/currency";

export function useGoalsFilter(goals: any[]) {
  const { t } = useTranslation();

  // --- STATE ---
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("deadline-asc"); // Сортування за замовчуванням: найближчі дедлайни

  const [filters, setFilters] = useState({
    status: [] as string[],
    currency: [] as string[],
    // Можна додати діапазон прогресу, якщо треба
    // progress: { min: "", max: "" },
  });

  // --- CONFIGS ---
  const filtersConfig: FilterConfig[] = useMemo(
    () => [
      {
        key: "status",
        label: t("goals_debts:goals.filter_status"),
        type: "multi-select",
        options: [
          { value: "active", label: t("goals_debts:goals.status_active", "Активні") },
          { value: "reached", label: t("goals_debts:goals.status_reached", "Досягнуті") },
          { value: "paused", label: t("goals_debts:goals.status_paused", "На паузі") },
          { value: "failed", label: t("goals_debts:goals.status_failed", "Провалені") },
        ],
      },
      {
        key: "currency",
        label: t("goals_debts:goals.filter_currency"),
        type: "multi-select",
        options: getCurrencyOptions(),
      },
    ],
    [t],
  );

  const sortOptions = useMemo(
    () => [
      {
        value: "deadline-asc",
        label: t("goals_debts:goals.sort_deadline_asc", "Дедлайн (спочатку ближні)"),
      },
      {
        value: "deadline-desc",
        label: t("goals_debts:goals.sort_deadline_desc", "Дедлайн (спочатку дальні)"),
      },
      {
        value: "progress-desc",
        label: t("goals_debts:goals.sort_progress_desc", "Прогрес (високий -> низький)"),
      },
      {
        value: "progress-asc",
        label: t("goals_debts:goals.sort_progress_asc", "Прогрес (низький -> високий)"),
      },
      {
        value: "amount-desc",
        label: t("goals_debts:goals.sort_amount_desc", "Сума (велика -> мала)"),
      },
      {
        value: "amount-asc",
        label: t("goals_debts:goals.sort_amount_asc", "Сума (мала -> велика)"),
      },
      { value: "name-asc", label: t("goals_debts:goals.sort_name_asc", "Назва (А-Я)") },
    ],
    [t],
  );

  // --- LOGIC ---
  const filteredGoals = useMemo(() => {
    let result = goals.filter((goal) => {
      // 1. Пошук
      if (
        searchQuery &&
        !goal.name.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }

      // 2. Статус
      if (filters.status.length > 0 && !filters.status.includes(goal.status)) {
        return false;
      }

      // 3. Валюта
      if (
        filters.currency.length > 0 &&
        !filters.currency.includes(goal.currency)
      ) {
        return false;
      }

      return true;
    });

    // --- SORTING ---
    result.sort((a, b) => {
      switch (sortBy) {
        case "name-asc":
          return a.name.localeCompare(b.name);

        case "amount-desc":
          return b.target_amount - a.target_amount;
        case "amount-asc":
          return a.target_amount - b.target_amount;

        case "progress-desc":
          return b.percentage - a.percentage;
        case "progress-asc":
          return a.percentage - b.percentage;

        case "deadline-asc":
          // Цілі без дедлайну - в кінець
          if (!a.date_deadline) return 1;
          if (!b.date_deadline) return -1;
          return a.date_deadline - b.date_deadline;

        case "deadline-desc":
          if (!a.date_deadline) return 1;
          if (!b.date_deadline) return -1;
          return b.date_deadline - a.date_deadline;

        default:
          return 0;
      }
    });

    return result;
  }, [goals, searchQuery, filters, sortBy]);

  // --- HANDLERS ---
  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleClearAll = () => {
    setSearchQuery("");
    setFilters({ status: [], currency: [] });
    setSortBy("deadline-asc");
  };

  return {
    searchQuery,
    setSearchQuery,
    filters,
    sortBy,
    setSortBy,

    filteredGoals,

    filtersConfig,
    sortOptions,

    handleFilterChange,
    handleClearAll,
  };
}
