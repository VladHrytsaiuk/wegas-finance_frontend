import { useMemo, useState } from "react";
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
  const globalFilterKey = JSON.stringify(globalFilter);
  const [localFilterOverride, setLocalFilterOverride] = useState<{
    sourceKey: string;
    value: StatsFilter;
  } | null>(null);
  const localFilter = useMemo(
    () =>
      localFilterOverride?.sourceKey === globalFilterKey
        ? localFilterOverride.value
        : globalFilter || { from: 0, to: 0, label: "", accountIds: [] },
    [globalFilter, globalFilterKey, localFilterOverride],
  );

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

  const activeColor = activeType === "income" ? "#22c55e" : "#ef4444";

  // Запит даних
  const { data, isLoading } = useQuery({
    queryKey: ["stats", "trend", activeType, localFilter, currency],
    queryFn: () =>
      statsService.getTrend(activeType, { ...localFilter, currency }),
  });

  // Підготовка даних для графіка
  const chartDataInfo = useMemo(() => {
    // Якщо даних від API взагалі немає (помилка або ще не завантажилось) - повертаємо пустий масив
    if (!data) return { data: [], isMonthly: false };

    let startDate = new Date(localFilter.from);
    const endDate = new Date(localFilter.to);

    // Корекція дати старту, якщо прийшло 0 (Весь час) або дуже стара дата
    if (startDate.getFullYear() < 2000) {
      if (data.length > 0) {
        // Якщо є дані, стартуємо за тиждень до першої транзакції
        const firstTxDate = parseISO(data[0].date);
        startDate = subWeeks(firstTxDate, 1);
        if (data[0].date.length === 7) startDate = startOfMonth(startDate);
      } else {
        // Якщо даних немає і вибрано "Весь час" - показуємо останні 30 днів по нулях
        startDate = subWeeks(new Date(), 4);
      }
    }

    const daysDiff = differenceInDays(endDate, startDate);
    const isMonthly = daysDiff > 366;

    let ticks: Date[] = [];
    try {
      if (isMonthly) {
        ticks = eachMonthOfInterval({ start: startDate, end: endDate });
      } else {
        ticks = eachDayOfInterval({ start: startDate, end: endDate });
      }
    } catch {
      // Фолбек на випадок некоректних дат
      ticks = [];
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
