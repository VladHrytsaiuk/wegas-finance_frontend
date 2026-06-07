import styled, { css } from "styled-components";
import { Link } from "react-router-dom";

// --- TABLE WRAPPER ---

export const TableWrapper = styled.div`
  width: 100%;
  overflow-x: auto;
  overflow-y: visible;
  display: block;

  table {
  border-collapse: collapse;
  width: 100%;
  min-width: unset;
  }

  /* ICON */
  .col-icon {
  width: 60px;
  @media (max-width: 1300px) {
    width: 50px;
  }
  }

  /* NOTE (Примітки) */
  .col-note {

    /* Змінено з 1400px на 1300px за твоїм бажанням */
    @media (max-width: 1300px) {
      display: none;
    }
  }

  /* ACCOUNT */
  .col-account {
    @media (max-width: 1200px) {
      max-width: 120px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    /* Ховаємо окрему колонку на мобільних */
    @media (max-width: 768px) {
      display: none;
    }
  }

  /* ACTIONS */
  .col-actions {
    width: 60px;

    @media (max-width: 768px) {
      width: 40px; /* Менша ширина на мобільних */
    }
  }
`;

// --- HEADER ---
export const DateHeaderRow = styled.tr`
  background-color: var(--color-bg-page);
  pointer-events: none;
`;

export const DateHeaderCell = styled.td`
  padding: 0.7rem 0.8rem;
  font-weight: 700;
  font-size: 0.7rem;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1px solid var(--color-border);

  @media (max-width: 1300px) {
    padding: 0.5rem 0.7rem;
    font-size: 0.6rem;
  }

  @media (max-width: 768px) {
    padding: 0.6rem;
  }
`;

// --- TEXT STACK ---
export const TextStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;

  strong {
    font-weight: 600;
    font-size: 0.9rem;
    color: var(--color-text-main);

    @media (max-width: 1300px) {
      font-size: 0.8rem;
    }

    @media (max-width: 768px) {
      font-size: 0.85rem;
      line-height: 1.2;
    }
  }

  span {
    font-size: 0.75rem;
    color: var(--color-text-secondary);

    @media (max-width: 1300px) {
      font-size: 0.65rem;
    }

    @media (max-width: 768px) {
      font-size: 0.7rem;
    }
  }
`;

/* З'являється під категорією тільки на телефонах, коли колонка Account прихована */
export const MobileAccountBadge = styled.span`
  display: none;

  @media (max-width: 768px) {
    display: inline-flex;
    align-items: center;
    background-color: var(--color-bg-surface);
    border: 1px solid var(--color-border);
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 0.65rem;
    font-weight: 500;
    margin-top: 4px;
    width: fit-content;
  }
`;

export const NoteText = styled.div`
  font-size: 0.8rem;
  color: var(--color-text-secondary);
  max-width: 260px; /* Ширина для великих моніторів */
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  @media (max-width: 1300px) {
    font-size: 0.7rem;
  }

  /* На екранах ноутбуків (до 1500px) суттєво зменшуємо ширину примітки */
  @media (max-width: 1500px) {
    max-width: 120px;
  }
`;

export const ReceiptBadge = styled.div`
  color: var(--color-brand-600);
  background-color: var(--color-brand-50);
  padding: 4px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

export const Amount = styled.div<{ $color: string; $isForgiveness?: boolean }>`
  font-family: "JetBrains Mono", monospace;
  font-weight: 700;
  font-size: 0.95rem;
  text-align: right;
  color: ${(props) => props.$color};
  white-space: nowrap;

  @media (max-width: 1300px) {
    font-size: 0.8rem;
  }

  @media (max-width: 768px) {
    font-size: 0.9rem;
  }

  ${(p) =>
    p.$isForgiveness &&
    css`
      text-decoration: line-through;
      opacity: 0.6;
    `}
`;

export const AccountName = styled.span<{ $isDeleted?: boolean }>`
  font-weight: 600;
  color: var(--color-text-main);
  font-size: 0.85rem;

  @media (max-width: 1300px) {
    font-size: 0.75rem;
  }

  ${(p) =>
    p.$isDeleted &&
    css`
      text-decoration: line-through;
      color: var(--color-text-tertiary);
      font-style: italic;
      opacity: 0.7;
    `}
`;

// --- ACTIONS ---
export const DesktopActions = styled.div`
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
  align-items: center;

  @media (max-width: 1400px) {
    display: none;
  }
`;

export const MobileActions = styled.div`
  display: none;
  position: relative;

  @media (max-width: 1400px) {
    display: flex;
    justify-content: flex-end;
  }
`;

export const ActionBtn = styled.button<{ $variant?: "edit" | "delete" }>`
  background: transparent;
  border: none;
  padding: 8px;
  border-radius: 6px;
  cursor: pointer;
  color: var(--color-text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;

  &:hover {
    ${(props) =>
      props.$variant === "edit"
        ? css`
            background: var(--color-brand-100);
            color: var(--color-brand-600);
          `
        : css`
            background: var(--color-red-50);
            color: var(--color-red-700);
          `}
  }
`;

export const ActionLink = styled(Link)`
  background: transparent;
  border: none;
  padding: 8px;
  border-radius: 6px;
  cursor: pointer;
  color: var(--color-text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;

  &:hover {
    background: var(--color-brand-100);
    color: var(--color-brand-600);
  }
`;

export const MenuToggle = styled.button`
  background: transparent;
  border: none;
  padding: 6px;
  border-radius: 6px;
  cursor: pointer;
`;

export const MenuDropdown = styled.div`
  position: absolute;
  right: 0;
  top: 100%;
  z-index: 9999;
  background: var(--color-bg-page);
  border: 1px solid var(--color-border);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border-radius: 8px;
  padding: 4px;
  display: flex;
  flex-direction: column;
  min-width: 140px;
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
`;

export const MenuItemLink = styled(Link)`
  width: 100%;
  text-align: left;
  padding: 10px 12px;
  border-radius: 6px;
  display: flex;
  gap: 12px;
  text-decoration: none;
  color: var(--color-text-secondary);

  &:hover {
    background: var(--color-brand-50);
    color: var(--color-brand-600);
  }
`;
