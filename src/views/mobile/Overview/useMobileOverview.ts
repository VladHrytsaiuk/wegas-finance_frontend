import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { startOfMonth, endOfDay } from "date-fns";

import { useSettings } from "../../../context/SettingsContext";
import { statsService } from "../../../services/apiStats";
import { getAccountsApi } from "../../../services/apiAccounts";
import { getCategoriesApi } from "../../../services/apiCategories";
import { getCounterpartiesApi } from "../../../services/apiCounterparties";
import { getInboxPendingCountApi } from "../../../services/apiInbox";
import { getShoppingListsApi } from "../../../services/apiShopping";
import { getGoalsApi } from "../../../services/apiGoals";
import { getUsersApi } from "../../../services/apiUsers";
import { getMeters } from "../../../services/apiUtility";
import { formatMoney, sortTransactions } from "../../../utils/helpers";
import type { Account, Category } from "../../../types";
import type { TransactionListItem } from "../../../hooks/Transactions/useTransactionItem";
import type { Tint } from "../../../mobile/tokens";

export interface AttentionItem {
  key: string;
  title: string;
  subtitle: string;
  to: string;
  tint: Tint;
  icon: "inbox" | "owed" | "utility" | "debt";
}

const plural = (n: number, one: string, few: string, many: string) => {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
  return many;
};

export function useMobileOverview() {
  const { currency, language } = useSettings();
  // У підсумках копійки лише заважають.
  const money = (amount: number, cur = currency) => formatMoney(amount, cur, language, false);

  const [monthFrom, monthTo] = useMemo(() => {
    const now = new Date();
    return [startOfMonth(now).getTime(), endOfDay(now).getTime()];
  }, []);

  const balanceQuery = useQuery({
    queryKey: ["stats", "balance", [], currency],
    queryFn: () => statsService.getDashboard({ from: 0, to: 0, accountIds: [], currency }),
  });
  const monthQuery = useQuery({
    queryKey: ["stats", "month", monthFrom, currency],
    queryFn: () =>
      statsService.getDashboard({ from: monthFrom, to: monthTo, accountIds: [], currency }),
  });
  const recentQuery = useQuery({
    queryKey: ["stats", "recent", "overview"],
    queryFn: () => statsService.getRecent([], {}),
  });
  const { data: accounts = [] } = useQuery({ queryKey: ["accounts"], queryFn: getAccountsApi });
  const { data: categories = [] } = useQuery({ queryKey: ["categories"], queryFn: getCategoriesApi });
  const { data: counterparties = [] } = useQuery({
    queryKey: ["counterparties"],
    queryFn: getCounterpartiesApi,
  });
  const { data: inboxCount = 0 } = useQuery({
    queryKey: ["inbox", "pending-count"],
    queryFn: getInboxPendingCountApi,
    staleTime: 30 * 1000,
  });
  const { data: shoppingLists = [] } = useQuery({
    queryKey: ["shopping-lists"],
    queryFn: getShoppingListsApi,
  });
  const { data: goals = [] } = useQuery({ queryKey: ["goals"], queryFn: getGoalsApi });
  const { data: members = [] } = useQuery({ queryKey: ["users"], queryFn: getUsersApi });
  const { data: meters = [] } = useQuery({ queryKey: ["utilityMeters"], queryFn: getMeters });

  const recent = useMemo(
    () => sortTransactions((recentQuery.data ?? []) as TransactionListItem[]).slice(0, 3),
    [recentQuery.data],
  );

  // «Потребує уваги»: чеки, борги нам, комуналка, наші борги.
  const attention = useMemo<AttentionItem[]>(() => {
    const items: AttentionItem[] = [];

    if (inboxCount > 0) {
      items.push({
        key: "inbox",
        title: `${inboxCount} ${plural(inboxCount, "чек чекає", "чеки чекають", "чеків чекають")} розбору`,
        subtitle: "Підтвердьте збіг або оберіть рахунок",
        to: "/inbox",
        tint: "green",
        icon: "inbox",
      });
    }

    // Баланс контрагента: + нам винні, − ми винні (у валюті рахунку, без конвертації).
    const utilityIds = new Set(meters.map((m) => m.counterparty_id).filter(Boolean));
    const owedToUs: { name: string; amount: number }[] = [];
    let utilityDue = 0;
    let weOwe = 0;
    for (const cp of counterparties) {
      const balance = (cp.balances || [])
        .filter((b) => b.currency === currency)
        .reduce((sum, b) => sum + b.balance, 0);
      if (balance > 0) owedToUs.push({ name: cp.name, amount: balance });
      if (balance < 0 && utilityIds.has(cp.id)) utilityDue += -balance;
      else if (balance < 0) weOwe += -balance;
    }

    if (owedToUs.length > 0) {
      const total = owedToUs.reduce((sum, d) => sum + d.amount, 0);
      items.push({
        key: "owed",
        title: `Вам винні ${money(total)}`,
        subtitle: owedToUs
          .sort((a, b) => b.amount - a.amount)
          .map((d) => d.name)
          .join(", "),
        to: "/debts",
        tint: "blue",
        icon: "owed",
      });
    }
    if (utilityDue > 0) {
      items.push({
        key: "utility",
        title: "Комуналка до сплати",
        subtitle: money(utilityDue),
        to: "/utility",
        tint: "yellow",
        icon: "utility",
      });
    }
    if (weOwe > 0) {
      items.push({
        key: "debt",
        title: `Ви винні ${money(weOwe)}`,
        subtitle: "Відкриті борги",
        to: "/debts",
        tint: "orange",
        icon: "debt",
      });
    }
    return items;
    // money залежить лише від currency і language
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inboxCount, counterparties, meters, currency, language]);

  const shopping = useMemo(() => {
    const withLeft = shoppingLists
      .map((list) => ({ list, left: (list.items || []).filter((i) => !i.is_bought) }))
      .filter((x) => x.left.length > 0)
      .sort((a, b) => b.list.updated_at - a.list.updated_at);
    const first = withLeft[0];
    if (!first) return null;
    return {
      title: first.list.title,
      preview: first.left.slice(0, 3).map((i) => i.name).join(" · "),
      left: first.left.length,
    };
  }, [shoppingLists]);

  const goal = useMemo(() => {
    const active = goals
      .filter((g) => g.status === "active" && g.target_amount > 0)
      .map((g) => ({ g, pct: Math.min(100, Math.round((g.current_amount / g.target_amount) * 100)) }))
      .sort((a, b) => b.pct - a.pct);
    const first = active[0];
    if (!first) return null;
    return {
      id: first.g.id,
      name: first.g.name,
      pct: first.pct,
      progress: `${formatMoney(first.g.current_amount, first.g.currency, language, false)} з ${formatMoney(first.g.target_amount, first.g.currency, language, false)}`,
    };
  }, [goals, language]);

  return {
    isLoading: balanceQuery.isLoading,
    accountsCount: accounts.length,
    balance: balanceQuery.data?.total_balance ?? 0,
    monthExpense: monthQuery.data?.total_expense ?? 0,
    monthIncome: monthQuery.data?.total_income ?? 0,
    recent,
    accounts: accounts as unknown as Account[],
    categories: categories as Category[],
    attention,
    shopping,
    goal,
    members,
    currency,
    language,
  };
}
