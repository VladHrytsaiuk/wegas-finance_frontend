import { useState, useMemo, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import {
  getCpCategoriesApi,
  getCounterpartiesApi,
} from "../../services/apiCounterparties";
import { useCounterpartyData } from "./useCounterpartyData";
import { useCounterpartyTree } from "./useCounterpartyTree";
import { useDropdownPosition } from "../useDropdownPosition";

const EMPTY_ARRAY: string[] = [];
const ROOT_ID_PEOPLE = "root_people";
const ROOT_ID_SHOPS = "root_shops";
const ROOT_ID_OTHER = "root_other";

interface UseCounterpartySelectProps {
  counterparties?: any[];
  value: string;
  onChange: (id: string) => void;
  type?: "person" | "shop" | "other";
  initialExpanded?: string[];
}

export const useCounterpartySelect = ({
  counterparties: propsCounterparties,
  value,
  onChange,
  type,
  initialExpanded,
}: UseCounterpartySelectProps) => {
  const { t } = useTranslation();

  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [imgError, setImgError] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const triggerBtnRef = useRef<HTMLButtonElement>(null);
  const hiddenModalTriggerRef = useRef<HTMLButtonElement>(null);

  const { actions } = useCounterpartyData();

  // 1. Positioning: задаємо ширину 350, щоб логіка позиціонування знала про це
  const { triggerRef, menuRef, style } = useDropdownPosition(
    isOpen,
    () => setIsOpen(false),
    "left",
    350,
  );

  // 2. Data Fetching
  const { data: categories = [] } = useQuery({
    queryKey: ["cp-categories-for-select"],
    queryFn: getCpCategoriesApi,
    staleTime: 5 * 60 * 1000,
  });

  const { data: fetchedCounterparties = [] } = useQuery({
    queryKey: ["counterparties"],
    queryFn: getCounterpartiesApi,
    enabled: !propsCounterparties,
  });

  const effectiveCounterparties = propsCounterparties || fetchedCounterparties;

  // Фільтруємо категорії під список контрагентів
  const effectiveCategories = useMemo(() => {
    if (!propsCounterparties) return categories;
    const usedCategoryIds = new Set(
      effectiveCounterparties.map((c) => c.category_id).filter(Boolean),
    );
    return categories.filter((cat) => usedCategoryIds.has(cat.id));
  }, [categories, propsCounterparties, effectiveCounterparties]);

  // 3. Tree Data
  const activeFilters = useMemo(() => ({ type: type ? [type] : [] }), [type]);

  const rawTreeData = useCounterpartyTree({
    counterparties: effectiveCounterparties,
    categories: effectiveCategories,
    searchQuery,
    filters: activeFilters,
    sortValue: "name-asc",
  });

  // Чистимо пусті корені
  const finalTreeData = useMemo(() => {
    if (!type) return rawTreeData;
    return rawTreeData.filter((node) => {
      if (type === "person" && node.id.includes("person")) return true;
      if (type === "shop" && node.id.includes("shop")) return true;
      if (type === "other" && node.id.includes("other")) return true;
      return false;
    });
  }, [rawTreeData, type]);

  const defaultExpandedIds = useMemo(() => {
    if (searchQuery) return EMPTY_ARRAY;
    if (initialExpanded) return initialExpanded;
    if (type === "other") return [ROOT_ID_OTHER];
    if (type === "person") return [ROOT_ID_PEOPLE];
    if (type === "shop") return [ROOT_ID_SHOPS];
    return [ROOT_ID_PEOPLE, ROOT_ID_SHOPS, ROOT_ID_OTHER];
  }, [type, searchQuery, initialExpanded]);

  // 4. Selected Item Logic
  const selectedCP = effectiveCounterparties.find(
    (c: any) => String(c.id) === String(value),
  );

  // --- ДОДАЙ useEffect ДЛЯ СКИНУ ПОМИЛКИ ПРИ ЗМІНІ ВИБОРУ ---
  useEffect(() => {
    setImgError(false);
  }, [value]);

  const displayIconName = useMemo(() => {
    if (!selectedCP) return "HiUser";
    let iconToUse = selectedCP.icon;

    if (!iconToUse && selectedCP.category_id && categories.length > 0) {
      const findCat = (cats: any[], id: string): any => {
        for (const c of cats) {
          if (String(c.id) === String(id)) return c;
          if (c.children) {
            const f = findCat(c.children, id);
            if (f) return f;
          }
        }
        return null;
      };
      const cat = findCat(categories, selectedCP.category_id);
      if (cat) iconToUse = cat.icon;
    }

    if (!iconToUse) {
      if (selectedCP.type === "shop") iconToUse = "HiShoppingCart";
      else if (selectedCP.type === "other") iconToUse = "HiBriefcase";
      else iconToUse = "HiUser";
    }

    if (iconToUse && !iconToUse.startsWith("Hi"))
      iconToUse = "Hi" + iconToUse.charAt(0).toUpperCase() + iconToUse.slice(1);

    return iconToUse || "HiUser";
  }, [selectedCP, categories]);

  // 5. Handlers
  const launchCreateModal = () => {
    setIsOpen(false);
    setTimeout(() => {
      hiddenModalTriggerRef.current?.click();
    }, 0);
  };

  const handleSelect = (id: string) => {
    onChange(id);
    setIsOpen(false);
    triggerBtnRef.current?.focus();
  };

  const handleClear = () => {
    onChange("");
    triggerBtnRef.current?.focus();
  };

  const toggleOpen = () => setIsOpen((prev) => !prev);

  // Keyboard Handlers
  const handleTriggerKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
      e.preventDefault();
      e.stopPropagation();
      setIsOpen((prev) => !prev);
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      e.stopPropagation();
      if (searchQuery.trim()) launchCreateModal();
    }
  };

  const handleMenuKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      setIsOpen(false);
      triggerBtnRef.current?.focus();
      return;
    }

    if (e.key === "Enter") {
      e.preventDefault();
      e.stopPropagation();
      const activeEl = document.activeElement as HTMLElement;
      if (activeEl && menuRef.current?.contains(activeEl)) {
        activeEl.click();
      }
      return;
    }

    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      const focusableSelectors =
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

      const menuElement = menuRef.current as HTMLElement;
      if (!menuElement) return;

      const allFocusable = Array.from(
        menuElement.querySelectorAll(focusableSelectors),
      ) as HTMLElement[];

      const listItems = allFocusable.filter(
        (el) => el !== searchInputRef.current,
      );
      const activeEl = document.activeElement as HTMLElement;

      if (activeEl === searchInputRef.current) {
        if (e.key === "ArrowDown") {
          e.preventDefault();
          listItems[0]?.focus();
        }
        return;
      }

      const idx = listItems.indexOf(activeEl);
      if (idx === -1) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        const next = idx + 1 < listItems.length ? idx + 1 : 0;
        listItems[next]?.focus();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        if (idx <= 0) {
          searchInputRef.current?.focus();
        } else {
          listItems[idx - 1]?.focus();
        }
      }
    }
  };

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  return {
    state: { isOpen, searchQuery, imgError },
    setters: { setIsOpen, setSearchQuery, setImgError },
    refs: {
      triggerRef,
      menuRef,
      searchInputRef,
      triggerBtnRef,
      hiddenModalTriggerRef,
    },
    data: {
      treeData: finalTreeData,
      selectedCP,
      displayIconName,
      defaultExpandedIds,
      style,
      actions,
    },
    handlers: {
      handleSelect,
      handleClear,
      launchCreateModal,
      handleTriggerKeyDown,
      handleInputKeyDown,
      handleMenuKeyDown,
      toggleOpen,
    },
    t,
  };
};
