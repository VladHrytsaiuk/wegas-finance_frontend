import styled from "styled-components";

// --- Контейнери ---
export const ToolbarContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem; /* Зменшив відступ між блоками */
  margin-bottom: 2.5rem;
  width: 100%;
`;

export const ControlsRow = styled.div`
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  gap: 0.5rem;

  background-color: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 0.5rem;
  box-shadow: var(--shadow-sm);
  height: 56px;

  overflow-x: auto;
  &::-webkit-scrollbar {
    display: none;
  }
  -ms-overflow-style: none;
  scrollbar-width: none;
`;

// --- НОВИЙ КОНТЕЙНЕР ДЛЯ НИЖНЬОГО РЯДКА ---
export const BottomBar = styled.div`
  display: flex;
  justify-content: flex-end; /* Притискаємо вправо */
  align-items: center;
  padding: 0 0.2rem;
`;

export const Divider = styled.div`
  width: 1px;
  height: 24px;
  background-color: var(--color-border);
  margin: 0 0.2rem;
  flex-shrink: 0;
`;

export const Spacer = styled.div`
  margin-left: auto;
`;

// ... Всі інші стилі (SearchWrapper, SearchInput, FilterButton, Badge, ClearTextBtn, і т.д.) залишаються БЕЗ ЗМІН ...
// Просто скопіюй їх зі старого файлу або залиш як є.
export const SearchWrapper = styled.div<{ $inline?: boolean }>`
  position: relative;
  flex: 1 1 auto;
  min-width: 120px;
  max-width: 320px;
  transition: all 0.2s ease;
`;

export const SearchInput = styled.input`
  width: 100%;
  padding: 0.5rem 0.5rem 0.5rem 2.2rem;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background-color: var(--color-bg-page);
  color: var(--color-text-main);
  font-size: 0.9rem;
  transition: all 0.2s;
  height: 38px;

  font-size: 0.7rem;
  height: 30px;

  &:focus {
    outline: none;
    background-color: var(--color-bg-surface);
    border-color: var(--color-brand-500);
    box-shadow: 0 0 0 2px var(--color-brand-100);
  }
`;

export const FilterButton = styled.button<{
  $isActive: boolean;
  $isOpen: boolean;
}>`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0 0.8rem;
  height: 38px;
  position: relative;

  background-color: ${(props) =>
    props.$isActive || props.$isOpen ? "var(--color-brand-50)" : "transparent"};
  border: 1px solid
    ${(props) =>
      props.$isActive || props.$isOpen
        ? "var(--color-brand-500)"
        : "var(--color-border)"};
  border-radius: 8px;

  color: ${(props) =>
    props.$isActive ? "var(--color-brand-700)" : "var(--color-text-main)"};

  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s, border-color 0.2s, color 0.2s;
  white-space: nowrap;
  flex-shrink: 0;
  border-width: 1px !important;

  padding: 0 0.6rem;
  font-size: 0.7rem;
  height: 30px;

  &:hover {
    background-color: var(--color-brand-50);
    border-color: var(--color-brand-500);
  }

  & svg:not(.chevron) {
    width: 1.1rem;
    height: 1.1rem;

    width: 13px;
    height: 13px;
  
  }

  svg.chevron {
    width: 12px;
    height: 12px;
    opacity: 0.5;
    transition: transform 0.2s;
    transform: ${(props) => (props.$isOpen ? "rotate(180deg)" : "rotate(0)")};
  }

  outline: none !important;
  box-shadow: none !important;

  &:focus,
  &:focus-visible,
  &:focus-within,
  &[data-autofocus],
  &[role="combobox"]:focus,
  &[role="combobox"]:focus-visible {
    outline: none !important;
    box-shadow: none !important;
  }
`;

export const TriggerSearchInput = styled.input`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  padding: inherit;
  border: none;
  outline: none;
  background: transparent;
  color: var(--color-text-main);
  font-size: inherit;
  font-family: inherit;
  z-index: 2;

  &::placeholder {
    color: var(--color-text-tertiary);
  }

  &:focus, &:focus-visible, &:active {
    outline: none !important;
    box-shadow: none !important;
  }
`;

export const TriggerContentWrapper = styled.div<{ $isHidden?: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  opacity: ${(p) => (p.$isHidden ? 0 : 1)};
  pointer-events: ${(p) => (p.$isHidden ? "none" : "auto")};
  width: 100%;
`;

export const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-brand-600);
  color: white;
  font-size: 0.7rem;
  font-weight: 700;
  height: 16px;
  min-width: 16px;
  padding: 0 4px;
  border-radius: 8px;
`;

export const ClearTextBtn = styled.button`
  background: var(--color-red-50);
  border: 1px solid transparent;
  color: var(--color-red-600);
  font-size: 0.8rem;
  cursor: pointer;

  font-size: 0.7rem;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;

  width: 30px;
  height: 30px;
  border-radius: 8px;
  flex-shrink: 0;
  transition: all 0.2s;
  span {
    display: none;
  }
  &:hover {
    background: var(--color-red-100);
    border-color: var(--color-red-200);
  }
`;

export const PortalMenu = styled.div`
  position: fixed;
  z-index: 99999;
  min-width: 240px;
  max-width: 320px;
  max-height: 400px;
  overflow-y: auto;
  background-color: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: 10px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
    0 4px 6px -2px rgba(0, 0, 0, 0.05);
  padding: 0.5rem;
  animation: fadeIn 0.15s ease-out;
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  /* Авто-фокус при пошуку */
  & [data-autofocus="true"] {
    background-color: var(--color-bg-page, #f3f4f6) !important;
    outline: 2px solid var(--color-brand-500);
    outline-offset: -2px;
  }
`;
export const MenuOption = styled.div<{ $selected: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.6rem 0.8rem;
  margin-bottom: 2px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  background-color: ${(props) =>
    props.$selected ? "var(--color-brand-50)" : "transparent"};
  color: ${(props) =>
    props.$selected ? "var(--color-brand-700)" : "var(--color-text-main)"};
  font-weight: ${(props) => (props.$selected ? "600" : "400")};
  &:hover, &:focus {
    outline: none;
    background-color: ${(props) =>
      props.$selected ? "var(--color-brand-100)" : "var(--color-bg-page)"};
  }
`;
export const Checkbox = styled.div<{ $checked: boolean }>`
  width: 16px;
  height: 16px;
  border-radius: 4px;
  border: 2px solid
    ${(props) =>
      props.$checked ? "var(--color-brand-600)" : "var(--color-border)"};
  background-color: ${(props) =>
    props.$checked ? "var(--color-brand-600)" : "transparent"};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  color: white;
  svg {
    width: 12px;
    height: 12px;
    opacity: ${(props) => (props.$checked ? 1 : 0)};
  }
`;
export const RangeContainer = styled.div`
  padding: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
`;
export const RangeInputs = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;
export const SmallInput = styled.input`
  width: 100%;
  padding: 0.5rem;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  font-size: 0.85rem;
  background: var(--color-bg-page);

  font-size: 0.7rem;
  height: 30px;
  color: var(--color-text-main);
  &:focus {
    border-color: var(--color-brand-500);
    outline: none;
  }
`;
export const ButtonSmall = styled.button`
  background-color: var(--color-brand-600);
  color: white;
  border: none;
  border-radius: 6px;
  padding: 0.4rem 0.8rem;
  font-size: 0.85rem;
  cursor: pointer;

  font-size: 0.7rem;
  height: 30px;
  font-weight: 500;
  &:hover {
    background-color: var(--color-brand-700);
  }
`;
