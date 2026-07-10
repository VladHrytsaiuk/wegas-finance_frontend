import React, { memo } from "react";
import { HiTrash } from "react-icons/hi2";
import { useTranslation } from "react-i18next";

// 🔥 ВАЖЛИВО: Перевір, що useItemRow знаходиться в цій же папці
import { useItemRow } from "../../../hooks/Transactions/useItemRow";
import { PriceInput } from "./PriceInput";
import { CategorySelect } from "../../categories/CategorySelect";
import * as S from "./styles";
import type { Category, TransactionItem } from "../../../types";

type EditableTransactionItem = Partial<TransactionItem> & {
  comment?: string;
  categoryId?: string;
  category_id?: string | null;
  tempId?: string;
};

interface ItemRowActions {
  updateItem: (
    idx: number,
    field: "categoryId" | "name" | "quantity" | "price_per_unit" | "comment",
    value: string | number,
  ) => void;
  removeItem: (idx: number) => void;
}

interface ItemRowProps {
  item: EditableTransactionItem;
  idx: number;
  actions: ItemRowActions;
  categories: Category[];
}

export const ItemRow = memo(
  ({ item, idx, actions, categories }: ItemRowProps) => {
    const { t } = useTranslation();

    const {
      handleManualCategoryChange,
      handleUpdateName,
      handleUpdateQty,
      handleUpdatePrice,
      handleUpdateComment,
      handleRemove,
      totalDisplay,
    } = useItemRow({ item, idx, actions, categories });

    return (
      <S.TableRow>
        <S.ColIndex>{idx + 1}</S.ColIndex>

        {/* Назва */}
        <S.TableInput
          placeholder={t("transactions:itemsTable.placeholder_name")}
          value={item.name}
          onChange={(e) => handleUpdateName(e.target.value)}
          autoFocus={!item.name}
        />

        {/* Категорія */}
        <div style={{ minWidth: 0 }}>
          <CategorySelect
            categories={categories}
            value={item.categoryId}
            onChange={handleManualCategoryChange}
            placeholder={t("categories:categorySelect.placeholder_default")}
            size="small"
          />
        </div>

        {/* Кількість */}
        <div style={{ textAlign: "right" }}>
          <PriceInput
            value={item.quantity || 0}
            onChange={handleUpdateQty}
            placeholder="1"
            style={{ textAlign: "right" }}
          />
        </div>

        {/* Ціна */}
        <div style={{ textAlign: "right" }}>
          <PriceInput
            value={item.price_per_unit || 0}
            onChange={handleUpdatePrice}
            placeholder="0.00"
            isCurrency={true}
            style={{ textAlign: "right" }}
          />
        </div>

        {/* Сума */}
        <S.ColTotal>{totalDisplay}</S.ColTotal>

        {/* Комент */}
        <S.TableInput
          placeholder={t("transactions:itemsTable.placeholder_comment")}
          value={item.comment || ""}
          onChange={(e) => handleUpdateComment(e.target.value)}
          style={{ fontStyle: "italic", color: "var(--color-text-secondary)" }}
        />

        {/* Видалити */}
        <S.ColCenter>
          <S.DeleteButton
            type="button"
            onClick={handleRemove}
            title={t("common:common.delete")}
            tabIndex={-1}
          >
            <HiTrash size={16} />
          </S.DeleteButton>
        </S.ColCenter>
      </S.TableRow>
    );
  }
);

ItemRow.displayName = "ItemRow";
