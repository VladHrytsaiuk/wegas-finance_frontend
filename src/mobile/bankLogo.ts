import { BANK_SKINS } from "../components/accounts/bankSkins";

interface AccountLike {
  type?: string;
  bank_name?: string;
  card_type?: string;
  icon?: string;
}

// Ключові слова в bank_name → скін за замовчуванням для банку.
const BANK_DEFAULT_SKIN: [string, string][] = [
  ["mono", "monobank-black"],
  ["privat", "privat-universal"],
  ["pumb", "pumb-black"],
  ["oschad", "oschad-classic"],
  ["sense", "sense-black"],
  ["ukrsib", "ukrsib-new"],
  ["raif", "raif-yellow"],
];

/** Міні-логотип банку для картки (icon_monobank тощо) або null. */
export function bankLogo(account: AccountLike): string | null {
  if (account.type !== "card") return null;

  const bank = (account.bank_name || "").toLowerCase();
  const skin =
    (account.bank_name && account.card_type && BANK_SKINS[`${account.bank_name}-${account.card_type}`]) ||
    (account.icon && BANK_SKINS[account.icon]) ||
    BANK_SKINS[BANK_DEFAULT_SKIN.find(([key]) => bank.includes(key))?.[1] ?? ""];

  const logo = skin?.miniLogoFile;
  return logo && logo !== "icon_default" ? logo : null;
}
