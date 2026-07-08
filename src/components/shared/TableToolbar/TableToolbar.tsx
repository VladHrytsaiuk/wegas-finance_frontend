import { type ReactNode, useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { HiMagnifyingGlass, HiFunnel, HiCalendar } from "react-icons/hi2";
import { useTranslation } from "react-i18next";

// Components
import { MultiSelectFilter } from "./MultiSelectFilter";
import { RangeFilter } from "./RangeFilter";
import { ToggleFilter } from "./ToggleFilter";
import { SortControl } from "./SortControl";
import { DateRangePicker } from "../../ui/DateRangePicker";
import { MobileTableToolbar } from "./MobileTableToolbar";

// Hooks
import { useDropdownPosition } from "../../../hooks/useDropdownPosition";
import { useIsMobile } from "../../../hooks/useIsMobile";

// Styles & Types
import * as S from "./TableToolbar.styles";
import type { FilterConfig, FilterOption } from "./types";

type RangeFilterValue = {
  min?: string | number;
  max?: string | number;
};

type FilterValue = string | string[] | boolean | RangeFilterValue | undefined;

const hasFilterValue = (value: FilterValue): boolean => {
  if (Array.isArray(value)) {
    return value.length > 0;
  }

  if (typeof value === "object" && value !== null) {
    return Boolean(value.min || value.max);
  }

  return Boolean(value);
};

interface TableToolbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  searchPlaceholder?: string;
  searchPosition?: "top" | "inline";
  filtersConfig: FilterConfig[];
  filterValues: Record<string, FilterValue>;
  onFilterChange: (key: string, value: FilterValue) => void;
  sortOptions: FilterOption[];
  sortValue: string;
  onSortChange: (value: string) => void;
  onClearAll: () => void;
  dateRange?: { from: Date | undefined; to: Date | undefined };
  onDateRangeChange?: (range: {
    from: Date | undefined;
    to: Date | undefined;
  }) => void;
  enableSticky?: boolean;
  children?: ReactNode;
}

export const TableToolbar = ({
  searchQuery,
  onSearchChange,
  searchPlaceholder,
  searchPosition = "inline",
  filtersConfig,
  filterValues,
  onFilterChange,
  sortOptions,
  sortValue,
  onSortChange,
  onClearAll,
  dateRange,
  onDateRangeChange,
  enableSticky = false,
  children,
}: TableToolbarProps) => {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Стейт для відстеження самого факту прилипання
  const [isSticky, setIsSticky] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!enableSticky) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsSticky(!entry.isIntersecting);
      },
      // Від'ємний відступ "-24px" змушує обзервер спрацювати ПІЗНІШЕ
      { threshold: 1, rootMargin: "-1px 0px 0px 0px" },
    );

    if (sentinelRef.current) {
      observer.observe(sentinelRef.current);
    }

    return () => observer.disconnect();
  }, [enableSticky]);

  const ESTIMATED_WIDTH = 480;

  const {
    triggerRef,
    menuRef,
    style: popupStyle,
  } = useDropdownPosition(
    showDatePicker,
    () => setShowDatePicker(false),
    "right",
    ESTIMATED_WIDTH,
  );

  const finalSearchPlaceholder =
    searchPlaceholder || t("legacy:toolbar.search_default_placeholder");

  const stickyActive = enableSticky && isSticky;
  const hasDateFilter = dateRange && (dateRange.from || dateRange.to);

  const hasActiveFilters =
    searchQuery !== "" ||
    hasDateFilter ||
    Object.values(filterValues).some((value) => hasFilterValue(value));

  const activeFiltersCount =
    (searchQuery !== "" ? 1 : 0) +
    (hasDateFilter ? 1 : 0) +
    Object.values(filterValues).reduce((count, value) => {
      return count + (hasFilterValue(value) ? 1 : 0);
    }, 0);

  if (isMobile) {
    return (
      <MobileTableToolbar
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
        searchPlaceholder={searchPlaceholder}
        filtersConfig={filtersConfig}
        filterValues={filterValues}
        onFilterChange={onFilterChange}
        sortOptions={sortOptions}
        sortValue={sortValue}
        onSortChange={onSortChange}
        onClearAll={onClearAll}
        activeFiltersCount={activeFiltersCount}
        dateRange={dateRange}
        onDateRangeChange={onDateRangeChange}
      />
    );
  }

  const showControlsRow =
    searchPosition === "inline" ||
    filtersConfig.length > 0 ||
    !!dateRange ||
    (hasActiveFilters && searchQuery === ""); // Show if filters are active, but ignore search if it's handled in BottomBar

  return (
    <S.ToolbarWrapper style={{ gap: "0.5rem" }}>
      {/* 1. ВЕРХНІЙ РЯДОК З КНОПКАМИ (відлітає при скролі) */}
      <S.ChildrenTopRow style={{ position: "relative" }}>
        {children}

        {/* 🔥 МАЯЧОК: тепер він абсолютний відносно ChildrenTopRow. 
            Він не займає місця і не створює подвійного gap в PageContainer */}
        <div
          ref={sentinelRef}
          style={{
            position: "absolute",
            bottom: "-10px", // Трохи нижче за кнопки
            left: 0,
            height: "1px",
            width: "10px",
            pointerEvents: "none",
            visibility: "hidden",
          }}
        />
      </S.ChildrenTopRow>

      {/* 2. ЛИПКИЙ КОНТЕЙНЕР (Фільтри + Пошук + Сортування) */}
      <S.StickyContainer $isSticky={stickyActive} $stickyEnabled={enableSticky}>
        {showControlsRow && (
          <S.ControlsRow $isSticky={stickyActive}>
            {searchPosition === "inline" && (
              <S.SearchWrapper $inline>
                <HiMagnifyingGlass />
                <S.SearchInput
                  type="search"
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder={finalSearchPlaceholder}
                />
              </S.SearchWrapper>
            )}

            {searchPosition === "inline" && <S.Divider />}

            <S.FiltersGroup>
              {filtersConfig.map((config: FilterConfig) => {
                if (config.type === "multi-select") {
                  return (
                    <MultiSelectFilter
                      key={config.key}
                      config={config}
                      value={filterValues[config.key] || []}
                      onChange={(vals) => onFilterChange(config.key, vals)}
                    />
                  );
                }

                if (config.type === "range") {
                  return (
                    <RangeFilter
                      key={config.key}
                      config={config}
                      value={filterValues[config.key] || { min: "", max: "" }}
                      onChange={(val) => onFilterChange(config.key, val)}
                    />
                  );
                }

                if (config.type === "toggle") {
                  return (
                    <ToggleFilter
                      key={config.key}
                      config={config}
                      value={filterValues[config.key] || []}
                      onChange={(vals) => onFilterChange(config.key, vals)}
                    />
                  );
                }

                return null;
              })}

              {dateRange && onDateRangeChange && (
                <>
                  <S.DateIconButton
                    ref={triggerRef}
                    type="button"
                    onClick={() => setShowDatePicker(!showDatePicker)}
                      $active={Boolean(hasDateFilter) || showDatePicker}
                  >
                    <HiCalendar />
                  </S.DateIconButton>

                  {showDatePicker &&
                    createPortal(
                      <S.DatePopupPortal
                        ref={menuRef}
                        style={{ ...popupStyle, width: "fit-content" }}
                      >
                        <DateRangePicker
                          dateFrom={dateRange.from}
                          dateTo={dateRange.to}
                          onChange={onDateRangeChange}
                          staticPicker
                          numberOfMonths={1}
                        />
                      </S.DatePopupPortal>,
                      document.body,
                    )}
                </>
              )}

              {hasActiveFilters && (
                <S.ResetButton type="button" onClick={onClearAll}>
                  <HiFunnel />
                </S.ResetButton>
              )}
            </S.FiltersGroup>
          </S.ControlsRow>
        )}

        {(searchPosition === "top" || sortOptions.length > 0) && (
          <S.BottomBar>
            {searchPosition === "top" ? (
              <S.SearchWrapper>
                <HiMagnifyingGlass />
                <S.SearchInput
                  type="search"
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder={finalSearchPlaceholder}
                />
              </S.SearchWrapper>
            ) : (
              <div />
            )}

            {sortOptions.length > 0 && (
              <SortControl
                options={sortOptions}
                value={sortValue}
                onChange={onSortChange}
              />
            )}
          </S.BottomBar>
        )}
      </S.StickyContainer>
    </S.ToolbarWrapper>
  );
};
