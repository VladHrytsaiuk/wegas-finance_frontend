import React, { memo } from "react";
import { HiListBullet } from "react-icons/hi2";
import { useTranslation } from "react-i18next";

import { ItemsTable } from "./ItemsTable";
import * as S from "./styles";
import type { Category, TransactionItem } from "../../../types";

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

interface ExpenseDetailsSectionProps {
  showDetails: boolean;
  items: EditableTransactionItem[];
  actions: ItemTableActions;
  currencyCode?: string;
  categories: Category[];
  onOpen: () => void;
  onClose: () => void;
}

function ExpenseDetailsSectionComponent({
  showDetails,
  items,
  actions,
  currencyCode,
  categories,
  onOpen,
  onClose,
}: ExpenseDetailsSectionProps) {
  const { t } = useTranslation();

  return (
    <S.ItemsTableContainer>
      {!showDetails ? (
        <S.DetailsTriggerButton
          type="button"
          onClick={onOpen}
          $desktopFullWidth
        >
          <HiListBullet size={18} />
          <span>{t("transactions:transactionForm.details_button_show")}</span>
        </S.DetailsTriggerButton>
      ) : (
        <ItemsTable
          items={items}
          actions={actions}
          onClose={onClose}
          currencyCode={currencyCode}
          categories={categories}
        />
      )}
    </S.ItemsTableContainer>
  );
}

export const ExpenseDetailsSection = memo(
  ExpenseDetailsSectionComponent,
  (prev, next) =>
    prev.showDetails === next.showDetails &&
    prev.items === next.items &&
    prev.actions.addItem === next.actions.addItem &&
    prev.actions.removeItem === next.actions.removeItem &&
    prev.actions.updateItem === next.actions.updateItem &&
    prev.actions.setIsClearModalOpen === next.actions.setIsClearModalOpen &&
    prev.currencyCode === next.currencyCode &&
    prev.categories === next.categories &&
    prev.onOpen === next.onOpen &&
    prev.onClose === next.onClose,
);

ExpenseDetailsSection.displayName = "ExpenseDetailsSection";
