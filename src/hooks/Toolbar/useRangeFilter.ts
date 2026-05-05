import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useDropdownPosition } from "../useDropdownPosition"; // Перевір шлях
import type { FilterConfig } from "../../components/shared/TableToolbar/types";

interface UseRangeFilterProps {
  config: FilterConfig;
  value: { min: string; max: string };
  onChange: (val: { min: string; max: string }) => void;
}

export const useRangeFilter = ({
  config,
  value,
  onChange,
}: UseRangeFilterProps) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [localMin, setLocalMin] = useState(value.min);
  const [localMax, setLocalMax] = useState(value.max);

  // Позиціонування
  const { triggerRef, menuRef, style } = useDropdownPosition(
    isOpen,
    () => setIsOpen(false),
    "left",
    260 // Ширина меню
  );

  // Синхронізація локального стану з пропсами при відкритті
  useEffect(() => {
    if (isOpen) {
      setLocalMin(value.min);
      setLocalMax(value.max);
    }
  }, [isOpen, value]);

  const apply = () => {
    onChange({ min: localMin, max: localMax });
    setIsOpen(false);
  };

  const reset = () => {
    setLocalMin("");
    setLocalMax("");
    onChange({ min: "", max: "" });
    setIsOpen(false);
  };

  const isActive = value.min !== "" || value.max !== "";

  const label = isActive
    ? `${value.min || t("filterComponent.range_display_from")} - ${
        value.max || t("filterComponent.range_display_to")
      }`
    : config.label;

  return {
    state: {
      isOpen,
      localMin,
      localMax,
      isActive,
      label,
      style,
    },
    refs: {
      triggerRef,
      menuRef,
    },
    handlers: {
      toggleOpen: () => setIsOpen(!isOpen),
      setLocalMin,
      setLocalMax,
      apply,
      reset,
    },
    t,
  };
};
