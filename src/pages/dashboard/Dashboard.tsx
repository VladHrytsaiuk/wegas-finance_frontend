import React, { useCallback, useEffect, useMemo, useState } from "react";
import { endOfMonth, startOfMonth, subDays } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { HiCheck, HiPencil, HiXMark } from "react-icons/hi2";
import { Responsive, WidthProvider } from "react-grid-layout/legacy";
import type { ResponsiveLayouts as Layouts } from "react-grid-layout/legacy";
import { useTranslation } from "react-i18next";

import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

import { WidgetControls } from "../../components/stats/widgets/WidgetControls";
import { BalanceCard } from "../../components/stats/widgets/summary/BalanceCard";
import { IncomeCard } from "../../components/stats/widgets/summary/IncomeCard";
import { ExpenseCard } from "../../components/stats/widgets/summary/ExpenseCard";
import { TrendWidget } from "../../components/stats/widgets/TrendWidget";
import { TopListWidget } from "../../components/stats/widgets/TopListWidget";
import { RecentTransactionsWidget } from "../../components/stats/widgets/RecentTransactionsWidget";
import { AccountsWidget } from "../../components/stats/widgets/AccountsWidget";
import { ExpensesPieWidget } from "../../components/stats/widgets/ExpensesPieWidget";

import { useHeader } from "../../context/HeaderContext";
import api from "../../services/Axios";
import { CenteredSpinner } from "../../components/ui/CenteredSpinner";
import { useSummaryWidget } from "../../hooks/Stats/useSummaryWidget";
import { formatMoney } from "../../utils/helpers";

import {
  DashboardContainer,
  FilterBar,
  EditButton,
  GridItemContainer,
  WidgetInnerContainer,
  DragOverlay,
  ButtonLabel,
} from "./Dashboard.styles";

const ResponsiveGridLayout = WidthProvider(Responsive);

// 🔥 ФІКСОВАНА ВИСОТА h: 8 (при rowHeight: 30) ідеально відповідає ~350px
const MAIN_H = 8;
const SUM_H = 3;
const TREND_H = 10;

const defaultLayouts: Layouts = {
  xl: [
    { i: "balance", x: 0, y: 0, w: 6, h: SUM_H },
    { i: "income", x: 6, y: 0, w: 3, h: SUM_H },
    { i: "expense", x: 9, y: 0, w: 3, h: SUM_H },
    { i: "accounts", x: 0, y: 3, w: 6, h: MAIN_H },
    { i: "recent", x: 6, y: 3, w: 6, h: MAIN_H, isResizable: false },
    { i: "trend", x: 0, y: 11, w: 12, h: TREND_H },
    { i: "pie", x: 0, y: 21, w: 6, h: MAIN_H },
    { i: "top_categories", x: 6, y: 21, w: 6, h: MAIN_H },
    { i: "top_counterparties", x: 0, y: 29, w: 12, h: MAIN_H },
  ],
  lg: [
    { i: "balance", x: 0, y: 0, w: 6, h: SUM_H },
    { i: "income", x: 6, y: 0, w: 3, h: SUM_H },
    { i: "expense", x: 9, y: 0, w: 3, h: SUM_H },
    { i: "accounts", x: 0, y: 3, w: 6, h: MAIN_H },
    { i: "recent", x: 6, y: 3, w: 6, h: MAIN_H },
    { i: "trend", x: 0, y: 11, w: 12, h: TREND_H },
    { i: "pie", x: 0, y: 21, w: 6, h: MAIN_H },
    { i: "top_categories", x: 6, y: 21, w: 6, h: MAIN_H },
    { i: "top_counterparties", x: 0, y: 29, w: 12, h: MAIN_H },
  ],
  md: [
    { i: "balance", x: 0, y: 0, w: 6, h: SUM_H },
    { i: "income", x: 6, y: 0, w: 3, h: SUM_H },
    { i: "expense", x: 9, y: 0, w: 3, h: SUM_H },
    { i: "accounts", x: 0, y: 3, w: 6, h: MAIN_H },
    { i: "recent", x: 6, y: 3, w: 6, h: MAIN_H },
    { i: "trend", x: 0, y: 11, w: 12, h: TREND_H },
    { i: "pie", x: 0, y: 21, w: 6, h: MAIN_H },
    { i: "top_categories", x: 6, y: 21, w: 6, h: MAIN_H },
    { i: "top_counterparties", x: 0, y: 29, w: 12, h: MAIN_H },
  ],
  sm: [
    { i: "balance", x: 0, y: 0, w: 6, h: SUM_H },
    { i: "income", x: 0, y: 3, w: 3, h: SUM_H },
    { i: "expense", x: 3, y: 3, w: 3, h: SUM_H },
    { i: "accounts", x: 0, y: 6, w: 6, h: MAIN_H },
    { i: "recent", x: 0, y: 16, w: 6, h: MAIN_H },
    { i: "trend", x: 0, y: 26, w: 6, h: TREND_H },
    { i: "top_categories", x: 0, y: 36, w: 6, h: MAIN_H },
    { i: "pie", x: 0, y: 46, w: 6, h: MAIN_H },
    { i: "top_counterparties", x: 0, y: 56, w: 6, h: MAIN_H },
  ],
  xs: [
    { i: "balance", x: 0, y: 0, w: 4, h: SUM_H },
    { i: "income", x: 0, y: 3, w: 2, h: SUM_H },
    { i: "expense", x: 2, y: 3, w: 2, h: SUM_H },
    { i: "accounts", x: 0, y: 6, w: 4, h: MAIN_H },
    { i: "recent", x: 0, y: 16, w: 4, h: MAIN_H },
    { i: "trend", x: 0, y: 26, w: 4, h: TREND_H },
    { i: "top_categories", x: 0, y: 36, w: 4, h: MAIN_H },
    { i: "pie", x: 0, y: 46, w: 4, h: MAIN_H },
    { i: "top_counterparties", x: 0, y: 56, w: 4, h: MAIN_H },
  ],
};

interface GridItemProps {
  style?: React.CSSProperties;
  className?: string;
  children?: React.ReactNode;
  [key: string]: any;
}

const GridItem = React.forwardRef<HTMLDivElement, GridItemProps>(
  ({ style, className, children, ...props }, ref) => {
    const isStatic = className?.includes("static");
    return (
      <GridItemContainer
        ref={ref}
        style={style}
        className={`${className} ${isStatic ? "static-mode" : ""}`}
        {...props}
      >
        {children}
      </GridItemContainer>
    );
  },
);

function Dashboard() {
  const { t } = useTranslation();
  const { setPageTitle, resetPageTitle } = useHeader();
  const [isEditMode, setIsEditMode] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 200);
    return () => clearTimeout(timer);
  }, []);

  const [layouts, setLayouts] = useState(() => {
    try {
      const saved = localStorage.getItem("dashboard_layout_v19");
      return saved ? JSON.parse(saved) : defaultLayouts;
    } catch (e) {
      return defaultLayouts;
    }
  });

  const controlledLayouts = useMemo(() => {
    const newLayouts = JSON.parse(JSON.stringify(layouts));
    for (const key in newLayouts) {
      newLayouts[key] = newLayouts[key].map((item: any) => ({
        ...item,
        static: !isEditMode ? true : item.static || false,
      }));
    }
    return newLayouts;
  }, [layouts, isEditMode]);

  const onLayoutChange = useCallback(
    (_currentLayout: any, allLayouts: any) => {
      if (!isEditMode) return;
      const allLayoutsStr = JSON.stringify(allLayouts);
      setLayouts(allLayouts);
      localStorage.setItem("dashboard_layout_v19", allLayoutsStr);
    },
    [isEditMode],
  );

  const handleResetLayout = () => {
    setLayouts(defaultLayouts);
    localStorage.removeItem("dashboard_layout_v19");
    setIsEditMode(false);
  };

  const { data: user, isLoading: isUserLoading } = useQuery({
    queryKey: ["me"],
    queryFn: async () => (await api.get("/users/me")).data,
  });

  const { data: accounts, isLoading: isAccLoading } = useQuery({
    queryKey: ["accounts"],
    queryFn: async () => (await api.get<any[]>("/accounts")).data,
  });

  const myAccountIds = useMemo(() => {
    return (
      accounts
        ?.filter((acc) => acc.user_id === user?.id)
        .map((acc) => acc.id) || []
    );
  }, [accounts, user?.id]);

  const [globalFilter, setGlobalFilter] = useState<any>({
    from: subDays(new Date(), 30).getTime(),
    to: new Date().getTime(),
    label: t("legacy:filters.periods.last_30_days"),
    accountIds: [],
  });

  const {
    totals: { balance, income, expense },
    meta: { currency, language },
  } = useSummaryWidget({ globalFilter });

  const [isDiverged, setIsDiverged] = useState(false);

  useEffect(() => {
    if (myAccountIds.length > 0 && globalFilter.accountIds.length === 0) {
      setGlobalFilter((prev: any) => ({ ...prev, accountIds: myAccountIds }));
    }
  }, [myAccountIds]);

  useEffect(() => {
    const name = user?.name || t("common:shared.user_default");
    setPageTitle(
      t("dashboard:dashboardPage.greetings", { name }),
      t("dashboard:dashboardPage.subtitle"),
    );
    return () => resetPageTitle();
  }, [setPageTitle, resetPageTitle, user, t]);

  const handleGlobalUpdate = (updates: any) => {
    setGlobalFilter((prev: any) => ({ ...prev, ...updates }));
    setIsDiverged(false);
  };
  const handleLocalChange = () => setIsDiverged(true);

  const breakpoints = useMemo(
    () => ({ xl: 1300, lg: 1000, md: 768, sm: 480, xs: 0 }),
    [],
  );
  const cols = useMemo(() => ({ xl: 12, lg: 12, md: 12, sm: 6, xs: 4 }), []);
  const margin = useMemo(() => [16, 16] as [number, number], []);
  const containerPadding = useMemo(() => [0, 0] as [number, number], []);

  if (isUserLoading || isAccLoading)
    return (
      <CenteredSpinner
        isContainer
        message={t("common:ui.loading_finances", "Завантаження фінансів...")}
      />
    );

  return (
    <DashboardContainer $isEditMode={isEditMode} $isMounted={isMounted}>
      <FilterBar>
        <div style={{ display: "flex", gap: "10px" }}>
          <EditButton
            onClick={() => setIsEditMode(!isEditMode)}
            $active={isEditMode}
          >
            {isEditMode ? <HiCheck /> : <HiPencil />}
            <ButtonLabel>
              {isEditMode
                ? t("dashboard:dashboardPage.save_mode")
                : t("dashboard:dashboardPage.edit_mode")}
            </ButtonLabel>
          </EditButton>
          {isEditMode && (
            <EditButton onClick={handleResetLayout}>
              <HiXMark />
              <ButtonLabel>{t("dashboard:dashboardPage.reset_layout")}</ButtonLabel>
            </EditButton>
          )}
        </div>

        <WidgetControls
          variant="global"
          hasChanges={isDiverged}
          currentLabel={globalFilter.label}
          currentAccountIds={globalFilter.accountIds}
          onFilterChange={handleGlobalUpdate}
          currentFrom={globalFilter.from}
          currentTo={globalFilter.to}
          restrictedAccountIds={myAccountIds}
          disabled={isEditMode}
        />
      </FilterBar>

      <ResponsiveGridLayout
        className="layout"
        layouts={controlledLayouts}
        breakpoints={breakpoints}
        cols={cols}
        rowHeight={30}
        margin={margin}
        containerPadding={containerPadding}
        onLayoutChange={onLayoutChange}
        isDraggable={isEditMode}
        isResizable={isEditMode}
        draggableHandle=".drag-overlay"
        useCSSTransforms={true}
        measureBeforeMount={false}
      >
        <GridItem key="balance">
          <WidgetInnerContainer $isEditMode={isEditMode}>
            <BalanceCard
              label={t("dashboard:dashboard.total_balance")}
              value={formatMoney(balance, currency, language)}
            />
            {isEditMode && <DragOverlay className="drag-overlay" />}
          </WidgetInnerContainer>
        </GridItem>

        <GridItem key="income">
          <WidgetInnerContainer $isEditMode={isEditMode}>
            <IncomeCard
              label={t("dashboard:dashboard.income_period")}
              value={formatMoney(income, currency, language)}
            />
            {isEditMode && <DragOverlay className="drag-overlay" />}
          </WidgetInnerContainer>
        </GridItem>

        <GridItem key="expense">
          <WidgetInnerContainer $isEditMode={isEditMode}>
            <ExpenseCard
              label={t("dashboard:dashboard.expense_period")}
              value={formatMoney(expense, currency, language)}
            />
            {isEditMode && <DragOverlay className="drag-overlay" />}
          </WidgetInnerContainer>
        </GridItem>

        <GridItem key="accounts">
          <WidgetInnerContainer $isEditMode={isEditMode}>
            <AccountsWidget />
            {isEditMode && <DragOverlay className="drag-overlay" />}
          </WidgetInnerContainer>
        </GridItem>

        <GridItem key="recent">
          <WidgetInnerContainer $isEditMode={isEditMode}>
            <RecentTransactionsWidget
              globalFilter={globalFilter}
              onDiverge={handleLocalChange}
            />
            {isEditMode && <DragOverlay className="drag-overlay" />}
          </WidgetInnerContainer>
        </GridItem>

        <GridItem key="trend">
          <WidgetInnerContainer $isEditMode={isEditMode}>
            <TrendWidget
              type="expense"
              title={t("dashboard:dashboardPage.widget_trend_expenses")}
              color="#ef4444"
              globalFilter={globalFilter}
              onDiverge={handleLocalChange}
            />
            {isEditMode && <DragOverlay className="drag-overlay" />}
          </WidgetInnerContainer>
        </GridItem>

        <GridItem key="pie">
          <WidgetInnerContainer $isEditMode={isEditMode}>
            <ExpensesPieWidget
              globalFilter={globalFilter}
              onDiverge={handleLocalChange}
              type="expense"
            />
            {isEditMode && <DragOverlay className="drag-overlay" />}
          </WidgetInnerContainer>
        </GridItem>

        <GridItem key="top_categories">
          <WidgetInnerContainer $isEditMode={isEditMode}>
            <TopListWidget
              type="expense"
              entity="category"
              title={t("dashboard:dashboardPage.widget_top_categories")}
              globalFilter={globalFilter}
              onDiverge={handleLocalChange}
            />
            {isEditMode && <DragOverlay className="drag-overlay" />}
          </WidgetInnerContainer>
        </GridItem>

        <GridItem key="top_counterparties">
          <WidgetInnerContainer $isEditMode={isEditMode}>
            <TopListWidget
              type="expense"
              entity="counterparty"
              title={t("dashboard:dashboardPage.widget_top_shops")}
              globalFilter={globalFilter}
              onDiverge={handleLocalChange}
            />
            {isEditMode && <DragOverlay className="drag-overlay" />}
          </WidgetInnerContainer>
        </GridItem>
      </ResponsiveGridLayout>
    </DashboardContainer>
  );
}

export default Dashboard;
