import styled from "styled-components";

export const PageContainer = styled.div`
  padding: 0 2rem 2rem 2rem;
  width: 100%;
  max-width: none;
  margin: 0 auto;
`;

export const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2.5rem;
`;

export const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: none;
  border: none;
  font-size: 1rem;
  color: var(--color-grey-600);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  margin-bottom: 1.5rem;

  &:hover {
    color: var(--color-brand-600);
    transform: translateX(-4px);
  }

  svg {
    width: 1.2rem;
    height: 1.2rem;
  }
`;

export const ActionsColumn = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 12px;
`;

export const ActionRow = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
`;

export const IconButton = styled.button`
  background: none;
  border: 1px solid var(--color-grey-200);
  border-radius: 8px;
  padding: 8px;
  color: var(--color-grey-600);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background: var(--color-grey-50);
    color: var(--color-brand-600);
    border-color: var(--color-brand-200);
  }

  &.danger:hover:not(:disabled) {
    background: var(--color-red-50);
    color: var(--color-red-600);
    border-color: var(--color-red-200);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.4;
    filter: grayscale(1);
    border-color: var(--color-grey-100);
  }

  svg {
    width: 1.2rem;
    height: 1.2rem;
  }
`;

export const TitleBlock = styled.div`
  h1 {
    font-size: 2.2rem;
    font-weight: 800;
    color: var(--color-grey-800);
    margin-bottom: 4px;
  }
`;

export const SubTitle = styled.div`
  color: var(--color-grey-500);
  font-size: 1rem;
  display: flex;
  flex-direction: column;
  gap: 2px;

  .account {
    font-family: "JetBrains Mono", monospace;
    font-size: 0.85rem;
    color: var(--color-brand-600);
    font-weight: 600;
  }
`;

export const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  margin-bottom: 2.5rem;
`;

export const StatCard = styled.div`
  background: var(--color-grey-0);
  border: 1px solid var(--color-grey-100);
  padding: 1.5rem;
  border-radius: 16px;
  box-shadow: var(--shadow-sm);

  h3 {
    font-size: 0.85rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: var(--color-grey-400);
    margin-bottom: 8px;
  }
`;

export const StatValue = styled.div<{ $isDebt?: boolean }>`
  font-size: 1.8rem;
  font-weight: 800;
  color: ${(p) =>
    p.$isDebt ? "var(--color-red-600)" : "var(--color-grey-700)"};

  &.green {
    color: var(--color-green-600);
  }
`;

export const StatSub = styled.div`
  font-size: 0.85rem;
  color: var(--color-grey-400);
  margin-top: 4px;
`;

export const TableWrapper = styled.div`
  background: var(--color-grey-0);
  border-radius: 16px;
  border: 1px solid var(--color-grey-100);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
`;

// Заміна inline style={{ width: "50px" }}
export const ActionHeader = styled.th`
  width: 50px;
`;

export const DateCell = styled.div`
  color: var(--color-grey-600);
  font-weight: 500;
`;

export const ValueCell = styled.div`
  strong {
    font-size: 1rem;
    color: var(--color-grey-700);
  }
  span {
    color: var(--color-grey-400);
    margin-left: 2px;
  }
`;

// Заміна inline style для Diff
export const DiffValue = styled.span<{ $positive: boolean }>`
  font-weight: 500;
  color: ${(p) => (p.$positive ? "var(--color-brand-600)" : "inherit")};
`;

export const CostCell = styled.div`
  font-weight: 700;
  color: var(--color-grey-700);
`;

export const StatusBadge = styled.div<{ $paid: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 100px;
  font-size: 0.8rem;
  font-weight: 600;
  background: ${(p) =>
    p.$paid ? "var(--color-green-100)" : "var(--color-red-100)"};
  color: ${(p) =>
    p.$paid ? "var(--color-green-700)" : "var(--color-red-700)"};
`;

// Контейнер для кнопок дій у рядку (заміна div style={{ display: flex... }})
export const ActionGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const TransactionLink = styled.button`
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  font: inherit;
  color: inherit;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
    opacity: 0.8;
  }
`;

// Додаткове посилання на транзакцію нарахування (сіре, з розділювачем)
export const SecondaryTransactionLink = styled(TransactionLink)`
  border-left: 1px solid currentColor;
  padding-left: 8px;
  opacity: 0.7;
`;

export const PayButton = styled.button`
  border: none;
  background: none;
  cursor: pointer;
  color: inherit;
  font-weight: 700;
  text-decoration: underline;
  display: flex;
  align-items: center;
  gap: 4px;
  &:hover {
    color: var(--color-red-800);
  }
`;

export const ActionButton = styled.button`
  border: none;
  background: none;
  color: var(--color-grey-400);
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background: var(--color-red-50);
    color: var(--color-red-600);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.4;
  }
`;

export const DeleteWarningContainer = styled.div`
  text-align: center;
  padding: 2rem;
  max-width: 400px;
  h3 {
    margin-bottom: 0.5rem;
    font-size: 1.25rem;
    font-weight: 600;
  }
  p {
    color: var(--color-grey-500);
    line-height: 1.5;
  }
`;

export const WarningIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 1rem;
`;
