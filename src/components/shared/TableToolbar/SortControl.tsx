import { useState } from "react";
import { createPortal } from "react-dom";
import { HiArrowsUpDown, HiCheck } from "react-icons/hi2";
import { useTranslation } from "react-i18next";

import { useDropdownPosition } from "../../../hooks/useDropdownPosition";
import type { FilterOption } from "./types";
import * as S from "./TableToolbar.styles";

interface SortControlProps {
  options: FilterOption[];
  value: string;
  onChange: (val: string) => void;
}

export const SortControl = ({ options, value, onChange }: SortControlProps) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const { triggerRef, menuRef, style } = useDropdownPosition(
    isOpen,
    () => setIsOpen(false),
    "right"
  );

  const currentOption = options.find((o) => o.value === value);
  const label = currentOption ? currentOption.label : t("toolbar.sort_default");

  return (
    <div ref={triggerRef}>
      <S.FilterButton
        type="button"
        $isActive={false}
        $isOpen={isOpen}
        onClick={() => setIsOpen(!isOpen)}
      >
        <HiArrowsUpDown />
        <S.SortLabelPrefix>{t("toolbar.sort_label_prefix")}</S.SortLabelPrefix>
        <S.SortLabelValue>{label}</S.SortLabelValue>
      </S.FilterButton>

      {isOpen &&
        createPortal(
          <S.PortalMenu
            id="active-portal-menu"
            ref={menuRef}
            style={{
              top: style.top,
              bottom: style.bottom,
              right: style.right,
              left: style.left,
              maxHeight: style.maxHeight,
              transformOrigin: style.transformOrigin,
              minWidth: "220px",
            }}
          >
            {options.map((opt) => (
              <S.MenuOption
                key={opt.value}
                type="button"
                $selected={value === opt.value}
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
              >
                {opt.label}
                {value === opt.value && <HiCheck />}
              </S.MenuOption>
            ))}
          </S.PortalMenu>,
          document.body
        )}
    </div>
  );
};
