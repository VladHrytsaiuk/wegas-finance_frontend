import styled, { css } from "styled-components";

export const TriggerContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  line-height: 1.2;
  width: 100%;
  overflow: hidden;
`;

export const AccountName = styled.span`
  font-weight: 600;
  color: var(--color-text-main);
  font-size: 0.9rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
`;

export const AccountBalance = styled.span`
  font-size: 0.8rem;
  color: var(--color-text-secondary);
  font-weight: 500;
  margin-top: 2px;
`;

// Контейнер іконки
export const IconWrapper = styled.div<{ $color: string; $hasImage?: boolean }>`
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  overflow: hidden;
  position: relative;
  transition: transform 0.2s ease;

  background: ${(p) => (p.$hasImage ? "transparent" : `${p.$color}15`)};
  border: 1px solid
    ${(p) => (p.$hasImage ? "var(--color-border)" : "transparent")};

  /* Легкий ефект при наведенні на весь рядок */
  button:hover & {
    transform: scale(1.05);
  }
`;

export const OptionItem = styled.button<{ $isActive: boolean }>`
  width: 100%;
  text-align: left;
  border: none;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0.7rem 1rem;
  cursor: pointer;
  position: relative;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  border-bottom: 1px solid var(--color-border-light, #f1f5f9);

  /* Базовий колір фону залежно від активності */
  background: ${(p) => (p.$isActive ? "var(--color-brand-50)" : "transparent")};

  /* Лінія активності зліва */
  &::before {
    content: "";
    position: absolute;
    left: 0;
    width: 3px;
    height: 0;
    background: var(--color-brand-600);
    transition: height 0.2s ease;
    border-radius: 0 4px 4px 0;
    ${(p) =>
      p.$isActive &&
      css`
        height: 60%;
      `}
  }

  &:hover:not(:disabled) {
    background: var(--color-bg-hover, #f8fafc);
    padding-left: 1.2rem; /* Ефект зміщення вправо */

    &::before {
      height: 40%;
    }
  }

  &:active:not(:disabled) {
    background: var(--color-brand-50);
    transform: scale(0.99);
  }

  &:focus {
    outline: none;
    background: var(--color-bg-hover);
  }

  /* Стилі для заблокованих */
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background: var(--color-bg-page);
    filter: grayscale(0.8);
  }

  &:last-child {
    border-bottom: none;
  }
`;

export const GroupLabel = styled.div`
  padding: 0.6rem 1rem;
  font-size: 0.7rem;
  font-weight: 700;
  color: var(--color-text-tertiary);
  background-color: var(--color-bg-secondary, #f1f5f9);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const EmptyState = styled.div`
  padding: 1.5rem;
  text-align: center;
  color: var(--color-text-secondary);
  font-size: 0.9rem;
`;
