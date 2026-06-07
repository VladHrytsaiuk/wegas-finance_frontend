import styled from "styled-components";

export const TableWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

export const TableHead = styled.div`
  display: grid;
  grid-template-columns: 2fr 2fr 1fr;
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
  grid-template-columns: 2fr 2fr 1fr;
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
  min-width: 0; /* 🔥 Fix for flex ellipsis */
`;

export const IconBox = styled.div<{ $bg: string }>`
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: ${(p) => `${p.$bg}15`};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: contain; /* 🔥 Change from cover to contain for logos */
    padding: 4px; /* Give logos some breathing room */
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
  gap: 8px;
  align-items: flex-start;
  padding-right: 2rem;
  
  .value {
    font-size: 0.85rem;
    font-weight: 700;
    color: var(--color-text-main);
  }
`;

export const ProgressBar = styled.div`
  width: 100%;
  max-width: 180px;
  height: 8px;
  background: var(--color-bg-page);
  border-radius: 4px;
  overflow: hidden;
  .fill {
    height: 100%;
    border-radius: 4px;
    transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  }
`;

export const AmountCell = styled.div`
  text-align: right;
  font-weight: 600;
  color: var(--color-text-main);
  font-feature-settings: "tnum";
  font-size: 0.95rem;
`;
