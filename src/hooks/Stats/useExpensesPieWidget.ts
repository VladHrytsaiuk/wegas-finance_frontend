import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

import { statsService, type StatsFilter } from "../../services/apiStats";
import { getCategoriesApi } from "../../services/apiCategories";
import { getCounterpartiesApi } from "../../services/apiCounterparties";
import { useSettings } from "../../context/SettingsContext";
import type { Category, Counterparty } from "../../types";

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
  metadata?: string;
  logo?: string | null;
  icon?: string | null;
  id?: string;
}

type ChartDataItem = {
  name: string;
  value: number;
  color: string;
  logo: string | null;
  icon: string | null;
};

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
  const [localOverrides, setLocalOverrides] = useState<Partial<StatsFilter>>({});

  const localFilter = useMemo<StatsFilter>(
    () => ({
      from: globalFilter?.from ?? 0,
      to: globalFilter?.to ?? 0,
      accountIds: globalFilter?.accountIds ?? [],
      currency: globalFilter?.currency,
      ...localOverrides,
    }),
    [globalFilter, localOverrides],
  );

  const handleFilterUpdate = (updates: Partial<StatsFilter>) => {
    setLocalOverrides((prev) => ({ ...prev, ...updates }));
    if (onDiverge) onDiverge();
  };

  const shouldFetch = !externalData;

  // --- Queries ---
  const { data: fetchedData, isLoading: isDataLoading } = useQuery({
    queryKey: ["stats", "structurePie", type, activeTab, localFilter, currency],
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
  const isLoading = shouldFetch ? isDataLoading : false;

  const chartData = useMemo<ChartDataItem[]>(() => {
    const rawData = externalData || fetchedData || [];
    if (!rawData || rawData.length === 0) return [];

    const sorted = [...rawData].sort((a, b) => b.total - a.total);

    const enrichData = (item: DataItem) => {
      let color = item.color || item.metadata;
      let logo = item.logo || null;
      let icon = item.icon || null;

      if (shouldFetch) {
        if (activeTab === "category") {
          const cat = categories.find(
            (c: Category) => String(c.id) === String(item.id) || c.name === item.name
          );
          if (cat?.color) color = cat.color;
          if (cat?.icon) icon = cat.icon;
        } else if (activeTab === "counterparty") {
          const cp = counterparties.find(
            (c: Counterparty) =>
              String(c.id) === String(item.id) || c.name === item.name
          );
          if (cp) {
            if (cp.logo) logo = cp.logo;
            
            // Icon Logic: CP icon -> Category icon
            icon = cp.icon || cp.category?.icon;
            if (!icon && cp.category_id) {
              const parentCat = categories.find(
                (c: Category) => String(c.id) === String(cp.category_id)
              );
              if (parentCat?.icon) icon = parentCat.icon;
            }
            
            if (cp.color) color = cp.color;
            else if (cp.category?.color) color = cp.category.color;
            else if (cp.category_id) {
              const parentCat = categories.find(
                (c: Category) => String(c.id) === String(cp.category_id)
              );
              if (parentCat?.color) color = parentCat.color;
            }
          }
        }
      }
      return {
        color: color || stringToColor(item.name),
        logo,
        icon,
      };
    };

    let result: ChartDataItem[] = [];
    if (sorted.length <= 6) {
      result = sorted.map((item) => ({
        name: item.name,
        value: item.total,
        ...enrichData(item),
      }));
    } else {
      const top5 = sorted.slice(0, 5);
      const others = sorted.slice(5);
      const othersTotal = others.reduce((acc, curr) => acc + curr.total, 0);

      result = top5.map((item) => ({
        name: item.name,
        value: item.total,
        ...enrichData(item),
      }));

      if (othersTotal > 0) {
        result.push({
          name: t("dashboard:dashboard.filter_other", "Інше"),
          value: othersTotal,
          color: "#9ca3af",
          logo: null,
          icon: null,
        });
      }
    }
    return result;
  }, [externalData, fetchedData, categories, counterparties, shouldFetch, activeTab, t]);

  const widgetTitle = useMemo(() => {
    if (activeTab === "counterparty") return t("dashboard:dashboard.widget_top_shops");
    if (activeTab === "tag") return t("stats_utility:statisticsPage.tab_tags");

    return type === "income"
      ? t("dashboard:dashboard.income_period")
      : t("dashboard:dashboard.widget_top_categories");
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
