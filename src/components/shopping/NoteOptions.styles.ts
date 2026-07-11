import styled from "styled-components";

export const Container = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

export const IconButton = styled.button<{ $isActive?: boolean }>`
  background: none;
  border: none;
  color: var(--note-text-secondary, var(--color-text-secondary));
  padding: 6px;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;

  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
    color: var(--note-text-main, var(--color-text-main));
  }
  ${(props) =>
    props.$isActive &&
    `color: var(--color-brand-600); background-color: var(--color-brand-50);`}
`;

export const DropdownMenu = styled.div`
  background-color: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-lg);
  border-radius: 12px;
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 100%; /* Займає всю ширину, яку дав портал */
  box-sizing: border-box; /* 🔥 Критично для правильної ширини */
`;

export const UserScrollList = styled.div`
  max-height: 120px;
  overflow-y: auto;
  margin-top: 4px;
  padding-right: 4px;
  border-left: 2px solid var(--color-border);
  margin-left: 8px;

  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background-color: var(--color-border);
    border-radius: 4px;
  }
`;

export const ColorGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  padding: 4px;
`;

export const ColorCircle = styled.div<{ $color: string; $selected: boolean }>`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background-color: ${(props) => props.$color};
  border: 2px solid
    ${(props) =>
      props.$selected ? "var(--color-text-secondary)" : "var(--color-border)"};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.1s;

  &:hover {
    transform: scale(1.1);
  }
`;

export const MenuItem = styled.div<{
  $selected?: boolean;
  $isHeader?: boolean;
}>`
  padding: 8px 12px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.9rem;
  cursor: pointer;
  border-radius: 8px;
  color: var(--color-text-main);
  font-weight: ${(props) => (props.$isHeader ? "600" : "400")};
  background-color: ${(props) =>
    props.$selected ? "var(--color-bg-hover)" : "transparent"};
  flex-shrink: 0;

  &:hover {
    background-color: var(--color-bg-hover);
  }
`;

export const Divider = styled.div`
  height: 1px;
  background-color: var(--color-border);
  margin: 4px 0;
  flex-shrink: 0;
`;

export const CheckIconWrapper = styled.div<{ $isHidden: boolean }>`
  width: 18px;
  height: 18px;
  border: ${(props) =>
    props.$isHidden ? "none" : "2px solid var(--color-text-tertiary)"};
  background-color: ${(props) =>
    props.$isHidden ? "var(--color-brand-600)" : "transparent"};
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
`;
