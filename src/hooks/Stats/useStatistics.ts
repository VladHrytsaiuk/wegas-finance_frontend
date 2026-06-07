import { useState, useEffect, useMemo } from "react";
import { startOfMonth, endOfMonth, subDays } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

import { statsService, type StatsFilter } from "../../services/apiStats";
import { getCategoriesApi } from "../../services/apiCategories";
import { getCounterpartiesApi } from "../../services/apiCounterparties";
import { useSettings } from "../../context/SettingsContext";
import { useHeader } from "../../context/HeaderContext";

// --- Helpers ---
const stringToColor = (str: string) => {
  if (!str) return "#9ca3af";
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = Math.abs(hash % 360);
  return `hsl(${h}, 65%, 45%)`;
};

export const useStatistics = () => {
  const { t } = useTranslation();
  const { currency } = useSettings();
  const { setPageTitle, resetPageTitle } = useHeader();

  // --- Title Management ---
  useEffect(() => {
    setPageTitle(t("stats_utility:statisticsPage.title"), t("stats_utility:statisticsPage.subtitle"));
    return () => resetPageTitle();
  }, [setPageTitle, resetPageTitle, t]);

  // --- Local State ---
  const [filter, setFilter] = useState<StatsFilter>({
    from: subDays(new Date(), 30).getTime(),
    to: new Date().getTime(),
    label: t("legacy:filters.periods.last_30_days"),
    accountIds: [],
  });

  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [flowType, setFlowType] = useState<"expense" | "income">("expense");
  const [activeTab, setActiveTab] = useState<
    "category" | "counterparty" | "tag"
  >("category");

  // --- Queries ---
  const { data: listData = [], isLoading: isListLoading } = useQuery({
    queryKey: ["stats", "list", flowType, activeTab, filter, currency],
    queryFn: () =>
      statsService.getTopStats(flowType, activeTab, { ...filter, currency }),
    placeholderData: (prev) => prev,
  });

  const { data: categories = [], isLoading: isCatLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategoriesApi,
    staleTime: 5 * 60 * 1000,
  });

  const { data: counterparties = [], isLoading: isCpLoading } = useQuery({
    queryKey: ["counterparties"],
    queryFn: getCounterpartiesApi,
    staleTime: 5 * 60 * 1000,
  });

  const isLoading = isListLoading || isCatLoading || isCpLoading;

  // --- Data Transformation (Enrichment) ---
  const enrichedData = useMemo(() => {
    if (!listData) return [];

    return listData.map((item) => {
      let finalColor = item.color;
      let finalIcon = item.icon;
      let finalLogo = item.logo;

      // Logic for Categories
      if (activeTab === "category") {
        const found = categories.find(
          (c: any) => String(c.id) === String(item.id) || c.name === item.name
        );
        finalColor = found?.color || item.color || stringToColor(item.name);
        finalIcon = found?.icon || item.icon;
        if (found?.logo) finalLogo = found.logo;
      }

      // Logic for Counterparties
      if (activeTab === "counterparty") {
        const foundCP = counterparties.find(
          (c: any) => String(c.id) === String(item.id) || c.name === item.name
        );

        const nestedCategory = foundCP?.category;
        let parentCat = null;
        if (!nestedCategory && foundCP?.category_id) {
          parentCat = categories.find(
            (c: any) => String(c.id) === String(foundCP.category_id)
          );
        }

        finalColor =
          foundCP?.color || nestedCategory?.color || parentCat?.color;
        if (!finalColor) finalColor = stringToColor(item.name);

        finalIcon =
          foundCP?.icon || nestedCategory?.icon || parentCat?.icon || item.icon;
        if (foundCP?.logo) finalLogo = foundCP.logo;
      }

      // Logic for Tags
      if (activeTab === "tag") {
        finalColor = item.color || stringToColor(item.name);
      }

      return {
        ...item,
        icon: finalIcon,
        color: finalColor,
        logo: finalLogo,
      };
    });
  }, [listData, activeTab, categories, counterparties]);

  const totalSum =
    (listData || []).reduce((acc, item) => acc + item.total, 0) || 0;

  // --- Handlers ---
  const handleFilterChange = (updates: Partial<StatsFilter>) => {
    setFilter((prev) => ({ ...prev, ...updates }));
  };

  return {
    state: {
      filter,
      isExportModalOpen,
      flowType,
      activeTab,
      enrichedData,
      totalSum,
      currency,
      isLoading,
    },
    actions: {
      setFilter,
      handleFilterChange,
      setIsExportModalOpen,
      setFlowType,
      setActiveTab,
    },
    t,
  };
};
