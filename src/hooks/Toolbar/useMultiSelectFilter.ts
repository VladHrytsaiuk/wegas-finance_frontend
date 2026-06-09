import { useState, useRef, useMemo, useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useDropdownPosition } from "../useDropdownPosition";
import { useCounterpartyTree } from "../Counterparties/useCounterpartyTree";
import type { FilterConfig } from "../../components/shared/TableToolbar/types";

// Helper
const getAllLeafIds = (node: any): string[] => {
  if (!node.children || node.children.length === 0) return [String(node.id)];
  return node.children.flatMap(getAllLeafIds);
};

interface UseMultiSelectProps {
  config: FilterConfig;
  value: string[];
  onChange: (vals: string[]) => void;
}

export const useMultiSelectFilter = ({
  config,
  value,
  onChange,
}: UseMultiSelectProps) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");

  const searchInputRef = useRef<HTMLInputElement>(null);
  const treeContainerRef = useRef<HTMLDivElement>(null);

  // Position
  const { triggerRef, menuRef, style } = useDropdownPosition(
    isOpen,
    () => setIsOpen(false),
    "left",
    340
  );

  const activeCount = value.length;

  // --- Handlers ---
  const toggleNode = useCallback(
    (node: any) => {
      const targetIds = getAllLeafIds(node);
      const allSelected = targetIds.every((id) => value.includes(id));
      let newValue: string[];
      if (allSelected) {
        newValue = value.filter((id) => !targetIds.includes(id));
      } else {
        newValue = Array.from(new Set([...value, ...targetIds]));
      }
      onChange(newValue);
    },
    [value, onChange]
  );

  const toggleFlat = (val: string) => {
    if (value.includes(val)) onChange(value.filter((v) => v !== val));
    else onChange([...value, val]);
  };

  const getInitials = (str: string) =>
    str ? str.charAt(0).toUpperCase() : "?";

  // --- Keyboard Navigation ---
  const handleTriggerKeyDown = (e: React.KeyboardEvent) => {
    if (isOpen) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        const firstFocusable = menuRef.current?.querySelector(
          'button, [href], [role="button"], [tabindex]:not([tabindex="-1"])'
        ) as HTMLElement;
        firstFocusable?.focus();
        return;
      }
      if (e.key === "Enter") {
        e.preventDefault();
        const firstFocusable = treeContainerRef.current?.querySelector(
          'button, [href], [role="button"], [tabindex]:not([tabindex="-1"])'
        ) as HTMLElement;
        if (firstFocusable) {
          firstFocusable.click();
        }
        return;
      }
      if (e.key === "Escape") {
        e.preventDefault();
        setIsOpen(false);
        triggerRef.current?.focus();
        return;
      }
      return; // Дозволяємо типити
    }

    if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
      e.preventDefault();
      setIsOpen(true);
    }
  };

  // Ефект для автоматичного "підсвічування" першого елемента при пошуку
  useEffect(() => {
    if (isOpen && search && treeContainerRef.current) {
      const firstFocusable = treeContainerRef.current.querySelector(
        'button, [href], [role="button"], [tabindex]:not([tabindex="-1"])'
      ) as HTMLElement;

      const highlighted = treeContainerRef.current.querySelectorAll("[data-autofocus]");
      highlighted.forEach((el) => el.removeAttribute("data-autofocus"));

      if (firstFocusable) {
        firstFocusable.setAttribute("data-autofocus", "true");
      }
    }
  }, [isOpen, search, treeContainerRef]);

  const handleMenuKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      setIsOpen(false);
      triggerRef.current?.focus();
      return;
    }

    const menuElement = menuRef.current as HTMLElement;
    if (!menuElement) return;

    const focusableSelectors =
      'button, [href], input, [role="button"], [tabindex]:not([tabindex="-1"])';
    const focusableElements = Array.from(
      menuElement.querySelectorAll(focusableSelectors)
    ) as HTMLElement[];
    if (focusableElements.length === 0) return;

    const activeEl = document.activeElement as HTMLElement;
    const currentIndex = focusableElements.indexOf(activeEl);

    if (e.key === "ArrowDown") {
      e.preventDefault();
      const nextIndex =
        currentIndex + 1 < focusableElements.length ? currentIndex + 1 : 0;
      focusableElements[nextIndex]?.focus();
      return;
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      // Logic to jump back to search input (trigger)
      if (currentIndex === 0) {
        searchInputRef.current?.focus();
        return;
      }
      const nextIndex =
        currentIndex - 1 >= 0 ? currentIndex - 1 : focusableElements.length - 1;
      focusableElements[nextIndex]?.focus();
      return;
    }

    if (e.key === "Tab") {
      // Trap focus
      if (!e.shiftKey && currentIndex === focusableElements.length - 1) {
        e.preventDefault();
        focusableElements[0]?.focus();
        return;
      }
      if (e.shiftKey && currentIndex === 0) {
        e.preventDefault();
        focusableElements[focusableElements.length - 1]?.focus();
        return;
      }
    }
  };

  // Focus effect
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // --- Data Preparation ---

  // 1. Categories Tree
  const categoryTreeData = useMemo(() => {
    if (config.treeType !== "categories" || !config.rawData) return [];
    const categories = config.rawData;
    let filtered = categories;

    if (search) {
      const q = search.toLowerCase();
      const matches = new Set(
        categories
          .filter((c: any) => c.name.toLowerCase().includes(q))
          .map((c: any) => c.id)
      );
      filtered = categories.filter(
        (c: any) =>
          matches.has(c.id) ||
          (c.parent_id && matches.has(c.parent_id)) ||
          categories.some(
            (child: any) => child.parent_id === c.id && matches.has(child.id)
          )
      );
    }

    // Rebuild tree
    const map = new Map();
    const roots: any[] = [];
    filtered.forEach((cat: any) => map.set(cat.id, { ...cat, children: [] }));
    filtered.forEach((cat: any) => {
      const node = map.get(cat.id);
      if (cat.parent_id && map.has(cat.parent_id))
        map.get(cat.parent_id).children.push(node);
      else roots.push(node);
    });

    const sort = (nodes: any[]) => {
      nodes.sort((a, b) =>
        a.children.length > 0 && b.children.length === 0 ? -1 : 0
      );
      nodes.forEach((n) => {
        if (n.children.length > 0) sort(n.children);
      });
    };
    sort(roots);
    return roots;
  }, [config.treeType, config.rawData, search]);

  // 2. Counterparties Tree
  const counterpartyTreeData = useCounterpartyTree({
    counterparties:
      config.treeType === "counterparties" ? config.rawData || [] : [],
    categories:
      config.treeType === "counterparties" ? config.relatedData || [] : [],
    searchQuery: search,
    filters: { type: [] },
    sortValue: "name-asc",
  });

  const cpExpandedIds = useMemo(() => {
    return search ? [] : ["root_shops", "root_people", "root_other"];
  }, [search]);

  // 3. Flat List Options
  const filteredFlatOptions = useMemo(() => {
    if (config.treeType) return [];
    return (config.options || []).filter((o) =>
      o.label.toLowerCase().includes(search.toLowerCase())
    );
  }, [config.options, config.treeType, search]);

  return {
    state: {
      isOpen,
      search,
      activeCount,
      categoryTreeData,
      counterpartyTreeData,
      cpExpandedIds,
      filteredFlatOptions,
      style,
    },
    refs: {
      triggerRef,
      menuRef,
      searchInputRef,
      treeContainerRef,
    },
    handlers: {
      setIsOpen,
      setSearch,
      toggleNode,
      toggleFlat,
      handleTriggerKeyDown,
      handleMenuKeyDown,
      getInitials,
    },
    t,
  };
};
