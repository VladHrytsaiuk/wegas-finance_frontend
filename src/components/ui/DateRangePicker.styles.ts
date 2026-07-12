import styled from "styled-components";

export const PickerContainer = styled.div`
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  border-radius: 12px;
  display: flex;
  overflow: hidden;

  /* 🔥 ВАЖЛИВО: Дозволяємо вертикальний скрол, якщо екран малий */
  overflow-y: auto;

  @media (max-width: 600px) {
    flex-direction: column;
    min-width: 300px;
    max-width: 95vw;
  }
`;
export const StyledDayPickerWrapper = styled.div`
  /* Компактний розмір клітинки */
  --rdp-cell-size: 34px;
  --rdp-accent-color: var(--color-brand-600);
  --rdp-today-color: var(--color-green-600);
  --rdp-background-color: color-mix(
    in srgb,
    var(--color-brand-500),
    transparent 88%
  );

  .rdp {
    margin: 0;
    color: var(--color-text-main);
  }

  /* Зменшуємо шрифт */
  .rdp-day {
    font-size: 0.85rem;
  }

  /* Відступи між місяцями */
  .rdp-months {
    gap: 1rem;
    justify-content: center;
  }

  .rdp-chevron {
    fill: var(--color-text-secondary);
  }

  .rdp-nav button {
    color: var(--color-text-secondary);
  }

  .rdp-nav button:hover {
    background-color: var(--color-bg-hover);
  }

  .rdp-button {
    border-radius: 6px;
    transition: background-color 0.2s;
    color: var(--color-text-main);
  }

  .rdp-button:hover:not([disabled]):not(.rdp-day_selected) {
    background-color: var(--color-bg-hover);
  }

  .rdp-day_today:not(.rdp-day_selected) {
    border: 2px solid var(--color-green-600);
    color: var(--color-green-600);
    font-weight: bold;
    background-color: var(--color-success-50);
  }

  .rdp-today:not(.rdp-outside) {
    color: var(--color-green-600) !important;
  }

  .rdp-today:not(.rdp-outside) .rdp-day_button {
    color: var(--color-green-600) !important;
  }

  .rdp-day_selected {
    background-color: var(--color-brand-600) !important;
    color: white !important;
    border-radius: 6px !important;
  }

  .rdp-today.rdp-day_selected .rdp-day_button,
  .rdp-today .rdp-day_range_start .rdp-day_button,
  .rdp-today .rdp-day_range_end .rdp-day_button {
    color: white !important;
    border: none !important;
  }

  .rdp-day_range_start,
  .rdp-day_range_end {
    background-color: var(--color-brand-600) !important;
    color: white !important;
    font-weight: bold;
    border-radius: 6px !important;
    opacity: 1 !important;
  }

  .rdp-day_range_middle {
    background-color: color-mix(
      in srgb,
      var(--color-brand-500),
      transparent 84%
    ) !important;
    color: var(--color-text-main) !important;
    border-radius: 0 !important;
  }

  .rdp-day_range_start:not(.rdp-day_range_end) {
    border-top-right-radius: 0 !important;
    border-bottom-right-radius: 0 !important;
  }

  .rdp-day_range_end:not(.rdp-day_range_start) {
    border-top-left-radius: 0 !important;
    border-bottom-left-radius: 0 !important;
  }

  /* 🔥 СТИЛІ ДЛЯ ВИПАДАЮЧИХ СПИСКІВ (МІСЯЦЬ / РІК) 🔥 */

  /* 1. Ховаємо старий текстовий заголовок (бо інакше текст накладеться на селект) */
  .rdp-caption_label {
    display: none !important;
  }

  /* 2. Обгортка для селектів */
  .rdp-caption_dropdowns {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
  }

  /* 3. Знімаємо з обгорток відносне позиціонування, щоб вони не стискалися */
  .rdp-dropdown_month,
  .rdp-dropdown_year {
    position: static !important;
    display: flex;
  }

  /* 4. ПРОЯВЛЯЄМО САМІ СЕЛЕКТИ (вони мають клас .rdp-dropdown) */
  .rdp-dropdown {
    position: static !important; /* Відміняємо абсолютне позиціонування бібліотеки */
    opacity: 1 !important; /* Відміняємо прозорість */
    width: auto !important;
    height: auto !important;

    /* Робимо їх красивими */
    appearance: none !important;
    -webkit-appearance: none !important;
    background-color: var(--color-bg-surface) !important;
    color: var(--color-text-main) !important;
    border: 1px solid var(--color-border) !important;
    padding: 4px 24px 4px 12px !important;
    border-radius: 6px !important;
    font-size: 0.9rem !important;
    font-weight: 500 !important;
    cursor: pointer !important;
    font-family: inherit;

    /* Кастомна стрілочка */
    background-image: url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23888%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E") !important;
    background-repeat: no-repeat !important;
    background-position: right 8px center !important;
    background-size: 10px auto !important;
  }

  .rdp-dropdown:hover {
    border-color: var(--color-text-secondary) !important;
  }

  .rdp-dropdown:focus {
    outline: none !important;
    border-color: var(--color-brand-600) !important;
    box-shadow: 0 0 0 2px var(--color-brand-100) !important;
  }

  .rdp-dropdown option {
    background-color: var(--color-bg-surface);
    color: var(--color-text-main);
  }

  /* Вирівнюємо весь рядок заголовка */
  .rdp-caption {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    margin-bottom: 0.5rem;
  }
`;

export const ShortcutsPanel = styled.div`
  width: 140px;
  background: var(--color-bg-hover);
  padding: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 2px;
  border-right: 1px solid var(--color-border);
  flex-shrink: 0;

  @media (max-width: 600px) {
    width: 100%;
    flex-direction: row;
    overflow-x: auto;
    border-right: none;
    border-bottom: 1px solid var(--color-border);
  }
`;

export const RightSide = styled.div`
  display: flex;
  flex-direction: column;
  flex-shrink: 0; /* Не даємо йому стискатись */
  width: 100%;
  align-items: center;
`;

export const CalendarSection = styled.div`
  padding: 0.75rem;
  background: var(--color-bg-surface);
  display: flex;
  justify-content: center;
  flex-shrink: 0; /* Не даємо календарю стискатись */
  width: 100%;
`;

export const Footer = styled.div`
  padding: 8px 12px;
  border-top: 1px solid var(--color-border);
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  background: var(--color-bg-surface);
  flex-shrink: 0;
`;

// ... SegmentedWrapper та інші без змін
export const SegmentedWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 46px;
  background-color: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: 6px;
  display: flex;
  align-items: center;
  transition: all 0.2s;
  cursor: text;
  padding-left: 2px;
  &:focus-within {
    border-color: var(--color-brand-600);
    box-shadow: 0 0 0 3px var(--color-brand-100);
  }
`;

export const SegmentInput = styled.input`
  border: none;
  background: transparent;
  text-align: center;
  font-size: 0.95rem;
  color: var(--color-text-main);
  outline: none;
  padding: 0;
  margin: 0;
  box-sizing: content-box;
  line-height: 1;
  font-family: inherit;
  &::placeholder {
    color: var(--color-text-tertiary);
    opacity: 0.5;
    font-size: 0.8rem;
    letter-spacing: -0.5px;
    font-weight: 400;
    transform: translateY(1px);
  }
  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
`;

export const Separator = styled.span`
  color: var(--color-text-tertiary);
  font-weight: 500;
  margin: 0 -2px;
  user-select: none;
  padding-bottom: 2px;
  position: relative;
  z-index: 1;
`;

export const IconButton = styled.button`
  background: none;
  border: none;
  padding: 0 10px;
  height: 100%;
  display: flex;
  align-items: center;
  color: var(--color-text-secondary);
  cursor: pointer;
  &:hover {
    color: var(--color-brand-600);
  }
`;

export const TriggerBtn = styled.button<{ $active: boolean }>`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--color-bg-surface);
  border: 1px solid
    ${(p) => (p.$active ? "var(--color-brand-600)" : "var(--color-border)")};
  height: 46px;
  padding: 0 1rem;
  border-radius: 6px;
  color: var(--color-text-main);
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
  overflow: hidden;
  transition: all 0.2s;
  &:hover {
    border-color: var(--color-text-secondary);
  }
  &:focus, &:focus-visible, &:active {
    outline: none !important;
    box-shadow: none !important;
  }
`;

export const FooterBtn = styled.button`
  background: transparent;
  border: none;
  color: var(--color-text-secondary);
  font-size: 0.9rem;
  cursor: pointer;
  padding: 6px 12px;
  border-radius: 6px;
  &:hover {
    background: var(--color-bg-hover);
    color: var(--color-text-main);
  }
`;

export const ApplyBtn = styled.button`
  background: var(--color-brand-600);
  color: white;
  border: none;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  padding: 6px 16px;
  border-radius: 6px;
  &:hover {
    background: var(--color-brand-700);
  }
`;

export const ShortcutBtn = styled.button`
  text-align: left;
  background: transparent;
  border: none;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 0.85rem;
  color: var(--color-text-main);
  cursor: pointer;
  &:hover {
    background: var(--color-bg-surface);
    color: var(--color-brand-600);
  }
`;
