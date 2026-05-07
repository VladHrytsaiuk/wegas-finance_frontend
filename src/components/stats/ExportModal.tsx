import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import {
  HiXMark,
  HiChartPie,
  HiListBullet,
  HiBuildingStorefront,
  HiTag,
  HiTableCells,
} from "react-icons/hi2";
import { Trans } from "react-i18next";

import { DateRangePicker } from "../ui/DateRangePicker";
import { MultiSelectFilter } from "../shared/TableToolbar/MultiSelectFilter";
import { Button } from "../ui/Button";

import { useExportStatsModal } from "../../hooks/Stats/useExportStatsModal";
import { useEscapeKey } from "../../hooks/useEscapeKey";
import * as S from "./ExportModal.styles";

interface ExportStatsModalProps {
  initialFrom: number;
  initialTo: number;
  initialAccountIds?: string[];
  onClose: () => void;
}

export default function ExportStatsModal(props: ExportStatsModalProps) {
  const { state, actions, t } = useExportStatsModal(props);
  const { dateRange, accountIds, options, accountsConfig, loading } = state;
  const { onClose } = props;
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  useEscapeKey(onClose);

  useEffect(() => {
    closeBtnRef.current?.focus();
  }, []);

  return createPortal(
    <S.Overlay onClick={onClose}>
      <S.ModalContainer
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <S.Header>
          <S.Title id="modal-title">
            {t("export_import:exportStatsModal.title")}
          </S.Title>
          <S.CloseBtn
            onClick={onClose}
            ref={closeBtnRef}
            aria-label={t("common:ui.close", "Закрити")}
            title={t("common:ui.close", "Закрити")}
          >
            <HiXMark size={24} />
          </S.CloseBtn>
        </S.Header>

        <S.Content>
          <div>
            <S.SectionLabel>
              {t("export_import:exportStatsModal.section_params")}
            </S.SectionLabel>
            <S.ControlRow>
              <div style={{ flex: 1, minWidth: "220px" }}>
                <DateRangePicker
                  mode="range"
                  dateFrom={dateRange.from}
                  dateTo={dateRange.to}
                  onChange={(from, to) => actions.setDateRange({ from, to })}
                />
              </div>
              <S.Divider />
              <div style={{ flex: 1 }}>
                <MultiSelectFilter
                  config={accountsConfig}
                  value={accountIds}
                  onChange={actions.setAccountIds}
                />
              </div>
            </S.ControlRow>
          </div>

          <div>
            <S.SectionLabel>
              {t("export_import:exportStatsModal.section_structure")}
            </S.SectionLabel>
            <S.OptionsGrid>
              <S.OptionCard $checked={options.summary}>
                <input
                  type="checkbox"
                  checked={options.summary}
                  onChange={() => actions.toggleOption("summary")}
                />
                <div className="icon">
                  <HiChartPie />
                </div>
                <span>
                  {t("export_import:exportStatsModal.option_summary")}
                </span>
              </S.OptionCard>

              <S.OptionCard $checked={options.topTransactions}>
                <input
                  type="checkbox"
                  checked={options.topTransactions}
                  onChange={() => actions.toggleOption("topTransactions")}
                />
                <div className="icon">
                  <HiListBullet />
                </div>
                <span>
                  {t("export_import:exportStatsModal.option_top_transactions")}
                </span>
              </S.OptionCard>

              <S.OptionCard $checked={options.categories}>
                <input
                  type="checkbox"
                  checked={options.categories}
                  onChange={() => actions.toggleOption("categories")}
                />
                <div className="icon">
                  <HiChartPie />
                </div>
                <span>
                  {t("export_import:exportStatsModal.option_categories")}
                </span>
              </S.OptionCard>

              <S.OptionCard $checked={options.counterparties}>
                <input
                  type="checkbox"
                  checked={options.counterparties}
                  onChange={() => actions.toggleOption("counterparties")}
                />
                <div className="icon">
                  <HiBuildingStorefront />
                </div>
                <span>
                  {t("export_import:exportStatsModal.option_counterparties")}
                </span>
              </S.OptionCard>

              <S.OptionCard $checked={options.tags}>
                <input
                  type="checkbox"
                  checked={options.tags}
                  onChange={() => actions.toggleOption("tags")}
                />
                <div className="icon">
                  <HiTag />
                </div>
                <span>{t("export_import:exportStatsModal.option_tags")}</span>
              </S.OptionCard>
            </S.OptionsGrid>
          </div>

          <S.FormatInfo>
            <HiTableCells size={20} style={{ color: "#107930" }} />
            <span>
              <Trans
                i18nKey="export_import:exportStatsModal.format_info"
                components={{ strong: <strong /> }}
              />
            </span>
          </S.FormatInfo>
        </S.Content>

        <S.Footer>
          <Button variation="secondary" onClick={onClose} disabled={loading}>
            {t("export_import:exportStatsModal.button_cancel")}
          </Button>
          <Button
            variation="primary"
            onClick={actions.handleExport}
            disabled={loading}
          >
            {loading
              ? t("export_import:exportStatsModal.button_generating")
              : t("export_import:exportStatsModal.button_download")}
          </Button>
        </S.Footer>
      </S.ModalContainer>
    </S.Overlay>,
    document.body
  );
}
