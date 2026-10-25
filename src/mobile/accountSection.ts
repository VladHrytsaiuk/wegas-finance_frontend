// Вид рахунку визначає розділ у списку Рахунків і запасну іконку.

export interface AccountLike {
  type?: string;
  goal_id?: string | null;
  bank_name?: string;
  card_type?: string;
  icon?: string;
}

export type AccountSection = "cards" | "cash" | "savings" | "crypto" | "other";

export const ACCOUNT_SECTIONS: { key: AccountSection; caption: string }[] = [
  { key: "cards", caption: "Картки" },
  { key: "cash", caption: "Готівка" },
  { key: "savings", caption: "Накопичення" },
  { key: "crypto", caption: "Крипта" },
  { key: "other", caption: "Інше" },
];

export function accountSection(account: AccountLike): AccountSection {
  const type = account.type;
  if (account.goal_id || type === "piggy_bank" || type === "savings") return "savings";
  if (type === "card") return "cards";
  if (type === "cash") return "cash";
  if (type === "crypto") return "crypto";
  return "other";
}
