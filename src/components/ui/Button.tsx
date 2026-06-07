import React, { forwardRef } from "react";
import styled, { css } from "styled-components";

// 1. Описуємо варіанти стилів (кольори)
const variations = {
  primary: css`
    background-color: var(--color-brand-600);
    color: white;

    &:hover:not(:disabled) {
      background-color: var(--color-brand-700);
    }
  `,
  secondary: css`
    background-color: var(--color-bg-surface);
    color: var(--color-text-main);
    border: 1px solid var(--color-border);

    &:hover:not(:disabled) {
      background-color: var(--color-bg-page);
      border-color: var(--color-text-secondary);
    }
  `,
  danger: css`
    background-color: var(--color-red-700);
    color: white;

    &:hover:not(:disabled) {
      background-color: #991b1b;
    }
  `,
};

// 2. Описуємо варіанти розмірів
const sizes = {
  small: css`
    font-size: 0.7rem;
    padding: 0 0.8rem;
    height: 30px;
    font-weight: 600;

    & svg {
      width: 13px !important;
      height: 13px !important;
    }
  `,

  medium: css`
    font-size: 0.95rem;
    padding: 0 1rem;
    height: 38px;
    font-weight: 600;

    @media (max-width: 1300px) {
      padding: 0 0.75rem;
      font-size: 0.7rem;
      height: 30px;
    }
  `,
  large: css`
    font-size: 1.1rem;
    padding: 1rem 1.6rem;
    font-weight: 600;
  `,
};

// 3. Інтерфейс для стилів (тільки те, що впливає на CSS)
interface StyleProps {
  $variation?: keyof typeof variations;
  $size?: keyof typeof sizes;
  $active?: boolean;
}

// 4. Основний стилізований елемент (Internal)
const StyledButton = styled.button<StyleProps>`
  display: inline-flex;
  justify-content: center;
  align-items: center;
  gap: 0.6rem; /* Відступ між іконкою і текстом */

  @media (max-width: 1300px) {
    gap: 0.2rem;
  }

  border: none;
  border-radius: 8px; /* Трохи округліше */
  cursor: pointer;
  letter-spacing: 0.01em;

  box-shadow: var(--shadow-sm);
  transition: all 0.2s ease-in-out;

  /* Вставляємо стилі залежно від пропсів */
  ${(props) => sizes[props.$size || "medium"]}
  ${(props) => variations[props.$variation || "primary"]}

  /* Ефекти натискання та ховеру */
  &:hover:not(:disabled) {
    box-shadow: var(--shadow-md);
    transform: translateY(-1px);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    background-color: var(--color-text-light); // Або var(--color-bg-hover)
    color: #9ca3af;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
    border-color: transparent;
  }

  /* Стиль для іконки всередині кнопки */
  & svg {
    width: 1.2em;
    height: 1.2em;
    flex-shrink: 0; /* Щоб іконку не сплющувало */

    @media (max-width: 1300px) {
      width: 17px;
      height: 17px;
    }
  }

  /* Контейнер для іконки */
  & > span {
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

// 5. Інтерфейс компонента (розширює стандартні атрибути кнопки)
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variation?: keyof typeof variations;
  size?: keyof typeof sizes;
  active?: boolean;
  icon?: React.ReactNode; // ✅ ДОДАНО: іконка
}

// 6. Експортований React-компонент
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      icon,
      variation = "primary",
      size = "medium",
      active,
      type = "button",
      ...props
    },
    ref
  ) => {
    return (
      <StyledButton
        $variation={variation}
        $size={size}
        $active={active}
        type={type}
        ref={ref}
        {...props}
      >
        {/* Якщо іконка передана — рендеримо її */}
        {icon && <span>{icon}</span>}
        {children}
      </StyledButton>
    );
  }
);

Button.displayName = "Button";
