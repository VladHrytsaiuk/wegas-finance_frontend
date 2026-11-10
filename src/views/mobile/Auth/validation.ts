// Підказки до відправки форм; остаточно все перевіряє бекенд.

/** Простий розбір email. */
export const looksLikeEmail = (value: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

/** Бекенд вимагає щонайменше 6 символів. */
export const MIN_PASSWORD = 6;
