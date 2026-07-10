import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import type { FilterConfig } from "../../components/shared/TableToolbar/types";
import { getCurrencyOptions } from "../../utils/currency";
import type { Goal } from "../../types";

interface GoalWithStats extends Goal {
  percentage: number;
  daysLeft: number | null;
  isUrgent: boolean;
  isOverdue: boolean;
}

interface GoalFilters {
  status: string[];
  currency: string[];
}

export function useGoalsFilter(goals: GoalWithStats[]) {
  const { t } = useTranslation();

  // --- STATE ---
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("deadline-asc"); // Сортування за замовчуванням: найближчі дедлайни

  const [filters, setFilters] = useState<GoalFilters>({
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
          { value: "active", label: t("goals_debts:goals.status_active") },
          { value: "reached", label: t("goals_debts:goals.status_reached") },
          { value: "paused", label: t("goals_debts:goals.status_paused") },
          { value: "failed", label: t("goals_debts:goals.status_failed") },
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
        label: t("goals_debts:goals.sort_deadline_asc"),
      },
      {
        value: "deadline-desc",
        label: t("goals_debts:goals.sort_deadline_desc"),
      },
      {
        value: "progress-desc",
        label: t("goals_debts:goals.sort_progress_desc"),
      },
      {
        value: "progress-asc",
        label: t("goals_debts:goals.sort_progress_asc"),
      },
      {
        value: "amount-desc",
        label: t("goals_debts:goals.sort_amount_desc"),
      },
      {
        value: "amount-asc",
        label: t("goals_debts:goals.sort_amount_asc"),
      },
      { value: "name-asc", label: t("goals_debts:goals.sort_name_asc") },
    ],
    [t],
  );

  // --- LOGIC ---
  const filteredGoals = useMemo(() => {
    const result = goals.filter((goal) => {
      // 1. Пошук
      if (
        searchQuery &&
        !goal.name.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }

      // 2. Статус (Robust case-insensitive filtering with visual state mapping)
      if (filters.status.length > 0) {
        const goalStatus = (goal.status || "").toLowerCase();
        // A goal is visually 'Done' if status is reached/done OR progress is 100%
        const isVisuallyCompleted =
          goalStatus === "reached" ||
          goalStatus === "done" ||
          (goal.percentage && goal.percentage >= 100);

        const isMatch = filters.status.some((filterVal) => {
          const fv = filterVal.toLowerCase();

          if (fv === "reached" || fv === "done") {
            return isVisuallyCompleted;
          }

          if (fv === "active") {
            // Active filter should exclude visually completed goals
            return goalStatus === "active" && !isVisuallyCompleted;
          }

          return goalStatus === fv;
        });

        if (!isMatch) return false;
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
  const handleFilterChange = <K extends keyof GoalFilters>(
    key: K,
    value: GoalFilters[K],
  ) => {
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
