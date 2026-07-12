import styled, { css, keyframes } from "styled-components";
import { Button } from "../../ui/Button";

const fadeIn = keyframes`
  from { opacity: 0; scale: 0.98; }
  to { opacity: 1; scale: 1; }
`;

export const Container = styled.div`
  position: relative;
  display: inline-block;
`;

export const MiniTrigger = styled.button<{
  $active: boolean;
  $hasChanges: boolean;
}>`
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  border: 1px solid var(--color-border);
  background: var(--color-bg-surface);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all 0.2s;
  font-size: 1.2rem;
  &:hover {
    background: var(--color-bg-hover);
    color: var(--color-text-main);
  }
  ${(p) =>
    p.$active &&
    css`
      background: var(--color-bg-hover);
      color: var(--color-text-main);
    `}
  ${(p) =>
    p.$hasChanges &&
    css`
      background: #fff7ed !important;
      color: #d97706 !important;
      border-color: #fcd34d !important;
    `}
`;

export const TriggerButton = styled(Button)<{
  $active: boolean;
  $hasChanges: boolean;
}>`
  justify-content: space-between;
  min-width: 150px;
  ${(p) =>
    p.$hasChanges &&
    css`
      background-color: #f59e0b !important;
      color: white !important;
      border-color: transparent !important;
    `}
  .chevron-icon {
    transition: transform 0.2s;
    transform: ${(p) => (p.$active ? "rotate(180deg)" : "rotate(0)")};
  }
  .warning-icon {
    color: white;
  }
`;

export const MegaDropdown = styled.div`
  position: fixed;
  z-index: 99999;
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.25);
  border-radius: 12px;

  height: 400px;
  max-height: 80vh;
  box-sizing: border-box;

  display: flex;
  flex-direction: column;

  overflow: hidden;
  animation: ${fadeIn} 0.15s ease-out;

  @media (max-width: 600px) {
    width: 95vw !important;
    left: 2.5vw !important;
    right: auto !important;
  }
`;

export const ColumnsWrapper = styled.div<{ $hidePeriod?: boolean }>`
  display: grid;
  grid-template-columns: ${(p) =>
    p.$hidePeriod ? "minmax(0, 1fr)" : "180px minmax(0, 1fr)"};

  flex: 1;
  min-height: 0;
  height: 100%;
  overflow: hidden;
`;

export const LeftColumn = styled.div`
  height: 100%;
  overflow: hidden;
  background: var(--color-bg-page);
  border-right: 1px solid var(--color-border);
`;

export const RightColumn = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  min-width: 0;
  overflow: hidden;
`;

export const RightColumnHeader = styled.div`
  padding: 12px 12px 0 12px;
  flex-shrink: 0;
`;

export const ScrollArea = styled.div`
  overflow-y: auto;
  height: 100%;
  padding: 12px;
  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background: var(--color-border);
    border-radius: 4px;
  }
`;

export const TreeScrollArea = styled.div`
  flex: 1;
  overflow-y: auto;
  min-height: 0;
  padding: 0 12px 12px 12px;
  width: 100%;
  box-sizing: border-box;

  &::-webkit-scrollbar {
    width: 5px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background: var(--color-border);
    border-radius: 4px;
  }
  &::-webkit-scrollbar-thumb:hover {
    background: var(--color-text-tertiary);
  }
`;

export const DropdownFooter = styled.div`
  border-top: 1px solid var(--color-border);
  padding: 8px 12px;
  background: var(--color-bg-surface);
  position: relative;
  z-index: 10;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
  height: 50px;
`;

export const SectionTitle = styled.div`
  font-size: 0.65rem;
  color: var(--color-text-tertiary);
  text-transform: uppercase;
  font-weight: 600;
  margin-bottom: 6px;
`;

export const ChipsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
`;

export const MiniChip = styled.button<{ $active?: boolean }>`
  background: ${(p) =>
    p.$active ? "var(--color-brand-50)" : "var(--color-bg-hover)"};
  border: 1px solid
    ${(p) => (p.$active ? "var(--color-brand-200)" : "var(--color-border)")};
  color: ${(p) =>
    p.$active ? "var(--color-brand-600)" : "var(--color-text-main)"};
  font-weight: ${(p) => (p.$active ? "600" : "400")};
  border-radius: 6px;
  padding: 4px 2px;
  font-size: 0.7rem;
  cursor: pointer;
  transition: all 0.2s;
  &:hover {
    background: var(--color-brand-50);
    border-color: var(--color-brand-200);
  }
`;

export const CompactList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

export const MenuItem = styled.button<{
  $active?: boolean;
  $highlight?: boolean;
}>`
  width: 100%;
  text-align: left;
  padding: 4px 10px;
  border: none;
  font-size: 0.85rem;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  background: ${(p) =>
    p.$active
      ? "var(--color-brand-50)"
      : p.$highlight
      ? "var(--color-bg-hover)"
      : "transparent"};
  color: ${(p) =>
    p.$active || p.$highlight
      ? "var(--color-brand-600)"
      : "var(--color-text-secondary)"};
  font-weight: ${(p) => (p.$active || p.$highlight ? "600" : "400")};
  &:hover {
    background: var(--color-bg-hover);
    color: var(--color-text-main);
  }
`;

export const IconWrapper = styled.div`
  width: 16px;
  display: flex;
  justify-content: center;
  align-items: center;
  .check {
    color: var(--color-brand-600);
    font-weight: bold;
  }
`;

export const Divider = styled.div`
  height: 1px;
  background: var(--color-border);
  margin: 12px 0;
`;

export const VerticalDivider = styled.div`
  display: none;
`;

export const SearchContainer = styled.div`
  display: flex;
  align-items: center;
  background: var(--color-bg-page);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 6px 10px;
  margin-bottom: 10px;
  gap: 8px;
  color: var(--color-text-tertiary);
  &:focus-within {
    border-color: var(--color-brand-500);
    color: var(--color-brand-500);
  }
`;

export const SearchInput = styled.input`
  border: none;
  background: transparent;
  outline: none;
  width: 100%;
  font-size: 0.9rem;
  color: var(--color-text-main);
  &::placeholder {
    color: var(--color-text-tertiary);
  }
`;

export const ResetButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  background: transparent;
  border: none;
  color: var(--color-text-secondary);
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  padding: 6px 12px;
  border-radius: 6px;
  transition: all 0.2s;
  &:hover {
    background: #fee2e2;
    color: #ef4444;
  }
`;

export const ApplyButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  background: var(--color-brand-600);
  border: none;
  color: white;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  padding: 6px 12px;
  border-radius: 6px;
  transition: all 0.2s;
  &:hover {
    background: var(--color-brand-700);
  }
`;

// --- Calendar Styles ---

export const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(2px);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.2s;

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;

export const CalendarContainer = styled.div`
  background: var(--color-bg-surface);
  padding: 1.5rem;
  border-radius: 16px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  max-width: 90vw;

  /* Анімація появи */
  animation: scaleUp 0.2s;
  @keyframes scaleUp {
    from {
      opacity: 0;
      transform: scale(0.95);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }
`;

export const CalendarHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  h3 {
    margin: 0;
    font-size: 1.1rem;
    color: var(--color-text-main);
  }
`;

export const CloseBtn = styled.button`
  background: transparent;
  border: none;
  font-size: 1.2rem;
  color: var(--color-text-secondary);
  cursor: pointer;
`;

export const CalendarFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 1rem;
`;

export const ApplyBtn = styled.button`
  background: var(--color-brand-600);
  color: white;
  border: none;
  padding: 8px 24px;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
`;

export const StyledDayPickerWrapper = styled.div`
  .rdp {
    --rdp-cell-size: 40px;
    --rdp-accent-color: var(--color-brand-600);
    --rdp-today-color: var(--color-green-600);
    --rdp-background-color: var(--color-brand-50);
    --rdp-accent-color-dark: var(--color-brand-700);
    
    /* Додаткові змінні для повного контролю */
    --rdp-outline: 2px solid var(--color-brand-200);
    --rdp-outline-focus: 2px solid var(--color-brand-600);
    --rdp-range_start-date-background-color: var(--color-brand-600);
    --rdp-range_end-date-background-color: var(--color-brand-600);
    --rdp-range_middle-background-color: var(--color-brand-50);
    --rdp-selected-color: white;
    --rdp-selected-border: none; /* 🔥 ПРИБИРАЄМО ОБВЕДЕННЯ */
    
    margin: 0;
  }

  /* 🔥 ПРИБИРАЄМО СИНЮ ОБВОДКУ (OUTLINE) */
  .rdp-button:focus,
  .rdp-button:active,
  .rdp-day_button:focus,
  .rdp-day_button:active,
  .rdp-day:focus,
  *:focus {
    outline: none !important;
    box-shadow: none !important;
  }
  
  .rdp-button:focus-visible,
  .rdp-day_button:focus-visible {
    outline: 2px solid var(--color-brand-300) !important;
    outline-offset: -2px;
  }

  /* 🔥 ФІКС ВИБРАНИХ ДНІВ ТА ДІАПАЗОНУ (ЄДИНА ЛІНІЯ) */
  
  .rdp-day {
    padding: 0 !important;
    background: transparent !important; /* Клітинка завжди прозора */
  }

  .rdp-day_button {
    width: 100% !important;
    height: 100% !important;
    margin: 0 !important;
    border: none !important; /* 🔥 ПРИБИРАЄМО ОБВОДКУ */
    outline: none !important;
    box-shadow: none !important;
    border-radius: 0 !important; /* Дефолт для середини діапазону */
  }

  /* Початок діапазону (КНОПКА) */
  .rdp-range_start .rdp-day_button, 
  .rdp-day_range_start .rdp-day_button {
    background-color: var(--color-brand-600) !important;
    color: white !important;
    border-radius: 100px 0 0 100px !important;
  }

  /* Кінець діапазону (КНОПКА) */
  .rdp-range_end .rdp-day_button,
  .rdp-day_range_end .rdp-day_button {
    background-color: var(--color-brand-600) !important;
    color: white !important;
    border-radius: 0 100px 100px 0 !important;
  }

  /* Початок і кінець — один день (КНОПКА) */
  .rdp-range_start.rdp-range_end .rdp-day_button,
  .rdp-day_range_start.rdp-day_range_end .rdp-day_button {
    border-radius: 100px !important;
  }

  /* Окремий вибраний день (КНОПКА) */
  .rdp-day_selected:not(.rdp-day_range_start):not(.rdp-day_range_end):not(.rdp-day_range_middle) .rdp-day_button,
  .rdp-selected:not(.rdp-range_start):not(.rdp-range_end):not(.rdp-range_middle) .rdp-day_button {
    border-radius: 100px !important;
    background-color: var(--color-brand-600) !important;
    color: white !important;
  }

  /* Середина діапазону (КНОПКА) */
  .rdp-range_middle .rdp-day_button,
  .rdp-day_range_middle .rdp-day_button {
    background-color: var(--color-brand-50) !important;
    color: var(--color-brand-700) !important;
    border-radius: 0 !important;
  }

  /* Hover ефект для не вибраних кнопок */
  .rdp-button:hover:not([disabled]):not(.rdp-day_selected):not(.rdp-selected) .rdp-day_button,
  .rdp-button:hover:not([disabled]):not(.rdp-day_selected):not(.rdp-selected) {
    background-color: var(--color-bg-hover) !important;
    border-radius: 100px !important; /* Округлюємо при наведенні */
  }

  /* Стрілки навігації */
  .rdp-nav_button {
    color: var(--color-text-main) !important;
    border: 1px solid var(--color-border) !important;
    background: var(--color-bg-surface) !important;
  }

  .rdp-chevron {
    fill: var(--color-brand-600) !important;
  }

  .rdp-nav_button:hover {
    background: var(--color-bg-hover) !important;
    border-color: var(--color-brand-300) !important;
  }

  .rdp-nav_button:hover .rdp-chevron {
    fill: var(--color-brand-700) !important;
  }

  .rdp-day_today:not(.rdp-day_selected) .rdp-day_button {
    border: 2px solid var(--color-green-600) !important;
    color: var(--color-green-600) !important;
    font-weight: bold;
    background: var(--color-success-50) !important;
    border-radius: 100px !important;
  }

  .rdp-today:not(.rdp-outside) {
    color: var(--color-green-600) !important;
  }

  .rdp-today:not(.rdp-outside) .rdp-day_button {
    color: var(--color-green-600) !important;
  }

  /* Колір назви місяця та днів тижня */
  .rdp-caption_label,
  .rdp-head_cell {
    color: var(--color-text-main) !important;
    font-weight: 600;
  }
`;
