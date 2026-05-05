import styled from "styled-components";

export const Container = styled.div``;

export const Button = styled.button<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  background: ${(p) =>
    p.$active ? "var(--color-bg-hover)" : "var(--color-bg-surface)"};
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 8px 12px;
  cursor: pointer;
  color: var(--color-text-main);
  font-size: 1.2rem;
  transition: all 0.2s;

  &:hover {
    background: var(--color-bg-hover);
  }
`;

export const ButtonLabel = styled.span`
  font-size: 0.9rem;
  font-weight: 500;
  white-space: nowrap;
`;

export const Dropdown = styled.div`
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: 16px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  animation: fadeIn 0.15s ease-out;

  @keyframes fadeIn {
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

export const SectionTitle = styled.h4`
  margin: 0;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--color-text-secondary);
  font-weight: 600;
`;

export const PeriodGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

export const Chip = styled.button<{ $isActive?: boolean }>`
  background: ${(p) =>
    p.$isActive ? "var(--color-brand-100)" : "var(--color-bg-hover)"};
  color: ${(p) =>
    p.$isActive ? "var(--color-brand-600)" : "var(--color-text-main)"};
  border: 1px solid
    ${(p) => (p.$isActive ? "var(--color-brand-200)" : "transparent")};
  border-radius: 20px;
  padding: 6px 12px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: ${(p) => (p.$isActive ? "500" : "400")};

  &:hover {
    background: var(--color-brand-100);
    color: var(--color-brand-600);
  }
`;

export const Divider = styled.div`
  height: 1px;
  background: var(--color-border);
  margin: 4px 0;
`;

export const AccountList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-height: 200px;
  overflow-y: auto;
  padding-right: 4px;

  /* Стилізація скролбару */
  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background: var(--color-border);
    border-radius: 4px;
  }
`;

export const AccountItem = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
  font-size: 0.9rem;
  color: var(--color-text-main);

  &:hover {
    background: var(--color-bg-hover);
  }
`;

export const Checkbox = styled.div<{ $checked: boolean }>`
  width: 18px;
  height: 18px;
  border-radius: 4px;
  border: 2px solid
    ${(p) => (p.$checked ? "var(--color-brand-600)" : "var(--color-border)")};
  background: ${(p) => (p.$checked ? "var(--color-brand-600)" : "transparent")};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 14px;
  transition: all 0.2s;
`;

export const ApplyButton = styled.button`
  background: var(--color-brand-600);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  margin-top: 8px;
  transition: background 0.2s;

  &:hover {
    background: var(--color-brand-700);
  }
`;
