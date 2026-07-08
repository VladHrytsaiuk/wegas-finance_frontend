import { useState, useMemo } from "react";
import styled, { css, keyframes } from "styled-components";
import { 
  HiChevronDown, 
  HiCheck, 
  HiMagnifyingGlass,
} from "react-icons/hi2";
import { useTranslation } from "react-i18next";

// Components
import { CategoryTree } from "../../categories/CategoryTree";
import { CounterpartyTree } from "../../counterparties/CounterpartyTree";
import { AccountTree } from "../../accounts/AccountTree";
import { Checkbox } from "./styles";

// Logic
import type { FilterConfig } from "./types";
import { useCategoryTreeState } from "../../../hooks/Categories/useCategoryTreeState";
import { useCounterpartyTree } from "../../../hooks/Counterparties/useCounterpartyTree";
import type { CategoryNode } from "../../../hooks/Categories/useCategoryTreeState";
import type { TreeNodeData } from "../../counterparties/CounterpartyTree";
import type { Account } from "../../../services/apiAccounts";
import type { UserProfile } from "../../../services/apiUsers";

const slideIn = keyframes`
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const ItemContainer = styled.div<{ $isOpen: boolean; $hasValue: boolean }>`
  border: 1px solid ${props => props.$isOpen ? 'var(--color-brand-400)' : 'var(--color-border)'};
  border-radius: 18px;
  background-color: var(--color-bg-surface);
  overflow: hidden;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: ${props => props.$isOpen ? '0 8px 24px -6px rgba(0, 0, 0, 0.08)' : 'var(--shadow-sm)'};
  
  ${props => props.$hasValue && !props.$isOpen && css`
    border-color: var(--color-brand-200);
    background-color: var(--color-brand-50);
  `}
`;

const ItemHeader = styled.button<{ $isOpen: boolean; $hasValue: boolean }>`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 18px;
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
    font-size: 11px;
    font-weight: 800;
    color: ${props => props.$isOpen ? 'var(--color-brand-600)' : 'var(--color-text-tertiary)'};
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .value-summary {
    font-size: 15px;
    font-weight: 700;
    color: ${props => props.$hasValue ? 'var(--color-brand-700)' : 'var(--color-text-main)'};
  }

  .chevron {
    color: var(--color-text-tertiary);
    transition: transform 0.3s;
    transform: ${props => props.$isOpen ? 'rotate(180deg)' : 'rotate(0)'};
  }
`;

const ItemContent = styled.div`
  background-color: var(--color-bg-surface);
  border-top: 1px solid var(--color-border);
  padding: 12px;
  animation: ${slideIn} 0.2s ease-out;
`;

const SearchBox = styled.div`
  margin-bottom: 12px;
  position: relative;
  
  svg {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--color-text-tertiary);
    width: 16px;
    height: 16px;
  }
`;

const SearchInput = styled.input`
  width: 100%;
  height: 38px;
  padding: 0 12px 0 36px;
  border-radius: 12px;
  border: 1px solid var(--color-border);
  background-color: var(--color-bg-page);
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
  border-radius: 12px;
  border: 1px solid var(--color-border);
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

  // Data processing logic
  const categoryTreeData = useMemo(() => {
    if (config.treeType !== "categories" || !config.rawData) return [];
    const categories = config.rawData;
    let filtered = categories;
    if (search) {
      const q = search.toLowerCase();
      filtered = categories.filter((c: CategoryNode) =>
        c.name.toLowerCase().includes(q),
      );
    }
    const map = new Map<string, CategoryNode>();
    const roots: CategoryNode[] = [];
    filtered.forEach((cat: CategoryNode) =>
      map.set(cat.id, { ...cat, children: [] }),
    );
    filtered.forEach((cat: CategoryNode) => {
      const node = map.get(cat.id);
      if (cat.parent_id && map.has(cat.parent_id)) {
        map.get(cat.parent_id)?.children.push(node as CategoryNode);
      } else if (node) {
        roots.push(node);
      }
    });
    return roots;
  }, [config.treeType, config.rawData, search]);

  const counterpartyTreeData = useCounterpartyTree({
    counterparties: config.treeType === "counterparties" ? config.rawData || [] : [],
    categories: config.treeType === "counterparties" ? config.relatedData || [] : [],
    searchQuery: search,
    filters: { type: [] },
    sortValue: "name-asc",
  });

  const filteredFlatOptions = useMemo(() => {
    if (config.treeType) return [];
    return (config.options || []).filter((o) =>
      o.label.toLowerCase().includes(search.toLowerCase())
    );
  }, [config.options, config.treeType, search]);

  const valueSummary = useMemo(() => {
    if (value.length === 0) return t("common:shared.all", "Всі");
    if (value.length === 1) {
      const opt = config.options?.find(o => o.value === value[0]);
      if (opt) return opt.label;
      const raw = config.rawData?.find(
        (r: CategoryNode | TreeNodeData) => String(r.id) === String(value[0]),
      );
      if (raw) return raw.name || raw.label;
      return t("common:ui.selected_count", { count: 1 });
    }
    return t("common:ui.selected_count", { count: value.length });
  }, [value, config, t]);

  const toggleFlat = (val: string) => {
    if (value.includes(val)) onChange(value.filter((v) => v !== val));
    else onChange([...value, val]);
  };

  const hasValue = value.length > 0;

  // Clean label - remove "Filter" or common redundant suffixes
  const cleanLabel = config.label.replace(/фільтр/gi, '').trim();

  return (
    <ItemContainer $isOpen={isOpen} $hasValue={hasValue}>
      <ItemHeader 
        $isOpen={isOpen} 
        $hasValue={hasValue}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="label-group">
          <span className="title">{cleanLabel}</span>
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
                  autoFocus
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
                nodes={counterpartyTreeData as TreeNodeData[]}
                selectedIds={value}
                onSelect={(node) => {
                   const ids = node.children
                     ? node.children.map((c: TreeNodeData) => String(c.id))
                     : [String(node.id)];
                   const allSelected = ids.every(id => value.includes(id));
                   onChange(allSelected ? value.filter(id => !ids.includes(id)) : Array.from(new Set([...value, ...ids])));
                }}
                withCheckboxes={true}
              />
            ) : config.treeType === "accounts" ? (
              <AccountTree
                accounts={(config.rawData || []) as Account[]}
                users={(config.relatedData || []) as UserProfile[]}
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
