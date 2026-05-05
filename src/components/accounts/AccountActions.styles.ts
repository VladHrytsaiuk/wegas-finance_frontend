import styled from "styled-components";

export const ActionButtons = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

export const ActionBtn = styled.button<{
  $variant: "income" | "expense" | "transfer";
}>`
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-sm);
  color: var(--color-text-main);

  padding: 0.8rem 1rem;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 0.8rem;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 600;
  font-size: 0.9rem;
  width: 100%;

  &:hover {
    background: ${(props) =>
      props.$variant === "income"
        ? "var(--color-brand-50)"
        : props.$variant === "expense"
        ? "var(--color-red-100)"
        : "var(--color-blue-50)"};

    border-color: ${(props) =>
      props.$variant === "income"
        ? "var(--color-brand-500)"
        : props.$variant === "expense"
        ? "var(--color-red-700)"
        : "var(--color-blue-500)"};

    transform: translateX(4px);
  }
`;

export const ImportBtn = styled(ActionBtn)`
  &:hover {
    background: var(--color-purple-50, #f5f3ff);
    border-color: var(--color-purple-500, #8b5cf6);
  }
`;
