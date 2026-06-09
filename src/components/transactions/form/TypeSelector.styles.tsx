import styled from "styled-components";

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

export const MainTabs = styled.div`
  display: flex;
  background: var(--color-bg-surface-secondary, #f3f4f6);
  padding: 3px;
  border-radius: 10px;
  border: 1px solid var(--color-border);
`;

export const Tab = styled.button<{ $isActive: boolean; $activeColor: string }>`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 4px;
  border-radius: 7px;
  font-weight: 600;
  font-size: 0.8rem;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

  @media (max-width: 1300px) {
    font-size: 0.7rem;
  }
  border: none;
  cursor: pointer;
  white-space: nowrap;

  background: ${(props) => (props.$isActive ? "white" : "transparent")};
  color: ${(props) =>
    props.$isActive ? props.$activeColor : "var(--color-text-secondary)"};
  box-shadow: ${(props) =>
    props.$isActive ? "0 1px 3px rgba(0,0,0,0.1)" : "none"};

  &:hover {
    color: ${(props) => props.$activeColor};
  }

  &:focus-visible {
    outline: 2px solid var(--color-brand-500);
    outline-offset: -2px;
  }

  & svg {
    width: 1rem;
    height: 1rem;
    opacity: ${(props) => (props.$isActive ? 1 : 0.7)};
  }
`;

export const SubOptionsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
  animation: slideDown 0.2s ease-out;

  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-5px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

export const SubButton = styled.button<{ $isActive: boolean; $color: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 6px;
  border-radius: 8px;
  border: 1px solid ${(p) => (p.$isActive ? p.$color : "var(--color-border)")};
  background-color: ${(p) => (p.$isActive ? `${p.$color}10` : "white")};
  color: ${(p) => (p.$isActive ? p.$color : "var(--color-text-secondary)")};
  font-size: 0.75rem;
  font-weight: 500;

  @media (max-width: 1300px) {
    font-size: 0.7rem;
  }
  cursor: pointer;
  transition: all 0.15s;

  &:hover {
    border-color: ${(p) => p.$color};
    color: ${(p) => p.$color};
  }

  &:focus-visible {
    outline: 2px solid ${(p) => p.$color};
  }

  & svg {
    width: 0.9rem;
    height: 0.9rem;
  }
`;
