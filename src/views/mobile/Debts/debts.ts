import type { Counterparty } from "../../../types";

// Розподіл людей за боргами й підсумки по валютах (як на старій сторінці боргів).

/** Менше копійки — вже не борг. */
const EPS = 1;

export type DebtGroup = "debtor" | "creditor" | "settled";

export interface DebtGroups {
  debtors: Counterparty[];
  creditors: Counterparty[];
  /** Колись був борг (є записи балансу), зараз усе по нулях. */
  settled: Counterparty[];
  owedToMe: Record<string, number>;
  iOwe: Record<string, number>;
  net: Record<string, number>;
}

export const positiveBalances = (cp: Counterparty) =>
  (cp.balances ?? []).filter((b) => b.balance > EPS);
export const negativeBalances = (cp: Counterparty) =>
  (cp.balances ?? []).filter((b) => b.balance < -EPS);

export function groupDebts(
  counterparties: Counterparty[],
  currency?: string,
): DebtGroups {
  const groups: DebtGroups = {
    debtors: [],
    creditors: [],
    settled: [],
    owedToMe: {},
    iOwe: {},
    net: {},
  };
  for (const cp of counterparties) {
    const balances = (cp.balances ?? []).filter(
      (b) => !currency || b.currency === currency,
    );
    if (!balances.length) continue;
    const pos = balances.filter((b) => b.balance > EPS);
    const neg = balances.filter((b) => b.balance < -EPS);
    if (pos.length) groups.debtors.push(cp);
    if (neg.length) groups.creditors.push(cp);
    if (!pos.length && !neg.length) groups.settled.push(cp);
    for (const b of pos)
      groups.owedToMe[b.currency] =
        (groups.owedToMe[b.currency] || 0) + b.balance;
    for (const b of neg)
      groups.iOwe[b.currency] =
        (groups.iOwe[b.currency] || 0) + Math.abs(b.balance);
    for (const b of [...pos, ...neg])
      groups.net[b.currency] = (groups.net[b.currency] || 0) + b.balance;
  }
  return groups;
}

/** Валюти, в яких зараз є хоч один борг — для фільтра. */
export function debtCurrencies(counterparties: Counterparty[]) {
  const set = new Set<string>();
  for (const cp of counterparties)
    for (const b of cp.balances ?? [])
      if (Math.abs(b.balance) > EPS) set.add(b.currency);
  return [...set].sort();
}
