import { useState, useMemo } from "react";
import type { FilterConfig } from "../../components/shared/TableToolbar/types";
import type { UtilityMeter } from "../../types";

export function useUtilityFilters(meters: UtilityMeter[]) {
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
        label: "Тип сервісу",
        type: "multi-select",
        options: [
          {
            value: "electricity",
            label: "Світло",
            icon: "HiBolt",
            color: "#f59e0b",
          },
          { value: "water", label: "Вода", icon: "HiBeaker", color: "#3b82f6" },
          { value: "gas", label: "Газ", icon: "HiFire", color: "#ef4444" },
          {
            value: "internet",
            label: "Інтернет",
            icon: "HiWifi",
            color: "#10b981",
          },
          { value: "rent", label: "Оренда", icon: "HiHome", color: "#6366f1" },
          {
            value: "heating",
            label: "Опалення",
            unit: "Gcal",
            icon: "HiSun",
            color: "#f97316",
          },
        ],
      },
    ],
    [],
  );

  // Опції для dropdown сортування, які тепер керують групуванням
  const sortOptions = [
    { value: "group-asset", label: "По нерухомості" },
    { value: "group-type", label: "По типу послуг" },
    { value: "name-asc", label: "А-Я (Списком)" },
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
      groups["Всі"] = filteredMeters.sort((a, b) =>
        a.name.localeCompare(b.name),
      );
    } else if (sortValue === "group-asset") {
      // Групуємо по Asset
      filteredMeters.forEach((m) => {
        const key = m.asset?.name || "Інше / Без прив'язки";
        if (!groups[key]) groups[key] = [];
        groups[key].push(m);
      });
    } else if (sortValue === "group-type") {
      // Групуємо по Type
      const typeLabels: Record<string, string> = {
        electricity: "Електроенергія",
        water: "Водопостачання",
        gas: "Газопостачання",
        internet: "Інтернет та ТБ",
        rent: "Квартплата / Оренда",
        heating: "Опалення",
      };
      filteredMeters.forEach((m) => {
        const key = typeLabels[m.type] || "Інше";
        if (!groups[key]) groups[key] = [];
        groups[key].push(m);
      });
    }

    return groups;
  }, [filteredMeters, sortValue]);

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
