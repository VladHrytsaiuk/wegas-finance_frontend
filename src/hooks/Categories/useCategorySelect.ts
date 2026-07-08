import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";

// Типи
export interface Category {
  id: string;
  name: string;
  parent_id?: string | null;
  color?: string;
  icon?: string;
  children?: Category[];
  type?: "income" | "expense";
}

interface UseCategorySelectProps {
  categories: Category[];
  value: string;
  onChange: (id: string) => void;
  placeholder?: string;
}

export function useCategorySelect({
  categories,
  value,
  onChange,
  placeholder,
}: UseCategorySelectProps) {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");

  const finalPlaceholder =
    placeholder || t("categories:categorySelect.placeholder_default");

  const selectedCategory = useMemo(
    () => categories.find((c) => c.id === value),
    [categories, value]
  );

  // Логіка фільтрації та побудови дерева
  const treeData = useMemo(() => {
    // 1. Якщо даних немає
    if (!categories) return [];

    let filtered = [...categories]; // Копіюємо, щоб зберегти порядок

    // 2. Фільтрація (Пошук)
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matches = new Set(
        categories
          .filter((c) => c.name.toLowerCase().includes(q))
          .map((c) => c.id)
      );

      filtered = categories.filter(
        (c) =>
          matches.has(c.id) ||
          (c.parent_id && matches.has(c.parent_id)) ||
          categories.some(
            (child) => child.parent_id === c.id && matches.has(child.id)
          )
      );
    }

    // 3. Побудова дерева (ЗБЕРІГАЮЧИ ПОРЯДОК API)
    const map = new Map<string, Category>();
    const roots: Category[] = [];

    // Ініціалізація
    filtered.forEach((cat) => map.set(cat.id, { ...cat, children: [] }));

    // Зв'язування
    filtered.forEach((cat) => {
      const node = map.get(cat.id);
      if (node && cat.parent_id && map.has(cat.parent_id)) {
        // Додаємо в children у тому порядку, в якому йде масив
        map.get(cat.parent_id)!.children!.push(node);
      } else if (node) {
        roots.push(node);
      }
    });

    // ❌ ТУТ БУЛО СОРТУВАННЯ (sortNodes).
    // Ми його видалили. Тепер порядок такий, як прийшов з бекенду.

    return roots;
  }, [categories, searchQuery]);

  const handleSelect = (node: Category) => {
    onChange(node.id);
    document.body.click();
  };

  const handleClear = () => onChange("");

  return {
    searchQuery,
    setSearchQuery,
    treeData,
    selectedCategory,
    finalPlaceholder,
    handleSelect,
    handleClear,
    t,
  };
}
