import styled from "styled-components";

export const Card = styled.div`
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 1.25rem 0.2rem 0.5rem 1.25rem;
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
`;

export const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-right: 0.75rem;
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
  padding: 4px 8px;
  border-radius: 6px;
  transition: all 0.2s;

  &:hover {
    background: var(--color-brand-50);
  }
`;

export const ScrollArea = styled.div`
  flex: 1;
  overflow-y: auto;
  padding-right: 0.5rem;

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

export const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;
export const IconBox = styled.div<{ $color: string; $hasImage?: boolean }>`
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  overflow: hidden;

  /* Фон: тільки якщо це НЕ логотип банку */
  background: ${(p) => (p.$hasImage ? "transparent" : `${p.$color}15`)};

  /* Обводка: для логотипів — легка рамка, для іконок — ні */
  border: 1px solid
    ${(p) => (p.$hasImage ? "var(--color-border-light)" : "transparent")};

  color: ${(p) => p.$color};

  svg {
    width: 20px;
    height: 20px;
  }
`;

export const Item = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 6px 10px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: var(--color-bg-hover);
    transform: translateX(4px); /* Твій фірмовий ховер */
  }
`;

export const Info = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
`;

export const Name = styled.span`
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--color-text-main);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const TypeText = styled.span`
  font-size: 0.75rem;
  color: var(--color-text-secondary);
`;

export const Amount = styled.span<{ $amount: number }>`
  font-size: 1rem;
  font-weight: 700;
  color: ${(p) =>
    p.$amount < 0 ? "var(--color-red-600)" : "var(--color-text-main)"};
  white-space: nowrap;
`;
