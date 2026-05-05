import styled, { css } from "styled-components";
// Якщо ви раніше не додавали ToolbarWrapper, ось він:
export const ToolbarWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0;
  margin-bottom: 1.5rem;
`;

export const ChildrenTopRow = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 0.8rem;
  margin-bottom: 1rem;
`;

// Додали проп $stickyEnabled
export const StickyContainer = styled.div<{
  $isSticky?: boolean;
  $stickyEnabled?: boolean;
}>`
  /* Якщо стікі вимкнено - блок поводиться як звичайний div */
  position: ${(p) => (p.$stickyEnabled ? "sticky" : "relative")};

  /* 🔥 ВИПРАВЛЕННЯ: Ставимо top: 0 для стікі, і auto для звичайного стану, 
     щоб блок НІКОЛИ не наїжджав на верхні кнопки */
  top: ${(p) => (p.$stickyEnabled ? "0" : "auto")};

  z-index: 50;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  ${(p) =>
    p.$isSticky
      ? css`
          background: var(--color-bg-surface);
          padding: 1.25rem 1.5rem;
          margin: 0 -1.5rem;
          border-radius: 16px;
          border: 1px solid var(--color-border);
          box-shadow:
            0 12px 24px -8px rgba(0, 0, 0, 0.15),
            0 4px 10px -4px rgba(0, 0, 0, 0.1);
        `
      : css`
          background: transparent;
          padding: 0;
          margin: 0;
          border: 1px solid transparent;
          border-radius: 0;
          box-shadow: none;
        `}
`;

export const ControlsRow = styled.div<{ $isSticky?: boolean }>`
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;

  background: ${(p) =>
    p.$isSticky ? "transparent" : "var(--color-bg-surface)"};
  border: ${(p) => (p.$isSticky ? "none" : "1px solid var(--color-border)")};
  border-radius: 12px;
  padding: ${(p) => (p.$isSticky ? "0" : "0.75rem 1rem")};
  box-shadow: ${(p) =>
    p.$isSticky ? "none" : "0 1px 2px rgba(0, 0, 0, 0.05)"};
  transition: all 0.3s ease;
`;

export const BottomBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
`;

export const SearchWrapper = styled.div<{ $inline?: boolean }>`
  position: relative;
  width: ${(p) => (p.$inline ? "240px" : "300px")};
  max-width: 100%;

  & > svg {
    position: absolute;
    left: 10px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--color-text-secondary);
    width: 16px;
    height: 16px;
    pointer-events: none;
  }
`;

export const SearchInput = styled.input`
  width: 100%;
  padding: 8px 10px 8px 32px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-bg-surface);
  color: var(--color-text-main);
  font-size: 0.9rem;
  transition: border-color 0.2s;

  &:focus {
    border-color: var(--color-brand-600);
    outline: none;
  }

  &::placeholder {
    color: var(--color-text-tertiary);
  }
`;

export const Divider = styled.div`
  width: 1px;
  height: 24px;
  background: var(--color-border);
`;

export const FiltersGroup = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
  flex-wrap: wrap;
`;

export const ResetButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  padding: 0;
  background: #fee2e2;
  color: #ef4444;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;

  &:hover {
    background: #fecaca;
    color: #dc2626;
  }

  svg {
    width: 20px;
    height: 20px;
  }

  &::after {
    content: "";
    position: absolute;
    width: 22px;
    height: 2px;
    background-color: currentColor;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) rotate(-45deg);
    border-radius: 2px;
    box-shadow: 0 0 0 2px #fee2e2;
    pointer-events: none;
  }

  &:hover::after {
    box-shadow: 0 0 0 2px #fecaca;
  }
`;

// --- Інші стилі для кнопок, меню та Date Picker залишаються без змін ---

// Просто вставляю сюди для повноти (не міняв)
export const FilterButton = styled.button<{
  $isActive: boolean;
  $isOpen: boolean;
}>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border: 1px solid transparent;
  background: ${(p) => (p.$isOpen ? "var(--color-bg-hover)" : "transparent")};
  color: var(--color-text-main);
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: background 0.2s;
  &:hover {
    background: var(--color-bg-hover);
  }
  & > svg:first-child {
    width: 18px;
    height: 18px;
    color: var(--color-text-secondary);
  }
`;
export const SortLabelPrefix = styled.span`
  color: var(--color-text-secondary);
`;
export const SortLabelValue = styled.span`
  font-weight: 600;
`;
export const PortalMenu = styled.div`
  position: fixed;
  z-index: 9999;
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  padding: 6px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  animation: fadeIn 0.1s ease-out;
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(5px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;
export const MenuOption = styled.button<{ $selected: boolean }>`
  width: 100%;
  text-align: left;
  padding: 8px 12px;
  border: none;
  background: ${(p) => (p.$selected ? "var(--color-bg-hover)" : "transparent")};
  color: ${(p) =>
    p.$selected ? "var(--color-brand-600)" : "var(--color-text-main)"};
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  font-size: 0.9rem;
  font-weight: ${(p) => (p.$selected ? "600" : "400")};
  &:hover {
    background: var(--color-bg-hover);
  }
  svg {
    margin-left: auto;
    color: var(--color-brand-600);
    font-size: 1.1rem;
  }
`;
export const DateFilterWrapper = styled.div`
  position: relative;
`;
export const DateIconButton = styled.button<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border-radius: 8px;
  border: 1px solid
    ${(p) => (p.$active ? "var(--color-brand-200)" : "var(--color-border)")};
  background: ${(p) =>
    p.$active ? "var(--color-brand-50)" : "var(--color-bg-surface)"};
  color: ${(p) =>
    p.$active ? "var(--color-brand-600)" : "var(--color-text-secondary)"};
  cursor: pointer;
  transition: all 0.2s;
  &:hover {
    background: ${(p) =>
      p.$active ? "var(--color-brand-100)" : "var(--color-bg-hover)"};
    color: ${(p) =>
      p.$active ? "var(--color-brand-700)" : "var(--color-text-main)"};
    border-color: ${(p) =>
      p.$active ? "var(--color-brand-300)" : "var(--color-text-secondary)"};
  }
  svg {
    width: 20px;
    height: 20px;
  }
`;
export const DatePopupPortal = styled.div`
  position: fixed;
  z-index: 2147483647;
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  padding: 0;
  animation: fadeIn 0.15s ease-out;
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(5px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;
