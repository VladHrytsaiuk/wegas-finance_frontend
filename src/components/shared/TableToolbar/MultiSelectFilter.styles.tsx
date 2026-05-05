import styled, { css } from "styled-components";

export const TreeContainer = styled.div`
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 0.5rem 0;
  overscroll-behavior: contain;

  /* Custom Scrollbar */
  scrollbar-width: thin;
  scrollbar-color: rgba(0, 0, 0, 0.2) transparent;
  &::-webkit-scrollbar {
    width: 8px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.2);
    border-radius: 4px;
    border: 2px solid transparent;
    background-clip: padding-box;
  }
  &::-webkit-scrollbar-thumb:hover {
    background-color: rgba(0, 0, 0, 0.4);
  }

  /* Reset default outlines for children */
  & > div {
    padding: 0;
    border: none;
  }
`;

export const SearchContainer = styled.div`
  padding: 0.5rem;
  border-bottom: 1px solid var(--color-border);
  background: var(--color-bg-surface);
  flex-shrink: 0;
`;
// src/components/shared/TableToolbar/MultiSelectFilter.styles.ts

export const ItemIconBox = styled.div<{ $color: string; $hasImage?: boolean }>`
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  position: relative;
  overflow: hidden;

  /* Фон: для іконок — прозорий кольоровий, для лого — прозорий */
  background: ${(p) => {
    if (p.$hasImage) return "transparent";
    let c = p.$color || "#f3f4f6";
    if (c.startsWith("#") && c.length === 4) {
      c = `#${c[1]}${c[1]}${c[2]}${c[2]}${c[3]}${c[3]}`;
    }
    return c.startsWith("#") ? `${c}25` : "#f3f4f6";
  }};

  color: ${(p) => p.$color || "var(--color-text-secondary)"};

  /* Обводка: Завжди є, але для картинок вона ледь помітна */
  border: 1px solid
    ${(p) => {
      let c = p.$color || "#d1d5db";
      if (c.startsWith("#") && c.length === 4) {
        c = `#${c[1]}${c[1]}${c[2]}${c[2]}${c[3]}${c[3]}`;
      }
      // Якщо є картинка — робимо обводку дуже тонкою і нейтральною
      if (p.$hasImage) return "var(--color-border)";
      return c.startsWith("#") ? `${c}40` : "var(--color-border)";
    }};

  font-weight: 700;
  font-size: 1rem;
`;

// 🔥 ДОДАНО: Стиль для картинки всередині боксу
export const LogoImg = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover; /* Логотип заповнить увесь бокс без падінгів */
  display: block;
`;

export const ItemLabel = styled.span`
  font-weight: 500;
  font-size: 0.9rem;
`;

export const ItemInitials = styled.span`
  font-weight: 700;
  font-size: 0.9rem;
`;

export const FooterRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 8px;
  border-top: 1px solid var(--color-border);
  background: var(--color-bg-surface);
  flex-shrink: 0;
`;

export const FooterBtn = styled.button<{ $variant: "primary" | "secondary" }>`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  height: 36px;

  ${(p) =>
    p.$variant === "primary"
      ? css`
          background: var(--color-brand-600);
          color: white;
          &:hover,
          &:focus {
            background: var(--color-brand-700);
            outline: 2px solid var(--color-brand-200);
          }
        `
      : css`
          background: var(--color-bg-hover);
          color: var(--color-text-main);
          &:hover,
          &:focus {
            background: #e5e7eb;
            color: #ef4444;
            outline: 2px solid var(--color-red-100);
          }
        `}
`;

export const EmptyState = styled.p`
  text-align: center;
  color: var(--color-text-light);
  font-size: 0.85rem;
  padding: 1rem;
`;
