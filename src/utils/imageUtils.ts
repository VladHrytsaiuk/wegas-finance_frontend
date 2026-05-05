/**
 * Генерує правильний шлях до логотипа.
 *
 * Логіка:
 * 1. Якщо це Base64 (починається з "data:") -> повертає рядок як є.
 * 2. Якщо це назва файлу (наприклад, "atb.svg") -> додає шлях до папки "/brands/".
 * 3. Якщо лого немає -> повертає undefined.
 *
 * @param logoIdentifier - Рядок з бази даних (ім'я файлу або Base64)
 */
export const getLogoSrc = (
  logoIdentifier: string | undefined | null
): string | undefined => {
  if (!logoIdentifier) return undefined;

  // Перевірка на Base64 (нові завантаження)
  if (logoIdentifier.startsWith("data:")) {
    return logoIdentifier;
  }

  // Перевірка на повний URL (на всяк випадок, якщо колись будуть зовнішні посилання)
  if (logoIdentifier.startsWith("http")) {
    return logoIdentifier;
  }

  // Стандартні файли в папці public/brands (наприклад, "atb.svg")
  // Браузер сам знайде їх за адресою http://site/brands/atb.svg
  return `/brands/${logoIdentifier}`;
};
