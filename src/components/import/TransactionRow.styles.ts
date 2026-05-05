import styled from "styled-components";

export const Tr = styled.tr<{
  $status: "duplicate" | "warning" | "selected" | "normal";
}>`
  transition: all 0.2s;
  background-color: ${(props) => {
    switch (props.$status) {
      case "duplicate":
        return "rgba(0, 0, 0, 0.02)";
      case "warning":
        return "var(--color-yellow-50)";
      case "selected":
        return "var(--color-brand-50)";
      default:
        return "transparent";
    }
  }};
  opacity: ${(props) => (props.$status === "duplicate" ? 0.6 : 1)};
  cursor: ${(props) =>
    props.$status === "duplicate" ? "not-allowed" : "default"};

  &:hover {
    background-color: ${(props) =>
      props.$status === "duplicate"
        ? "rgba(0, 0, 0, 0.02)"
        : props.$status === "warning"
        ? "var(--color-yellow-100)"
        : "var(--color-bg-hover)"};
  }

  td {
    padding: 0.8rem 1rem;
    border-bottom: 1px solid var(--color-border);
    color: var(--color-text-main);
    vertical-align: middle;
  }
`;

export const CellCenter = styled.td`
  text-align: center;
`;

export const CellRight = styled.td`
  text-align: right;
`;

export const DateCell = styled.td`
  color: var(--color-text-secondary);
  font-size: 0.85rem;
  white-space: nowrap;
`;

export const NoteCell = styled.td`
  /* Специфічних стилів немає, але для семантики */
`;

export const MainInfo = styled.div`
  font-weight: 600;
  color: var(--color-text-main);
  display: flex;
  align-items: center;
  gap: 6px;
`;

export const SubInfo = styled.div`
  font-size: 0.8rem;
  color: var(--color-text-tertiary);
  margin-top: 2px;
`;

export const DuplicateStatusRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
`;

export const StatusBadge = styled.div<{ $color: "red" | "yellow" | "green" }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;

  ${(props) =>
    props.$color === "red" &&
    `color: var(--color-red-700); background: var(--color-red-100); border: 1px solid var(--color-red-200);`}
  ${(props) =>
    props.$color === "yellow" &&
    `color: var(--color-yellow-700); background: var(--color-yellow-100); border: 1px solid var(--color-yellow-200);`}
  ${(props) =>
    props.$color === "green" &&
    `color: var(--color-green-700); background: var(--color-green-100); border: 1px solid var(--color-green-200);`}
`;

export const CompareButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-text-secondary);
  display: flex;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s;

  &:hover {
    color: var(--color-text-main);
    background-color: var(--color-bg-hover);
  }
`;

export const Amount = styled.span<{ $type: string }>`
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: ${(props) =>
    props.$type === "income"
      ? "var(--color-brand-600)"
      : props.$type === "expense"
      ? "var(--color-red-600)"
      : "var(--color-blue-600)"};
`;

export const CategoryBadge = styled.span`
  background: var(--color-bg-subtle);
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 500;
  border: 1px solid var(--color-border);
  color: var(--color-text-secondary);
`;

export const MissingCategoryBadge = styled(CategoryBadge)`
  background: var(--color-yellow-100);
  color: var(--color-yellow-700);
  border-color: var(--color-yellow-200);
  display: inline-flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;

  &:hover {
    background: var(--color-yellow-200);
  }
`;

export const IconButton = styled.button`
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 1px solid transparent;
  background: transparent;
  color: var(--color-text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  &:hover {
    background: var(--color-bg-hover);
    color: var(--color-brand-600);
  }
`;
