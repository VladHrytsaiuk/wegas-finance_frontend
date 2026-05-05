import styled from "styled-components";

export const MenuContainer = styled.div`
  position: relative;
  z-index: 10;
`;

export const MenuButton = styled.button<{ $active: boolean }>`
  background: ${(p) => (p.$active ? "var(--color-bg-hover)" : "transparent")};
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  color: var(--color-text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  transition: all 0.2s;

  &:hover {
    background-color: var(--color-bg-hover, #f3f4f6);
    color: var(--color-text-main);
  }
`;

export const Dropdown = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 4px;
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  width: 160px;
  overflow: hidden;
  padding: 4px;
  animation: fadeIn 0.1s ease-out;

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

export const MenuItem = styled.div<{ $active: boolean }>`
  padding: 10px 12px;
  font-size: 0.9rem;
  color: ${(p) =>
    p.$active ? "var(--color-brand-600)" : "var(--color-text-main)"};
  background: ${(p) =>
    p.$active ? "var(--color-brand-50, #eff6ff)" : "transparent"};
  cursor: pointer;
  border-radius: 8px;
  transition: background 0.1s;

  &:hover {
    background: ${(p) =>
      p.$active ? "var(--color-brand-100)" : "var(--color-bg-hover, #f9fafb)"};
  }
`;
