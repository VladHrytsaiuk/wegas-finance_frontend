import { useQuery } from "@tanstack/react-query";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import styled from "styled-components";
import { getGlobalUtilityStats } from "../../services/apiUtility";
import Spinner from "../ui/Spinner";
import { formatMoney } from "../../utils/helpers";

const ChartContainer = styled.div`
  background: var(--color-bg-secondary); // або var(--color-grey-0)
  padding: 1.5rem;
  border-radius: 16px;
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-sm);
  margin-bottom: 2rem;
  height: 400px;
  display: flex;
  flex-direction: column;

  h3 {
    margin-bottom: 1rem;
    font-size: 1.1rem;
    color: var(--color-text-main);
  }
`;

// Кольори для різних типів послуг
const TYPE_COLORS: Record<string, string> = {
  electricity: "#f59e0b", // Yellow
  water: "#3b82f6", // Blue
  gas: "#ef4444", // Red
  heating: "#f97316", // Orange
  internet: "#10b981", // Green
  rent: "#6366f1", // Indigo
  other: "#8b5cf6", // Purple
};

const TYPE_LABELS: Record<string, string> = {
  electricity: "Світло",
  water: "Вода",
  gas: "Газ",
  heating: "Опалення",
  internet: "Інтернет",
  rent: "Квартплата",
};

export default function UtilityGlobalChart() {
  const { data, isLoading } = useQuery({
    queryKey: ["utilityStatsGlobal"],
    queryFn: getGlobalUtilityStats,
  });

  if (isLoading) return <Spinner />;
  if (!data || data.length === 0) return null;

  // 1. Трансформуємо дані для Recharts
  // Бекенд: { month: "2024-01", data: { electricity: 100, water: 50 } }
  // Recharts хоче: { month: "2024-01", electricity: 100, water: 50 }
  const chartData = data.map((item) => ({
    month: item.month,
    ...item.data,
  }));

  // 2. Визначаємо, які ключі (типи послуг) взагалі є в даних, щоб створити <Bar /> для кожного
  const allKeys = Array.from(
    new Set(data.flatMap((item) => Object.keys(item.data))),
  );

  return (
    <ChartContainer>
      <h3>Аналітика витрат (останні 12 міс.)</h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="var(--color-grey-200)"
          />
          <XAxis dataKey="month" stroke="var(--color-grey-500)" fontSize={12} />
          <YAxis
            stroke="var(--color-grey-500)"
            fontSize={12}
            tickFormatter={(val) => `${val}₴`}
          />
          <Tooltip
            cursor={{ fill: "var(--color-bg-hover)" }}
            contentStyle={{
              borderRadius: "8px",
              border: "none",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            }}
            formatter={(value: number, name: string) => [
              formatMoney(value * 100, "UAH"), // Множимо на 100, бо formatMoney чекає копійки
              TYPE_LABELS[name] || name,
            ]}
          />
          <Legend formatter={(value) => TYPE_LABELS[value] || value} />

          {allKeys.map((key) => (
            <Bar
              key={key}
              dataKey={key}
              stackId="a"
              fill={TYPE_COLORS[key] || "#9ca3af"}
              radius={[2, 2, 0, 0]}
              maxBarSize={50}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
