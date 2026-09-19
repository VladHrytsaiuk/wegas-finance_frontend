/**
 * Повертає посилання, яке безпечно відкривати в новій вкладці, або undefined.
 * Дозволені лише http(s): "javascript:" чи "data:" з даних користувача
 * виконали б код у сесії застосунку. Адресу без схеми доповнює https://.
 */
export const safeExternalUrl = (raw?: string | null): string | undefined => {
  const value = raw?.trim();
  if (!value) return undefined;

  const withScheme = /^[a-z][a-z0-9+.-]*:/i.test(value) ? value : `https://${value}`;
  try {
    const url = new URL(withScheme);
    return url.protocol === "http:" || url.protocol === "https:" ? url.href : undefined;
  } catch {
    return undefined;
  }
};

export const openExternalUrl = (raw?: string | null) => {
  const url = safeExternalUrl(raw);
  if (url) window.open(url, "_blank", "noopener,noreferrer");
};
