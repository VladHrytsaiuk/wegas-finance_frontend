import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import styled from "styled-components";
import { useTranslation } from "react-i18next";
import { CHART_COLORS, CustomTooltip } from "./ChartConfig";
import type { UtilityMeterStat } from "../../types";

const ChartWrapper = styled.div`
  background: var(--color-bg-secondary, white);
  border-radius: 20px;
  padding: 1.5rem 2rem;
  border: 1px solid var(--color-border, #e5e7eb);
  box-shadow: var(--shadow-sm);
  height: 320px;
  margin-top: 2rem;
  display: flex;
  flex-direction: column;
`;

const Title = styled.h3`
  font-size: 1.1rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  color: var(--color-grey-800);
  display: flex;
  align-items: center;
  justify-content: space-between;

  .unit-badge {
    font-size: 0.75rem;
    font-weight: 500;
    color: var(--color-grey-500);
    background: var(--color-grey-100);
    padding: 2px 8px;
    border-radius: 6px;
    text-transform: lowercase;
  }
`;

interface TariffHistoryProps {
  data: UtilityMeterStat[];
  unit: string;
  currency: string;
}

export default function TariffHistoryChart({
  data,
  unit,
  currency,
}: TariffHistoryProps) {
  const { t } = useTranslation();
  const safeData = data.map((item) => ({
    month: item.month,
    tariff: item.avg_tariff || item.tariff || 0,
  }));

  return (
    <ChartWrapper>
      <Title>
        {t("stats_utility:utility.tariff_history")}
        <span className="unit-badge">
          {currency} / {unit}
        </span>
      </Title>

      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={safeData}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorTariff" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor={CHART_COLORS.electricity}
                stopOpacity={0.2}
              />
              <stop
                offset="95%"
                stopColor={CHART_COLORS.electricity}
                stopOpacity={0}
              />
            </linearGradient>
          </defs>

          <CartesianGrid
            strokeDasharray="4 4"
            vertical={false}
            stroke="var(--color-grey-100, #f3f4f6)"
          />

          <XAxis
            dataKey="month"
            tick={{ fontSize: 12, fill: "var(--color-grey-500)" }}
            axisLine={false}
            tickLine={false}
            dy={10}
          />

          <YAxis
            tick={{ fontSize: 12, fill: "var(--color-grey-500)" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(val) => `${val}₴`}
          />

          <Tooltip
            content={<CustomTooltip currency={currency} />}
            cursor={{
              stroke: CHART_COLORS.electricity,
              strokeWidth: 2,
              strokeDasharray: "4 4",
            }}
          />

          <Area
            type="stepAfter"
            dataKey="tariff"
            name={t("stats_utility:utility.table_rate")}
            stroke={CHART_COLORS.electricity}
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorTariff)"
            // Вимикаємо анімацію для стабільності, як і в першому графіку
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
}
