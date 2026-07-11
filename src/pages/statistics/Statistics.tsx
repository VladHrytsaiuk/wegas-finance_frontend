import { lazy, Suspense } from "react";
import { HiArrowDownTray, HiChartPie } from "react-icons/hi2";
import { usePageTitle } from "../../hooks/usePageTitle";

import { WidgetControls } from "../../components/stats/widgets/WidgetControls";
import { TrendWidget } from "../../components/stats/widgets/TrendWidget";
import { ExpensesPieWidget } from "../../components/stats/widgets/ExpensesPieWidget";
import { DetailedTable } from "../../components/stats/DetailedTable";
import Modal from "../../components/ui/Modal";
import { Button } from "../../components/ui/Button";
import { EmptyState } from "../../components/ui/EmptyState";
import { CenteredSpinner } from "../../components/ui/CenteredSpinner";
import { useIsMobile } from "../../hooks/useIsMobile";
import { FAB } from "../../components/ui/FAB";

import { useStatistics } from "../../hooks/Stats/useStatistics";
import * as S from "./Statistics.styles";

const ExportPage = lazy(() => import("../settings/ExportPage"));

export const Statistics = () => {
  const { state, actions, t } = useStatistics();
  usePageTitle(t("navigation:general.statistics", "Статистика"));
  const isMobile = useIsMobile();
  const {
    filter,
    flowType,
    activeTab,
    enrichedData,
    totalSum,
    currency,
    isLoading,
  } = state;

  return (
    <Modal>
      <S.PageContainer style={{ paddingBottom: isMobile ? "80px" : undefined }}>
        <S.Header>
          <S.ControlsGroup>
            <S.TypeToggle>
              <S.ToggleBtn
                $active={flowType === "expense"}
                $type="expense"
                onClick={() => actions.setFlowType("expense")}
              >
                {t("categories:categoriesPage.filter_expense")}
              </S.ToggleBtn>
              <S.ToggleBtn
                $active={flowType === "income"}
                $type="income"
                onClick={() => actions.setFlowType("income")}
              >
                {t("categories:categoriesPage.filter_income")}
              </S.ToggleBtn>
            </S.TypeToggle>

            <WidgetControls
              variant="local"
              currentLabel={
                filter.label || t("stats_utility:statisticsPage.filter_period")
              }
              currentAccountIds={filter.accountIds}
              onFilterChange={actions.handleFilterChange}
              currentFrom={filter.from}
              currentTo={filter.to}
            />

            {!isMobile && (
              <Modal.Open opens="export-all">
                <Button
                  variation="secondary"
                  icon={<HiArrowDownTray size={18} />}
                >
                  {t("export_import:exportPage.title")}
                </Button>
              </Modal.Open>
            )}
          </S.ControlsGroup>
        </S.Header>

        <S.TrendContainer>
          <TrendWidget
            type={flowType}
            title={
              flowType === "income"
                ? t("stats_utility:statisticsPage.trend_title_income")
                : t("stats_utility:statisticsPage.trend_title_expense")
            }
            color={flowType === "income" ? "#22c55e" : "#ef4444"}
            globalFilter={filter}
          />
        </S.TrendContainer>

        <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: "1rem" }}>
          <S.TabsContainer>
            <S.Tab
              $active={activeTab === "category"}
              onClick={() => actions.setActiveTab("category")}
            >
              {t("stats_utility:statisticsPage.tab_categories")}
            </S.Tab>
            <S.Tab
              $active={activeTab === "counterparty"}
              onClick={() => actions.setActiveTab("counterparty")}
            >
              {t("stats_utility:statisticsPage.tab_counterparties")}
            </S.Tab>
            <S.Tab
              $active={activeTab === "tag"}
              onClick={() => actions.setActiveTab("tag")}
            >
              {t("stats_utility:statisticsPage.tab_tags")}
            </S.Tab>
          </S.TabsContainer>
        </div>

        {isLoading && enrichedData.length === 0 ? (
          <div style={{ height: "450px", position: "relative" }}>
            <CenteredSpinner isContainer />
          </div>
        ) : enrichedData.length === 0 ? (
          <EmptyState
            icon={<HiChartPie />}
            title={t("dashboard:dashboard.no_data")}
            description={t("common:common.try_adjusting_search")}
          />
        ) : (
          <S.ContentGrid>
            <S.PieContainer>
              <ExpensesPieWidget
                data={enrichedData}
                currency={currency}
                type={flowType}
                activeTab={activeTab}
                hideHeader
              />
            </S.PieContainer>

            <S.ChartSection>
              <DetailedTable
                data={enrichedData}
                currency={currency}
                totalSum={totalSum}
                type={activeTab}
              />
            </S.ChartSection>
          </S.ContentGrid>
        )}

        <Modal.Window name="export-all">
          <Suspense fallback={<CenteredSpinner isContainer />}>
            <ExportPage
              initialFrom={filter.from}
              initialTo={filter.to}
              initialAccountIds={filter.accountIds}
              initialTab="stats"
            />
          </Suspense>
        </Modal.Window>
      </S.PageContainer>

      {isMobile && (
        <Modal.Open opens="export-all">
          <FAB icon={<HiArrowDownTray />} />
        </Modal.Open>
      )}
    </Modal>
  );
};
