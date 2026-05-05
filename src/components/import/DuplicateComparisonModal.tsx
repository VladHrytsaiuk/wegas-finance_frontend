import { HiArrowRight, HiXMark } from "react-icons/hi2";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";

// Types
import type { ExtendedTransaction, ExistingTransactionDB } from "./ImportTypes";

// UI Components
import { Button } from "../ui/Button"; // Використовуємо наш UI Button

// Styles
import * as S from "./DuplicateComparisonModal.styles";

interface Props {
  newTx: ExtendedTransaction;
  existingTx: ExistingTransactionDB;
  onClose: () => void;
}

export default function DuplicateComparisonModal({
  newTx,
  existingTx,
  onClose,
}: Props) {
  const { t } = useTranslation();

  const translateType = (type: string) => {
    switch (type) {
      case "expense":
        return t("transactionForm.type_expense");
      case "income":
        return t("transactionForm.type_income");
      case "transfer":
        return t("transactionForm.type_transfer");
      default:
        return type;
    }
  };

  const formatDate = (dateStr: string | Date) => {
    try {
      return format(new Date(dateStr), "dd.MM.yyyy HH:mm");
    } catch {
      return String(dateStr);
    }
  };

  const formatAmount = (amount: number) => {
    return (amount / 100).toFixed(2);
  };

  return (
    <S.Overlay onClick={onClose}>
      <S.Card onClick={(e) => e.stopPropagation()}>
        {/* HEADER */}
        <S.Header>
          <S.HeaderTitle>
            {t("importModal.duplicate_title", "Порівняння даних")}
          </S.HeaderTitle>
          <S.CloseButton onClick={onClose} type="button">
            <HiXMark size={24} />
          </S.CloseButton>
        </S.Header>

        <S.Grid>
          {/* === НОВА ТРАНЗАКЦІЯ === */}
          <S.Column $bg="var(--color-brand-50)">
            <S.Title>
              {t("importModal.duplicate_new", "Нова (з файлу)")}
            </S.Title>

            <S.Row>
              <S.Label>{t("exportMapping.table_date")}</S.Label>
              <S.Value>{formatDate(newTx.date)}</S.Value>
            </S.Row>

            <S.Row>
              <S.Label>{t("exportMapping.table_type")}</S.Label>
              <div>
                <S.Badge $type={newTx.type}>
                  {translateType(newTx.type)}
                </S.Badge>
              </div>
            </S.Row>

            <S.Row>
              <S.Label>{t("exportMapping.table_amount")}</S.Label>
              <S.Value>{formatAmount(newTx.amount)}</S.Value>
            </S.Row>

            <S.Row>
              <S.Label>{t("importModal.col_raw_desc", "Опис (Raw)")}</S.Label>
              <S.Value>{newTx.description}</S.Value>
            </S.Row>

            <S.Row>
              <S.Label>{t("exportMapping.table_counterparty")}</S.Label>
              <S.Value>{newTx.counterparty_name || "—"}</S.Value>
            </S.Row>

            <S.Row>
              <S.Label>
                {t("importModal.col_prediction", "Категорія (прогноз)")}
              </S.Label>
              <S.Value>{newTx.predicted_category || "—"}</S.Value>
            </S.Row>
          </S.Column>

          {/* ARROW */}
          <S.ArrowContainer>
            <HiArrowRight size={24} />
          </S.ArrowContainer>

          {/* === ІСНУЮЧА ТРАНЗАКЦІЯ === */}
          <S.Column $bg="var(--color-yellow-50)">
            <S.Title>
              {t("importModal.duplicate_existing", "Існуюча (в базі)")}
            </S.Title>

            <S.Row>
              <S.Label>{t("exportMapping.table_date")}</S.Label>
              <S.Value>{formatDate(existingTx.date)}</S.Value>
            </S.Row>

            <S.Row>
              <S.Label>{t("exportMapping.table_type")}</S.Label>
              <div>
                <S.Badge $type={existingTx.type}>
                  {translateType(existingTx.type)}
                </S.Badge>
              </div>
            </S.Row>

            <S.Row>
              <S.Label>{t("exportMapping.table_amount")}</S.Label>
              <S.Value>{formatAmount(existingTx.amount)}</S.Value>
            </S.Row>

            <S.Row>
              <S.Label>{t("exportMapping.table_note")}</S.Label>
              <S.Value>{existingTx.note || "—"}</S.Value>
            </S.Row>

            <S.Row>
              <S.Label>{t("exportMapping.table_counterparty")}</S.Label>
              <S.Value>{existingTx.counterparty?.name || "—"}</S.Value>
            </S.Row>

            <S.Row>
              <S.Label>{t("exportMapping.table_category")}</S.Label>
              <S.Value>{existingTx.category?.name || "—"}</S.Value>
            </S.Row>
          </S.Column>
        </S.Grid>

        {/* FOOTER */}
        <S.Footer>
          <Button variation="secondary" onClick={onClose}>
            {t("common.close", "Закрити")}
          </Button>
        </S.Footer>
      </S.Card>
    </S.Overlay>
  );
}
