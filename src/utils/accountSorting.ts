import type { Account } from "../services/apiAccounts";

const TYPE_PRIORITY: Record<string, number> = {
  card: 1,
  cash: 2,
  savings: 3,
  piggy_bank: 3,
  crypto: 4,
};

const BANK_PRIORITY: Record<string, number> = {
  monobank: 1,
  privat: 2,
  raiffeisen: 3,
  ukrsib: 4,
  pumb: 5,
  sense: 6,
  oschad: 7,
  other: 99,
};

export const normalizeAccountType = (type?: string) => {
  if (type === "piggy_bank") return "savings";
  return type || "other";
};

export const identifyAccountBank = (account: Account): string => {
  if (account.type !== "card") return "other";

  const raw = `${account.bank_name || ""} ${account.icon || ""}`.toLowerCase();

  if (raw.includes("mono")) return "monobank";
  if (raw.includes("privat")) return "privat";
  if (raw.includes("raif")) return "raiffeisen";
  if (raw.includes("ukrsib")) return "ukrsib";
  if (raw.includes("pumb")) return "pumb";
  if (raw.includes("sense")) return "sense";
  if (raw.includes("oschad")) return "oschad";

  return account.bank_name || "other";
};

export const compareAccountsByDisplayOrder = (a: Account, b: Account) => {
  const typeDiff =
    (TYPE_PRIORITY[normalizeAccountType(a.type)] ?? 99) -
    (TYPE_PRIORITY[normalizeAccountType(b.type)] ?? 99);

  if (typeDiff !== 0) return typeDiff;

  if (normalizeAccountType(a.type) === "card") {
    const bankDiff =
      (BANK_PRIORITY[identifyAccountBank(a)] ?? 99) -
      (BANK_PRIORITY[identifyAccountBank(b)] ?? 99);

    if (bankDiff !== 0) return bankDiff;
  }

  const nameDiff = a.name.localeCompare(b.name, "uk", { sensitivity: "base" });
  if (nameDiff !== 0) return nameDiff;

  return (a.created_at || 0) - (b.created_at || 0);
};

export const sortAccountsByDisplayOrder = <T extends Account>(accounts: T[]) =>
  [...accounts].sort(compareAccountsByDisplayOrder);
