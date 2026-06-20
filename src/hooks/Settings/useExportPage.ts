import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { subDays, endOfDay, format } from "date-fns";
import { uk, enGB } from "date-fns/locale";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

import { useAuth } from "../../context/AuthContext";
import { useStatsExport } from "../Stats/useStatsExport";
import { getExportData, getExportBackup } from "../../services/apiExport";
import { getAccountsApi } from "../../services/apiAccounts";
import { getCategoriesApi } from "../../services/apiCategories";
import {
  getCounterpartiesApi,
  getCpCategoriesApi,
} from "../../services/apiCounterparties";
import { getFamilyMembers } from "../../services/apiUsers";
import {
  generateXLSX,
  generateCSV,
  generatePDF,
} from "../../utils/fileGenerators";

export const useExportPage = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const isChild = user?.role_id === "child";

  // --- UI State ---
  const [activeTab, setActiveTab] = useState<"transactions" | "stats" | "backup">(
    "transactions"
  );
  const [loading, setLoading] = useState(false);

  // --- Date Range ---
  const [dateRange, setDateRange] = useState({
    from: subDays(new Date(), 30).getTime(),
    to: endOfDay(new Date()).getTime(),
  });

  // --- Transactions Filters & Format ---
  const [transFilters, setTransFilters] = useState({
    accountIds: [] as string[],
    categoryIds: [] as string[],
    counterpartyIds: [] as string[],
    userIds: [] as string[],
    type: [] as string[],
  });
  const [transFormat, setTransFormat] = useState<"xlsx" | "csv" | "pdf">(
    "xlsx"
  );

  // --- Stats Filters & Options ---
  const [statsAccountIds, setStatsAccountIds] = useState<string[]>([]);
  const [statsOptions, setStatsOptions] = useState({
    summary: true,
    topTransactions: true,
    categories: true,
    counterparties: false,
    tags: false,
  });

  // --- Hooks ---
  const { generateReport, loading: statsLoading } = useStatsExport();

  // --- Data Fetching ---
  const { data: accounts } = useQuery({
    queryKey: ["accounts"],
    queryFn: getAccountsApi,
  });
  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategoriesApi,
  });
  const { data: counterparties } = useQuery({
    queryKey: ["counterparties"],
    queryFn: getCounterpartiesApi,
  });
  const { data: cpCategories } = useQuery({
    queryKey: ["cp-categories"],
    queryFn: getCpCategoriesApi,
  });
  const { data: users } = useQuery({
    queryKey: ["family-members"],
    queryFn: getFamilyMembers,
  });

  // --- Configs ---
  const filterConfigs = useMemo(
    () => [
      {
        key: "type",
        label: t("categories:categoriesPage.filter_type_label"),
        type: "multi-select",
        options: [
          {
            label: t("categories:categoriesPage.filter_expense"),
            value: "expense",
            icon: "HiArrowTrendingDown",
            color: "#ef4444",
          },
          {
            label: t("categories:categoriesPage.filter_income"),
            value: "income",
            icon: "HiArrowTrendingUp",
            color: "#22c55e",
          },
          {
            label: t("legacy:transactionFiltersHook.filter_type_transfer"),
            value: "transfer",
            icon: "HiArrowsRightLeft",
            color: "#3b82f6",
          },
        ],
      },
      {
        key: "accountIds",
        label: t("accounts:accountsFilter.owner_label"),
        type: "multi-select",
        options: (accounts || []).map((a: any) => ({
          label: a.name,
          value: a.id,
          icon: a.type === "cash" ? "HiBanknotes" : "HiCreditCard",
          color: a.color || "#6b7280",
        })),
      },
      {
        key: "categoryIds",
        label: t("categories:categoriesPage.title"),
        type: "multi-select",
        treeType: "categories",
        rawData: categories || [],
        options: [],
      },
      {
        key: "counterpartyIds",
        label: t("counterparties:counterpartiesPage.title"),
        type: "multi-select",
        treeType: "counterparties",
        rawData: counterparties || [],
        relatedData: cpCategories || [],
        options: [],
      },
      {
        key: "userIds",
        label: t("export_import:exportPage.label_who"),
        type: "multi-select",
        options: (users || []).map((u: any) => ({
          label: u.name,
          value: u.id,
          icon: "HiUser",
          logo: u.avatar_url,
        })),
      },
    ],
    [accounts, categories, counterparties, cpCategories, users, t]
  );

  // --- Handlers ---
  const handleTransFilterChange = (key: string, val: string[]) => {
    setTransFilters((prev) => ({ ...prev, [key]: val }));
  };

  const toggleStatsOption = (key: keyof typeof statsOptions) => {
    setStatsOptions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // --- Action: Export Transactions ---
  const handleExportTransactions = async () => {
    setLoading(true);
    const toastId = toast.loading(t("export_import:exportPage.status_generating"));
    try {
      const data = await getExportData({
        from: dateRange.from,
        to: dateRange.to,
        ...transFilters,
      });

      if (!data?.length) {
        toast.error(t("export_import:exportPage.status_empty"), { id: toastId });
        return;
      }

      const fileName = `Export_${new Date().toISOString().slice(0, 10)}`;

      if (transFormat === "xlsx") await generateXLSX(data, fileName, t);
      if (transFormat === "csv") generateCSV(data, fileName, t);
      if (transFormat === "pdf") generatePDF(data, fileName, t);

      toast.success(t("export_import:exportPage.status_ready", { count: data.length }), {
        id: toastId,
      });
    } catch (error) {
      toast.error(t("export_import:exportPage.status_error"), { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  // --- Action: Export Stats ---
  const handleExportStats = async () => {
    const currentLocale = i18n.language === "uk" ? uk : enGB;
    const label = `${format(dateRange.from, "d MMM", {
      locale: currentLocale,
    })} - ${format(dateRange.to, "d MMM yyyy", { locale: currentLocale })}`;

    await generateReport(
      { from: dateRange.from, to: dateRange.to, accountIds: statsAccountIds },
      statsOptions,
      label
    );
  };

  // --- Action: Export Backup ---
  const handleExportBackup = async () => {
    setLoading(true);
    const toastId = toast.loading(t("export_import:exportPage.status_generating_backup"));
    try {
      const blob = await getExportBackup();
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Backup_${new Date().toISOString().slice(0, 10)}.json`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      
      toast.success(t("export_import:exportPage.status_backup_ready"), { id: toastId });
    } catch (error: any) {
      toast.error(error.message || t("export_import:exportPage.status_error"), { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const handleExport =
    activeTab === "transactions" 
      ? handleExportTransactions 
      : activeTab === "stats" 
      ? handleExportStats
      : handleExportBackup;

  return {
    state: {
      activeTab,
      loading: loading || statsLoading,
      dateRange,
      transFilters,
      transFormat,
      statsAccountIds,
      statsOptions,
      filterConfigs,
      isChild,
    },
    actions: {
      setActiveTab,
      setDateRange,
      handleTransFilterChange,
      setTransFormat,
      setStatsAccountIds,
      toggleStatsOption,
      handleExport,
    },
    t,
  };
};
