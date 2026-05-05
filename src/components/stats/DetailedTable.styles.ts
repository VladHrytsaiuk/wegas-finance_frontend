import styled from "styled-components";

export const TableWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

export const Empty = styled.div`
  text-align: center;
  color: var(--color-text-secondary);
  padding: 3rem 1rem;
  font-size: 0.95rem;
  background: var(--color-bg-surface);
  border-radius: 12px;
  border: 1px dashed var(--color-border);
`;

export const TableHead = styled.div`
  display: grid;
  grid-template-columns: 2fr 1.5fr 1fr;
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
  display: grid;
  grid-template-columns: 2fr 1.5fr 1fr;
  padding: 0.85rem 1rem;
  border-bottom: 1px solid var(--color-border);
  align-items: center;
  transition: background 0.1s ease;
  &:last-child {
    border-bottom: none;
  }
  &:hover {
    background: var(--color-bg-hover);
  }
`;

export const NameCell = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  overflow: hidden;
`;

export const IconBox = styled.div<{ $bg: string }>`
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: ${(p) => `${p.$bg}10`};
  border: 1px solid ${(p) => `${p.$bg}20`};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 12px;
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

export const PercentCell = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  align-items: flex-end;
  padding-right: 1rem;
  .value {
    font-size: 0.8rem;
    font-weight: 600;
    color: var(--color-text-secondary);
  }
`;

export const ProgressBar = styled.div`
  width: 100%;
  max-width: 120px;
  height: 6px;
  background: var(--color-bg-surface-secondary);
  border-radius: 3px;
  overflow: hidden;
  .fill {
    height: 100%;
    border-radius: 3px;
    transition: width 0.5s ease-out;
  }
`;

export const AmountCell = styled.div`
  text-align: right;
  font-weight: 600;
  color: var(--color-text-main);
  font-feature-settings: "tnum";
  font-size: 0.95rem;
`;
