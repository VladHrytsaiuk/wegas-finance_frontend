import { useState, useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { type ShoppingList } from "../../services/apiShopping";

// Експортуємо константу, щоб знати розмір сторінки
export const SHOPPING_PAGE_SIZE = 9;

export function useShoppingFilters(initialLists: ShoppingList[]) {
  const { t } = useTranslation();

  // --- STATE ---
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [sortValue, setSortValue] = useState("date-desc");
  const [filterValues, setFilterValues] = useState<Record<string, any>>({
    visibility: [],
  });

  // Скидаємо сторінку на 1, коли міняються фільтри
  useEffect(() => {
    setPage(1);
  }, [searchQuery, sortValue, filterValues]);

  // --- LOGIC ---
  const processedLists = useMemo(() => {
    let result = [...initialLists];

    // 1. Пошук
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (list) =>
          list.title.toLowerCase().includes(q) ||
          list.items.some((item) => item.name.toLowerCase().includes(q)),
      );
    }

    // 2. Фільтрація (Visibility)
    if (filterValues.visibility.length > 0) {
      result = result.filter((list) =>
        filterValues.visibility.includes(list.visibility),
      );
    }

    // 3. Сортування
    result.sort((a, b) => {
      switch (sortValue) {
        case "date-asc":
          return (a.created_at || 0) - (b.created_at || 0);
        case "title-asc":
          return a.title.localeCompare(b.title);
        case "title-desc":
          return b.title.localeCompare(a.title);
        case "date-desc":
        default:
          return (b.created_at || 0) - (a.created_at || 0);
      }
    });

    return result;
  }, [initialLists, searchQuery, sortValue, filterValues]);

  // 4. Пагінація
  const totalCount = processedLists.length; // <--- ВАЖЛИВО: Загальна кількість
  const paginatedLists = processedLists.slice(
    (page - 1) * SHOPPING_PAGE_SIZE,
    page * SHOPPING_PAGE_SIZE,
  );

  // --- CONFIGS ---
  const filtersConfig = [
    {
      key: "visibility",
      label: t("shopping_wishlist:shopping.filter_visibility", "Приватність"),
      type: "multi-select",
      options: [
        { value: "public", label: t("shopping_wishlist:shopping.public", "Сім'я") },
        { value: "private", label: t("shopping_wishlist:shopping.private", "Тільки я") },
        { value: "hidden", label: t("shopping_wishlist:shopping.hidden", "Приховано") },
      ],
    },
  ];

  const sortOptions = [
    { value: "date-desc", label: t("common:common.sort_newest", "Спочатку нові") },
    { value: "date-asc", label: t("common:common.sort_oldest", "Спочатку старі") },
    { value: "title-asc", label: t("common:common.sort_az", "Назва (А-Я)") },
  ];

  const handleFilterChange = (key: string, val: any) => {
    setFilterValues((prev) => ({ ...prev, [key]: val }));
  };

  const handleClearAll = () => {
    setSearchQuery("");
    setSortValue("date-desc");
    setFilterValues({ visibility: [] });
  };

  return {
    searchQuery,
    setSearchQuery,
    sortValue,
    setSortValue,
    filterValues,
    handleFilterChange,
    handleClearAll,

    // Результати для пагінації
    paginatedLists,
    page,
    setPage,
    totalCount, // <--- Передаємо це в компонент
    pageSize: SHOPPING_PAGE_SIZE, // <--- Передаємо це в компонент

    // Конфіги для тулбара
    filtersConfig,
    sortOptions,
  };
}
