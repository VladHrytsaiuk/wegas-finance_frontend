import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

import { statsService, type StatsFilter } from "../../services/apiStats";
import { getCategoriesApi } from "../../services/apiCategories";
import { getCounterpartiesApi } from "../../services/apiCounterparties";
import { useSettings } from "../../context/SettingsContext";

// Helper for random color generation
const stringToColor = (str: string) => {
  if (!str) return "#9ca3af";
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = Math.abs(hash % 360);
  return `hsl(${h}, 65%, 45%)`;
};

export interface DataItem {
  name: string;
  total: number;
  color?: string;
  [key: string]: any;
}

interface UseExpensesPieWidgetProps {
  globalFilter?: StatsFilter;
  onDiverge?: () => void;
  data?: DataItem[];
  type?: "income" | "expense";
  activeTab?: "category" | "counterparty" | "tag";
  currency?: string;
}

export const useExpensesPieWidget = ({
  globalFilter,
  onDiverge,
  data: externalData,
  type = "expense",
  activeTab = "category",
  currency: externalCurrency,
}: UseExpensesPieWidgetProps) => {
  const { t } = useTranslation();
  const { currency: contextCurrency, language } = useSettings();
  const currency = externalCurrency || contextCurrency;

  // Local Filter
  const [localFilter, setLocalFilter] = useState<StatsFilter>(
    globalFilter || { from: 0, to: 0, label: "", accountIds: [] }
  );

  // Sync Global Filter
  useEffect(() => {
    if (globalFilter) setLocalFilter(globalFilter);
  }, [globalFilter]);

  const handleFilterUpdate = (updates: Partial<StatsFilter>) => {
    setLocalFilter((prev) => ({ ...prev, ...updates }));
    if (onDiverge) onDiverge();
  };

  const shouldFetch = !externalData;

  // --- Queries ---
  const { data: fetchedData, isLoading: isDataLoading } = useQuery({
    queryKey: ["structurePie", type, activeTab, localFilter, currency],
    queryFn: () =>
      statsService.getTopStats(type, activeTab, { ...localFilter, currency }),
    enabled: shouldFetch,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategoriesApi,
    staleTime: 10 * 60 * 1000,
    enabled: shouldFetch,
  });

  const { data: counterparties = [] } = useQuery({
    queryKey: ["counterparties"],
    queryFn: getCounterpartiesApi,
    staleTime: 10 * 60 * 1000,
    enabled: shouldFetch && activeTab === "counterparty",
  });

  // --- Data Processing ---
  const rawData = externalData || fetchedData || [];
  const isLoading = shouldFetch ? isDataLoading : false;

  const chartData = useMemo(() => {
    if (!rawData || rawData.length === 0) return [];

    const sorted = [...rawData].sort((a, b) => b.total - a.total);

    const enrichColor = (item: any) => {
      if (item.color) return item.color;
      let color = item.metadata;

      if (shouldFetch) {
        if (activeTab === "category") {
          const cat = categories.find(
            (c: any) => String(c.id) === String(item.id)
          );
          if (cat?.color) color = cat.color;
        } else if (activeTab === "counterparty") {
          const cp = counterparties.find(
            (c: any) => String(c.id) === String(item.id)
          );
          if (cp) {
            if (cp.color) color = cp.color;
            else if (cp.category?.color) color = cp.category.color;
            else if (cp.category_id) {
              const parentCat = categories.find(
                (c: any) => String(c.id) === String(cp.category_id)
              );
              if (parentCat?.color) color = parentCat.color;
            }
          }
        }
      }
      return color || stringToColor(item.name);
    };

    let result = [];
    if (sorted.length <= 6) {
      result = sorted.map((item) => ({
        name: item.name,
        value: item.total,
        color: enrichColor(item),
      }));
    } else {
      const top5 = sorted.slice(0, 5);
      const others = sorted.slice(5);
      const othersTotal = others.reduce((acc, curr) => acc + curr.total, 0);

      result = top5.map((item) => ({
        name: item.name,
        value: item.total,
        color: enrichColor(item),
      }));

      if (othersTotal > 0) {
        result.push({
          name: t("dashboard.filter_other", "Інше"),
          value: othersTotal,
          color: "#9ca3af",
        });
      }
    }
    return result;
  }, [rawData, categories, counterparties, shouldFetch, activeTab, t]);

  const widgetTitle = useMemo(() => {
    if (activeTab === "counterparty") return t("dashboard.widget_top_shops");
    if (activeTab === "tag") return t("statisticsPage.tab_tags");

    return type === "income"
      ? t("dashboard.income_period")
      : t("dashboard.widget_top_categories");
  }, [activeTab, type, t]);

  return {
    state: {
      chartData,
      isLoading,
      localFilter,
      shouldFetch,
      currency,
      language,
      widgetTitle,
    },
    actions: {
      handleFilterUpdate,
    },
    t,
  };
};
