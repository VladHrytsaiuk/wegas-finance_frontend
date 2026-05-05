import { format } from "date-fns";
import {
  HiCheck,
  HiPencil,
  HiInformationCircle,
  HiEye,
  HiExclamationTriangle,
  HiCheckCircle,
  HiQuestionMarkCircle,
} from "react-icons/hi2";
import { useTranslation } from "react-i18next";

// Components
import Checkbox from "../ui/Checkbox";

// Styles & Types
import * as S from "./TransactionRow.styles";
import type { ExtendedTransaction, ExistingTransactionDB } from "./ImportTypes";

interface Props {
  tx: ExtendedTransaction;
  idx: number;
  isSelected: boolean;
  categories: any[];
  counterparties: any[];
  onToggle: (idx: number) => void;
  onEdit: (tx: ExtendedTransaction, idx: number) => void;
  onShowDuplicate: (
    newTx: ExtendedTransaction,
    oldTx: ExistingTransactionDB
  ) => void;
}

export default function TransactionRow({
  tx,
  idx,
  isSelected,
  categories,
  counterparties,
  onToggle,
  onEdit,
  onShowDuplicate,
}: Props) {
  const { t } = useTranslation();

  // Визначаємо статус рядка
  let rowStatus: "duplicate" | "warning" | "selected" | "normal" = "normal";
  if (tx.is_duplicate) rowStatus = "duplicate";
  else if (isSelected) rowStatus = "selected";
  else if (tx.is_potential_duplicate) rowStatus = "warning";

  return (
    <S.Tr $status={rowStatus}>
      {/* CHECKBOX */}
      <S.CellCenter>
        {tx.is_duplicate ? (
          <div title={t("export_import:importModal.tip_exact_duplicate", "Точний дублікат")}>
            <HiInformationCircle size={22} color="var(--color-text-tertiary)" />
          </div>
        ) : (
          <Checkbox checked={isSelected} onChange={() => onToggle(idx)} />
        )}
      </S.CellCenter>

      {/* DATE */}
      <S.DateCell>{format(new Date(tx.date), "dd.MM HH:mm")}</S.DateCell>

      {/* DETAILS (Note + Counterparty + Status) */}
      <S.NoteCell>
        <S.MainInfo>
          {tx.counterparty_id
            ? counterparties.find((c: any) => c.id === tx.counterparty_id)
                ?.name || tx.counterparty_name
            : tx.counterparty_name}

          {tx.counterparty_id && (
            <HiCheck
              size={16}
              color="var(--color-brand-500)"
              title={t("export_import:importModal.tip_found_db", "Знайдено в базі")}
            />
          )}
        </S.MainInfo>

        <S.SubInfo>{tx.description}</S.SubInfo>

        {tx.existing_transaction && (
          <S.DuplicateStatusRow>
            {tx.is_duplicate && (
              <S.StatusBadge $color="red">
                <HiInformationCircle size={14} />{" "}
                {t("export_import:importModal.status_in_db", "Вже в базі")}
              </S.StatusBadge>
            )}
            {!tx.is_duplicate && tx.is_potential_duplicate && !isSelected && (
              <S.StatusBadge $color="yellow">
                <HiExclamationTriangle size={14} />{" "}
                {t("export_import:importModal.status_similar", "Схожа")}
              </S.StatusBadge>
            )}
            {!tx.is_duplicate && tx.is_potential_duplicate && isSelected && (
              <S.StatusBadge $color="green">
                <HiCheckCircle size={14} />{" "}
                {t("export_import:importModal.status_create_new", "Створити нову")}
              </S.StatusBadge>
            )}

            <S.CompareButton
              onClick={(e) => {
                e.stopPropagation();
                onShowDuplicate(tx, tx.existing_transaction!);
              }}
              title={t("export_import:importModal.tip_compare", "Порівняти")}
            >
              <HiEye size={18} />
            </S.CompareButton>
          </S.DuplicateStatusRow>
        )}
      </S.NoteCell>

      {/* CATEGORY */}
      <td>
        {tx.category_id ? (
          <S.CategoryBadge>
            {categories.find((c: any) => c.id === tx.category_id)?.name}
          </S.CategoryBadge>
        ) : (
          <S.MissingCategoryBadge onClick={() => onEdit(tx, idx)}>
            <HiQuestionMarkCircle size={14} />{" "}
            {t("common:ui.select_placeholder_default")}
          </S.MissingCategoryBadge>
        )}
      </td>

      {/* AMOUNT */}
      <S.CellRight>
        <S.Amount $type={tx.type}>{(tx.amount / 100).toFixed(2)}</S.Amount>
      </S.CellRight>

      {/* ACTIONS */}
      <S.CellCenter>
        <S.IconButton onClick={() => onEdit(tx, idx)}>
          <HiPencil size={16} />
        </S.IconButton>
      </S.CellCenter>
    </S.Tr>
  );
}
