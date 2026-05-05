import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

import { useStatsExport } from "./useStatsExport";
import { getAccountsApi } from "../../services/apiAccounts";

interface UseExportStatsModalProps {
  initialFrom: number;
  initialTo: number;
  initialAccountIds?: string[];
  onClose: () => void;
}

export const useExportStatsModal = ({
  initialFrom,
  initialTo,
  initialAccountIds = [],
  onClose,
}: UseExportStatsModalProps) => {
  const { t } = useTranslation();
  const { generateReport, loading } = useStatsExport();

  // --- State ---
  const [dateRange, setDateRange] = useState({
    from: initialFrom,
    to: initialTo,
  });
  const [accountIds, setAccountIds] = useState<string[]>(initialAccountIds);

  const [options, setOptions] = useState({
    summary: true,
    topTransactions: true,
    categories: true,
    counterparties: false,
    tags: false,
  });

  // --- Data Fetching ---
  const { data: accounts } = useQuery({
    queryKey: ["accounts"],
    queryFn: getAccountsApi,
    staleTime: 5 * 60 * 1000,
  });

  // --- Configs ---
  const accountsConfig = useMemo(
    () => ({
      key: "accountIds",
      label: t("accounts:accountsFilter.owner_label"),
      type: "multi-select",
      options: (accounts || []).map((a: any) => ({
        label: a.name,
        value: a.id,
        icon: a.type === "cash" ? "HiBanknotes" : "HiCreditCard",
        color: a.color || "#6b7280",
      })),
    }),
    [accounts, t]
  );

  // --- Handlers ---
  const toggleOption = (key: keyof typeof options) => {
    setOptions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleExport = async () => {
    const label = t("export_import:exportStatsModal.user_period");
    await generateReport(
      { from: dateRange.from, to: dateRange.to, accountIds: accountIds },
      options,
      label
    );
    onClose();
  };

  return {
    state: {
      dateRange,
      accountIds,
      options,
      accountsConfig,
      loading,
    },
    actions: {
      setDateRange,
      setAccountIds,
      toggleOption,
      handleExport,
    },
    t,
  };
};
