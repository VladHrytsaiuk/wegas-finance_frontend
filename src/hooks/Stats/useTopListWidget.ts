import { useState, useEffect, useRef, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

import { statsService, type StatsFilter } from "../../services/apiStats";
import { getCategoriesApi } from "../../services/apiCategories";
import { getCounterpartiesApi } from "../../services/apiCounterparties";
import { useSettings } from "../../context/SettingsContext";

interface UseTopListWidgetProps {
  type: "income" | "expense";
  entity: "category" | "tag" | "counterparty";
  globalFilter: StatsFilter;
  onDiverge?: () => void;
}

export const useTopListWidget = ({
  type,
  entity,
  globalFilter,
  onDiverge,
}: UseTopListWidgetProps) => {
  const { t } = useTranslation();
  const { currency, language } = useSettings();

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
  const { data, isLoading: isStatsLoading } = useQuery({
    queryKey: ["topStats", type, entity, localFilter, currency],
    queryFn: async () => {
      const res = await statsService.getTopStats(type, entity, {
        ...localFilter,
        currency,
      });
      return res.sort((a, b) => b.total - a.total);
    },
    placeholderData: (prev) => prev,
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
    const DEFAULT_COLOR = type === "income" ? "#22c55e" : "#ef4444";

    return topItems.map((item) => {
      const percent = maxValue > 0 ? (item.total / maxValue) * 100 : 0;
      let displayColor = item.metadata;

      // Color Logic
      if (entity === "category") {
        const cat = categories.find((c: any) => c.name === item.name);
        if (cat?.color) displayColor = cat.color;
      } else if (entity === "counterparty") {
        const cp = counterparties.find((c: any) => c.name === item.name);
        if (cp) {
          if (cp.color) {
            displayColor = cp.color;
          } else if (cp.category?.color) {
            displayColor = cp.category.color;
          } else if (cp.category_id) {
            const parentCat = categories.find(
              (c: any) => String(c.id) === String(cp.category_id)
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
        displayName: item.name || t("dashboard.filter_other", "Інше"),
      };
    });
  }, [data, categories, counterparties, entity, type, t]);

  const isLoading = isStatsLoading;

  return {
    state: {
      processedData,
      isLoading,
      localFilter,
      hasChanges,
      currency,
      language,
    },
    actions: {
      handleFilterUpdate,
    },
    t,
  };
};
