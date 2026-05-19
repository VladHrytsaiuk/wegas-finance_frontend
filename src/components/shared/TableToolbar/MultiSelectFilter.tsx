import React from "react";
import { createPortal } from "react-dom";
import { HiFunnel, HiChevronDown, HiCheck } from "react-icons/hi2";

// Components
import { CategoryTree } from "../../categories/CategoryTree";
import { CounterpartyTree } from "../../counterparties/CounterpartyTree";
import { AccountTree } from "../../accounts/AccountTree";
import { SmartIcon } from "../../../utils/IconMap";

// Shared Styles
import {
  FilterButton,
  Badge,
  PortalMenu,
  SearchInput,
  MenuOption,
  Checkbox,
} from "./styles";

// Specific Styles
import * as S from "./MultiSelectFilter.styles";

// Logic
import { useMultiSelectFilter } from "../../../hooks/Toolbar/useMultiSelectFilter";
import type { FilterConfig } from "./types";
// 🔥 Імпортуємо хук
import {
  useCategoryTreeState,
  type CategoryNode,
} from "../../../hooks/Categories/useCategoryTreeState";

interface Props {
  config: FilterConfig;
  value: string[];
  onChange: (vals: string[]) => void;
}

export const MultiSelectFilter = ({ config, value = [], onChange }: Props) => {
  // 1. Викликаємо хуки ВСЕРЕДИНІ компонента
  const { calculateNewSelection } = useCategoryTreeState({});

  const {
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
    refs: { triggerRef, menuRef, searchInputRef, treeContainerRef },
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
  } = useMultiSelectFilter({ config, value, onChange });

  // 2. Оновлений хендлер для категорій (з урахуванням ієрархії)
  const handleCategorySelect = (node: CategoryNode) => {
    // Викликаємо логіку, яка додасть і батька, і всіх дітей
    const newIds = calculateNewSelection(node, value);
    onChange(newIds);
  };

  // Render Helper for Flat List
  const renderFlatList = () => {
    if (filteredFlatOptions.length === 0) {
      return (
        <S.EmptyState>
          {t("legacy:filterComponent.status_not_found")}
        </S.EmptyState>
      );
    }
    return filteredFlatOptions.map((opt) => {
      const isSelected = value.includes(opt.value);
      const color = opt.color || "var(--color-text-secondary)";

      const isBankLogo =
        typeof opt.icon === "string" && opt.icon.startsWith("icon_");
      const isOtherLogo = !!opt.logo;
      const hasImage = isBankLogo || isOtherLogo;
      const showLetter = !opt.logo && !opt.icon;
      const isCustomIcon = React.isValidElement(opt.icon);

      return (
        <MenuOption
          key={opt.value}
          type="button"
          $selected={isSelected}
          onClick={() => toggleFlat(opt.value)}
          style={{ gap: "10px", padding: "0.6rem 0.8rem" }}
        >
          <Checkbox $checked={isSelected}>
            <HiCheck />
          </Checkbox>
          <S.ItemIconBox $color={color} $hasImage={hasImage || isCustomIcon}>
            {showLetter ? (
              <S.ItemInitials>{getInitials(opt.label)}</S.ItemInitials>
            ) : isCustomIcon ? (
              opt.icon
            ) : (
              <SmartIcon
                logo={isBankLogo ? (opt.icon as string) : opt.logo}
                iconName={!hasImage ? (opt.icon as string) : undefined}
                color={color}
                size={32}
              />
            )}
          </S.ItemIconBox>
          <S.ItemLabel>{opt.label}</S.ItemLabel>
        </MenuOption>
      );
    });
  };

  return (
    <div ref={triggerRef} style={{ position: "relative" }}>
      <FilterButton
        type="button"
        $isActive={activeCount > 0}
        $isOpen={isOpen}
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleTriggerKeyDown}
      >
        {activeCount === 0 && <HiFunnel style={{ opacity: 0.6 }} />}
        {config.label}
        {activeCount > 0 && <Badge>{activeCount}</Badge>}
        <HiChevronDown className="chevron" />
      </FilterButton>

      {isOpen &&
        createPortal(
          <PortalMenu
            ref={menuRef}
            onKeyDown={handleMenuKeyDown}
            style={{
              top: style.top,
              bottom: style.bottom,
              left: style.left,
              right: style.right,
              transformOrigin: style.transformOrigin,
              width: "340px",
              height: "auto",
              maxHeight: "50vh",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <S.SearchContainer>
              <SearchInput
                ref={searchInputRef}
                placeholder={t("legacy:filterComponent.search_placeholder")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.stopPropagation()}
              />
            </S.SearchContainer>

            <S.TreeContainer ref={treeContainerRef}>
              {config.treeType === "categories" ? (
                categoryTreeData.length > 0 ? (
                  <CategoryTree
                    categories={categoryTreeData}
                    selectedIds={value}
                    // 🔥 Використовуємо наш новий хендлер
                    onSelect={handleCategorySelect}
                    withCheckboxes={true}
                    collapsible={!search}
                    defaultExpandedIds={
                      search ? categoryTreeData.map((c: any) => c.id) : []
                    }
                  />
                ) : (
                  <S.EmptyState>
                    {t("categories:categorySelect.status_not_found")}
                  </S.EmptyState>
                )
              ) : config.treeType === "counterparties" ? (
                counterpartyTreeData.length > 0 ? (
                  <CounterpartyTree
                    nodes={counterpartyTreeData}
                    selectedIds={value}
                    onSelect={(node: any) => toggleNode(node)}
                    withCheckboxes={true}
                    defaultExpandedIds={cpExpandedIds}
                  />
                ) : (
                  <S.EmptyState>
                    {t("counterparties:counterpartySelect.status_not_found")}
                  </S.EmptyState>
                )
              ) : config.treeType === "accounts" ? (
                <AccountTree
                  accounts={config.rawData || []}
                  users={config.relatedData || []}
                  selectedIds={value}
                  onSelect={(ids) => onChange(ids)}
                  searchQuery={search}
                />
              ) : (
                renderFlatList()
              )}
            </S.TreeContainer>

            <S.FooterRow>
              {activeCount > 0 && (
                <S.FooterBtn
                  $variant="secondary"
                  type="button"
                  onClick={() => onChange([])}
                >
                  {t("legacy:filterComponent.clear_selection")}
                </S.FooterBtn>
              )}
              <S.FooterBtn
                $variant="primary"
                type="button"
                onClick={() => setIsOpen(false)}
              >
                {t("legacy:filterComponent.range_button_ok")}
              </S.FooterBtn>
            </S.FooterRow>
          </PortalMenu>,
          document.body,
        )}
    </div>
  );
};
