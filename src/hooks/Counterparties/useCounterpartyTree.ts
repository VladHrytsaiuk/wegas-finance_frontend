import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import type { Counterparty, CounterpartyCategory } from "../../types";
import type { TreeNodeData } from "../../components/counterparties/CounterpartyTree"; // Імпорт типу

// Types for internal tree structure
export interface CounterpartyTreeNode {
  id: string;
  name: string;
  type: "group" | "subgroup" | "item";
  iconName: string;
  logo: string | null;
  color?: string;
  children: CounterpartyTreeNode[];
  isRoot?: boolean;
  isCategory?: boolean;
  raw?: any; // Original data object
}

// Helper: shopping-cart -> HiShoppingCart
const normalizeIconName = (iconName: string | undefined): string => {
  if (!iconName) return "HiTag";
  if (iconName.startsWith("Hi")) return iconName;

  // Convert kebab-case to PascalCase (e.g. shopping-cart -> ShoppingCart)
  const pascal = iconName
    .replace(/[-_]([a-z])/g, (g) => g[1].toUpperCase())
    .replace(/^[a-z]/, (g) => g.toUpperCase());

  return `Hi${pascal}`;
};

interface UseTreeProps {
  counterparties: Counterparty[];
  categories: CounterpartyCategory[];
  searchQuery: string;
  filters: { type: string[] };
  sortValue: string;
  priorityCategoryId?: string; // 🔥 Додано для хойстінгу
}

export function useCounterpartyTree({
  counterparties,
  categories,
  searchQuery,
  filters,
  sortValue,
  priorityCategoryId,
}: UseTreeProps) {
  const { t } = useTranslation();

  const treeRoots = useMemo(() => {
    let cps = Array.isArray(counterparties) ? [...counterparties] : [];
    let cats = Array.isArray(categories) ? [...categories] : [];

    // 1. Filter by Type
    if (filters?.type?.length > 0) {
      cps = cps.filter((cp) => filters.type.includes(cp.type));
      cats = cats.filter((c) => filters.type.includes(c.type));
    }

    // 2. Smart Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();

      // Find matching categories by name
      const matchingCatIdsByName = new Set(
        cats.filter((c) => c.name.toLowerCase().includes(q)).map((c) => c.id),
      );

      // Filter counterparties (by name OR by parent category match)
      cps = cps.filter(
        (cp) =>
          cp.name.toLowerCase().includes(q) ||
          (cp.category_id && matchingCatIdsByName.has(cp.category_id)),
      );

      // Filter categories (by name OR if they have matching children)
      const catIdsWithMatchingChildren = new Set(
        cps.map((cp) => cp.category_id).filter(Boolean),
      );

      cats = cats.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          catIdsWithMatchingChildren.has(c.id),
      );
    }

    // 3. Create Root Groups
    const rootShops: CounterpartyTreeNode = {
      id: "root_shops",
      name: t("counterparties:counterpartyTree.group_shops") || "Shops",
      type: "group",
      iconName: "HiShoppingCart",
      color: "#6366f1",
      children: [],
      isRoot: true,
      logo: null,
    };

    const rootPeople: CounterpartyTreeNode = {
      id: "root_people",
      name: t("counterparties:counterpartyTree.group_people") || "People",
      type: "group",
      iconName: "HiUser",
      color: "#a78bfa",
      children: [],
      isRoot: true,
      logo: null,
    };

    const rootOther: CounterpartyTreeNode = {
      id: "root_other",
      name: t("counterparties:counterpartyTree.group_other") || "Other",
      type: "group",
      iconName: "HiTag",
      color: "#94a3b8",
      children: [],
      isRoot: true,
      logo: null,
    };

    let rootPriority: CounterpartyTreeNode | null = null;
    const categoryNodes = new Map<string, CounterpartyTreeNode>();

    // 4. Distribute Categories
    cats.forEach((cat) => {
      const isPriority = priorityCategoryId && cat.id === priorityCategoryId;

      const node: CounterpartyTreeNode = {
        id: cat.id,
        name: cat.name,
        type: isPriority ? "group" : "subgroup", // Підвищуємо тип, якщо це корінь
        iconName: normalizeIconName(cat.icon),
        logo: null,
        color: cat.color || "#64748b",
        children: [],
        isCategory: true,
        isRoot: isPriority, // Робимо справжнім коренем
        raw: cat,
      };
      categoryNodes.set(cat.id, node);

      if (isPriority) {
        rootPriority = node;
      } else {
        if (cat.type === "shop") rootShops.children.push(node);
        else if (cat.type === "person") rootPeople.children.push(node);
        else rootOther.children.push(node);
      }
    });

    const shopSubtypesMap = new Map<string, CounterpartyTreeNode>();

    // 5. Distribute Counterparties
    cps.forEach((cp) => {
      const normalizedIcon =
        normalizeIconName(cp.icon) ||
        (cp.type === "person" ? "HiUser" : "HiShoppingCart");

      const node: CounterpartyTreeNode = {
        id: cp.id,
        name: cp.name,
        type: "item",
        iconName: normalizedIcon,
        logo: cp.logo || null,
        color: cp.color || (cp.type === "person" ? "#a78bfa" : "#6366f1"),
        raw: { ...cp, iconName: normalizedIcon },
        children: [],
        isCategory: false,
      };

      // Case A: Has explicit Category
      if (cp.category_id && categoryNodes.has(cp.category_id)) {
        categoryNodes.get(cp.category_id)!.children.push(node);
      }
      // Case B: No Category, but has Subtype (for shops)
      else if (cp.type === "shop" && cp.subtype) {
        if (!shopSubtypesMap.has(cp.subtype)) {
          // Try to find icon for subtype from existing categories with same name
          const matchingCat = cats.find((c) => c.name === cp.subtype);
          const subgroupIcon = matchingCat
            ? normalizeIconName(matchingCat.icon)
            : "HiTag";

          shopSubtypesMap.set(cp.subtype, {
            id: `sub_${cp.subtype}`,
            name: cp.subtype,
            type: "subgroup",
            children: [],
            iconName: subgroupIcon,
            logo: null,
            color: "var(--color-text-light)",
          });
        }
        shopSubtypesMap.get(cp.subtype)!.children.push(node);
      }
      // Case C: Orphan -> Root
      else {
        if (cp.type === "shop") rootShops.children.push(node);
        else if (cp.type === "person") rootPeople.children.push(node);
        else rootOther.children.push(node);
      }
    });

    // Add generated subtypes to Shops root
    const sortedSubgroups = Array.from(shopSubtypesMap.values()).sort((a, b) =>
      a.name.localeCompare(b.name),
    );
    rootShops.children.push(...sortedSubgroups);

    // 6. Sorting Logic
    const sortNodes = (nodes: CounterpartyTreeNode[]) => {
      return nodes.sort((a, b) => {
        // Groups always on top
        const aIsGroup = a.type === "group" || a.type === "subgroup";
        const bIsGroup = b.type === "group" || b.type === "subgroup";

        if (aIsGroup && !bIsGroup) return -1;
        if (!aIsGroup && bIsGroup) return 1;

        if (sortValue === "name-desc") {
          return b.name.localeCompare(a.name, undefined, {
            sensitivity: "base",
          });
        }
        return a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
      });
    };

    // Sort children of roots
    [rootShops, rootPeople, rootOther].forEach((root) => {
      if (root.children.length > 0) sortNodes(root.children);
    });

    if (rootPriority && rootPriority.children.length > 0) {
      sortNodes(rootPriority.children);
    }

    // Sort children of categories
    categoryNodes.forEach((node) => {
      if (node.children.length > 0) sortNodes(node.children);
    });

    // Only return roots that have content
    // ПОРЯДОК: Пріоритет -> Магазини -> Люди -> Інше
    return [
      ...(rootPriority ? [rootPriority] : []),
      ...(rootShops.children.length ? [rootShops] : []),
      ...(rootPeople.children.length ? [rootPeople] : []),
      ...(rootOther.children.length ? [rootOther] : []),
    ];
  }, [
    counterparties,
    categories,
    searchQuery,
    filters,
    sortValue,
    t,
    priorityCategoryId,
  ]);

  return treeRoots;
}

// Додати в hooks/useCounterpartyTree.ts (або окремий файл)

export function getAllLeafIds(node: TreeNodeData): string[] {
  if (!node.children || node.children.length === 0) return [String(node.id)];
  return node.children.flatMap(getAllLeafIds);
}

export function isNodeFullySelected(
  node: TreeNodeData,
  selectedIds: string[]
): boolean {
  if (!node.children || node.children.length === 0) {
    return selectedIds.includes(String(node.id));
  }
  const leaves = getAllLeafIds(node);
  return leaves.length > 0 && leaves.every((id) => selectedIds.includes(id));
}

export function isNodePartiallySelected(
  node: TreeNodeData,
  selectedIds: string[]
): boolean {
  if (!node.children || node.children.length === 0) return false;
  const leaves = getAllLeafIds(node);
  const selectedCount = leaves.filter((id) => selectedIds.includes(id)).length;
  return selectedCount > 0 && selectedCount < leaves.length;
}
