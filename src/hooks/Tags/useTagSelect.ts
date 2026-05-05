import { useState, useRef, useMemo, useEffect, useCallback } from "react";
import { useDropdownPosition } from "../useDropdownPosition";
import { focusNextElement } from "../../utils/focusUtils";

interface Tag {
  id: string;
  name: string;
  color?: string;
}

interface UseTagSelectProps {
  tags: Tag[];
  value: string[];
  onChange: (ids: string[]) => void;
  onCreate: (name: string) => void;
}

export const useTagSelect = ({
  tags,
  value,
  onChange,
  onCreate,
}: UseTagSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");

  // Refs
  const searchInputRef = useRef<HTMLInputElement>(null);
  const triggerBtnRef = useRef<HTMLButtonElement>(null);
  const doneBtnRef = useRef<HTMLButtonElement>(null);

  // Position Hook
  const { triggerRef, menuRef, style } = useDropdownPosition(
    isOpen,
    () => setIsOpen(false),
    "left",
    "auto"
  );

  // Focus Search on Open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Derived State
  const filteredTags = useMemo(() => {
    if (!search) return tags;
    return tags.filter((t) =>
      t.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [tags, search]);

  const exactMatch = useMemo(() => {
    return filteredTags.some(
      (t) => t.name.toLowerCase() === search.toLowerCase()
    );
  }, [filteredTags, search]);

  const selectedTags = useMemo(() => {
    return tags.filter((t) => value.includes(t.id));
  }, [tags, value]);

  // Handlers
  const handleToggle = useCallback(
    (id: string) => {
      if (value.includes(id)) {
        onChange(value.filter((v) => v !== id));
      } else {
        onChange([...value, id]);
      }
      searchInputRef.current?.focus();
    },
    [value, onChange]
  );

  const handleClear = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onChange([]);
      triggerBtnRef.current?.focus();
    },
    [onChange]
  );

  const handleCreate = useCallback(() => {
    if (!search) return;
    onCreate(search);
    setSearch("");
    searchInputRef.current?.focus();
  }, [search, onCreate]);

  const handleTriggerKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
      e.preventDefault();
      setIsOpen((prev) => !prev);
    }
  }, []);

  const handleMenuKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setIsOpen(false);
        triggerBtnRef.current?.focus();
        return;
      }

      // Tab Navigation Logic to close menu when leaving via bottom
      if (e.key === "Tab") {
        if (document.activeElement === doneBtnRef.current && !e.shiftKey) {
          e.preventDefault();
          setIsOpen(false);
          if (triggerBtnRef.current) {
            triggerBtnRef.current.focus();
            setTimeout(() => {
              focusNextElement(triggerBtnRef.current);
            }, 0);
          }
          return;
        }
      }

      // Arrow Navigation
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        const focusableSelectors = "input, button";
        const menuElement = menuRef.current as HTMLElement;
        if (!menuElement) return;

        const allFocusable = Array.from(
          menuElement.querySelectorAll(focusableSelectors)
        ) as HTMLElement[];
        if (allFocusable.length === 0) return;

        const activeEl = document.activeElement as HTMLElement;
        const currentIndex = allFocusable.indexOf(activeEl);

        if (e.key === "ArrowDown") {
          e.preventDefault();
          const nextIndex =
            currentIndex + 1 < allFocusable.length ? currentIndex + 1 : 0;
          allFocusable[nextIndex]?.focus();
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          const nextIndex =
            currentIndex - 1 >= 0 ? currentIndex - 1 : allFocusable.length - 1;
          allFocusable[nextIndex]?.focus();
        }
      }
    },
    [menuRef]
  );

  return {
    state: {
      isOpen,
      search,
      style,
      filteredTags,
      exactMatch,
      selectedTags,
    },
    actions: {
      setIsOpen,
      setSearch,
      handleToggle,
      handleClear,
      handleCreate,
      handleTriggerKeyDown,
      handleMenuKeyDown,
    },
    refs: {
      triggerRef,
      menuRef,
      triggerBtnRef,
      searchInputRef,
      doneBtnRef,
    },
  };
};
