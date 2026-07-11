import styled, { css } from "styled-components";

export const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  width: 100%;

  @media (max-width: 768px) {
    padding: 16px 16px 0 16px;
  }
`;

export const ActionsBar = styled.div`
  display: flex;
  justify-content: flex-end;
`;

// --- Table Cells ---
export const AssetName = styled.div`
  font-weight: 500;
  color: var(--color-text-main);
  display: flex;
  align-items: center;
`;

export const AssetType = styled.div`
  font-size: 0.8rem;
  color: var(--color-text-secondary);
`;

export const AssetAvatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--color-brand-100);
  color: var(--color-brand-600);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 14px;
  flex-shrink: 0;
`;

export const InfoWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

export const Badge = styled.span<{ $color: string }>`
  padding: 0.2rem 0.6rem;
  border-radius: 99px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  white-space: nowrap;

  ${(p) => {
    switch (p.$color) {
      case "red":
        return css`
          background-color: var(--color-red-100);
          color: var(--color-red-700);
        `;
      case "green":
        return css`
          background-color: var(--color-brand-100);
          color: var(--color-brand-700);
        `;
      case "blue":
        return css`
          background-color: var(--color-brand-50);
          color: var(--color-brand-600);
        `;
      case "gray":
        return css`
          background-color: var(--color-bg-page);
          color: var(--color-text-secondary);
        `;
      default:
        return css`
          background-color: var(--color-bg-page);
          color: var(--color-text-secondary);
        `;
    }
  }}
`;

// --- ACTIONS (Responsive) ---
export const DesktopActions = styled.div`
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
  align-items: center;

  & > button,
  & > div > button {
    background: none;
    border: none;
    cursor: pointer;
    padding: 0.4rem;
    border-radius: 4px;
    transition: all 0.2s;
    color: var(--color-text-secondary);
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
      background-color: var(--color-bg-page);
      color: var(--color-brand-600);
    }
    &.delete:hover {
      color: var(--color-red-600);
    }
    &:disabled {
      cursor: not-allowed;
      opacity: 0.3;
    }
  }

  /* 🔥 Брейкпоінт змінено на 1280px */
  display: none;
`;

export const MobileActions = styled.div`
  display: none;
  /* position: relative;  <-- Можеш прибрати, більше не потрібно для Portals */

  /* 🔥 Брейкпоінт змінено на 1280px */
  display: flex;
  justify-content: flex-end;
`;

export const MenuToggle = styled.button`
  background: transparent;
  border: none;
  padding: 6px;
  border-radius: 6px;
  cursor: pointer;
  color: var(--color-text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: var(--color-bg-page);
    color: var(--color-text-main);
  }
`;

export const MenuDropdown = styled.div`
  /* 🔥 ВАЖЛИВО: Змінено на fixed */
  position: fixed;
  z-index: 99999;
  background: var(--color-bg-surface, #fff);
  border: 1px solid var(--color-border);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border-radius: 8px;
  padding: 4px;
  display: flex;
  flex-direction: column;
  min-width: 160px;
`;

export const MenuItemButton = styled.button<{ $variant?: "delete" }>`
  width: 100%;
  text-align: left;
  background: none;
  border: none;
  padding: 10px 12px;
  cursor: pointer;
  border-radius: 6px;
  display: flex;
  gap: 12px;
  align-items: center;
  color: ${(p) =>
    p.$variant === "delete"
      ? "var(--color-red-700)"
      : "var(--color-text-secondary)"};

  &:hover {
    background: ${(p) =>
      p.$variant === "delete"
        ? "var(--color-red-50)"
        : "var(--color-brand-50)"};
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.4;
  }
`;

export const EmptyStateContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  text-align: center;
  color: var(--color-text-secondary);
  background: var(--color-bg-surface);
  border: 1px dashed var(--color-border);
  border-radius: 12px;
  margin: 1rem 0;

  h3 {
    margin-top: 1rem;
    margin-bottom: 0.5rem;
    color: var(--color-text-main);
  }

  p {
    font-size: 0.9rem;
    max-width: 400px;
  }
`;

export const EmptyIconWrapper = styled.div`
  font-size: 3rem;
  opacity: 0.3;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-tertiary);
`;
