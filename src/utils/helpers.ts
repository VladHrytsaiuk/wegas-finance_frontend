import { format, isToday, isYesterday } from "date-fns";
import { uk, enUS } from "date-fns/locale";

type DatedAmountEntity = {
  date: number | string;
  amount: number;
  id?: string | number | null;
};

const CURRENCY_SYMBOLS: Record<string, string> = {
  UAH: "₴",
  USD: "$",
  EUR: "€",
  GBP: "£",
  PLN: "zł",
  CHF: "₣",
};

// 🔥 ДОДАНО: Функція форматування дати для Goals
export const formatDate = (date: number | string, language: string = "uk") => {
  const currentLocale = language === "uk" ? uk : enUS;
  return format(new Date(date), "d MMMM yyyy", { locale: currentLocale });
};

// 🔥 ОНОВЛЕНО: Форматуємо число і примусово ставимо свій символ
export const formatMoney = (
  amount: number = 0,
  currency: string = "UAH",
  language: string = "uk",
  showDecimals: boolean = true, // 🔥 Додано параметр для керування копійками
) => {
  const locale = language === "uk" ? "uk-UA" : "en-US";
  const value = amount / 100;

  // 1. Форматуємо число з урахуванням нашого параметра
  const formattedNumber = new Intl.NumberFormat(locale, {
    style: "decimal",
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0,
  }).format(value);

  // 2. Беремо красивий символ, або залишаємо код
  const symbol =
    CURRENCY_SYMBOLS[currency.toUpperCase()] || currency.toUpperCase();

  // 3. Збираємо докупи: 1 499 ₴ або 1 499,00 ₴
  return `${formattedNumber} ${symbol}`;
};

// 🔥 ОНОВЛЕНА ФУНКЦІЯ ГРУПУВАННЯ + СОРТУВАННЯ ВСЕРЕДИНІ
export const groupTransactionsByDate = (
  transactions: DatedAmountEntity[],
  language: string = "uk",
  sortValue: string = "date-desc", // ✅ Додали параметр сортування
) => {
  const groups: Record<string, DatedAmountEntity[]> = {};
  const currentLocale = language === "uk" ? uk : enUS;

  // 1. Спочатку просто розкладаємо по днях
  transactions.forEach((tx) => {
    const date = new Date(tx.date);
    let key = "";

    if (isToday(date)) {
      key = "today";
    } else if (isYesterday(date)) {
      key = "yesterday";
    } else {
      key = format(date, "d MMMM yyyy", { locale: currentLocale });
    }

    if (!groups[key]) groups[key] = [];
    groups[key].push(tx);
  });

  // 2. Тепер сортуємо КОЖНУ групу окремо
  Object.keys(groups).forEach((key) => {
    groups[key].sort((a, b) => {
      // Якщо обрано сортування за сумою (більша -> менша)
      if (sortValue === "amount-desc") {
        return b.amount - a.amount;
      }
      // Якщо обрано сортування за сумою (менша -> більша)
      if (sortValue === "amount-asc") {
        return a.amount - b.amount;
      }

      // Дефолтне сортування (date-desc) - хронологічне (новіші зверху)
      // Порівнюємо точний час (date)
      return b.date - a.date;
    });
  });

  return groups;
};

export const sortTransactions = <T extends DatedAmountEntity>(transactions: T[]) => {
  return [...transactions].sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    // Сортуємо чисто хронологічно: новіші зверху
    if (dateA !== dateB) return dateB - dateA;
    // Стабілізація за ID
    return (b.id || "").toString().localeCompare((a.id || "").toString());
  });
};

/**
 * Генерує правильний шлях для завантажених файлів (чеки, фото активів).
 * * Логіка:
 * 1. Якщо це вже повне посилання (http) або Base64 -> повертає як є.
 * 2. Локальна розробка -> додає URL бекенду (напр. http://localhost:8080/uploads/...)
 * 3. Продакшн (Vercel) -> додає префікс /wegasfinance для спрацьовування vercel.json rewrites.
 */
export const getUploadedFileUrl = (
  path: string | undefined | null,
): string | undefined => {
  if (!path) return undefined;
  if (path.startsWith("http") || path.startsWith("data:")) return path;

  // Локальна розробка
  if (import.meta.env.DEV) {
    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8080";
    const baseUrl = apiUrl.endsWith("/api") ? apiUrl.slice(0, -4) : apiUrl;
    return `${baseUrl}${path}`;
  }

  // Продакшн (Vercel)
  return `/wegasfinance${path}`;
};
