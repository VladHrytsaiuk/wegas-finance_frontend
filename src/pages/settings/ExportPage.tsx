import {
  HiArrowDownTray,
  HiChartPie,
  HiListBullet,
  HiTableCells,
  HiDocumentText,
  HiBuildingStorefront,
  HiTag,
} from "react-icons/hi2";

import { DateRangePicker } from "../../components/ui/DateRangePicker";
import { MultiSelectFilter } from "../../components/shared/TableToolbar/MultiSelectFilter";
import { Button } from "../../components/ui/Button";

import { useExportPage } from "../../hooks/Settings/useExportPage";
import * as S from "./ExportPage.styles";

export default function ExportPage() {
  const { state, actions, t } = useExportPage();
  const {
    activeTab,
    loading,
    dateRange,
    transFilters,
    transFormat,
    statsAccountIds,
    statsOptions,
    filterConfigs,
  } = state;

  return (
    <S.PageContainer>
      <S.Header>
        <S.HeaderTitle>
          <h1>{t("export_import:exportPage.title")}</h1>
          <p>{t("export_import:exportPage.subtitle")}</p>
        </S.HeaderTitle>
        <Button
          size="medium"
          onClick={actions.handleExport}
          disabled={loading}
          icon={<HiArrowDownTray />}
        >
          {loading
            ? t("export_import:exportPage.button_processing")
            : t("export_import:exportPage.button_download")}
        </Button>
      </S.Header>

      <S.TabsContainer>
        <S.TabButton
          $active={activeTab === "transactions"}
          onClick={() => actions.setActiveTab("transactions")}
        >
          <HiListBullet /> {t("export_import:exportPage.tab_transactions")}
        </S.TabButton>
        <S.TabButton
          $active={activeTab === "stats"}
          onClick={() => actions.setActiveTab("stats")}
        >
          <HiChartPie /> {t("export_import:exportPage.tab_stats")}
        </S.TabButton>
      </S.TabsContainer>

      <S.ControlPanel>
        <div>
          <S.Label>{t("export_import:exportPage.section_params")}</S.Label>
          <S.ControlRow>
            <S.DateRangeWrapper>
              <DateRangePicker
                mode="range"
                dateFrom={dateRange.from}
                dateTo={dateRange.to}
                onChange={(from, to) => actions.setDateRange({ from, to })}
              />
            </S.DateRangeWrapper>
            <S.Divider />
            <MultiSelectFilter
              config={filterConfigs[1]}
              value={
                activeTab === "transactions"
                  ? transFilters.accountIds
                  : statsAccountIds
              }
              onChange={(val) =>
                activeTab === "transactions"
                  ? actions.handleTransFilterChange("accountIds", val)
                  : actions.setStatsAccountIds(val)
              }
            />
          </S.ControlRow>
        </div>

        {activeTab === "transactions" ? (
          <>
            <div>
              <S.Label>{t("export_import:exportPage.section_filters")}</S.Label>
              <S.ControlRow>
                <MultiSelectFilter
                  config={filterConfigs[0]}
                  value={transFilters.type}
                  onChange={(v) => actions.handleTransFilterChange("type", v)}
                />
                <MultiSelectFilter
                  config={filterConfigs[2]}
                  value={transFilters.categoryIds}
                  onChange={(v) =>
                    actions.handleTransFilterChange("categoryIds", v)
                  }
                />
                <MultiSelectFilter
                  config={filterConfigs[3]}
                  value={transFilters.counterpartyIds}
                  onChange={(v) =>
                    actions.handleTransFilterChange("counterpartyIds", v)
                  }
                />
                <MultiSelectFilter
                  config={filterConfigs[4]}
                  value={transFilters.userIds}
                  onChange={(v) =>
                    actions.handleTransFilterChange("userIds", v)
                  }
                />
              </S.ControlRow>
            </div>

            <S.FormatSection>
              <S.Label>{t("export_import:exportPage.section_format")}</S.Label>
              <S.ControlRow>
                <S.FormatButton
                  $active={transFormat === "xlsx"}
                  onClick={() => actions.setTransFormat("xlsx")}
                >
                  <HiTableCells /> Excel
                </S.FormatButton>
                <S.FormatButton
                  $active={transFormat === "csv"}
                  onClick={() => actions.setTransFormat("csv")}
                >
                  <HiDocumentText /> CSV
                </S.FormatButton>
                <S.FormatButton
                  $active={transFormat === "pdf"}
                  onClick={() => actions.setTransFormat("pdf")}
                >
                  <HiDocumentText /> PDF
                </S.FormatButton>
              </S.ControlRow>
            </S.FormatSection>
          </>
        ) : (
          <>
            <div>
              <S.Label>{t("export_import:exportPage.section_structure")}</S.Label>
              <S.OptionsGrid>
                <S.OptionCard $checked={statsOptions.summary}>
                  <input
                    type="checkbox"
                    checked={statsOptions.summary}
                    onChange={() => actions.toggleStatsOption("summary")}
                  />
                  <div className="icon">
                    <HiChartPie />
                  </div>
                  <span>{t("export_import:exportStatsModal.option_summary")}</span>
                </S.OptionCard>

                <S.OptionCard $checked={statsOptions.categories}>
                  <input
                    type="checkbox"
                    checked={statsOptions.categories}
                    onChange={() => actions.toggleStatsOption("categories")}
                  />
                  <div className="icon">
                    <HiChartPie />
                  </div>
                  <span>{t("export_import:exportStatsModal.option_categories")}</span>
                </S.OptionCard>

                <S.OptionCard $checked={statsOptions.topTransactions}>
                  <input
                    type="checkbox"
                    checked={statsOptions.topTransactions}
                    onChange={() =>
                      actions.toggleStatsOption("topTransactions")
                    }
                  />
                  <div className="icon">
                    <HiListBullet />
                  </div>
                  <span>{t("export_import:exportPage.option_top_15")}</span>
                </S.OptionCard>

                <S.OptionCard $checked={statsOptions.counterparties}>
                  <input
                    type="checkbox"
                    checked={statsOptions.counterparties}
                    onChange={() => actions.toggleStatsOption("counterparties")}
                  />
                  <div className="icon">
                    <HiBuildingStorefront />
                  </div>
                  <span>{t("export_import:exportStatsModal.option_counterparties")}</span>
                </S.OptionCard>

                <S.OptionCard $checked={statsOptions.tags}>
                  <input
                    type="checkbox"
                    checked={statsOptions.tags}
                    onChange={() => actions.toggleStatsOption("tags")}
                  />
                  <div className="icon">
                    <HiTag />
                  </div>
                  <span>{t("export_import:exportStatsModal.option_tags")}</span>
                </S.OptionCard>
              </S.OptionsGrid>
            </div>

            <S.StatsInfo
              dangerouslySetInnerHTML={{ __html: t("export_import:exportPage.stats_info") }}
            />
          </>
        )}
      </S.ControlPanel>
    </S.PageContainer>
  );
}
