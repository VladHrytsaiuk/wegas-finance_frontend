import styled from "styled-components";

export const WidgetCard = styled.div`
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 1.25rem 0 0 0;
  display: flex;
  flex-direction: column;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
  height: 100%;
  min-height: 0;
  overflow: hidden;
`;

export const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 1.25rem;
  margin-bottom: 6px;
`;

export const TitleGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

export const Title = styled.h3`
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--color-text-main);
  margin: 0;
`;

export const ViewAllLink = styled.button`
  background: transparent;
  border: none;
  color: var(--color-brand-600);
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: color 0.2s;

  &:hover {
    color: var(--color-brand-700);
  }
`;

export const TableList = styled.div`
  display: flex;
  flex-direction: column;

  /* 🔥 Головний фікс: змушуємо контейнер зайняти весь вільний простір до низу картки */
  flex: 1;
  overflow-y: hidden;
  /* padding-bottom removed */

  /* Стилізація дочірніх елементів (TransactionItem) */
  & > div {
    height: 58px;
    padding-left: 1.25rem;
    padding-right: 1.25rem;
    flex-shrink: 0; /* 🔥 Забороняємо транзакціям сплющуватись, якщо їх буде багато */
  }

  & > div:last-child {
    border-bottom: none;
  }

  /* 🔥 Додаємо акуратний скролбар (такий самий як в Accounts) */
  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background: var(--color-text-tertiary);
    border-radius: 10px;
  }
`;
