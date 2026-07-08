import { useState, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";

export interface CategoryNode {
  id: string;
  name: string;
  icon?: string;
  color?: string;
  children?: CategoryNode[];
  type?: "income" | "expense";
}

// --- Logic Helpers (Оновлено) ---

/**
 * Рекурсивно збирає ВСІ ID у гілці, включаючи саму ноду
 */
function getAllBranchIds(node: CategoryNode): string[] {
  const ids = [node.id];
  if (node.children && node.children.length > 0) {
    node.children.forEach((child) => {
      ids.push(...getAllBranchIds(child));
    });
  }
  return ids;
}

/**
 * Перевіряє, чи вибрана сама нода.
 * (В новій логіці "повністю вибрано" означає, що ID самої ноди є в списку)
 */
function isNodeFullySelected(
  node: CategoryNode,
  selectedIds: string[],
): boolean {
  return selectedIds.includes(node.id);
}

/**
 * Перевіряє, чи вибраний хоча б один нащадок, але не сама нода (або не всі нащадки)
 * Це потрібно для візуального відображення "мінуса" в чекбоксі,
 * якщо ми обираємо дітей вручну без батька.
 */
function isNodePartiallySelected(
  node: CategoryNode,
  selectedIds: string[],
): boolean {
  if (!node.children || node.children.length === 0) return false;

  // Збираємо всіх дітей (без самого батька)
  const allChildrenIds = node.children.flatMap(getAllBranchIds);
  const selectedChildrenCount = allChildrenIds.filter((id) =>
    selectedIds.includes(id),
  ).length;

  // Частково вибрано, якщо: вибрано хоча б одну дитину, АЛЕ батько не вибраний повністю
  return selectedChildrenCount > 0 && !selectedIds.includes(node.id);
}
// ---------------------

interface UseCategoryTreeStateProps {
  defaultExpandedIds?: string[];
  collapsible?: boolean;
}

export function useCategoryTreeState({
  defaultExpandedIds = [],
}: UseCategoryTreeStateProps) {
  const { t } = useTranslation();
  const [manualExpandedIds, setManualExpandedIds] = useState<Set<string>>(
    new Set(),
  );
  const [collapsedDefaultIds, setCollapsedDefaultIds] = useState<Set<string>>(
    new Set(),
  );

  const defaultExpandedSet = useMemo(
    () => new Set(defaultExpandedIds),
    [defaultExpandedIds],
  );

  const expandedIds = useMemo(() => {
    const next = new Set(manualExpandedIds);
    defaultExpandedIds.forEach((id) => {
      if (!collapsedDefaultIds.has(id)) {
        next.add(id);
      }
    });
    return next;
  }, [manualExpandedIds, defaultExpandedIds, collapsedDefaultIds]);

  const toggle = useCallback((id: string) => {
    if (defaultExpandedSet.has(id)) {
      setCollapsedDefaultIds((prev) => {
        const next = new Set(prev);
        if (next.has(id)) {
          next.delete(id);
        } else {
          next.add(id);
        }
        return next;
      });
      return;
    }

    setManualExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, [defaultExpandedSet]);

  /**
   * Визначає візуальний стан чекбокса
   */
  const getSelectionState = (node: CategoryNode, selectedIds: string[]) => {
    const fully = isNodeFullySelected(node, selectedIds);
    const partially = !fully && isNodePartiallySelected(node, selectedIds);
    return { fully, partially };
  };

  /**
   * 🔥 ГОЛОВНА ФУНКЦІЯ: Розраховує новий масив ID при кліку на ноду.
   * Додає/видаляє всю гілку (батько + діти).
   */
  const calculateNewSelection = (
    node: CategoryNode,
    currentSelectedIds: string[],
  ): string[] => {
    const branchIds = getAllBranchIds(node);
    const isSelected = currentSelectedIds.includes(node.id);

    if (isSelected) {
      // Якщо вибрано -> видаляємо батька і всіх дітей
      const branchSet = new Set(branchIds);
      return currentSelectedIds.filter((id) => !branchSet.has(id));
    } else {
      // Якщо не вибрано -> додаємо батька і всіх дітей
      const newSet = new Set([...currentSelectedIds, ...branchIds]);
      return Array.from(newSet);
    }
  };

  return {
    expandedIds,
    toggle,
    getSelectionState,
    calculateNewSelection, // Експортуємо для використання в MultiSelectFilter
    t,
  };
}
