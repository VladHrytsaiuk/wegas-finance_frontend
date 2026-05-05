import { useQuery } from "@tanstack/react-query";
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import styled from "styled-components";
import { getMeterStats } from "../../services/apiUtility";
import Spinner from "../ui/Spinner";
import { CustomTooltip } from "./ChartConfig";

const ChartContainer = styled.div`
  background: var(--color-bg-secondary);
  padding: 1.5rem;
  border-radius: 16px;
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-sm);
  margin-bottom: 2rem;
  height: 350px;
  display: flex;
  flex-direction: column;

  h3 {
    margin-bottom: 1rem;
    font-size: 1.1rem;
    color: var(--color-text-main);
  }
`;

interface Props {
  meterId: string;
  unit: string;
  currency: string;
}
export default function UtilityMeterChart({ meterId, unit, currency }: Props) {
  const { data, isLoading } = useQuery({
    queryKey: ["utilityStatsMeter", meterId],
    queryFn: () => getMeterStats(meterId),
    enabled: !!meterId,
  });

  if (isLoading) return <Spinner />;

  // 🔥 ГАРАНТОВАНА ОЧИСТКА: фільтруємо будь-який непотріб
  const safeData = Array.isArray(data)
    ? data.filter((item) => item && typeof item === "object" && item.month)
    : [];

  if (safeData.length === 0) return null;

  return (
    <ChartContainer>
      <h3>Динаміка споживання та витрат</h3>
      <ResponsiveContainer width="100%" height="100%">
        {/* Ключ змушує Recharts скинути внутрішній стейт при зміні ID або довжини даних */}
        <ComposedChart
          key={`${meterId}-${safeData.length}`}
          data={safeData}
          margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
        >
          <CartesianGrid stroke="#f5f5f5" vertical={false} />

          <XAxis
            dataKey="month"
            scale="band"
            fontSize={12}
            stroke="var(--color-grey-500)"
          />

          <YAxis
            yAxisId="left"
            orientation="left"
            stroke="var(--color-brand-600)"
            fontSize={12}
            label={{ value: unit, angle: -90, position: "insideLeft" }}
          />

          <YAxis
            yAxisId="right"
            orientation="right"
            stroke="#ef4444"
            fontSize={12}
            tickFormatter={(val) => (val ? `${val}₴` : "0₴")}
          />

          <Tooltip content={<CustomTooltip currency={currency} />} />
          <Legend />

          <Bar
            yAxisId="left"
            dataKey="total_consumption"
            name="Спожито"
            barSize={30}
            fill="var(--color-brand-200)"
            radius={[4, 4, 0, 0]}
            isAnimationActive={false} // 💡 Тимчасово вимкніть, щоб перевірити чи не в анімації справа
          />

          <Line
            yAxisId="right"
            type="monotone"
            dataKey="total_cost"
            name="Вартість"
            stroke="#ef4444"
            strokeWidth={2}
            dot={{ r: 4 }}
            isAnimationActive={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
