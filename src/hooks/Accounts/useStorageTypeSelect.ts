import { useState, useRef, useMemo, useEffect, useCallback } from "react";
import { useDropdownPosition } from "../useDropdownPosition";

interface StorageType {
  id: string;
  name: string;
  icon?: string;
  slug?: string;
}

interface UseStorageTypeSelectProps {
  types: StorageType[];
  value: string | null; // ID обраного типу
  onChange: (id: string) => void;
  onCreate: (name: string) => void;
}

export const useStorageTypeSelect = ({
  types,
  value,
  onChange,
  onCreate,
}: UseStorageTypeSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");

  // Refs
  const searchInputRef = useRef<HTMLInputElement>(null);
  const triggerBtnRef = useRef<HTMLButtonElement>(null);

  // Position Hook
  const { triggerRef, menuRef, style } = useDropdownPosition(
    isOpen,
    () => setIsOpen(false),
    "left",
    "auto",
  );

  // Focus Search on Open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Filter Logic
  const filteredTypes = useMemo(() => {
    if (!search) return types;
    return types.filter((t) =>
      t.name.toLowerCase().includes(search.toLowerCase()),
    );
  }, [types, search]);

  const exactMatch = useMemo(() => {
    return filteredTypes.some(
      (t) => t.name.toLowerCase() === search.toLowerCase(),
    );
  }, [filteredTypes, search]);

  const selectedType = useMemo(() => {
    return types.find((t) => t.id === value);
  }, [types, value]);

  // Handlers
  const handleSelect = useCallback(
    (id: string) => {
      onChange(id);
      setIsOpen(false);
      triggerBtnRef.current?.focus();
    },
    [onChange],
  );

  const handleCreate = useCallback(() => {
    if (!search) return;
    onCreate(search); // Створюємо новий тип
    setSearch("");
    // Ми не закриваємо меню, поки тип не створиться (це буде оброблено в батьківському компоненті)
    // Або можна закрити, якщо ми оптимістично додаємо його
    setIsOpen(false);
  }, [search, onCreate]);

  const handleClear = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onChange(""); // Clear selection
    },
    [onChange],
  );

  // Keyboard Nav
  const handleTriggerKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
      e.preventDefault();
      setIsOpen((prev) => !prev);
    }
  }, []);

  const handleMenuKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      setIsOpen(false);
      triggerBtnRef.current?.focus();
    }
    // Тут можна додати навігацію стрілками по списку, як в TagSelect
  }, []);

  return {
    state: {
      isOpen,
      search,
      style,
      filteredTypes,
      exactMatch,
      selectedType,
    },
    actions: {
      setIsOpen,
      setSearch,
      handleSelect,
      handleCreate,
      handleClear,
      handleTriggerKeyDown,
      handleMenuKeyDown,
    },
    refs: {
      triggerRef,
      menuRef,
      triggerBtnRef,
      searchInputRef,
    },
  };
};
