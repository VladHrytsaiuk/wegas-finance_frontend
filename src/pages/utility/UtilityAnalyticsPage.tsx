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
import { HiArrowLeft } from "react-icons/hi2";

import Spinner from "../../components/ui/Spinner";
import {
  CHART_COLORS,
  CustomTooltip,
  TYPE_LABELS,
} from "../../components/utility/ChartConfig";
import { formatMoney } from "../../utils/helpers";

// Імпорт хука та стилів (припускаємо, що вони в цьому ж файлі або імпортуються)
import { useUtilityAnalytics } from "../../hooks/Utility/useUtilityAnalytics"; // шлях умовний
import {
  PageContainer,
  BackButton,
  Header,
  ChartCard,
  EmptyStateWrapper,
  SummaryCards,
  Card,
  CardTitle,
  CardValue,
} from "./UtilityAnalyticsPage.styles"; // шлях умовний

// Виносимо конфігурацію Recharts за межі компонента, щоб уникнути inline об'єктів
const legendStyle = { paddingTop: "20px" };

export default function UtilityAnalyticsPage() {
  const {
    isLoading,
    chartData,
    allKeys,
    totalYearCost,
    avgMonthly,
    hasData,
    handleBack,
  } = useUtilityAnalytics();

  if (isLoading) return <Spinner />;

  return (
    <PageContainer>
      <BackButton onClick={handleBack}>
        <HiArrowLeft /> Назад {hasData ? "до списку" : ""}
      </BackButton>

      <Header>
        <h1>{t("stats_utility:utility.analytics_title")}</h1>
        {hasData && <p>{t("stats_utility:utility.analytics_subtitle")}</p>}
      </Header>

      {!hasData ? (
        <ChartCard>
          <EmptyStateWrapper>
            Дані для аналітики за цей період відсутні.
          </EmptyStateWrapper>
        </ChartCard>
      ) : (
        <>
          <SummaryCards>
            <Card>
              <CardTitle>{t("stats_utility:utility.total_year")}</CardTitle>
              <CardValue>{formatMoney(totalYearCost * 100, "UAH")}</CardValue>
            </Card>
            <Card>
              <CardTitle>{t("stats_utility:utility.average_monthly")}</CardTitle>
              {/* Передаємо проп замість інлайн стилю */}
              <CardValue $variant="neutral">
                {formatMoney(avgMonthly * 100, "UAH")}
              </CardValue>
            </Card>
          </SummaryCards>

          <ChartCard>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                key={`global-chart-${chartData.length}-${allKeys.length}`}
                data={chartData}
                margin={{ top: 20, right: 30, left: 10, bottom: 10 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke={CHART_COLORS.grid}
                />

                <XAxis
                  dataKey="month"
                  stroke={CHART_COLORS.text}
                  tick={{ fill: CHART_COLORS.text, fontSize: 13 }}
                  tickLine={false}
                  axisLine={{ stroke: CHART_COLORS.grid }}
                  dy={10}
                  padding={{ left: 50, right: 50 }}
                />

                <YAxis
                  stroke={CHART_COLORS.text}
                  tick={{ fill: CHART_COLORS.text, fontSize: 12 }}
                  tickFormatter={(val) => `${val}₴`}
                  axisLine={false}
                  tickLine={false}
                  dx={-10}
                />

                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ fill: CHART_COLORS.hoverCursor, radius: 8 }}
                  isAnimationActive={false}
                />

                <Legend
                  formatter={(val) => TYPE_LABELS[val] || val}
                  wrapperStyle={legendStyle}
                  iconType="circle"
                />

                {allKeys.map((key) => (
                  <Bar
                    key={key}
                    dataKey={key}
                    name={TYPE_LABELS[key] || key}
                    stackId="a"
                    fill={CHART_COLORS[key] || CHART_COLORS.other}
                    barSize={40}
                    isAnimationActive={false}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </>
      )}
    </PageContainer>
  );
}
