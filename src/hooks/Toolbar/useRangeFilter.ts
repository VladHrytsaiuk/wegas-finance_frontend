import { useState } from "react";
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
  const [draftRange, setDraftRange] = useState<{ min: string; max: string } | null>(
    null,
  );
  const localMin = draftRange?.min ?? value.min;
  const localMax = draftRange?.max ?? value.max;

  // Позиціонування
  const { triggerRef, menuRef, style } = useDropdownPosition(
    isOpen,
    () => setIsOpen(false),
    "left",
    260 // Ширина меню
  );

  const close = () => {
    setIsOpen(false);
    setDraftRange(null);
  };

  const apply = () => {
    onChange({ min: localMin, max: localMax });
    close();
  };

  const reset = () => {
    setDraftRange({ min: "", max: "" });
    onChange({ min: "", max: "" });
    close();
  };

  const isActive = value.min !== "" || value.max !== "";

  const label = isActive
    ? `${value.min || t("legacy:filterComponent.range_display_from")} - ${
        value.max || t("legacy:filterComponent.range_display_to")
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
      toggleOpen: () => {
        if (isOpen) {
          close();
          return;
        }

        setDraftRange({ min: value.min, max: value.max });
        setIsOpen(true);
      },
      setLocalMin: (min: string) =>
        setDraftRange((prev) => ({ min, max: prev?.max ?? value.max })),
      setLocalMax: (max: string) =>
        setDraftRange((prev) => ({ min: prev?.min ?? value.min, max })),
      apply,
      reset,
    },
    t,
  };
};
