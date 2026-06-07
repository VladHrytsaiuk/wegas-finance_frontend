import styled, { css } from "styled-components";

// ГОЛОВНЕ: Обмежуємо ширину і ховаємо все, що вилазить
export const TreeWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding-bottom: 0.5rem;
  width: 100%;
  box-sizing: border-box;
  overflow-x: hidden;
`;

export const TreeItemWrapper = styled.div<{ $level: number }>`
  padding-left: ${(p) => p.$level * 24}px;
  width: 100%;
  box-sizing: border-box;

  ${(p) =>
    p.$level > 0 &&
    css`
      position: relative;
      &::before {
        content: "";
        position: absolute;
        left: ${p.$level * 24 - 12}px;
        top: 0;
        bottom: 0;
        width: 1px;
        background-color: var(--color-border);
        opacity: 0.4;
      }
    `}
`;

export const TreeItem = styled.div<{
  $selected: boolean;
  $hasChildren: boolean;
  $isSelectable: boolean;
}>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.35rem 0.4rem 0.35rem 0.2rem;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s;
  user-select: none;
  min-height: 32px;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;

  background-color: ${(p) =>
    p.$selected ? "var(--color-brand-50)" : "transparent"};

  box-shadow: ${(p) =>
    p.$selected ? "inset 0 0 0 1px var(--color-brand-200)" : "none"};

  &:hover {
    background-color: ${(p) =>
      p.$selected ? "var(--color-brand-100)" : "var(--color-bg-hover)"};
  }

  ${(p) =>
    !p.$isSelectable &&
    !p.$hasChildren &&
    css`
      cursor: default;
      &:hover {
        background-color: transparent;
      }
    `}
`;

export const LeftSide = styled.div`
  display: flex;
  align-items: center;
  gap: 0.2rem;
  flex: 1;
  min-width: 0;
  overflow: hidden;
`;

export const ExpandButton = styled.button<{ $expanded?: boolean }>`
  background: none;
  border: none;
  cursor: pointer;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  color: var(--color-text-tertiary);
  transition: all 0.2s;
  flex-shrink: 0;

  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
    color: var(--color-text-main);
  }

  svg {
    width: 14px;
    height: 14px;
    transition: transform 0.2s ease-in-out;
    transform: ${(p) => (p.$expanded ? "rotate(0deg)" : "rotate(-90deg)")};
  }
`;

export const Info = styled.div`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  flex: 1;
  margin-left: 2px;
  min-width: 0;
  overflow: hidden;
`;

export const IconWrapper = styled.div<{ $color: string; $hasImage?: boolean }>`
  width: 28px;
  height: 28px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  overflow: hidden;

  background: ${(p) => {
    // Якщо це логотип банку — фону не треба
    if (p.$hasImage) return "transparent";

    // Якщо це іконка (User/Group) — малюємо напівпрозорий фон кольору іконки
    const c = p.$color || "var(--color-bg-hover)";

    // Якщо колір — це змінна CSS (var--...), додаємо фон через opacity
    if (c.startsWith("var")) {
      return `rgba(from ${c} r g b / 0.15)`; // Сучасний CSS
    }

    // Для Hex кольорів (#fff)
    return c.startsWith("#") ? `${c}25` : "var(--color-bg-hover)";
  }};

  color: ${(p) => p.$color || "var(--color-text-secondary)"};

  /* Додаємо тонку обводку для логотипів, а для іконок — колір фону */
  border: 1px solid
    ${(p) => {
      if (p.$hasImage) return "var(--color-border)";
      return "transparent";
    }};
`;

export const Label = styled.span`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--color-text-main);
  line-height: 1.2;
  flex: 1;
  min-width: 0;
`;

export const Checkbox = styled.div<{ $checked: boolean }>`
  width: 18px;
  height: 18px;
  border-radius: 4px;
  border: 1px solid
    ${(p) => (p.$checked ? "var(--color-brand-600)" : "var(--color-border)")};
  background-color: ${(p) =>
    p.$checked ? "var(--color-brand-600)" : "transparent"};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  margin-right: 8px;
  transition: all 0.2s;
  flex-shrink: 0;

  svg {
    width: 14px;
    height: 14px;
    stroke-width: 3;
  }
`;
