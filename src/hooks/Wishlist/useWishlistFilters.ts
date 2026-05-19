import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import type { WishlistItem, WishlistGroup } from "../../types";
import type { FilterConfig } from "../../components/shared/TableToolbar/types";
import { useQuery } from "@tanstack/react-query";
import { getMeApi } from "../../services/apiUsers";

// 🔥 Універсальна логіка приватності (для списків та папок)
export const canSeeObject = (
  obj: { user_id: string; visibility: string; hidden_from?: string | null },
  myId: string,
) => {
  // 1. Якщо я власник — бачу завжди
  if (obj.user_id === myId) return true;

  // 2. Якщо приватне і я не власник — не бачу
  if (obj.visibility === "private") return false;

  // 3. Якщо публічне — перевіряємо список заблокованих
  if (obj.hidden_from) {
    const blockedIds = obj.hidden_from.split(",");
    if (blockedIds.includes(myId)) return false; // Я в чорному списку
  }

  return true;
};

export const useWishlistFilters = (
  items: WishlistItem[],
  groups: WishlistGroup[],
) => {
  const { t } = useTranslation();
  const { data: user } = useQuery({ queryKey: ["me"], queryFn: getMeApi });

  // 🔥 ВИТЯГУЄМО ID В ОКРЕМУ ЗМІННУ ДЛЯ REACT COMPILER
  const userId = user?.id;

  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("priority-desc");

  // Стани фільтрів
  const [filters, setFilters] = useState<{
    status: string[];
    priority: string[];
    group: string[];
    visibility: string[];
    author: string[];
    availability: string[];
  }>({
    status: [],
    priority: [],
    group: [],
    visibility: [],
    author: [],
    availability: [],
  });

  const filtersConfig = (
    [
      {
        key: "status",
        type: "multi-select",
        label: t("shopping_wishlist:wishlist.filter_status", "Статус"),
        options: [
          {
            value: "planning",
            label: t("shopping_wishlist:wishlist.status_planning", "В планах"),
          },
          { value: "bought", label: t("shopping_wishlist:wishlist.status_bought", "Придбано") },
        ],
      },
      {
        key: "availability",
        type: "multi-select",
        label: t("shopping_wishlist:wishlist.filter_availability", "Наявність"),
        options: [
          {
            value: "available",
            label: t("shopping_wishlist:wishlist.filter_availability_free", "Вільні"),
          },
          {
            value: "reserved_by_me",
            label: t(
              "shopping_wishlist:wishlist.filter_availability_reserved_by_me",
              "Зарезервовані мною",
            ),
          },
        ],
      },
      {
        key: "priority",
        type: "multi-select",
        label: t("shopping_wishlist:wishlist.filter_priority", "Пріоритет"),
        options: [
          {
            value: "3",
            label: t("shopping_wishlist:wishlist.priority_high", "Високий"),
          },
          {
            value: "2",
            label: t("shopping_wishlist:wishlist.priority_medium", "Середній"),
          },
          {
            value: "1",
            label: t("shopping_wishlist:wishlist.priority_low", "Низький"),
          },
        ],
      },
      {
        key: "group_id",
        type: "multi-select",
        label: t("shopping_wishlist:wishlist.filter_group", "Група"),
        options: groups.map((g) => ({ value: g.id, label: g.name })),
      },
      {
        key: "author",
        type: "multi-select",
        label: t("shopping_wishlist:wishlist.filter_author", "Автор"),
        options: [
          {
            value: "me",
            label: t("shopping_wishlist:wishlist.filter_author_me", "Створені мною"),
          },
          {
            value: "others",
            label: t("shopping_wishlist:wishlist.filter_author_others", "Спільні"),
          },
        ],
      },
    ] as FilterConfig[]
  ).filter((f) => f.options && f.options.length > 0);

  const sortOptions = [
    {
      value: "priority-desc",
      label: t("shopping_wishlist:wishlist.sort_priority_desc", "Пріоритет (високий)"),
    },
    {
      value: "priority-asc",
      label: t("shopping_wishlist:wishlist.sort_priority_asc", "Пріоритет (низький)"),
    },
    {
      value: "price-desc",
      label: t("shopping_wishlist:wishlist.sort_price_desc", "Найдорожчі"),
    },
    {
      value: "price-asc",
      label: t("shopping_wishlist:wishlist.sort_price_asc", "Найдешевші"),
    },
    {
      value: "newest",
      label: t("shopping_wishlist:wishlist.sort_newest", "Спочатку нові"),
    },
    {
      value: "oldest",
      label: t("shopping_wishlist:wishlist.sort_oldest", "Спочатку старі"),
    },
    {
      value: "name-asc",
      label: t("shopping_wishlist:wishlist.sort_name_asc", "Назва (А-Я)"),
    },
    {
      value: "name-desc",
      label: t("shopping_wishlist:wishlist.sort_name_desc", "Назва (Я-А)"),
    },
  ];

  const handleFilterChange = (filterId: string, values: string[]) => {
    setFilters((prev) => ({ ...prev, [filterId]: values }));
  };

  const handleClearAll = () => {
    setFilters({
      status: [],
      priority: [],
      group: [],
      visibility: [],
      author: [],
      availability: [],
    });
    setSearchQuery("");
  };

  const filteredItems = useMemo(() => {
    // Використовуємо локальну змінну
    if (!userId) return [];

    return items
      .filter((item) => {
        // 🔥 ПЕРЕВІРКА ПРИВАТНОСТІ БЕЗПОСЕРЕДНЬО ТУТ
        if (!canSeeObject(item, userId)) return false;

        // Пошук
        if (
          searchQuery &&
          !item.name.toLowerCase().includes(searchQuery.toLowerCase())
        ) {
          return false;
        }

        // Фільтри
        if (filters.status.length > 0 && !filters.status.includes(item.status))
          return false;
        if (
          filters.priority.length > 0 &&
          !filters.priority.includes(String(item.priority))
        )
          return false;

        if (filters.group?.length > 0) {
          const itemGroup = item.group_id || "unassigned";
          if (!filters.group.includes(itemGroup)) return false;
        }

        if (
          filters.visibility?.length > 0 &&
          !filters.visibility.includes(item.visibility)
        )
          return false;

        // Автор
        if (filters.author?.length > 0) {
          const isMine = item.user_id === userId;
          const isOthers = item.user_id !== userId;
          if (
            filters.author.includes("me") &&
            !filters.author.includes("others") &&
            !isMine
          )
            return false;
          if (
            filters.author.includes("others") &&
            !filters.author.includes("me") &&
            !isOthers
          )
            return false;
        }

        // Резерв
        if (filters.availability?.length > 0) {
          const isReserved = !!item.reserved_by;
          const isReservedByMe = item.reserved_by === userId;
          const wantAvailable = filters.availability.includes("available");
          const wantReservedByMe =
            filters.availability.includes("reserved_by_me");

          if (wantAvailable && !wantReservedByMe) {
            if (isReserved && !isReservedByMe) return false;
          }
          if (wantReservedByMe && !wantAvailable) {
            if (!isReservedByMe) return false;
          }
          if (wantAvailable && wantReservedByMe) {
            const isAvailable = !isReserved;
            if (!isAvailable && !isReservedByMe) return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case "priority-desc":
            return (b.priority || 0) - (a.priority || 0);
          case "priority-asc":
            return (a.priority || 0) - (b.priority || 0);
          case "price-desc":
            return (b.price || 0) - (a.price || 0);
          case "price-asc":
            return (a.price || 0) - (b.price || 0);
          case "newest":
            return (b.created_at || 0) - (a.created_at || 0);
          case "oldest":
            return (a.created_at || 0) - (b.created_at || 0);
          case "name-asc":
            return a.name.localeCompare(b.name);
          case "name-desc":
            return b.name.localeCompare(a.name);
          default:
            return 0;
        }
      });
    // 🔥 ТЕПЕР ТУТ ЧИСТИЙ userId
  }, [items, searchQuery, filters, sortBy, userId]);

  return {
    searchQuery,
    setSearchQuery,
    filters,
    sortBy,
    setSortBy,
    filteredItems,
    filtersConfig,
    sortOptions,
    handleFilterChange,
    handleClearAll,
  };
};
