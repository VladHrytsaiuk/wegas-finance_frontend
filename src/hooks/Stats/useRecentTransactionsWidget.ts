import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { statsService, type StatsFilter } from "../../services/apiStats";
import { getCategoriesApi } from "../../services/apiCategories";
import { getAccountsApi } from "../../services/apiAccounts";
import { useSettings } from "../../context/SettingsContext";
import { sortTransactions } from "../../utils/helpers";

interface UseRecentTransactionsWidgetProps {
  globalFilter: StatsFilter;
  onDiverge?: () => void;
}

export const useRecentTransactionsWidget = ({
  globalFilter,
  onDiverge,
}: UseRecentTransactionsWidgetProps) => {
  const { t } = useTranslation();
  const { currency, language } = useSettings();
  const navigate = useNavigate();

  // Local Filter State
  const globalFilterKey = JSON.stringify(globalFilter);
  const [localFilterOverride, setLocalFilterOverride] = useState<{
    sourceKey: string;
    value: StatsFilter;
  } | null>(null);
  const localFilter =
    localFilterOverride?.sourceKey === globalFilterKey
      ? localFilterOverride.value
      : globalFilter;

  const handleFilterUpdate = (updates: Partial<StatsFilter>) => {
    setLocalFilterOverride((prev) => ({
      sourceKey: globalFilterKey,
      value: {
        ...(prev?.sourceKey === globalFilterKey ? prev.value : localFilter),
        ...updates,
      },
    }));
    if (onDiverge) onDiverge();
  };

  // --- Queries ---

  // 1. Transactions
  const { data: transactionsData, isLoading: isLoadingTx } = useQuery({
    queryKey: [
      "stats",
      "recent",
      localFilter.accountIds,
      localFilter.from,
      localFilter.to,
    ],
    queryFn: () =>
      statsService.getRecent(localFilter.accountIds, {
        from: localFilter.from,
        to: localFilter.to,
      }),
  });

  // 2. Categories (Needed for Item display)
  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategoriesApi,
    staleTime: 10 * 60 * 1000,
  });

  // 3. Accounts (Needed for Item display)
  const { data: accounts = [] } = useQuery({
    queryKey: ["accounts"],
    queryFn: getAccountsApi,
    staleTime: 10 * 60 * 1000,
  });

  // Sort & Limit
  const recentItems = useMemo(() => {
    if (!transactionsData) return [];
    return sortTransactions(transactionsData).slice(0, 5);
  }, [transactionsData]);

  const handleNavigateToAll = () => {
    navigate("/transactions");
  };

  const handleNavigateToDetails = (id: string) => {
    navigate(`/transactions/${id}`);
  };

  return {
    state: {
      recentItems,
      isLoadingTx,
      categories,
      accounts,
      localFilter,
      currency,
      language,
    },
    actions: {
      handleFilterUpdate,
      handleNavigateToAll,
      handleNavigateToDetails,
    },
    t,
  };
};
