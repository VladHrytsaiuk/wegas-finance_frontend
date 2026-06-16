import { useState } from "react";
import styled, { keyframes } from "styled-components";
import { 
  HiMagnifyingGlass, 
  HiFunnel, 
  HiXMark,
  HiCheck,
  HiCalendar,
  HiArrowsUpDown
} from "react-icons/hi2";
import { useTranslation } from "react-i18next";
import { createPortal } from "react-dom";

import type { FilterConfig, FilterOption } from "./types";
import { MobileInlineFilter } from "./MobileInlineFilter";
import { DateRangePicker } from "../../ui/DateRangePicker";

const slideUp = keyframes`
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
`;

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const MobileToolbarContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  margin-bottom: 16px;
  padding: 0 16px;
`;

const SearchBarRow = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const SearchInputWrapper = styled.div`
  position: relative;
  flex: 1;
  
  svg {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--color-text-secondary);
    width: 20px;
    height: 20px;
  }
`;

const SearchInput = styled.input`
  width: 100%;
  height: 44px;
  background-color: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 0 12px 0 40px;
  font-size: 16px;
  color: var(--color-text-main);
  box-shadow: var(--shadow-sm);

  &:focus {
    outline: none;
    border-color: var(--color-brand-600);
  }
`;

const IconButton = styled.button<{ $active?: boolean }>`
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background-color: ${props => props.$active ? 'var(--color-brand-600)' : 'var(--color-bg-surface)'};
  color: ${props => props.$active ? 'white' : 'var(--color-text-main)'};
  border: 1px solid ${props => props.$active ? 'var(--color-brand-600)' : 'var(--color-border)'};
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-sm);
  position: relative;
  flex-shrink: 0;
  
  svg {
    width: 20px;
    height: 20px;
  }
`;

const Badge = styled.span`
  position: absolute;
  top: -5px;
  right: -5px;
  background-color: var(--color-red-600);
  color: white;
  font-size: 10px;
  font-weight: 800;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid var(--color-bg-page);
`;

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
  z-index: 2000;
  animation: ${fadeIn} 0.2s ease-out;
`;

const Sheet = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: var(--color-bg-page);
  border-radius: 24px 24px 0 0;
  max-height: 92vh;
  display: flex;
  flex-direction: column;
  animation: ${slideUp} 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
`;

const SheetHeader = styled.div`
  padding: 16px 20px;
  border-bottom: 1px solid var(--color-border);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: var(--color-bg-surface);
`;

const SheetTitle = styled.h2`
  font-size: 18px;
  font-weight: 700;
  color: var(--color-text-main);
`;

const SheetContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const SheetFooter = styled.div`
  padding: 16px 20px;
  padding-bottom: max(16px, env(safe-area-inset-bottom));
  border-top: 1px solid var(--color-border);
  display: flex;
  gap: 12px;
  background-color: var(--color-bg-surface);
`;

const FilterSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const SectionLabel = styled.label`
  font-size: 12px;
  font-weight: 800;
  color: var(--color-text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.8px;
  margin-left: 4px;
`;

const SortOptionItem = styled.button<{ $active: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: ${props => props.$active ? 'var(--color-brand-50)' : 'var(--color-bg-surface)'};
  border: none;
  border-bottom: 1px solid var(--color-border);
  width: 100%;
  text-align: left;
  
  &:active {
    background-color: var(--color-bg-hover);
  }
  
  &:last-child {
    border-bottom: none;
  }

  span {
    font-size: 16px;
    font-weight: 600;
    color: ${props => props.$active ? 'var(--color-brand-700)' : 'var(--color-text-main)'};
  }
`;

const SortList = styled.div`
  border: 1px solid var(--color-border);
  border-radius: 14px;
  overflow: hidden;
`;

interface MobileTableToolbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  searchPlaceholder?: string;
  filtersConfig: FilterConfig[];
  filterValues: Record<string, any>;
  onFilterChange: (key: string, value: any) => void;
  sortOptions: FilterOption[];
  sortValue: string;
  onSortChange: (value: string) => void;
  onClearAll: () => void;
  activeFiltersCount: number;
  dateRange?: { from: Date | undefined; to: Date | undefined };
  onDateRangeChange?: (range: {
    from: Date | undefined;
    to: Date | undefined;
  }) => void;
}

export const MobileTableToolbar = ({
  searchQuery,
  onSearchChange,
  searchPlaceholder,
  filtersConfig,
  filterValues,
  onFilterChange,
  sortOptions,
  sortValue,
  onSortChange,
  onClearAll,
  activeFiltersCount,
  dateRange,
  onDateRangeChange
}: MobileTableToolbarProps) => {
  const { t } = useTranslation();
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const [isSortSheetOpen, setIsSortSheetOpen] = useState(false);

  const handleApply = () => {
    setIsFilterSheetOpen(false);
  };

  const actualFiltersCount = activeFiltersCount - (searchQuery !== "" ? 1 : 0);

  return (
    <MobileToolbarContainer>
      <SearchBarRow>
        <SearchInputWrapper>
          <HiMagnifyingGlass />
          <SearchInput 
            placeholder={searchPlaceholder || t("legacy:toolbar.search_default_placeholder")}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </SearchInputWrapper>

        {sortOptions.length > 0 && (
           <IconButton 
            $active={!!sortValue && sortValue !== 'date-desc' && sortValue !== 'name-asc'} 
            onClick={() => setIsSortSheetOpen(true)}
          >
            <HiArrowsUpDown />
          </IconButton>
        )}

        <IconButton 
          $active={isFilterSheetOpen || actualFiltersCount > 0} 
          onClick={() => setIsFilterSheetOpen(true)}
        >
          <HiFunnel />
          {actualFiltersCount > 0 && <Badge>{actualFiltersCount}</Badge>}
        </IconButton>
      </SearchBarRow>

      {/* Sort Sheet */}
      {isSortSheetOpen && createPortal(
        <Overlay onClick={() => setIsSortSheetOpen(false)}>
          <Sheet onClick={(e) => e.stopPropagation()}>
            <SheetHeader>
              <SheetTitle>{t("legacy:toolbar.sort_default")}</SheetTitle>
              <IconButton onClick={() => setIsSortSheetOpen(false)} style={{ border: 'none', background: 'none', boxShadow: 'none' }}>
                <HiXMark size={24} />
              </IconButton>
            </SheetHeader>
            <SheetContent style={{ gap: 0, padding: '16px' }}>
              <SortList>
                {sortOptions.map(opt => (
                  <SortOptionItem 
                    key={opt.value} 
                    $active={sortValue === opt.value}
                    onClick={() => { onSortChange(opt.value); setIsSortSheetOpen(false); }}
                  >
                    <span>{opt.label}</span>
                    {sortValue === opt.value && <HiCheck size={20} color="var(--color-brand-600)" />}
                  </SortOptionItem>
                ))}
              </SortList>
            </SheetContent>
          </Sheet>
        </Overlay>,
        document.body
      )}

      {/* Filter Sheet */}
      {isFilterSheetOpen && createPortal(
        <Overlay onClick={() => setIsFilterSheetOpen(false)}>
          <Sheet onClick={(e) => e.stopPropagation()}>
            <SheetHeader>
              <SheetTitle>{t("legacy:filters.title")}</SheetTitle>
              <IconButton onClick={() => setIsFilterSheetOpen(false)} style={{ border: 'none', background: 'none', boxShadow: 'none' }}>
                <HiXMark size={24} />
              </IconButton>
            </SheetHeader>
            
            <SheetContent>
              {/* Date Range Section */}
              {dateRange && onDateRangeChange && (
                <FilterSection>
                  <SectionLabel>{t("legacy:filters.period_label")}</SectionLabel>
                  <div style={{ background: 'var(--color-bg-surface)', borderRadius: '16px', padding: '12px', border: '1px solid var(--color-border)' }}>
                    <DateRangePicker 
                      dateFrom={dateRange.from} 
                      dateTo={dateRange.to} 
                      onChange={onDateRangeChange}
                      staticPicker
                      numberOfMonths={1}
                    />
                  </div>
                </FilterSection>
              )}

              {/* Dynamic Filters Sections */}
              {filtersConfig.length > 0 && (
                <FilterSection>
                  <SectionLabel>{t("legacy:filters.parameters_label")}</SectionLabel>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {filtersConfig.map(config => (
                      <MobileInlineFilter 
                        key={config.key}
                        config={config} 
                        value={filterValues[config.key] || []} 
                        onChange={(vals) => onFilterChange(config.key, vals)}
                      />
                    ))}
                  </div>
                </FilterSection>
              )}
            </SheetContent>

            <SheetFooter>
              <ButtonFull 
                $variant="secondary" 
                onClick={() => { onClearAll(); setIsFilterSheetOpen(false); }}
                style={{ flex: 1 }}
              >
                {t("legacy:filters.reset")}
              </ButtonFull>
              <ButtonFull 
                $variant="primary" 
                onClick={handleApply}
                style={{ flex: 2 }}
              >
                {t("legacy:filters.apply")}
              </ButtonFull>
            </SheetFooter>
          </Sheet>
        </Overlay>,
        document.body
      )}
    </MobileToolbarContainer>
  );
};

const ButtonFull = styled.button<{ $variant: 'primary' | 'secondary' }>`
  height: 50px;
  border-radius: 14px;
  font-size: 16px;
  font-weight: 700;
  border: none;
  cursor: pointer;
  
  background-color: ${props => props.$variant === 'primary' ? 'var(--color-brand-600)' : 'var(--color-bg-surface)'};
  color: ${props => props.$variant === 'primary' ? 'white' : 'var(--color-text-main)'};
  border: ${props => props.$variant === 'secondary' ? '1px solid var(--color-border)' : 'none'};
`;
