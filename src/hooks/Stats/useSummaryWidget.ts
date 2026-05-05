import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

import { statsService, type StatsFilter } from "../../services/apiStats";
import { getAccountsApi } from "../../services/apiAccounts"; // Використовуємо сервіс замість axios напряму
import { useSettings } from "../../context/SettingsContext";

interface UseSummaryWidgetProps {
  globalFilter: StatsFilter;
}

export const useSummaryWidget = ({ globalFilter }: UseSummaryWidgetProps) => {
  const { t } = useTranslation();
  const { currency, language } = useSettings();

  // 1. Завантажуємо рахунки (щоб отримати IDs, якщо фільтр порожній)
  const { data: accounts = [], isLoading: isAccountsLoading } = useQuery({
    queryKey: ["accounts"],
    queryFn: getAccountsApi,
  });

  // 2. Формуємо список ID для запиту
  const targetAccountIds = useMemo(() => {
    if (globalFilter.accountIds && globalFilter.accountIds.length > 0) {
      return globalFilter.accountIds;
    }
    // Якщо фільтр не вибрано, беремо всі доступні
    return accounts.map((acc: any) => acc.id);
  }, [globalFilter.accountIds, accounts]);

  // 3. Запит статистики
  const { data: stats, isLoading: isStatsLoading } = useQuery({
    queryKey: ["dashboardStats", globalFilter, targetAccountIds, currency],
    queryFn: () =>
      statsService.getDashboard({
        ...globalFilter,
        accountIds: targetAccountIds,
        currency,
      }),
    enabled: targetAccountIds.length > 0,
  });

  const isLoading = isStatsLoading || isAccountsLoading;

  const totalBalance = stats?.total_balance || 0;
  const totalIncome = stats?.total_income || 0;
  const totalExpense = stats?.total_expense || 0;

  return {
    totals: {
      balance: totalBalance,
      income: totalIncome,
      expense: totalExpense,
    },
    meta: {
      currency,
      language,
      isLoading,
    },
    t,
  };
};
