import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  eachDayOfInterval,
  eachMonthOfInterval,
  isSameDay,
  isSameMonth,
  parseISO,
  differenceInDays,
  startOfMonth,
  subWeeks,
} from "date-fns";
import { useTranslation } from "react-i18next";

import { statsService, type StatsFilter } from "../../services/apiStats";
import { useSettings } from "../../context/SettingsContext";

interface UseTrendWidgetProps {
  initialType: "income" | "expense";
  globalFilter: StatsFilter;
  onDiverge?: () => void;
}

export const useTrendWidget = ({
  initialType,
  globalFilter,
  onDiverge,
}: UseTrendWidgetProps) => {
  const { t } = useTranslation();
  const { currency, language } = useSettings();

  const [activeType, setActiveType] = useState<"income" | "expense">(
    initialType
  );

  // Локальний фільтр для віджету (може відрізнятися від глобального при зміні на самому віджеті)
  const [localFilter, setLocalFilter] = useState<StatsFilter>(
    globalFilter || { from: 0, to: 0, label: "", accountIds: [] }
  );

  // Синхронізація з глобальним фільтром
  useEffect(() => {
    if (globalFilter) setLocalFilter(globalFilter);
  }, [globalFilter]); // Примітка: краще використовувати примітиви або deep compare, але тут поки так

  const handleFilterUpdate = (updates: Partial<StatsFilter>) => {
    setLocalFilter((prev) => ({ ...prev, ...updates }));
    if (onDiverge) onDiverge();
  };

  const activeColor = activeType === "income" ? "#22c55e" : "#ef4444";

  // Запит даних
  const { data, isLoading } = useQuery({
    queryKey: ["stats", "trend", activeType, localFilter, currency],
    queryFn: () =>
      statsService.getTrend(activeType, { ...localFilter, currency }),
  });

  // Підготовка даних для графіка
  const chartDataInfo = useMemo(() => {
    if (!data || data.length === 0) return { data: [], isMonthly: false };

    let startDate = new Date(localFilter.from);
    const endDate = new Date(localFilter.to);

    // Корекція дати старту, якщо прийшло 0 або дуже стара дата
    if (startDate.getFullYear() < 2000 && data.length > 0) {
      const firstTxDate = parseISO(data[0].date);
      startDate = subWeeks(firstTxDate, 1);
      // Якщо дані прийшли по місяцях (YYYY-MM)
      if (data[0].date.length === 7) {
        startDate = startOfMonth(startDate);
      }
    }

    const daysDiff = differenceInDays(endDate, startDate);
    const isMonthly = daysDiff > 366;

    let ticks: Date[] = [];
    if (isMonthly) {
      ticks = eachMonthOfInterval({ start: startDate, end: endDate });
    } else {
      ticks = eachDayOfInterval({ start: startDate, end: endDate });
    }

    const mappedData = ticks.map((tickDate) => {
      const found = data.find((d) => {
        const itemDate = parseISO(d.date);
        return isMonthly
          ? isSameMonth(itemDate, tickDate)
          : isSameDay(itemDate, tickDate);
      });

      return {
        date: tickDate.getTime(),
        total: found ? found.total / 100 : 0,
      };
    });

    return { data: mappedData, isMonthly };
  }, [data, localFilter]);

  const { data: chartData, isMonthly } = chartDataInfo;
  const curveType = chartData.length < 30 ? "linear" : "monotone";

  return {
    state: {
      activeType,
      localFilter,
      chartData,
      isMonthly,
      isLoading,
      activeColor,
      curveType,
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
