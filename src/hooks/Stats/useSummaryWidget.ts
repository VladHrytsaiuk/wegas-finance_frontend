import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

import { statsService, type StatsFilter } from "../../services/apiStats";
import { useSettings } from "../../context/SettingsContext";

interface UseSummaryWidgetProps {
  globalFilter: StatsFilter;
}

export const useSummaryWidget = ({ globalFilter }: UseSummaryWidgetProps) => {
  const { t } = useTranslation();
  const { currency, language } = useSettings();

  const targetAccountIds = useMemo(() => {
    return globalFilter.accountIds ?? [];
  }, [globalFilter.accountIds]);

  const { data: balanceStats } = useQuery({
    queryKey: ["stats", "balance", targetAccountIds, currency],
    queryFn: () =>
      statsService.getDashboard({
        from: 0,
        to: 0,
        accountIds: targetAccountIds,
        currency,
      }),
  });

  const { data: periodStats, isLoading: isStatsLoading } = useQuery({
    queryKey: ["stats", "summary", globalFilter, targetAccountIds, currency],
    queryFn: () =>
      statsService.getDashboard({
        ...globalFilter,
        accountIds: targetAccountIds,
        currency,
      }),
  });

  const totalBalance = balanceStats?.total_balance || 0;
  const totalIncome = periodStats?.total_income || 0;
  const totalExpense = periodStats?.total_expense || 0;

  return {
    totals: {
      balance: totalBalance,
      income: totalIncome,
      expense: totalExpense,
    },
    meta: {
      currency,
      language,
      isLoading: isStatsLoading,
    },
    t,
  };
};
