import styled, { css } from "styled-components";

export const StyledItem = styled.div<{
  $isWidget: boolean;
  $hideAccount: boolean;
}>`
  display: grid;
  align-items: center;
  padding: 0.8rem 1.25rem;
  border-bottom: 1px solid var(--color-border);
  cursor: pointer;
  background: var(--color-bg-surface);
  transition: background 0.2s;
  gap: 0.75rem;

  /* Десктоп */
  grid-template-columns: ${(props) =>
    props.$isWidget
      ? "1fr auto"
      : props.$hideAccount
        ? "1.5fr 1.5fr 140px" /* Назва, Нотатка, Сума */
        : "1.2fr 1fr 1fr 140px"};

  @media (max-width: 1280px) {
    ${(props) =>
      !props.$isWidget &&
      css`
        /* В модалці тримаємо 3 колонки */
        grid-template-columns: ${props.$hideAccount
          ? "1fr 1fr 120px"
          : "1.2fr 1fr 120px"};

        /* 🔥 Ховаємо нотатку ТІЛЬКИ якщо це не модалка */
        .note-col {
          display: ${props.$hideAccount ? "block" : "none"};
        }
      `}
  }

  @media (max-width: 768px) {
    ${(props) =>
      !props.$isWidget &&
      css`
        /* Навіть на телефоні в модалці тримаємо 3 колонки */
        grid-template-columns: ${props.$hideAccount
          ? "1.2fr 1fr 100px"
          : "1fr 100px"};

        .acc-col {
          display: none;
        }

        /* 🔥 Ховаємо нотатку ТІЛЬКИ якщо це не модалка */
        .note-col {
          display: ${props.$hideAccount ? "block" : "none"};
        }
      `}
  }

  &:hover {
    background: var(--color-brand-50);
  }

  &:last-child {
    border-bottom: none;
    ${(props) =>
      props.$isWidget &&
      css`
        border-bottom-left-radius: 14px;
        border-bottom-right-radius: 14px;
      `}
  }
`;

export const MainSection = styled.div`
  display: flex;
  align-items: center;
  gap: 0.8rem;
  min-width: 0;
`;

export const IconBox = styled.div<{
  $color: string;
  $hasLogo?: boolean;
  $size: number;
}>`
  width: ${(p) => p.$size}px;
  height: ${(p) => p.$size}px;
  border-radius: 12px;
  flex-shrink: 0;
  overflow: hidden;

  @media (max-width: 1300px) {
    width: 32px;
    height: 32px;
    border-radius: 10px;

    & svg {
      width: 16px !important;
      height: 16px !important;
    }

    & span {
      font-size: 16px !important;
    }
  }

  background: ${(p) =>
    p.$hasLogo
      ? "transparent"
      : `color-mix(in srgb, ${p.$color || "#6b7280"}, transparent 90%)`};

  border: 1px solid
    ${(p) =>
      p.$hasLogo
        ? "rgba(0, 0, 0, 0.08)"
        : `color-mix(in srgb, ${p.$color || "#6b7280"}, transparent 80%)`};

  color: ${(p) => p.$color || "#6b7280"};
  display: flex;
  align-items: center;
  justify-content: center;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    padding: 0;
  }
`;

export const TextStack = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0;
`;

export const Title = styled.div`
  font-weight: 600;
  font-size: 0.9rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--color-text-main);
`;

export const Subtitle = styled.div`
  font-size: 0.75rem;
  color: var(--color-text-secondary);
  display: flex;
  align-items: center;

  .dot {
    margin: 0 4px;
    opacity: 0.4;
  }
`;

export const Time = styled.span`
  font-variant-numeric: tabular-nums;
  font-weight: 700;
  color: var(--color-brand-600);
`;

export const TableCol = styled.div<{ $isDeleted?: boolean }>`
  font-size: 0.85rem;
  color: var(--color-text-main);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  ${(p) =>
    p.$isDeleted &&
    css`
      text-decoration: line-through !important;
      color: var(--color-text-tertiary) !important;
      font-style: italic;
      opacity: 0.7;
    `}
`;

export const Note = styled.div`
  font-size: 0.8rem;
  color: var(--color-text-secondary);
  opacity: 0.7;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const Amount = styled.div<{ $color: string; $isForgiveness?: boolean }>`
  font-weight: 700;
  font-size: 0.95rem;
  font-family: "JetBrains Mono", monospace;
  color: ${(p) => p.$color};
  text-align: right;
  white-space: nowrap;

  ${(p) =>
    p.$isForgiveness &&
    css`
      text-decoration: line-through;
      opacity: 0.6;
    `}
`;
