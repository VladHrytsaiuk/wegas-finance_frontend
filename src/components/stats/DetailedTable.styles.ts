import styled from "styled-components";

export const TableWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

export const TableHead = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  padding: 0.75rem 1rem;
  font-size: 0.75rem;
  color: var(--color-text-tertiary);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 1px solid var(--color-border);
`;

export const TableBody = styled.div`
  display: flex;
  flex-direction: column;
`;

export const TableRow = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0.85rem 1rem;
  border-bottom: 1px solid var(--color-border);
  gap: 12px;
  transition: background 0.1s ease;
  &:last-child {
    border-bottom: none;
  }
  &:hover {
    background: var(--color-bg-hover);
  }
`;

export const RowContent = styled.div`
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  gap: 1rem;
`;

export const NameCell = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  overflow: hidden;
  min-width: 0; /* 🔥 Fix for flex ellipsis */
`;

export const IconBox = styled.div<{ $color: string; $hasLogo?: boolean }>`
  width: 36px;
  height: 36px;
  border-radius: 10px;
  flex-shrink: 0;
  overflow: hidden;

  background: ${(p) =>
    p.$hasLogo
      ? "transparent"
      : `color-mix(in srgb, ${p.$color || "#6b7280"}, transparent 90%)`};

  border: 1px solid
    ${(p) =>
      p.$hasLogo
        ? "rgba(0, 0, 0, 0.08)"
        : `color-mix(in srgb, ${p.$color || "#6b7280"}, transparent 80%)`};

  color: ${(p) => p.$color || "#6b7280"};
  display: flex;
  align-items: center;
  justify-content: center;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    padding: 0;
  }
`;

export const NameText = styled.span`
  font-weight: 500;
  color: var(--color-text-main);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 0.95rem;
`;

export const ProgressBar = styled.div`
  width: 100%;
  height: 6px;
  background: var(--color-bg-main);
  border: 1px solid var(--color-border);
  border-radius: 4px;
  overflow: hidden;
  .fill {
    height: 100%;
    border-radius: 4px;
    transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  }
`;

export const AmountCell = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
  
  .amount {
    font-weight: 600;
    color: var(--color-text-main);
    font-feature-settings: "tnum";
    font-size: 0.95rem;
  }
  
  .percent {
    font-size: 0.75rem;
    color: var(--color-text-secondary);
    font-weight: 500;
  }
`;
