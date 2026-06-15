import { useState, useMemo } from "react";
import styled from "styled-components";
import { 
  HiChevronDown, 
  HiCheck, 
  HiMagnifyingGlass,
  HiXMark
} from "react-icons/hi2";
import { useTranslation } from "react-i18next";

// Components
import { CategoryTree } from "../../categories/CategoryTree";
import { CounterpartyTree } from "../../counterparties/CounterpartyTree";
import { AccountTree } from "../../accounts/AccountTree";
import { SmartIcon } from "../../../utils/IconMap";
import { Checkbox } from "./styles";

// Logic
import type { FilterConfig } from "./types";
import { useCategoryTreeState, type CategoryNode } from "../../../hooks/Categories/useCategoryTreeState";
import { useCounterpartyTree } from "../../../hooks/Counterparties/useCounterpartyTree";

const ItemContainer = styled.div`
  border: 1px solid var(--color-border);
  border-radius: 14px;
  background-color: var(--color-bg-surface);
  overflow: hidden;
  transition: all 0.2s ease;
`;

const ItemHeader = styled.button<{ $isOpen: boolean }>`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  background: none;
  border: none;
  cursor: pointer;
  
  &:active {
    background-color: var(--color-bg-hover);
  }

  .label-group {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 2px;
  }

  .title {
    font-size: 15px;
    font-weight: 700;
    color: var(--color-text-main);
  }

  .value-summary {
    font-size: 13px;
    font-weight: 500;
    color: var(--color-brand-600);
  }

  .chevron {
    color: var(--color-text-tertiary);
    transition: transform 0.2s;
    transform: ${props => props.$isOpen ? 'rotate(180deg)' : 'rotate(0)'};
  }
`;

const ItemContent = styled.div`
  border-top: 1px solid var(--color-border);
  background-color: var(--color-bg-page);
`;

const SearchBox = styled.div`
  padding: 12px;
  position: relative;
  
  svg {
    position: absolute;
    left: 22px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--color-text-tertiary);
    width: 16px;
    height: 16px;
  }
`;

const SearchInput = styled.input`
  width: 100%;
  height: 36px;
  padding: 0 12px 0 32px;
  border-radius: 10px;
  border: 1px solid var(--color-border);
  background-color: var(--color-bg-surface);
  font-size: 14px;
  color: var(--color-text-main);

  &:focus {
    outline: none;
    border-color: var(--color-brand-600);
  }
`;

const TreeWrapper = styled.div`
  max-height: 300px;
  overflow-y: auto;
  padding: 4px 0;
`;

const FlatOption = styled.button<{ $selected: boolean }>`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: none;
  border: none;
  border-bottom: 1px solid var(--color-border);
  cursor: pointer;

  &:last-child { border-bottom: none; }
  &:active { background-color: var(--color-bg-hover); }

  .icon-box {
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 6px;
  }

  .label {
    font-size: 14px;
    font-weight: 600;
    color: ${props => props.$selected ? 'var(--color-brand-700)' : 'var(--color-text-main)'};
  }
`;

interface Props {
  config: FilterConfig;
  value: string[];
  onChange: (vals: string[]) => void;
}

export const MobileInlineFilter = ({ config, value = [], onChange }: Props) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const { calculateNewSelection } = useCategoryTreeState({});

  // 1. Categories Data
  const categoryTreeData = useMemo(() => {
    if (config.treeType !== "categories" || !config.rawData) return [];
    const categories = config.rawData;
    let filtered = categories;
    if (search) {
      const q = search.toLowerCase();
      filtered = categories.filter((c: any) => c.name.toLowerCase().includes(q));
    }
    const map = new Map();
    const roots: any[] = [];
    filtered.forEach((cat: any) => map.set(cat.id, { ...cat, children: [] }));
    filtered.forEach((cat: any) => {
      const node = map.get(cat.id);
      if (cat.parent_id && map.has(cat.parent_id)) map.get(cat.parent_id).children.push(node);
      else roots.push(node);
    });
    return roots;
  }, [config.treeType, config.rawData, search]);

  // 2. Counterparties Data
  const counterpartyTreeData = useCounterpartyTree({
    counterparties: config.treeType === "counterparties" ? config.rawData || [] : [],
    categories: config.treeType === "counterparties" ? config.relatedData || [] : [],
    searchQuery: search,
    filters: { type: [] },
    sortValue: "name-asc",
  });

  // 3. Flat List
  const filteredFlatOptions = useMemo(() => {
    if (config.treeType) return [];
    return (config.options || []).filter((o) =>
      o.label.toLowerCase().includes(search.toLowerCase())
    );
  }, [config.options, config.treeType, search]);

  const valueSummary = useMemo(() => {
    if (value.length === 0) return t("common:shared.all", "Всі");
    if (value.length === 1) {
      // Find label from options or rawData
      const opt = config.options?.find(o => o.value === value[0]);
      if (opt) return opt.label;
      const raw = config.rawData?.find((r: any) => String(r.id) === String(value[0]));
      if (raw) return raw.name || raw.label;
      return `Обрано: 1`;
    }
    return `Обрано: ${value.length}`;
  }, [value, config, t]);

  const toggleFlat = (val: string) => {
    if (value.includes(val)) onChange(value.filter((v) => v !== val));
    else onChange([...value, val]);
  };

  return (
    <ItemContainer>
      <ItemHeader $isOpen={isOpen} onClick={() => setIsOpen(!isOpen)}>
        <div className="label-group">
          <span className="title">{config.label}</span>
          <span className="value-summary">{valueSummary}</span>
        </div>
        <HiChevronDown className="chevron" size={20} />
      </ItemHeader>

      {isOpen && (
        <ItemContent>
          {(config.options?.length || 0) > 8 || config.treeType ? (
             <SearchBox>
                <HiMagnifyingGlass />
                <SearchInput 
                  placeholder={t("legacy:filterComponent.search_placeholder")}
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
             </SearchBox>
          ) : null}

          <TreeWrapper>
            {config.treeType === "categories" ? (
              <CategoryTree
                categories={categoryTreeData}
                selectedIds={value}
                onSelect={(node) => onChange(calculateNewSelection(node, value))}
                withCheckboxes={true}
                collapsible={!search}
              />
            ) : config.treeType === "counterparties" ? (
              <CounterpartyTree
                nodes={counterpartyTreeData}
                selectedIds={value}
                onSelect={(node: any) => {
                   const ids = node.children ? node.children.map((c: any) => String(c.id)) : [String(node.id)];
                   const allSelected = ids.every(id => value.includes(id));
                   onChange(allSelected ? value.filter(id => !ids.includes(id)) : Array.from(new Set([...value, ...ids])));
                }}
                withCheckboxes={true}
              />
            ) : config.treeType === "accounts" ? (
              <AccountTree
                accounts={config.rawData || []}
                users={config.relatedData || []}
                selectedIds={value}
                onSelect={(ids) => onChange(ids)}
                searchQuery={search}
              />
            ) : (
              filteredFlatOptions.map(opt => {
                const isSelected = value.includes(opt.value);
                return (
                  <FlatOption key={opt.value} $selected={isSelected} onClick={() => toggleFlat(opt.value)}>
                    <Checkbox $checked={isSelected}><HiCheck /></Checkbox>
                    <span className="label">{opt.label}</span>
                  </FlatOption>
                );
              })
            )}
          </TreeWrapper>
        </ItemContent>
      )}
    </ItemContainer>
  );
};
