import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import type { Asset } from "../../types";
import type { FilterConfig } from "../../components/shared/TableToolbar/types";

export function useAssetsFilter(assets: Asset[] = []) {
  const { t } = useTranslation();

  // --- STATE ---
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("purchase_date-desc"); // За замовчуванням: нові покупки
  const [filters, setFilters] = useState({});

  // --- CONFIGS ---
  const filtersConfig: FilterConfig[] = []; // Поки що без фільтрів

  const sortOptions = useMemo(
    () => [
      {
        value: "price-desc",
        label: t("assets:assetsPage.sort_price_desc", "Найдорожчі"),
      },
      {
        value: "price-asc",
        label: t("assets:assetsPage.sort_price_asc", "Найдешевші"),
      },
      {
        value: "purchase_date-desc",
        label: t("assets:assetsPage.sort_purchase_desc", "Нові покупки"),
      },
      {
        value: "purchase_date-asc",
        label: t("assets:assetsPage.sort_purchase_asc", "Старі покупки"),
      },
      {
        value: "name-asc",
        label: t("assets:assetsPage.sort_name_asc", "Назва (А-Я)"),
      },
    ],
    [t],
  );

  // --- LOGIC ---
  const filteredAssets = useMemo(() => {
    let result = assets ? [...assets] : [];

    // 1. Пошук
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter((asset) =>
        asset.name.toLowerCase().includes(q)
      );
    }

    // 2. Сортування
    result.sort((a, b) => {
      switch (sortBy) {
        case "name-asc":
          return a.name.localeCompare(b.name);

        case "price-desc":
          return (b.price || 0) - (a.price || 0);
        case "price-asc":
          return (a.price || 0) - (b.price || 0);

        case "purchase_date-desc":
          return (b.purchase_date || 0) - (a.purchase_date || 0);
        case "purchase_date-asc":
          return (a.purchase_date || 0) - (b.purchase_date || 0);

        default:
          return 0;
      }
    });

    return result;
  }, [assets, searchQuery, sortBy]);

  const handleFilterChange = (key: string, value: string[] | { min: string; max: string }) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleClearAll = () => {
    setSearchQuery("");
    setFilters({});
    setSortBy("purchase_date-desc");
  };

  return {
    searchQuery,
    setSearchQuery,
    filters,
    filtersConfig,
    sortBy,
    setSortBy,
    filteredAssets,
    sortOptions,
    handleFilterChange,
    handleClearAll,
  };
}
