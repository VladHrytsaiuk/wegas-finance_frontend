import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { getGlobalUtilityStats } from "../../services/apiUtility";

export const useUtilityAnalytics = () => {
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ["utilityStatsGlobal"],
    queryFn: getGlobalUtilityStats,
  });

  // 1. Отримуємо унікальні ключі (типи витрат)
  const allKeys = useMemo(() => {
    if (!data || !Array.isArray(data)) return [];
    return Array.from(
      new Set(data.flatMap((item) => Object.keys(item.data || {}))),
    );
  }, [data]);

  // 2. Створюємо "стерильні" дані для графіку
  const chartData = useMemo(() => {
    if (!data || !Array.isArray(data) || data.length === 0) return [];

    return data.map((item) => {
      const monthData = { month: item.month || "—" };
      allKeys.forEach((key) => {
        monthData[key] =
          typeof item.data?.[key] === "number" ? item.data[key] : 0;
      });
      return monthData;
    });
  }, [data, allKeys]);

  // 3. Обчислення загальних сум
  const totalYearCost = useMemo(() => {
    return chartData.reduce((acc, item) => {
      return acc + allKeys.reduce((sum, key) => sum + (item[key] || 0), 0);
    }, 0);
  }, [chartData, allKeys]);

  const avgMonthly =
    chartData.length > 0 ? totalYearCost / chartData.length : 0;

  const handleBack = () => navigate(-1);

  return {
    isLoading,
    chartData,
    allKeys,
    totalYearCost,
    avgMonthly,
    hasData: chartData.length > 0,
    handleBack,
  };
};
