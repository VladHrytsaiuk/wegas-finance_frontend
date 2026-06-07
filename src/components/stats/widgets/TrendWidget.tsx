import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { format } from "date-fns";
import { uk, enUS } from "date-fns/locale";

// Components
import { WidgetControls } from "./WidgetControls";
import Spinner from "../../ui/Spinner";
import { CenteredSpinner } from "../../ui/CenteredSpinner";
import { EmptyState } from "../../ui/EmptyState";
import { HiOutlineChartBar } from "react-icons/hi2";

// Styles & Hooks
import * as S from "./TrendWidget.styles";
import { useTrendWidget } from "../../../hooks/Stats/useTrendWidget";
import { formatMoney } from "../../../utils/helpers";
import type { StatsFilter } from "../../../services/apiStats";

interface Props {
  type: "income" | "expense";
  title: string;
  color: string;
  globalFilter: StatsFilter;
  onDiverge?: () => void;
}

// --- Custom Tooltip Component ---
// Винесений окремо, але залишається у файлі, оскільки специфічний для Recharts
const CustomTrendTooltip = ({
  active,
  payload,
  label,
  currency,
  language,
  isMonthly,
}: any) => {
  const dateLocale = language === "uk" ? uk : enUS;

  if (active && payload && payload.length) {
    // Recharts повертає value, яке ми підготували в хуку (уже / 100)
    // Але formatMoney очікує копійки, тому * 100
    const valueInCents = payload[0].value * 100;

    const dateLabel = isMonthly
      ? format(new Date(label), "LLLL yyyy", { locale: dateLocale })
      : format(new Date(label), "d MMMM yyyy", { locale: dateLocale });

    return (
      <S.TooltipContainer>
        <p className="date">{dateLabel}</p>
        <p className="value" style={{ color: payload[0].stroke }}>
          {formatMoney(valueInCents, currency, language)}
        </p>
      </S.TooltipContainer>
    );
  }
  return null;
};

// --- Main Component ---
export const TrendWidget = (props: Props) => {
  const {
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
    actions: { setActiveType, handleFilterUpdate },
    t,
  } = useTrendWidget({
    initialType: props.type,
    globalFilter: props.globalFilter,
    onDiverge: props.onDiverge,
  });

  return (
    <S.Container>
      <S.Header>
        <S.TitleGroup>
          <S.Title>
            {activeType === "income"
              ? t("dashboard:dashboard.income_period")
              : t("dashboard:dashboard.widget_trend_expenses")}
          </S.Title>
          <S.TypeToggle>
            <S.ToggleBtn
              $active={activeType === "expense"}
              $color="#ef4444"
              onClick={() => setActiveType("expense")}
            >
              {t("dashboard:filters.periods.expense_label")}
            </S.ToggleBtn>
            <S.ToggleBtn
              $active={activeType === "income"}
              $color="#22c55e"
              onClick={() => setActiveType("income")}
            >
              {t("dashboard:filters.periods.income_label")}
            </S.ToggleBtn>
          </S.TypeToggle>
        </S.TitleGroup>

        <WidgetControls
          mini={true}
          currentLabel={localFilter.label || t("legacy:filters.period_label")}
          currentAccountIds={localFilter.accountIds}
          onFilterChange={handleFilterUpdate}
          variant="local"
        />
      </S.Header>

      <S.ChartWrapper>
        {isLoading ? (
          <CenteredSpinner isContainer />
        ) : chartData.length === 0 ? (
          <EmptyState
            compact
            icon={<HiOutlineChartBar />}
            title={t("dashboard:dashboard.no_data")}
          />
        ) : (
          <S.AbsoluteChartContainer>
...

            <ResponsiveContainer width="99.9%" height="100%" debounce={50}>
              <AreaChart
                data={chartData}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient
                    id={`grad${activeType}`}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor={activeColor}
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="95%"
                      stopColor={activeColor}
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="var(--color-border)"
                />
                <XAxis dataKey="date" hide />
                <YAxis
                  domain={[0, "auto"]}
                  width={45}
                  tickFormatter={(val) =>
                    val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val
                  }
                  tick={{ fontSize: 11, fill: "var(--color-text-tertiary)" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  content={
                    <CustomTrendTooltip
                      currency={currency}
                      language={language}
                      isMonthly={isMonthly}
                    />
                  }
                  wrapperStyle={{ zIndex: 1000 }}
                  cursor={{ stroke: "var(--color-border)", strokeWidth: 1 }}
                />
                <Area
                  type={curveType}
                  dataKey="total"
                  stroke={activeColor}
                  strokeWidth={2}
                  fill={`url(#grad${activeType})`}
                  animationDuration={600}
                  activeDot={{ r: 4, strokeWidth: 0 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </S.AbsoluteChartContainer>
        )}
      </S.ChartWrapper>
    </S.Container>
  );
};
