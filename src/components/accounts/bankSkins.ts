export interface BankSkin {
  id: string; // Унікальний ключ
  bankId: string; // Група банку (mono, privat, raif...)
  designId: string; // Тип дизайну (black, gold, yellow...)
  label: string; // Назва в інтерфейсі

  // Стилі
  bg: string; // Фон (градієнт або колір)
  color: string; // Колір тексту (#fff або #000)
  border?: string; // Рамка (для темних карток на темному фоні)

  // Логотипи
  logoFile: string; // Велике лого (напр. card_monobank.svg)
  miniLogoFile: string; // Міні іконка (напр. icon_monobank.svg)
  logoWidth?: string; // Ширина для текстових логотипів
}

export function validateBankSkinsConfig(
  skins: Record<string, BankSkin> = BANK_SKINS,
) {
  const issues: string[] = [];
  const seenIds = new Set<string>();

  Object.entries(skins).forEach(([key, skin]) => {
    const expectedKey = `${skin.bankId}-${skin.designId}`;

    if (key !== "default" && key !== expectedKey) {
      issues.push(`Skin key mismatch: "${key}" should be "${expectedKey}"`);
    }

    if (skin.id !== key) {
      issues.push(`Skin id mismatch: "${key}" has id "${skin.id}"`);
    }

    if (seenIds.has(skin.id)) {
      issues.push(`Duplicate skin id: "${skin.id}"`);
    }

    seenIds.add(skin.id);
  });

  return issues;
}

export const BANK_SKINS: Record<string, BankSkin> = {
  // ============================================================
  // 🐈 MONOBANK
  // ============================================================
  "monobank-black": {
    id: "monobank-black",
    bankId: "monobank",
    designId: "black",
    label: "Black",
    bg: "linear-gradient(145deg, #1a1a1a 0%, #000000 100%)",
    color: "#ffffff",
    border: "1px solid #333",
    logoFile: "card_monobank",
    miniLogoFile: "icon_monobank",
    logoWidth: "90px",
  },
  "monobank-white": {
    id: "monobank-white",
    bankId: "monobank",
    designId: "white",
    label: "White",
    bg: "linear-gradient(145deg, #ffffff 0%, #f5f5f7 100%)",
    color: "#000000",
    border: "1px solid #e0e0e0",
    logoFile: "card_monobank",
    miniLogoFile: "icon_monobank",
    logoWidth: "90px",
  },
  "monobank-platinum": {
    id: "monobank-platinum",
    bankId: "monobank",
    designId: "platinum",
    label: "Platinum",
    bg: "linear-gradient(135deg, #323232 0%, #3e3e3e 40%, #1e1e1e 100%)",
    color: "#ffffff",
    border: "1px solid #444",
    logoFile: "card_monobank",
    miniLogoFile: "icon_monobank",
    logoWidth: "90px",
  },
  "monobank-iron": {
    id: "monobank-iron",
    bankId: "monobank",
    designId: "iron",
    label: "IRON",
    bg: "linear-gradient(135deg, #0f0f0f 0%, #262626 100%)",
    color: "#e5e5e5",
    border: "1px solid #4a5568",
    logoFile: "card_monobank",
    miniLogoFile: "icon_monobank",
    logoWidth: "90px",
  },
  "monobank-yellow": {
    id: "monobank-yellow",
    bankId: "monobank",
    designId: "yellow",
    label: "Дитяча",
    bg: "linear-gradient(135deg, #ffde00 0%, #ffc107 100%)",
    color: "#000000",
    logoFile: "card_monobank",
    miniLogoFile: "icon_monobank",
    logoWidth: "90px",
  },
  "monobank-madeInUkraine": {
    id: "monobank-madeInUkraine",
    bankId: "monobank",
    designId: "madeInUkraine", // Має співпадати з полем 'type' з JSON
    label: "Нац. Кешбек",
    // Патріотичний градієнт (синьо-жовтий)
    bg: "linear-gradient(135deg, #0057b7 0%, #2a5298 50%, #ffd700 100%)",
    color: "#ffffff",
    logoFile: "card_monobank",
    miniLogoFile: "icon_monobank",
    logoWidth: "90px",
  },

  // 📲 єПІДТРИМКА (diia)
  "monobank-diia": {
    id: "monobank-diia",
    bankId: "monobank",
    designId: "diia",
    label: "єПідтримка",
    // Фірмовий бірюзовий колір Дії
    bg: "linear-gradient(135deg, #2af598 0%, #009efd 100%)",
    color: "#ffffff",
    logoFile: "card_monobank",
    miniLogoFile: "icon_monobank",
    logoWidth: "90px",
  },

  // ============================================================
  // 🟢 PRIVATBANK
  // ============================================================
  "privat-universal": {
    id: "privat-universal",
    bankId: "privat",
    designId: "universal",
    label: "Універсальна",
    bg: "linear-gradient(135deg, #7db348 0%, #568a28 100%)",
    color: "#ffffff",
    logoFile: "card_privatbank",
    miniLogoFile: "icon_privatbank",
  },
  "privat-gold": {
    id: "privat-gold",
    bankId: "privat",
    designId: "gold",
    label: "Gold",
    bg: "linear-gradient(135deg, #cfaa60 0%, #a67c00 100%)",
    color: "#ffffff",
    logoFile: "card_privatbank",
    miniLogoFile: "icon_privatbank",
  },
  "privat-platinum": {
    id: "privat-platinum",
    bankId: "privat",
    designId: "platinum",
    label: "Platinum",
    bg: "linear-gradient(135deg, #1f1f1f 0%, #000000 100%)",
    color: "#ffffff",
    logoFile: "card_privatbank",
    miniLogoFile: "icon_privatbank",
  },
  "privat-payment": {
    id: "privat-payment",
    bankId: "privat",
    designId: "payment",
    label: "Для виплат",
    bg: "linear-gradient(135deg, #fff 0%, #f0f0f0 100%)",
    color: "#333333",
    logoFile: "card_privatbank",
    miniLogoFile: "icon_privatbank",
  },
  "privat-digital": {
    id: "privat-digital",
    bankId: "privat",
    designId: "digital",
    label: "Digital",
    bg: "linear-gradient(135deg, #5c258d 0%, #4389a2 100%)",
    color: "#ffffff",
    logoFile: "card_privatbank",
    miniLogoFile: "icon_privatbank",
  },
  "privat-junior": {
    id: "privat-junior",
    bankId: "privat",
    designId: "junior",
    label: "Юніор",
    bg: "linear-gradient(135deg, #ffde00 0%, #ffc107 100%)",
    color: "#000000",
    logoFile: "card_privatbank",
    miniLogoFile: "icon_privatbank",
  },

  // 🇺🇦 ПРИВАТ: НАЦІОНАЛЬНИЙ КЕШБЕК
  "privat-madeInUkraine": {
    id: "privat-madeInUkraine",
    bankId: "privat", // 🔥 Це включить шум (PrivatNoiseEffect)
    designId: "madeInUkraine",
    label: "Нац. Кешбек",
    // Патріотичний градієнт (Синій -> Жовтий)
    bg: "linear-gradient(135deg, #1e3c72 0%, #2a5298 50%, #f6d365 100%)",
    color: "#ffffff", // Білий текст (на синьому фоні читається добре)
    logoFile: "card_privatbank",
    miniLogoFile: "icon_privatbank",
  },

  // 📲 ПРИВАТ: єПІДТРИМКА
  "privat-diia": {
    id: "privat-diia",
    bankId: "privat", // 🔥 Шум буде і тут
    designId: "diia",
    label: "єПідтримка",
    // Фірмовий градієнт Дії (м'ятно-блакитний)
    bg: "linear-gradient(135deg, #2af598 0%, #009efd 100%)",
    color: "#ffffff",
    logoFile: "card_privatbank",
    miniLogoFile: "icon_privatbank",
  },

  // ============================================================
  // 🟡 RAIFFEISEN BANK (Aval)
  // ============================================================
  "raiffeisen-classic": {
    id: "raiffeisen-classic",
    bankId: "raiffeisen",
    designId: "classic",
    label: "Raifkarta",
    bg: "linear-gradient(135deg, #ffe600 0%, #f7d417 100%)",
    color: "#000000",
    logoFile: "card_raiffeisen",
    miniLogoFile: "icon_raiffeisen",
    logoWidth: "80px",
  },
  "raiffeisen-fishka": {
    id: "raiffeisen-fishka",
    bankId: "raiffeisen",
    designId: "fishka",
    label: "Fishka",
    bg: "linear-gradient(135deg, #ffffff 0%, #e0f2f1 100%)",
    color: "#006400", // Темно-зелений текст
    logoFile: "card_raiffeisen",
    miniLogoFile: "icon_raiffeisen",
    logoWidth: "80px",
  },
  "raiffeisen-premium": {
    id: "raiffeisen-premium",
    bankId: "raiffeisen",
    designId: "premium",
    label: "Premium",
    bg: "linear-gradient(135deg, #2c3e50 0%, #000000 100%)",
    color: "#ffffff",
    logoFile: "card_raiffeisen",
    miniLogoFile: "icon_raiffeisen",
    logoWidth: "80px",
  },
  "raiffeisen-atb": {
    id: "raiffeisen-atb",
    bankId: "raiffeisen",
    designId: "atb",
    label: "АТБ",
    bg: "linear-gradient(135deg, #ff0000 0%, #b30000 100%)",
    color: "#ffffff",
    logoFile: "card_raiffeisen",
    miniLogoFile: "icon_raiffeisen",
    logoWidth: "80px",
  },

  // ============================================================
  // 🟢 UKRSIBBANK
  // ============================================================
  "ukrsib-new": {
    id: "ukrsib-new",
    bankId: "ukrsib",
    designId: "new",
    label: "New Card",
    bg: "linear-gradient(135deg, #009c3d 0%, #007a30 100%)",
    color: "#ffffff",
    logoFile: "card_ukrsib", // Текст UKRSIBBANK
    miniLogoFile: "icon_ukrsib", // Зірочка
    logoWidth: "85px",
  },
  "ukrsib-black": {
    id: "ukrsib-black",
    bankId: "ukrsib",
    designId: "black",
    label: "Black Edition",
    bg: "linear-gradient(135deg, #121212 0%, #2d3436 100%)",
    color: "#ffffff",
    logoFile: "card_ukrsib",
    miniLogoFile: "icon_ukrsib",
    logoWidth: "85px",
  },
  "ukrsib-premium": {
    id: "ukrsib-premium",
    bankId: "ukrsib",
    designId: "premium",
    label: "Premium",
    bg: "linear-gradient(135deg, #003366 0%, #001f3f 100%)", // Темно-синій
    color: "#ffffff",
    logoFile: "card_ukrsib",
    miniLogoFile: "icon_ukrsib",
    logoWidth: "85px",
  },

  // ============================================================
  // 🔴 PUMB
  // ============================================================
  "pumb-black": {
    id: "pumb-black",
    bankId: "pumb",
    designId: "black",
    label: "всеКАРТА",
    bg: "linear-gradient(135deg, #1a1a1a 0%, #333 100%)",
    color: "#ffffff",
    logoFile: "card_pumb",
    miniLogoFile: "icon_pumb",
    logoWidth: "70px",
  },
  "pumb-solo": {
    id: "pumb-solo",
    bankId: "pumb",
    designId: "solo",
    label: "Solo (Prem)",
    bg: "linear-gradient(135deg, #bdc3c7 0%, #2c3e50 100%)", // Silver
    color: "#ffffff",
    logoFile: "card_pumb",
    miniLogoFile: "icon_pumb",
    logoWidth: "70px",
  },

  // ============================================================
  // 🌀 SENSE BANK (Alfa)
  // ============================================================
  "sense-white": {
    id: "sense-white",
    bankId: "sense",
    designId: "white",
    label: "White",
    bg: "linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%)",
    color: "#222222",
    logoFile: "card_sense",
    miniLogoFile: "icon_sense",
    logoWidth: "70px",
  },
  "sense-black": {
    id: "sense-black",
    bankId: "sense",
    designId: "black",
    label: "Black",
    bg: "linear-gradient(135deg, #232526 0%, #414345 100%)",
    color: "#ffffff",
    logoFile: "card_sense",
    miniLogoFile: "icon_sense",
    logoWidth: "70px",
  },
  "sense-chameleon": {
    id: "sense-chameleon",
    bankId: "sense",
    designId: "chameleon",
    label: "Chameleon",
    bg: "linear-gradient(135deg, #00c6ff 0%, #0072ff 100%)", // Яскраво-блакитний/синій
    color: "#ffffff",
    logoFile: "card_sense",
    miniLogoFile: "icon_sense",
    logoWidth: "70px",
  },

  // ============================================================
  // 🔵 OSCHADBANK
  // ============================================================
  "oschad-classic": {
    id: "oschad-classic",
    bankId: "oschad",
    designId: "classic",
    label: "Classic",
    bg: "#d4af37",
    color: "#111",
    logoFile: "card_oschadbank",
    miniLogoFile: "icon_oschadbank",
    logoWidth: "150px",
  },
  "oschad-credit": {
    id: "oschad-credit",
    bankId: "oschad",
    designId: "credit",
    label: "Credit",
    bg: "linear-gradient(135deg, #005a8c 0%, #003366 100%)",
    color: "#ffffff",
    logoFile: "card_oschadbank",
    miniLogoFile: "icon_oschadbank",
    logoWidth: "150px",
  },

  // ============================================================
  // ⚪ DEFAULT / OTHER
  // ============================================================
  default: {
    id: "default",
    bankId: "other",
    designId: "default",
    label: "Картка",
    bg: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "#ffffff",
    logoFile: "card_default",
    miniLogoFile: "icon_default",
  },
};

// Групи для табів у селекторі
export const BANK_GROUPS = {
  monobank: { label: "Monobank", id: "monobank" },
  privat: { label: "PrivatBank", id: "privat" },
  raiffeisen: { label: "Raiffeisen", id: "raiffeisen" },
  ukrsib: { label: "Ukrsibbank", id: "ukrsib" },
  pumb: { label: "PUMB", id: "pumb" },
  sense: { label: "Sense", id: "sense" },
  oschad: { label: "Oschad", id: "oschad" },
  other: { label: "Інші", id: "other" },
};

export const PAYMENT_SYSTEMS = [
  { value: "mastercard", label: "Mastercard" },
  { value: "visa", label: "Visa" },
];

export const CASH_COLORS = [
  "#10b981",
  "#f59f00",
  "#3b82f6",
  "#6366f1",
  "#ec4899",
  "#ef4444",
  "#8b5cf6",
  "#6b7280",
];
