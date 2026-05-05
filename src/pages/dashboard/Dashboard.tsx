import {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
  forwardRef,
} from "react";
import { startOfMonth, endOfMonth } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { HiPencil, HiCheck, HiXMark } from "react-icons/hi2";
import * as GridLayoutPkg from "react-grid-layout";
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

import { type StatsFilter } from "../../services/apiStats";
import { useHeader } from "../../context/HeaderContext";
import api from "../../services/Axios";
import Spinner from "../../components/ui/Spinner";
import { formatMoney } from "../../utils/helpers";
import { useSummaryWidget } from "../../hooks/Stats/useSummaryWidget";

import {
  DashboardContainer,
  FilterBar,
  EditButton,
  GridItemContainer,
  WidgetInnerContainer,
  DragOverlay,
  ButtonLabel,
} from "./Dashboard.styles";

// @ts-ignore
const Responsive =
  GridLayoutPkg.Responsive || GridLayoutPkg.default?.Responsive;

const withMyWidth = (Component: any) => {
  return (props: any) => {
    const [width, setWidth] = useState<number | null>(null);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const handleResize = () => {
        if (ref.current) setWidth(ref.current.offsetWidth);
      };
      const resizeObserver = new ResizeObserver(() => handleResize());
      if (ref.current) {
        resizeObserver.observe(ref.current);
        handleResize();
      }
      window.addEventListener("resize", handleResize);
      return () => {
        resizeObserver.disconnect();
        window.removeEventListener("resize", handleResize);
      };
    }, []);

    return (
      <div
        ref={ref}
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
        }}
      >
        {width !== null && (
          <Component
            width={width}
            {...props}
            style={{ height: "100%", flex: 1 }}
          />
        )}
      </div>
    );
  };
};

const ResponsiveGridLayout = Responsive
  ? withMyWidth(Responsive)
  : () => <div style={{ color: "red" }}>Grid Error</div>;

// 🔥 ФІНАЛЬНА СІТКА v10: Виправлено баг RGL зі стрибком віджета вниз
const defaultLayouts = {
  lg: [
    { i: "balance", x: 0, y: 0, w: 4, h: 3, minH: 2, minW: 2 },
    { i: "income", x: 4, y: 0, w: 4, h: 3, minH: 2, minW: 2 },
    { i: "expense", x: 8, y: 0, w: 4, h: 3, minH: 2, minW: 2 },
    { i: "accounts", x: 0, y: 3, w: 4, h: 8, minH: 5, minW: 3 },
    {
      i: "recent",
      x: 4,
      y: 3,
      w: 8,
      h: 8,
      minH: 6,
      minW: 4,
      isResizable: false,
    },
    { i: "trend", x: 0, y: 11, w: 8, h: 9, minH: 6, minW: 4 },
    { i: "pie", x: 8, y: 11, w: 4, h: 9, minH: 6, minW: 3 },
    { i: "top_categories", x: 0, y: 20, w: 6, h: 9, minH: 6, minW: 3 },
    { i: "top_counterparties", x: 6, y: 20, w: 6, h: 9, minH: 6, minW: 3 },
  ],
  md: [
    { i: "balance", x: 0, y: 0, w: 4, h: 3, minH: 2, minW: 2 },
    { i: "income", x: 4, y: 0, w: 3, h: 3, minH: 2, minW: 2 },
    { i: "expense", x: 7, y: 0, w: 3, h: 3, minH: 2, minW: 2 },
    { i: "accounts", x: 0, y: 3, w: 5, h: 8, minH: 5, minW: 3 },
    { i: "recent", x: 5, y: 3, w: 5, h: 8, isResizable: false, minW: 4 },
    { i: "trend", x: 0, y: 11, w: 10, h: 9, minH: 6, minW: 4 },
    { i: "pie", x: 0, y: 20, w: 5, h: 9, minH: 6, minW: 3 },
    { i: "top_categories", x: 5, y: 20, w: 5, h: 9, minH: 6, minW: 3 },
    { i: "top_counterparties", x: 0, y: 29, w: 10, h: 9, minH: 6, minW: 4 },
  ],
  sm: [
    { i: "balance", x: 0, y: 0, w: 6, h: 3, minH: 2, minW: 2 },
    { i: "income", x: 0, y: 3, w: 3, h: 3, minH: 2, minW: 2 },
    { i: "expense", x: 3, y: 3, w: 3, h: 3, minH: 2, minW: 2 },
    { i: "accounts", x: 0, y: 6, w: 3, h: 8, minH: 5, minW: 3 },
    { i: "recent", x: 3, y: 6, w: 3, h: 8, isResizable: false, minW: 3 },
    { i: "trend", x: 0, y: 14, w: 6, h: 9, minH: 6, minW: 4 },
    { i: "pie", x: 0, y: 23, w: 6, h: 9, minH: 6, minW: 3 },
    { i: "top_categories", x: 0, y: 32, w: 3, h: 9, minH: 6, minW: 3 },
    { i: "top_counterparties", x: 3, y: 32, w: 3, h: 9, minH: 6, minW: 3 },
  ],
  xs: [
    { i: "balance", x: 0, y: 0, w: 4, h: 3, minH: 2, minW: 2 },
    { i: "income", x: 0, y: 3, w: 2, h: 3, minH: 2, minW: 2 },
    { i: "expense", x: 2, y: 3, w: 2, h: 3, minH: 2, minW: 2 },
    { i: "accounts", x: 0, y: 6, w: 4, h: 8, minH: 5, minW: 2 },
    { i: "recent", x: 0, y: 14, w: 4, h: 8, isResizable: false, minW: 2 },
    { i: "trend", x: 0, y: 22, w: 4, h: 9, minH: 6, minW: 2 },
    { i: "pie", x: 0, y: 31, w: 4, h: 9, minH: 6, minW: 2 },
    { i: "top_categories", x: 0, y: 40, w: 4, h: 9, minH: 6, minW: 2 },
    { i: "top_counterparties", x: 0, y: 49, w: 4, h: 9, minH: 6, minW: 2 },
  ],
  // 🔥 ДОДАНО БРЕЙКПОІНТ XXS: Це забороняє бібліотеці "вгадувати" координати і ламати сітку
  xxs: [
    { i: "balance", x: 0, y: 0, w: 2, h: 3, minH: 2, minW: 2 },
    { i: "income", x: 0, y: 3, w: 2, h: 3, minH: 2, minW: 2 },
    { i: "expense", x: 0, y: 6, w: 2, h: 3, minH: 2, minW: 2 },
    { i: "accounts", x: 0, y: 9, w: 2, h: 8, minH: 5, minW: 2 },
    { i: "recent", x: 0, y: 17, w: 2, h: 8, isResizable: false, minW: 2 },
    { i: "trend", x: 0, y: 25, w: 2, h: 9, minH: 6, minW: 2 },
    { i: "pie", x: 0, y: 34, w: 2, h: 9, minH: 6, minW: 2 },
    { i: "top_categories", x: 0, y: 43, w: 2, h: 9, minH: 6, minW: 2 },
    { i: "top_counterparties", x: 0, y: 52, w: 2, h: 9, minH: 6, minW: 2 },
  ],
};

const GridItem = forwardRef(
  ({ style, className, children, ...props }: any, ref: any) => {
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
      const saved = localStorage.getItem("dashboard_layout_v7"); // 🔥 Змінив ключ, щоб сітка точно оновилась у всіх
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
    (currentLayout: any, allLayouts: any) => {
      if (!isEditMode) return;
      setLayouts(allLayouts);
      localStorage.setItem("dashboard_layout_v7", JSON.stringify(allLayouts));
    },
    [isEditMode],
  );

  const handleResetLayout = () => {
    setLayouts(defaultLayouts);
    localStorage.removeItem("dashboard_layout_v7");
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

  const [globalFilter, setGlobalFilter] = useState<StatsFilter>({
    from: startOfMonth(new Date()).getTime(),
    to: endOfMonth(new Date()).getTime(),
    label: t("dashboardPage.filter_period_label"),
    accountIds: [],
  });

  // 🔥 Завантажуємо дані для нових карток
  const {
    totals: { balance, income, expense },
    meta: { currency, language },
  } = useSummaryWidget({ globalFilter });

  const [isDiverged, setIsDiverged] = useState(false);

  useEffect(() => {
    if (myAccountIds.length > 0 && globalFilter.accountIds.length === 0) {
      setGlobalFilter((prev) => ({ ...prev, accountIds: myAccountIds }));
    }
  }, [myAccountIds]);

  useEffect(() => {
    const name = user?.name || t("shared.user_default");
    setPageTitle(
      t("dashboardPage.greetings", { name }),
      t("dashboardPage.subtitle"),
    );
    return () => resetPageTitle();
  }, [setPageTitle, resetPageTitle, user, t]);

  const handleGlobalUpdate = (updates: Partial<StatsFilter>) => {
    setGlobalFilter((prev) => ({ ...prev, ...updates }));
    setIsDiverged(false);
  };
  const handleLocalChange = () => setIsDiverged(true);

  if (isUserLoading || isAccLoading) return <Spinner />;

  return (
    <DashboardContainer $isEditMode={isEditMode} $isMounted={isMounted}>
      <FilterBar>
        <div style={{ display: "flex", gap: "10px" }}>
          <EditButton
            onClick={() => setIsEditMode(!isEditMode)}
            $active={isEditMode}
            title={
              isEditMode
                ? t("dashboardPage.save_mode")
                : t("dashboardPage.edit_mode")
            }
          >
            {isEditMode ? <HiCheck /> : <HiPencil />}
            <ButtonLabel>
              {isEditMode
                ? t("dashboardPage.save_mode")
                : t("dashboardPage.edit_mode")}
            </ButtonLabel>
          </EditButton>
          {isEditMode && (
            <EditButton
              onClick={handleResetLayout}
              title={t("dashboardPage.reset_layout")}
            >
              <HiXMark />
              <ButtonLabel>{t("dashboardPage.reset_layout")}</ButtonLabel>
            </EditButton>
          )}
        </div>

        <WidgetControls
          variant="global"
          hasChanges={isDiverged}
          currentLabel={
            globalFilter.label || t("dashboardPage.filter_period_label")
          }
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
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
        rowHeight={30}
        margin={[20, 20]}
        containerPadding={[0, 0]}
        onLayoutChange={onLayoutChange}
        isDraggable={isEditMode}
        isResizable={isEditMode}
        draggableHandle=".drag-overlay"
        useCSSTransforms={true}
      >
        {/* 🔥 ТРИ НОВІ КАРТКИ */}
        <GridItem key="balance">
          <WidgetInnerContainer $isEditMode={isEditMode}>
            <BalanceCard
              label={t("dashboard.total_balance")}
              value={formatMoney(balance, currency, language)}
            />
            {isEditMode && <DragOverlay className="drag-overlay" />}
          </WidgetInnerContainer>
        </GridItem>

        <GridItem key="income">
          <WidgetInnerContainer $isEditMode={isEditMode}>
            <IncomeCard
              label={t("dashboard.income_period")}
              value={formatMoney(income, currency, language)}
            />
            {isEditMode && <DragOverlay className="drag-overlay" />}
          </WidgetInnerContainer>
        </GridItem>

        <GridItem key="expense">
          <WidgetInnerContainer $isEditMode={isEditMode}>
            <ExpenseCard
              label={t("dashboard.expense_period")}
              value={formatMoney(expense, currency, language)}
            />
            {isEditMode && <DragOverlay className="drag-overlay" />}
          </WidgetInnerContainer>
        </GridItem>

        {/* СТАРІ ВІДЖЕТИ */}
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
              title={t("dashboardPage.widget_trend_expenses")}
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
              title={t("dashboardPage.widget_top_categories")}
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
              title={t("dashboardPage.widget_top_shops")}
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
