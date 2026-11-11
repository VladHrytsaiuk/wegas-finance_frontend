import { HiChevronUpDown } from "react-icons/hi2";
import styled from "styled-components";

import { CATALOG_SORTS, type CatalogSort } from "./catalog";

// Сортування довідників: завжди одним рядком під пошуком, справа.

const Bar = styled.button.attrs({ type: "button" })`
  align-self: flex-end;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin: -12px 4px -8px 0;
  padding: 0;
  border: none;
  background: none;
  font: inherit;
  font-size: 15px;
  color: var(--m-accent);
  cursor: pointer;
`;

export function SortBar({ sort, onOpen }: { sort: CatalogSort; onOpen: () => void }) {
  return (
    <Bar aria-label="Сортування" onClick={onOpen}>
      {CATALOG_SORTS.find((s) => s.value === sort)?.label}
      <HiChevronUpDown size={16} aria-hidden="true" />
    </Bar>
  );
}
