import { useMemo } from "react";

// Helper
const normalizeIconName = (iconName: string | undefined): string => {
  if (!iconName) return "HiTag";
  if (iconName.startsWith("Hi")) return iconName;
  const pascal = iconName
    .replace(/-([a-z])/g, (g) => g[1].toUpperCase())
    .replace(/^[a-z]/, (g) => g.toUpperCase());
  return `Hi${pascal}`;
};

interface UseTreeProps {
  categories: any[];
  searchQuery?: string;
  filters?: { type: string[] };
  sortValue?: string;
}

export function useCategoryTree({
  categories,
  searchQuery = "",
  filters = { type: [] },
  sortValue = "default",
}: UseTreeProps) {
  const treeRoots = useMemo(() => {
    // Якщо даних немає
    if (!categories) return [];

    // 1. Копіюємо вхідний масив.
    // ВАЖЛИВО: Ми покладаємось на порядок елементів у цьому масиві.
    // Якщо API надсилає { id: 1 }, { id: 2 }... то так і відобразимо.
    let items = [...categories];

    // 2. Фільтр по типу (Income/Expense)
    if (filters.type && filters.type.length > 0) {
      items = items.filter((c) => filters.type.includes(c.type));
    }

    // 3. Пошук
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matches = items.filter((c) => c.name.toLowerCase().includes(q));
      const matchIds = new Set(matches.map((c) => c.id));
      const keepIds = new Set<string>();

      // Логіка: якщо знайшли дитину, показуємо і батька
      items.forEach((c) => {
        if (matchIds.has(c.id)) {
          keepIds.add(c.id);
          if (c.parent_id) keepIds.add(c.parent_id);
        }
        if (c.parent_id && matchIds.has(c.parent_id)) {
          keepIds.add(c.id);
          keepIds.add(c.parent_id);
        }
      });
      items = items.filter((c) => keepIds.has(c.id));
    }

    // 4. Побудова дерева (Зберігаючи порядок)
    const map = new Map<string, any>();
    const roots: any[] = [];

    // Ініціалізація нод
    items.forEach((cat) => {
      const node = {
        ...cat,
        icon: normalizeIconName(cat.icon),
        children: [],
      };
      map.set(cat.id, node);
    });

    // Зв'язування батьків і дітей
    items.forEach((cat) => {
      const node = map.get(cat.id);
      if (cat.parent_id && map.has(cat.parent_id)) {
        // push додає в кінець масиву children, зберігаючи порядок items
        map.get(cat.parent_id).children.push(node);
      } else {
        roots.push(node);
      }
    });

    // 5. Сортування (рекурсивно)
    const sortNodes = (nodes: any[]) => {
      if (sortValue === "name-asc") {
        nodes.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }));
      } else if (sortValue === "name-desc") {
        nodes.sort((a, b) => b.name.localeCompare(a.name, undefined, { sensitivity: "base" }));
      }

      nodes.forEach((node) => {
        if (node.children && node.children.length > 0) {
          sortNodes(node.children);
        }
      });
    };

    sortNodes(roots);

    return roots;
  }, [categories, searchQuery, filters, sortValue]);

  return treeRoots;
}
