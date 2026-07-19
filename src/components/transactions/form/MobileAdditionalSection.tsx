import React, { memo } from "react";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";
import { HiChevronDown, HiChevronUp, HiLockClosed } from "react-icons/hi2";

import TagSelect from "../../tags/TagSelect";
import { DateRangePicker } from "../../ui/DateRangePicker";
import { TimePicker } from "../../ui/TimePicker";
import { AssetSection } from "./AssetSection";
import { ExpenseDetailsSection } from "./ExpenseDetailsSection";
import * as S from "./styles";
import type { Category, Tag, TransactionItem } from "../../../types";
import type { CreateAssetOnFlyInput } from "../../../services/apiTransactions";

type EditableTransactionItem = Partial<TransactionItem> & {
  comment?: string;
  categoryId?: string;
  category_id?: string | null;
  tempId?: string;
};

interface ItemTableActions {
  addItem: () => void;
  addDiscount: () => void;
  setIsClearModalOpen: (value: boolean) => void;
  updateItem: (
    idx: number,
    field: "categoryId" | "name" | "quantity" | "price_per_unit" | "comment",
    value: string | number,
  ) => void;
  removeItem: (idx: number) => void;
}

interface MobileAdditionalSectionProps {
  isOpen: boolean;
  onToggle: () => void;
  summary: string;
  hasSummary: boolean;
  isLocked: boolean;
  date: string;
  timeStr: string;
  onDateChange: (value: string) => void;
  onTimeChange: (value: string) => void;
  dateError?: string;
  isTransfer: boolean;
  tags: Tag[];
  tagIds: string[];
  onTagIdsChange: (value: string[]) => void;
  onCreateTag: (name: string) => void;
  isCreatingTag: boolean;
  showAssetSection: boolean;
  assetSectionProps?: {
    transactionType: string;
    isOpen: boolean;
    assetId: string;
    newAsset: CreateAssetOnFlyInput | null;
    setAssetId: (value: string) => void;
    setNewAsset: (value: CreateAssetOnFlyInput | null) => void;
    transactionDate: number;
    mileage: string;
    setMileage: (value: string) => void;
    onToggle: () => void;
    onToggleKeyDown: (e: React.KeyboardEvent) => void;
    isCarSelected: boolean;
    currentMileage?: number | null;
  };
  showExpenseDetails: boolean;
  expenseDetailsProps?: {
    showDetails: boolean;
    items: EditableTransactionItem[];
    actions: ItemTableActions;
    currencyCode?: string;
    categories: Category[];
    onOpen: () => void;
    onClose: () => void;
  };
}

const LabelWithLock = ({
  label,
  isLocked,
}: {
  label: string;
  isLocked?: boolean;
}) => (
  <S.LabelLockWrapper>
    {label}
    {isLocked && (
      <S.LockIconWrapper title="Синхронізовані дані (змінювати заборонено)">
        <HiLockClosed />
      </S.LockIconWrapper>
    )}
  </S.LabelLockWrapper>
);

function MobileAdditionalSectionComponent({
  isOpen,
  onToggle,
  summary,
  hasSummary,
  isLocked,
  date,
  timeStr,
  onDateChange,
  onTimeChange,
  dateError,
  isTransfer,
  tags,
  tagIds,
  onTagIdsChange,
  onCreateTag,
  isCreatingTag,
  showAssetSection,
  assetSectionProps,
  showExpenseDetails,
  expenseDetailsProps,
}: MobileAdditionalSectionProps) {
  const { t } = useTranslation();

  return (
    <>
      <S.MobileDisclosureToggle
        $open={isOpen}
        role="button"
        tabIndex={0}
        aria-expanded={isOpen}
        onClick={onToggle}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onToggle();
          }
        }}
      >
        <S.MobileDisclosureTitleWrap>
          <S.MobileDisclosureTitle>Додатково</S.MobileDisclosureTitle>
          {hasSummary && (
            <S.MobileDisclosureSubtitle>{summary}</S.MobileDisclosureSubtitle>
          )}
        </S.MobileDisclosureTitleWrap>
        {isOpen ? <HiChevronUp /> : <HiChevronDown />}
      </S.MobileDisclosureToggle>

      {isOpen && (
        <S.MobileDisclosureContent>
          <S.MobileDateTimeRow>
            <div>
              <S.Label>
                <LabelWithLock
                  label={t("transactions:transactionForm.label_date")}
                  isLocked={isLocked}
                />
              </S.Label>
              <div style={isLocked ? { pointerEvents: "none", opacity: 0.7 } : {}}>
                <DateRangePicker
                  mode="single"
                  date={date ? new Date(date).getTime() : null}
                  onDateChange={(ts) =>
                    onDateChange(format(new Date(ts), "yyyy-MM-dd"))
                  }
                />
              </div>
              {dateError && <S.ErrorText>{dateError}</S.ErrorText>}
            </div>
            <div>
              <S.Label>
                <LabelWithLock
                  label={t("transactions:transactionForm.label_time")}
                  isLocked={isLocked}
                />
              </S.Label>
              <div style={isLocked ? { pointerEvents: "none", opacity: 0.7 } : {}}>
                <TimePicker value={timeStr} onChange={onTimeChange} />
              </div>
            </div>
          </S.MobileDateTimeRow>

          {!isTransfer && (
            <div>
              <S.Label>{t("transactions:transactionForm.label_tags")}</S.Label>
              <TagSelect
                tags={tags}
                value={tagIds}
                onChange={onTagIdsChange}
                onCreate={onCreateTag}
                isCreating={isCreatingTag}
              />
            </div>
          )}

          {showAssetSection && assetSectionProps && (
            <AssetSection {...assetSectionProps} />
          )}

          {showExpenseDetails && expenseDetailsProps && (
            <ExpenseDetailsSection {...expenseDetailsProps} />
          )}
        </S.MobileDisclosureContent>
      )}
    </>
  );
}

export const MobileAdditionalSection = memo(
  MobileAdditionalSectionComponent,
  (prev, next) =>
    prev.isOpen === next.isOpen &&
    prev.summary === next.summary &&
    prev.hasSummary === next.hasSummary &&
    prev.isLocked === next.isLocked &&
    prev.date === next.date &&
    prev.timeStr === next.timeStr &&
    prev.dateError === next.dateError &&
    prev.isTransfer === next.isTransfer &&
    prev.tags === next.tags &&
    prev.tagIds === next.tagIds &&
    prev.onTagIdsChange === next.onTagIdsChange &&
    prev.onCreateTag === next.onCreateTag &&
    prev.isCreatingTag === next.isCreatingTag &&
    prev.showAssetSection === next.showAssetSection &&
    prev.assetSectionProps === next.assetSectionProps &&
    prev.showExpenseDetails === next.showExpenseDetails &&
    prev.expenseDetailsProps === next.expenseDetailsProps &&
    prev.onToggle === next.onToggle &&
    prev.onDateChange === next.onDateChange &&
    prev.onTimeChange === next.onTimeChange,
);

MobileAdditionalSection.displayName = "MobileAdditionalSection";
