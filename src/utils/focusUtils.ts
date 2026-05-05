// src/utils/focusUtils.ts

/**
 * Переводить фокус на наступний (або попередній) елемент у контейнері.
 * Реалізує кільцеву навігацію (Cycle).
 */
export const focusNextElement = (
  currentElement: HTMLElement | null,
  isShiftTab: boolean = false
) => {
  if (!currentElement) return;

  // 1. Шукаємо контейнер модалки або форми
  const container =
    currentElement.closest('[role="dialog"]') ||
    currentElement.closest("form") ||
    document.body;

  // 2. Збираємо всі інтерактивні елементи
  const focusableSelector =
    'button:not([disabled]):not([tabindex="-1"]), [href], input:not([disabled]):not([tabindex="-1"]), select:not([disabled]):not([tabindex="-1"]), textarea:not([disabled]):not([tabindex="-1"]), [tabindex]:not([tabindex="-1"]):not([disabled])';

  const allElements = Array.from(
    container.querySelectorAll(focusableSelector)
  ) as HTMLElement[];

  // 3. Фільтруємо тільки видимі (щоб не фокусуватись на прихованих інпутах файлів)
  const visibleElements = allElements.filter((el) => {
    return el.offsetParent !== null;
  });

  if (visibleElements.length === 0) return;

  const currentIndex = visibleElements.indexOf(currentElement);

  let nextIndex;

  if (isShiftTab) {
    // SHIFT + TAB (Назад)
    if (currentIndex === -1 || currentIndex === 0) {
      nextIndex = visibleElements.length - 1; // Йдемо в кінець
    } else {
      nextIndex = currentIndex - 1;
    }
  } else {
    // TAB (Вперед)
    if (currentIndex === -1 || currentIndex === visibleElements.length - 1) {
      nextIndex = 0; // Йдемо на початок (Кільце)
    } else {
      nextIndex = currentIndex + 1;
    }
  }

  const nextElement = visibleElements[nextIndex];

  if (nextElement) {
    nextElement.focus();
    if (nextElement instanceof HTMLInputElement) {
      nextElement.select();
    }
  }
};
