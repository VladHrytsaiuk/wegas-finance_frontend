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
import { HiArrowLeft, HiChartBar } from "react-icons/hi2";

import TariffHistoryChart from "../../components/utility/TariffHistoryChart";
import { DetailPageSkeleton } from "../../components/ui/Skeleton/LoadingSkeletons";
import { EmptyState } from "../../components/ui/EmptyState";
import {
  CHART_COLORS,
  CustomTooltip,
} from "../../components/utility/ChartConfig";

// Hooks & Styles
import { useMeterAnalytics } from "../../hooks/Utility/useUtilityMeterAnalyticsPage";
import * as S from "./UtilityMeterAnalyticsPage.styles";
import { useTranslation } from "react-i18next";

export default function UtilityMeterAnalyticsPage() {
  const { meter, stats, isLoading, hasData, handleBack, meterId } =
    useMeterAnalytics();
  const { t } = useTranslation();

  if (isLoading) return <DetailPageSkeleton />;
  if (!meter) return <div>{t("stats_utility:utility.not_found")}</div>;

  return (
    <S.PageContainer>
      <S.BackButton onClick={handleBack}>
        <HiArrowLeft /> {t("stats_utility:utility.back_to_meter")}
      </S.BackButton>

      <S.Header>
        <h1>
          {meter.name}
          <S.HeaderBadge>
            {meter.unit} / {meter.currency}
          </S.HeaderBadge>
        </h1>
      </S.Header>

      {/* --- БЛОК ГРАФІКІВ --- */}
      {!hasData ? (
        <EmptyState
          isFullPage={false}
          icon={<HiChartBar />}
          title={t("stats_utility:utility.analytics_meter_empty")}
        />
      ) : (
        <>
          {/* 1. Основний графік: Споживання та Вартість */}
          <S.ChartCard>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                key={`meter-chart-${meterId}-${stats.length}`}
                data={stats}
                margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
              >
                <CartesianGrid
                  stroke={CHART_COLORS.grid}
                  vertical={false}
                  strokeDasharray="3 3"
                />

                <XAxis
                  dataKey="month"
                  padding={{ left: 50, right: 50 }}
                  tick={{ fill: CHART_COLORS.text }}
                  tickLine={false}
                  axisLine={{ stroke: CHART_COLORS.grid }}
                />

                <YAxis
                  yAxisId="left"
                  orientation="left"
                  tick={{ fill: CHART_COLORS.text }}
                  axisLine={false}
                  tickLine={false}
                />

                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tickFormatter={(val) => `${val}₴`}
                  tick={{ fill: CHART_COLORS.text }}
                  axisLine={false}
                  tickLine={false}
                />

                <Tooltip
                  content={<CustomTooltip currency={meter.currency} />}
                  cursor={{ fill: CHART_COLORS.hoverCursor }}
                  isAnimationActive={false}
                />

                <Legend iconType="circle" />

                <Bar
                  yAxisId="left"
                  dataKey="total_consumption"
                  name={t("stats_utility:utility.chart_consumption")}
                  barSize={40}
                  fill={CHART_COLORS.water}
                  isAnimationActive={false}
                />

                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="total_cost"
                  name={t("stats_utility:utility.chart_cost")}
                  stroke={CHART_COLORS.gas}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  isAnimationActive={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </S.ChartCard>

          {/* 2. Графік історії тарифів */}
          <TariffHistoryChart
            data={stats}
            unit={meter.unit}
            currency={meter.currency}
          />
        </>
      )}
    </S.PageContainer>
  );
}
