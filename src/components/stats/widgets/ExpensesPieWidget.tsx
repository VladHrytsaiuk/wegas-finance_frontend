import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

// Components
import { WidgetControls } from "./WidgetControls";
import Spinner from "../../ui/Spinner";
import { CenteredSpinner } from "../../ui/CenteredSpinner";

// Styles & Logic
import * as S from "./ExpensesPieWidget.styles";
import {
  useExpensesPieWidget,
  type DataItem,
} from "../../../hooks/Stats/useExpensesPieWidget";
import { formatMoney } from "../../../utils/helpers";
import type { StatsFilter } from "../../../services/apiStats";

interface Props {
  globalFilter?: StatsFilter;
  onDiverge?: () => void;
  data?: DataItem[];
  type?: "income" | "expense";
  activeTab?: "category" | "counterparty" | "tag";
  currency?: string;
}

export const ExpensesPieWidget = (props: Props) => {
  const {
    state: {
      chartData,
      isLoading,
      localFilter,
      shouldFetch,
      currency,
      language,
      widgetTitle,
    },
    actions: { handleFilterUpdate },
    t,
  } = useExpensesPieWidget(props);

  return (
    <S.WidgetCard>
      <S.Header>
        <S.Title>{widgetTitle}</S.Title>
        {shouldFetch && props.globalFilter && (
          <WidgetControls
            mini={true}
            currentLabel={localFilter.label || t("legacy:filters.period_label")}
            currentAccountIds={localFilter.accountIds}
            onFilterChange={handleFilterUpdate}
            variant="local"
          />
        )}
      </S.Header>

      {isLoading ? (
        <CenteredSpinner isContainer />
      ) : chartData.length === 0 ? (
        <S.EmptyState>{t("dashboard:dashboard.no_data")}</S.EmptyState>
      ) : (
        <S.ContentContainer>
          <S.ChartArea>
            <S.AbsolutePieContainer>
              <ResponsiveContainer width="99.9%" height="100%" debounce={50}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                  >
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                        style={{ outline: "none" }}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: number) =>
                      formatMoney(val, currency, language)
                    }
                    wrapperStyle={{ zIndex: 1000 }}
                    contentStyle={{
                      backgroundColor: "var(--color-bg-surface)",
                      border: "1px solid var(--color-border)",
                      borderRadius: "12px",
                      boxShadow: "var(--shadow-md)",
                      padding: "8px 12px",
                    }}
                    itemStyle={{
                      color: "var(--color-text-main)",
                      fontWeight: 600,
                      fontSize: "0.9rem",
                    }}
                    labelStyle={{
                      color: "var(--color-text-secondary)",
                    }}
                    cursor={{ fill: "transparent" }}
                    separator=": "
                  />
                </PieChart>
              </ResponsiveContainer>
              <S.CenterLabel>
                <span className="label">{t("dashboard:dashboard.total_balance")}</span>
              </S.CenterLabel>
            </S.AbsolutePieContainer>
          </S.ChartArea>

          <S.CustomLegend>
            {chartData.map((entry, index) => (
              <S.LegendItem key={index}>
                <S.Dot style={{ backgroundColor: entry.color }} />
                <S.LegendText>
                  <span className="name" title={entry.name}>
                    {entry.name}
                  </span>
                  <span className="percent">
                    {(
                      (entry.value /
                        chartData.reduce((acc, cur) => acc + cur.value, 0)) *
                      100
                    ).toFixed(0)}
                    %
                  </span>
                </S.LegendText>
              </S.LegendItem>
            ))}
          </S.CustomLegend>
        </S.ContentContainer>
      )}
    </S.WidgetCard>
  );
};
