import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { getMeApi } from "../../services/apiUsers";
import { canSeeObject } from "./useWishlistFilters"; // Імпорт спільної логіки приватності
import type { FilterConfig } from "../../components/shared/TableToolbar/types";
import type { WishlistGroup, WishlistItem } from "../../types";

export const useWishlistGroupFilters = (
  groups: WishlistGroup[],
  items: WishlistItem[],
) => {
  const { t } = useTranslation();
  const { data: user } = useQuery({ queryKey: ["me"], queryFn: getMeApi });
  const userId = user?.id;

  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("name-asc");
  const [filters, setFilters] = useState<{
    author: string[];
    visibility: string[];
  }>({
    author: [],
    visibility: [],
  });

  const filtersConfig: FilterConfig[] = [
    {
      key: "author",
      type: "multi-select",
      label: t("shopping_wishlist:wishlist.filter_author", "Автор"),
      options: [
        { value: "me", label: "Мої папки" },
        { value: "others", label: "Спільні папки" },
      ],
    },
    {
      key: "visibility",
      type: "multi-select",
      label: t("shopping_wishlist:wishlist.filter_visibility", "Видимість"),
      options: [
        { value: "public", label: "Публічні" },
        { value: "private", label: "Приватні" },
      ],
    },
  ];

  const sortOptions = [
    { value: "name-asc", label: "Назва (А-Я)" },
    { value: "name-desc", label: "Назва (Я-А)" },
    { value: "count-desc", label: "Найбільше бажань" },
    { value: "count-asc", label: "Найменше бажань" },
  ];

  const handleFilterChange = (key: string, values: string[]) => {
    setFilters((prev) => ({ ...prev, [key]: values }));
  };

  const handleClearAll = () => {
    setFilters({ author: [], visibility: [] });
    setSearchQuery("");
  };

  const processedGroups = useMemo(() => {
    if (!userId) return [];

    return groups
      .map((g) => ({
        ...g,
        itemsCount: items.filter((i) => i.group_id === g.id).length,
      }))
      .filter((g) => {
        if (!canSeeObject(g, userId)) return false;
        if (
          searchQuery &&
          !g.name.toLowerCase().includes(searchQuery.toLowerCase())
        ) {
          return false;
        }

        if (filters.author.length > 0) {
          const isMine = g.user_id === userId;
          if (
            filters.author.includes("me") &&
            !filters.author.includes("others") &&
            !isMine
          )
            return false;
          if (
            filters.author.includes("others") &&
            !filters.author.includes("me") &&
            isMine
          )
            return false;
        }

        if (filters.visibility.length > 0) {
          if (!filters.visibility.includes(g.visibility)) return false;
        }

        return true;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case "name-asc":
            return a.name.localeCompare(b.name);
          case "name-desc":
            return b.name.localeCompare(a.name);
          case "count-desc":
            return b.itemsCount - a.itemsCount;
          case "count-asc":
            return a.itemsCount - b.itemsCount;
          default:
            return 0;
        }
      });
  }, [groups, items, searchQuery, filters, sortBy, userId]);

  const itemsWithoutGroup = items.filter((i) => !i.group_id);
  const myItemsCount = itemsWithoutGroup.filter(
    (i) => i.user_id === userId,
  ).length;
  const sharedItemsCount = itemsWithoutGroup.filter(
    (i) => i.user_id !== userId,
  ).length;

  let showMyVirtual = !searchQuery && myItemsCount > 0;
  let showSharedVirtual = !searchQuery && sharedItemsCount > 0;

  if (filters.author.length > 0) {
    if (!filters.author.includes("me")) showMyVirtual = false;
    if (!filters.author.includes("others")) showSharedVirtual = false;
  }

  return {
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    filters,
    filtersConfig,
    sortOptions,
    handleFilterChange,
    handleClearAll,
    processedGroups,
    showMyVirtual,
    showSharedVirtual,
    myItemsCount,
    sharedItemsCount,
    userId,
  };
};
