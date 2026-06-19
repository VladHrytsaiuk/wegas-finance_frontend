import { useTranslation } from "react-i18next";
import { HiExclamationTriangle, HiCalculator, HiPlus } from "react-icons/hi2";
import { Button } from "../../ui/Button";
import { Overlay } from "../../ui/Modal";
import * as S from "./TransactionConflictModal.styles";

// --- TYPES ---

interface ConflictData {
  total: number;
  itemsSum: number;
  diff: number;
}

interface TransactionConflictModalProps {
  data: ConflictData;
  onCancel: () => void;
  onUpdateTotal: () => void;
  onAddRemainder: () => void;
  onIgnore: () => void;
}

// --- COMPONENT ---

export default function TransactionConflictModal({
  data,
  onCancel,
  onUpdateTotal,
  onAddRemainder,
  onIgnore,
}: TransactionConflictModalProps) {
  const { t } = useTranslation();

  // Helper for formatting price (Presentational Logic)
  const formatPrice = (val: number) => (val / 100).toFixed(2);

  return (
    <Overlay
      onClick={(e) => e.stopPropagation()}
      role="dialog"
      aria-modal="true"
    >
      <S.ModalContainer onClick={(e) => e.stopPropagation()}>
        {/* HEADER */}
        <S.Header>
          <S.WarningIconWrapper>
            <HiExclamationTriangle />
          </S.WarningIconWrapper>
          <div>
            <S.Title>{t("transactions:transactionForm.conflict_title")}</S.Title>
            <S.Subtitle>{t("transactions:transactionForm.conflict_subtitle")}</S.Subtitle>
          </div>
        </S.Header>

        {/* CONTENT */}
        <S.Content>
          <S.ComparisonGrid>
            <S.AmountBox>
              <span>{t("transactions:transactionForm.label_amount")}</span>
              <span>{formatPrice(data.total)}</span>
            </S.AmountBox>

            <S.DividerIcon>≠</S.DividerIcon>

            <S.AmountBox $isSuccess>
              <span>{t("transactions:transactionForm.label_items_sum")}</span>
              <span>{formatPrice(data.itemsSum)}</span>
            </S.AmountBox>
          </S.ComparisonGrid>

          <S.DiffBox>
            <span>{t("transactions:transactionForm.conflict_diff_label")}</span>
            <strong>
              {formatPrice(data.diff)} {t("common:common.currency_suffix")}
            </strong>
          </S.DiffBox>
        </S.Content>

        {/* ACTIONS */}
        <S.Actions>
          {/* Option 1: Add Remainder Item (Only if diff is positive) */}
          {data.diff > 0 && (
            <S.ActionButton
              variation="primary"
              onClick={onAddRemainder}
              style={{ backgroundColor: "var(--color-brand-600)" }}
            >
              <HiPlus size={18} />
              {t("transactions:transactionForm.btn_add_remainder")}
            </S.ActionButton>
          )}

          {/* Option 2: Update Total Amount */}
          <S.ActionButton
            variation={data.diff > 0 ? "secondary" : "primary"}
            onClick={onUpdateTotal}
          >
            <HiCalculator size={18} />
            {t("transactions:transactionForm.btn_use_items")} ({formatPrice(data.itemsSum)})
          </S.ActionButton>

          <S.SecondaryActions>
            {/* Option 3: Ignore & Save */}
            <Button
              variation="danger"
              size="medium"
              onClick={onIgnore}
              style={{ justifyContent: "center" }}
            >
              {t("transactions:transactionForm.btn_ignore")}
            </Button>

            {/* Option 4: Cancel */}
            <Button
              variation="secondary"
              size="medium"
              onClick={onCancel}
              style={{ justifyContent: "center" }}
            >
              {t("common:common.return")}
            </Button>
          </S.SecondaryActions>
        </S.Actions>
      </S.ModalContainer>
    </Overlay>
  );
}
