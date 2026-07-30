import React, { memo } from "react";
import { HiChevronDown, HiTrash } from "react-icons/hi2";
import { useTranslation } from "react-i18next";
import { useIsMobile } from "../../../hooks/useIsMobile";
import { CURRENCY_SYMBOLS } from "../../../utils/currency";

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
  currencyCode?: string;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const ItemRow = memo(
  ({
    item,
    idx,
    actions,
    categories,
    currencyCode = "UAH",
    isCollapsed = false,
    onToggleCollapse,
  }: ItemRowProps) => {
    const { t } = useTranslation();
    const isMobile = useIsMobile();

    const {
      handleManualCategoryChange,
      handleUpdateName,
      handleUpdateQty,
      handleUpdatePrice,
      handleUpdateComment,
      handleRemove,
      totalDisplay,
    } = useItemRow({ item, idx, actions, categories });

    const unitPriceDisplay = new Intl.NumberFormat("uk-UA", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format((Number(item.price_per_unit) || 0) / 100);

    if (isMobile) {
      return (
        <S.MobileItemCard>
          <S.MobileItemHeader
            role="button"
            tabIndex={0}
            aria-expanded={!isCollapsed}
            onClick={onToggleCollapse}
            onKeyDown={(e) => {
              if ((e.key === "Enter" || e.key === " ") && onToggleCollapse) {
                e.preventDefault();
                onToggleCollapse();
              }
            }}
          >
            <S.MobileItemHeaderMain>
              <S.MobileItemIndex>{idx + 1}</S.MobileItemIndex>
              <S.MobileItemHeaderTitle>
                {item.name?.trim() ||
                  t("transactions:itemsTable.placeholder_name")}
              </S.MobileItemHeaderTitle>
            </S.MobileItemHeaderMain>
            <S.MobileItemHeaderActions>
              <S.MobileItemHeaderMeta>
                <S.MobileItemHeaderAmount>
                  {`${Number(item.quantity) || 0} × ${unitPriceDisplay} ${
                    CURRENCY_SYMBOLS[currencyCode] || currencyCode
                  }`}
                </S.MobileItemHeaderAmount>
              </S.MobileItemHeaderMeta>
              <S.MobileCollapseIcon $collapsed={isCollapsed}>
                <HiChevronDown size={18} />
              </S.MobileCollapseIcon>
            <S.MobileDeleteButton
              type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove();
                }}
              title={t("common:common.delete")}
            >
              <HiTrash size={18} />
            </S.MobileDeleteButton>
            </S.MobileItemHeaderActions>
          </S.MobileItemHeader>

          {!isCollapsed && (
            <>
          <S.MobileFieldBlock>
            <S.MobileFieldLabel>
              {t("transactions:itemsTable.header_item_name")}
            </S.MobileFieldLabel>
            <S.TableInput
              placeholder={t("transactions:itemsTable.placeholder_name")}
              value={item.name}
              onChange={(e) => handleUpdateName(e.target.value)}
              autoFocus={!item.name}
            />
          </S.MobileFieldBlock>

          <S.MobileFieldBlock>
            <S.MobileFieldLabel>
              {t("transactions:itemsTable.header_category")}
            </S.MobileFieldLabel>
            <CategorySelect
              categories={categories}
              value={item.categoryId}
              onChange={handleManualCategoryChange}
              placeholder={t("categories:categorySelect.placeholder_default")}
            />
          </S.MobileFieldBlock>

          <S.MobileAmountGrid>
            <S.MobileFieldBlock>
              <S.MobileFieldLabel>
                {t("transactions:itemsTable.header_quantity")}
              </S.MobileFieldLabel>
              <PriceInput
                value={item.quantity || 0}
                onChange={handleUpdateQty}
                placeholder="1"
                style={{ textAlign: "right" }}
              />
            </S.MobileFieldBlock>

            <S.MobileFieldBlock>
              <S.MobileFieldLabel>
                {t("transactions:itemsTable.header_price")}
              </S.MobileFieldLabel>
              <PriceInput
                value={item.price_per_unit || 0}
                onChange={handleUpdatePrice}
                placeholder="0.00"
                isCurrency={true}
                style={{ textAlign: "right" }}
              />
            </S.MobileFieldBlock>

            <S.MobileFieldBlock>
              <S.MobileFieldLabel>
                {t("transactions:itemsTable.header_amount")}
              </S.MobileFieldLabel>
              <S.MobileTotalValue>{totalDisplay}</S.MobileTotalValue>
            </S.MobileFieldBlock>
          </S.MobileAmountGrid>

          <S.MobileFieldBlock>
            <S.MobileFieldLabel>
              {t("transactions:itemsTable.header_note")}
            </S.MobileFieldLabel>
            <S.TableInput
              placeholder={t("transactions:itemsTable.placeholder_comment")}
              value={item.comment || ""}
              onChange={(e) => handleUpdateComment(e.target.value)}
              style={{ fontStyle: "italic", color: "var(--color-text-secondary)" }}
            />
          </S.MobileFieldBlock>
            </>
          )}
        </S.MobileItemCard>
      );
    }

    return (
      <S.TableRow>
        <S.ColIndex>{idx + 1}</S.ColIndex>
        <S.TableInput
          placeholder={t("transactions:itemsTable.placeholder_name")}
          value={item.name}
          onChange={(e) => handleUpdateName(e.target.value)}
          autoFocus={!item.name}
        />
        <div style={{ minWidth: 0 }}>
          <CategorySelect
            categories={categories}
            value={item.categoryId}
            onChange={handleManualCategoryChange}
            placeholder={t("categories:categorySelect.placeholder_default")}
            size="small"
          />
        </div>
        <div style={{ textAlign: "right" }}>
          <PriceInput
            value={item.quantity || 0}
            onChange={handleUpdateQty}
            placeholder="1"
            style={{ textAlign: "right" }}
          />
        </div>
        <div style={{ textAlign: "right" }}>
          <PriceInput
            value={item.price_per_unit || 0}
            onChange={handleUpdatePrice}
            placeholder="0.00"
            isCurrency={true}
            style={{ textAlign: "right" }}
          />
        </div>
        <S.ColTotal>{totalDisplay}</S.ColTotal>
        <S.TableInput
          placeholder={t("transactions:itemsTable.placeholder_comment")}
          value={item.comment || ""}
          onChange={(e) => handleUpdateComment(e.target.value)}
          style={{ fontStyle: "italic", color: "var(--color-text-secondary)" }}
        />
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
