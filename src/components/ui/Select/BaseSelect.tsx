import { ReactNode } from "react";
import { createPortal } from "react-dom";
import { HiChevronDown, HiXMark, HiMagnifyingGlass } from "react-icons/hi2";
import { useTranslation } from "react-i18next";

import * as S from "./styles"; // Імпорт всіх стилів як S
import { useBaseSelect } from "../../../hooks/ui/useBaseSelect";

export interface BaseSelectProps {
  triggerLabel?: ReactNode;
  children: ReactNode;
  onClear?: () => void;
  placeholder?: string;
  hasError?: boolean;
  disabled?: boolean;
  className?: string;
  menuWidth?: string | number;
  isMulti?: boolean;
  onSearchChange?: (value: string) => void;
  searchValue?: string;
  size?: "small" | "medium";
}

export const BaseSelect = ({
  triggerLabel,
  children,
  onClear,
  placeholder,
  hasError,
  disabled,
  className,
  menuWidth,
  isMulti = false,
  onSearchChange,
  searchValue = "",
  size = "medium",
}: BaseSelectProps) => {
  const { t } = useTranslation();

  const { state, refs, actions } = useBaseSelect({
    disabled,
    menuWidth,
    isMulti,
    onSearchChange,
    onClear,
    searchValue,
  });

  const handleInputClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!state.isOpen) actions.toggle();
  };

  return (
    <S.Wrapper className={className}>
      <S.Trigger
        ref={refs.triggerRef}
        onClick={actions.toggle}
        onKeyDown={actions.handleTriggerKeyDown}
        tabIndex={disabled ? -1 : 0}
        $isOpen={state.isOpen}
        $hasError={hasError}
        $disabled={disabled}
        $size={size}
        role="combobox"
        aria-expanded={state.isOpen}
      >
        <S.ContentWrapper $isHidden={state.isOpen && !!onSearchChange}>
          {triggerLabel ? (
            <S.TextTruncate>{triggerLabel}</S.TextTruncate>
          ) : (
            <S.Placeholder>
              {placeholder || t("common:ui.select_placeholder_default")}
            </S.Placeholder>
          )}
        </S.ContentWrapper>

        {onSearchChange && state.isOpen && (
          <S.TriggerSearchInput
            ref={refs.searchInputRef}
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            onClick={handleInputClick}
            placeholder={
              triggerLabel ? "" : placeholder || t("common:ui.search_placeholder_default")
            }
            autoComplete="off"
            autoFocus
          />
        )}

        <S.IconWrapper>
          {triggerLabel && onClear && !disabled && !state.isOpen && (
            <S.ClearButton
              onClick={actions.handleClear}
              type="button"
              tabIndex={-1}
              title={t("legacy:filterComponent.clear_selection")}
              aria-label={t("legacy:filterComponent.clear_selection")}
            >
              <HiXMark size={size === "small" ? 14 : 16} />
            </S.ClearButton>
          )}
          {onSearchChange && state.isOpen ? (
            <HiMagnifyingGlass
              size={size === "small" ? 14 : 16}
              style={{ color: "var(--color-brand-500)" }}
            />
          ) : (
            <HiChevronDown
              size={size === "small" ? 14 : 16}
              style={{
                transform: state.isOpen ? "rotate(180deg)" : "rotate(0)",
                transition: "transform 0.2s ease",
              }}
            />
          )}
        </S.IconWrapper>
      </S.Trigger>

      {state.isOpen &&
        createPortal(
          <S.Dropdown
            ref={refs.dropdownRef}
            tabIndex={-1}
            onKeyDown={actions.handleMenuKeyDown}
            $isAbove={state.coords.isAbove}
            style={{
              top: state.coords.top,
              left: state.coords.left,
              minWidth: state.coords.width,
              transform: state.coords.isAbove ? "translateY(-100%)" : "none",
            }}
            onClick={actions.handleDropdownClick}
          >
            <S.OptionsList>{children}</S.OptionsList>
          </S.Dropdown>,
          document.body
        )}
    </S.Wrapper>
  );
};
