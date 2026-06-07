import React, { useState } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Sector } from "recharts";
import { HiChartPie } from "react-icons/hi2";
import { EmptyState } from "../../ui/EmptyState";
import { SmartIcon } from "../../../utils/IconMap";

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
  hideHeader?: boolean;
}

// --- Custom Tooltip ---
const CustomPieTooltip = ({ active, payload, currency, language }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <S.TooltipContainer>
        <S.TooltipIconBox $color={data.color} $hasLogo={!!data.logo}>
          {data.logo ? (
            <img src={`/brands/${data.logo}`} alt={data.name} />
          ) : data.icon ? (
            <SmartIcon iconName={data.icon} color={data.color} size={16} />
          ) : (
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: data.color,
              }}
            />
          )}
        </S.TooltipIconBox>
        <div className="info">
          <span className="name">{data.name}</span>
          <span className="value">
            {formatMoney(data.value, currency, language)}
          </span>
        </div>
      </S.TooltipContainer>
    );
  }
  return null;
};

// --- Custom Active Shape (Hover Effect) ---
const renderActiveShape = (props: any) => {
  const {
    cx,
    cy,
    innerRadius,
    outerRadius,
    startAngle,
    endAngle,
    fill,
  } = props;

  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 8} // Висуваємо сектор на 8px
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        style={{ filter: `drop-shadow(0px 4px 8px rgba(0, 0, 0, 0.15))` }}
      />
    </g>
  );
};

export const ExpensesPieWidget = (props: Props) => {
  const [activeIndex, setActiveIndex] = useState(-1);

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

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  const onPieLeave = () => {
    setActiveIndex(-1);
  };

  return (
    <S.WidgetCard>
      {!props.hideHeader && (
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
      )}

      {isLoading ? (
        <CenteredSpinner isContainer />
      ) : chartData.length === 0 ? (
        <EmptyState
          compact
          icon={<HiChartPie />}
          title={t("dashboard:dashboard.no_data")}
        />
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
                    innerRadius={70}
                    outerRadius={95}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                    activeIndex={activeIndex}
                    activeShape={renderActiveShape}
                    onMouseEnter={onPieEnter}
                    onMouseLeave={onPieLeave}
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
                    content={
                      <CustomPieTooltip
                        currency={currency}
                        language={language}
                      />
                    }
                    wrapperStyle={{ zIndex: 1000 }}
                    cursor={{ fill: "transparent" }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <S.CenterLabel>
                <span className="label">
                  {t("dashboard:dashboard.total_balance")}
                </span>
              </S.CenterLabel>
            </S.AbsolutePieContainer>
          </S.ChartArea>
        </S.ContentContainer>
      )}
    </S.WidgetCard>
  );
};
