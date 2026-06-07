import styled from "styled-components";

export const GroupHeaderRow = styled.tr`
  background-color: var(--color-bg-secondary);
`;

export const GroupHeaderCell = styled.td`
  padding: 0.6rem 1.2rem;
  font-weight: 700;
  color: var(--color-text-secondary);
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1px solid var(--color-border);

  @media (max-width: 1300px) {
    font-size: 0.6rem;
  }
`;

export const BankIndicator = styled.div<{ $color: string }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: ${(p) => p.$color};
  box-shadow:
    0 0 0 2px var(--color-bg-surface),
    0 0 0 3px ${(p) => p.$color};
`;

export const IconWrapper = styled.div<{ $bg: string; $color: string }>`
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: ${(p) => p.$bg};
  color: ${(p) => p.$color};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  overflow: hidden;
  position: relative;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  font-weight: 700;
`;

export const LogoImg = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
`;

export const ActionsRow = styled.div`
  display: flex;
  justify-content: flex-end;
  /* Більше немає opacity: 0; тепер завжди видно */
`;

export const ActionBtn = styled.button<{ $variant: "edit" | "delete" }>`
  background: none;
  border: none;
  cursor: pointer;
  padding: 6px;
  border-radius: 6px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-secondary);

  &:hover {
    background-color: ${(p) =>
      p.$variant === "delete" ? "#fee2e2" : "var(--color-bg-hover)"};
    color: ${(p) =>
      p.$variant === "delete" ? "#ef4444" : "var(--color-brand-600)"};
  }
`;

/* 🔥 СТИЛІ ДЛЯ АДАПТИВНИХ ДІЙ */
export const DesktopActions = styled.div`
  display: flex;
  gap: 0.5rem;

  @media (max-width: 1280px) {
    display: none; /* Ховаємо на планшетах і менше */
  }
`;

export const MobileActions = styled.div`
  display: none;
  position: relative; /* Важливо для позиціонування дропдауну */

  @media (max-width: 1280px) {
    display: block; /* Показуємо три крапки */
  }
`;

export const DropdownMenu = styled.div`
  position: absolute;
  right: 0;
  top: calc(100% + 4px);
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-md);
  border-radius: 8px;
  padding: 6px;
  z-index: 50;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 140px;
`;

export const DropdownItem = styled.button<{ $isDanger?: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border: none;
  background: transparent;
  width: 100%;
  text-align: left;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.75rem;
  font-weight: 500;
  text-decoration: none;
  color: ${(p) =>
    p.$isDanger ? "var(--color-red-600)" : "var(--color-text-main)"};
  transition: background-color 0.2s;

  &:hover {
    background-color: ${(p) =>
      p.$isDanger ? "#fee2e2" : "var(--color-bg-hover)"};
  }
`;
