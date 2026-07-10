import { useState, useEffect, useRef, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

import {
  statsService,
  type StatsFilter,
  type TopStat,
} from "../../services/apiStats";
import { getCategoriesApi } from "../../services/apiCategories";
import { getCounterpartiesApi } from "../../services/apiCounterparties";
import { useSettings } from "../../context/SettingsContext";
import type { Category, Counterparty } from "../../types";

interface UseTopListWidgetProps {
  type: "income" | "expense";
  entity: "category" | "tag" | "counterparty";
  globalFilter: StatsFilter;
  onDiverge?: () => void;
}

export const useTopListWidget = ({
  type: initialType,
  entity,
  globalFilter,
  onDiverge,
}: UseTopListWidgetProps) => {
  const { t } = useTranslation();
  const { currency, language } = useSettings();

  const [activeType, setActiveType] = useState<"income" | "expense">(initialType);

  // Sync with prop type changes (e.g. from parent)
  useEffect(() => {
    setActiveType(initialType);
  }, [initialType]);

  // Local Filter State
  const [localFilter, setLocalFilter] = useState<StatsFilter>(globalFilter);
  const prevGlobalFilter = useRef(globalFilter);

  // Sync Global Filter
  useEffect(() => {
    if (
      JSON.stringify(globalFilter) !== JSON.stringify(prevGlobalFilter.current)
    ) {
      setLocalFilter(globalFilter);
      prevGlobalFilter.current = globalFilter;
    }
  }, [globalFilter]);

  const handleFilterUpdate = (updates: Partial<StatsFilter>) => {
    setLocalFilter((prev) => ({ ...prev, ...updates }));
    if (onDiverge) onDiverge();
  };

  const hasChanges =
    JSON.stringify(localFilter) !== JSON.stringify(globalFilter);

  // --- Queries ---
  const { data, isLoading: isStatsLoading, isFetching } = useQuery({
    queryKey: ["stats", "top", activeType, entity, localFilter, currency],
    queryFn: async () => {
      const res = await statsService.getTopStats(activeType, entity, {
        ...localFilter,
        currency,
      });
      return res.sort((a, b) => b.total - a.total);
    },
    // We remove placeholderData to see the loading state clearly when switching types
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategoriesApi,
    staleTime: 10 * 60 * 1000,
  });

  const { data: counterparties = [] } = useQuery({
    queryKey: ["counterparties"],
    queryFn: getCounterpartiesApi,
    staleTime: 10 * 60 * 1000,
    enabled: entity === "counterparty",
  });

  // --- Data Processing (Colors & Percentages) ---
  const processedData = useMemo(() => {
    if (!data) return [];

    const topItems = data.slice(0, 5);
    const maxValue = topItems.length > 0 ? topItems[0].total : 0;
    const DEFAULT_COLOR = activeType === "income" ? "#22c55e" : "#ef4444";

    return topItems.map((item: TopStat) => {
      const percent = maxValue > 0 ? (item.total / maxValue) * 100 : 0;
      let displayColor = item.metadata;
      let logo = null;
      let icon = null;

      // Color & Logo Logic
      if (entity === "category") {
        const cat = categories.find((c: Category) => c.name === item.name);
        if (cat?.color) displayColor = cat.color;
        if (cat?.icon) icon = cat.icon;
      } else if (entity === "counterparty") {
        const cp = counterparties.find((c: Counterparty) => c.name === item.name);
        if (cp) {
          if (cp.logo) logo = cp.logo;

          // Icon Logic: CP icon -> Category icon
          icon = cp.icon || cp.category?.icon;
          if (!icon && cp.category_id) {
            const parentCat = categories.find(
              (c: Category) => String(c.id) === String(cp.category_id),
            );
            if (parentCat?.icon) icon = parentCat.icon;
          }

          if (cp.color) {
            displayColor = cp.color;
          } else if (cp.category?.color) {
            displayColor = cp.category.color;
          } else if (cp.category_id) {
            const parentCat = categories.find(
              (c: Category) => String(c.id) === String(cp.category_id),
            );
            if (parentCat?.color) displayColor = parentCat.color;
          }
        }
      }

      if (!displayColor || displayColor === "undefined") {
        displayColor = DEFAULT_COLOR;
      }

      return {
        ...item,
        displayColor,
        percent,
        logo,
        icon,
        displayName: item.name || t("dashboard:dashboard.filter_other", "Інше"),
      };
    });
  }, [data, categories, counterparties, entity, activeType, t]);

  const isLoading = isStatsLoading || (isFetching && !data);

  return {
    state: {
      activeType,
      processedData,
      isLoading,
      localFilter,
      hasChanges,
      currency,
      language,
    },
    actions: {
      setActiveType,
      handleFilterUpdate,
    },
    t,
  };
};
