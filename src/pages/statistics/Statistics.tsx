import { HiArrowDownTray } from "react-icons/hi2";

import { WidgetControls } from "../../components/stats/widgets/WidgetControls";
import { TrendWidget } from "../../components/stats/widgets/TrendWidget";
import { ExpensesPieWidget } from "../../components/stats/widgets/ExpensesPieWidget";
import { DetailedTable } from "../../components/stats/DetailedTable";
import ExportStatsModal from "../../components/stats/ExportModal";
import Modal from "../../components/ui/Modal";
import { Button } from "../../components/ui/Button";

import { useStatistics } from "../../hooks/Stats/useStatistics";
import * as S from "./Statistics.styles";

export const Statistics = () => {
  const { state, actions, t } = useStatistics();
  const {
    filter,
    isExportModalOpen,
    flowType,
    activeTab,
    enrichedData,
    totalSum,
    currency,
  } = state;

  return (
    <Modal>
      <S.PageContainer>
        <S.Header>
          <S.ControlsGroup>
            <S.TypeToggle>
              <S.ToggleBtn
                $active={flowType === "expense"}
                $type="expense"
                onClick={() => actions.setFlowType("expense")}
              >
                {t("categoriesPage.filter_expense")}
              </S.ToggleBtn>
              <S.ToggleBtn
                $active={flowType === "income"}
                $type="income"
                onClick={() => actions.setFlowType("income")}
              >
                {t("categoriesPage.filter_income")}
              </S.ToggleBtn>
            </S.TypeToggle>

            <WidgetControls
              variant="local"
              currentLabel={filter.label || t("statisticsPage.filter_period")}
              currentAccountIds={filter.accountIds}
              onFilterChange={actions.handleFilterChange}
              currentFrom={filter.from}
              currentTo={filter.to}
            />

            <Button
              icon={<HiArrowDownTray size={18} />}
              onClick={() => actions.setIsExportModalOpen(true)}
            >
              {t("exportPage.title")}
            </Button>
          </S.ControlsGroup>
        </S.Header>

        <S.TrendContainer>
          <TrendWidget
            type={flowType}
            title={
              flowType === "income"
                ? t("statisticsPage.trend_title_income")
                : t("statisticsPage.trend_title_expense")
            }
            color={flowType === "income" ? "#22c55e" : "#ef4444"}
            globalFilter={filter}
          />
        </S.TrendContainer>

        <S.TabsContainer>
          <S.Tab
            $active={activeTab === "category"}
            onClick={() => actions.setActiveTab("category")}
          >
            {t("statisticsPage.tab_categories")}
          </S.Tab>
          <S.Tab
            $active={activeTab === "counterparty"}
            onClick={() => actions.setActiveTab("counterparty")}
          >
            {t("statisticsPage.tab_counterparties")}
          </S.Tab>
          <S.Tab
            $active={activeTab === "tag"}
            onClick={() => actions.setActiveTab("tag")}
          >
            {t("statisticsPage.tab_tags")}
          </S.Tab>
        </S.TabsContainer>

        <S.ContentGrid>
          <S.PieContainer>
            <ExpensesPieWidget
              data={enrichedData}
              currency={currency}
              type={flowType}
              activeTab={activeTab}
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

        {isExportModalOpen && (
          <ExportStatsModal
            initialFrom={filter.from}
            initialTo={filter.to}
            initialAccountIds={filter.accountIds}
            onClose={() => actions.setIsExportModalOpen(false)}
          />
        )}
      </S.PageContainer>
    </Modal>
  );
};
