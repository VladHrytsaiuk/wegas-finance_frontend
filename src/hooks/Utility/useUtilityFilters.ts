import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import type { FilterConfig } from "../../components/shared/TableToolbar/types";
import type { UtilityMeter } from "../../types";

export function useUtilityFilters(meters: UtilityMeter[]) {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");

  // sortValue тепер використовуємо і для сортування, і для групування
  // "group-asset" -> Групувати по нерухомості
  // "group-type" -> Групувати по типу
  const [sortValue, setSortValue] = useState("group-asset");

  const [filterValues, setFilterValues] = useState<Record<string, any>>({
    type: [],
  });

  const handleSearchChange = (val: string) => setSearchQuery(val);
  const handleSortChange = (val: string) => setSortValue(val);
  const handleFilterChange = (key: string, val: any) => {
    setFilterValues((prev) => ({ ...prev, [key]: val }));
  };
  const handleClearAll = () => {
    setSearchQuery("");
    setFilterValues({ type: [] });
    setSortValue("group-asset");
  };

  const filtersConfig: FilterConfig[] = useMemo(
    () => [
      {
        key: "type",
        label: t("stats_utility:filters.type_label"),
        type: "multi-select",
        options: [
          {
            value: "electricity",
            label: t("stats_utility:serviceTypes.electricity"),
            icon: "HiBolt",
            color: "#f59e0b",
          },
          {
            value: "water",
            label: t("stats_utility:serviceTypes.water"),
            icon: "HiBeaker",
            color: "#3b82f6",
          },
          {
            value: "gas",
            label: t("stats_utility:serviceTypes.gas"),
            icon: "HiFire",
            color: "#ef4444",
          },
          {
            value: "internet",
            label: t("stats_utility:serviceTypes.internet"),
            icon: "HiWifi",
            color: "#10b981",
          },
          {
            value: "rent",
            label: t("stats_utility:serviceTypes.rent"),
            icon: "HiHome",
            color: "#6366f1",
          },
          {
            value: "heating",
            label: t("stats_utility:serviceTypes.heating"),
            unit: "Gcal",
            icon: "HiSun",
            color: "#f97316",
          },
        ],
      },
    ],
    [t],
  );

  // Опції для dropdown сортування, які тепер керують групуванням
  const sortOptions = [
    { value: "group-asset", label: t("stats_utility:filters.sort_by_asset") },
    { value: "group-type", label: t("stats_utility:filters.sort_by_type") },
    { value: "name-asc", label: t("stats_utility:filters.sort_alphabetical") },
  ];

  // 1. Спочатку фільтруємо
  const filteredMeters = useMemo(() => {
    let result = [...meters];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.personal_account?.toLowerCase().includes(q) ||
          m.asset?.name?.toLowerCase().includes(q),
      );
    }

    if (filterValues.type.length > 0) {
      result = result.filter((m) => filterValues.type.includes(m.type));
    }

    return result;
  }, [meters, searchQuery, filterValues]);

  // 2. Тепер групуємо
  const groupedMeters = useMemo(() => {
    const groups: Record<string, UtilityMeter[]> = {};

    if (sortValue === "name-asc") {
      // Якщо вибрано просто сортування - одна група "Всі"
      groups[t("stats_utility:filters.group_all")] = filteredMeters.sort(
        (a, b) => a.name.localeCompare(b.name),
      );
    } else if (sortValue === "group-asset") {
      // Групуємо по Asset
      filteredMeters.forEach((m) => {
        const key = m.asset?.name || t("stats_utility:filters.group_other");
        if (!groups[key]) groups[key] = [];
        groups[key].push(m);
      });
    } else if (sortValue === "group-type") {
      // Групуємо по Type
      filteredMeters.forEach((m) => {
        const key =
          t(`stats_utility:serviceTypes.${m.type}`) ||
          t("stats_utility:serviceTypes.other");
        if (!groups[key]) groups[key] = [];
        groups[key].push(m);
      });
    }

    return groups;
  }, [filteredMeters, sortValue, t]);

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
    groupedMeters, // Повертаємо згруповані дані
  };
}
