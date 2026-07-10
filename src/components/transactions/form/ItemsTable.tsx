import { useMemo } from "react";
import { HiXMark } from "react-icons/hi2";
import { useTranslation } from "react-i18next";

import { useSettings } from "../../../context/SettingsContext";
import { formatMoney } from "../../../utils/helpers";
import { Button } from "../../ui/Button";
import type { Category, TransactionItem } from "../../../types";

// 🔥 ВАЖЛИВО: Імпорт має бути у фігурних дужках
import { ItemRow } from "./ItemRow";
import * as S from "./styles";

type EditableTransactionItem = Partial<TransactionItem> & {
  comment?: string;
  categoryId?: string;
  category_id?: string | null;
  tempId?: string;
};

interface ItemTableActions {
  addItem: () => void;
  setIsClearModalOpen: (value: boolean) => void;
  updateItem: (
    idx: number,
    field: "categoryId" | "name" | "quantity" | "price_per_unit" | "comment",
    value: string | number,
  ) => void;
  removeItem: (idx: number) => void;
}

interface ItemsTableProps {
  items: EditableTransactionItem[];
  actions: ItemTableActions;
  onClose: () => void;
  currencyCode?: string;
  categories: Category[];
}

export const ItemsTable = ({
  items,
  actions,
  onClose,
  currencyCode,
  categories,
}: ItemsTableProps) => {
  const { t } = useTranslation();
  const { language, currency: defaultCurrency } = useSettings();

  const displayCurrency = currencyCode || defaultCurrency;

  const itemsTotal = useMemo(() => {
    return items.reduce((sum, item) => {
      const p = Number(item.price_per_unit) || 0;
      const q = Number(item.quantity) || 0;
      return sum + p * q;
    }, 0);
  }, [items]);

  // 🔥 НОВА ЛОГІКА ЗАКРИТТЯ
  const handleCloseAttempt = () => {
    if (items.length > 0) {
      // Якщо є товари, викликаємо ту ж модалку, що і Cmd+D (попередження про видалення)
      // Це спрацює, бо actions прокинуті з useTransactionLogic
      actions.setIsClearModalOpen(true);
    } else {
      // Якщо товарів немає, просто закриваємо деталізацію
      onClose();
    }
  };

  return (
    <S.ItemsContainer>
      <S.ItemsHeader>
        <S.ItemsTitle>
          {t("transactions:itemsTable.title_details")}
          <S.CloseTableButton
            type="button"
            // 👇 ТУТ ВИКОРИСТОВУЄМО НОВУ ФУНКЦІЮ
            onClick={handleCloseAttempt}
            title={t("common:common.close")}
          >
            <HiXMark />
          </S.CloseTableButton>
        </S.ItemsTitle>

        <Button
          size="small"
          variation="soft"
          type="button"
          onClick={actions.addItem}
          icon={<HiPlusCircle size={16} />}
        >
          {t("transactions:itemsTable.button_add")}
        </Button>
      </S.ItemsHeader>

      <S.TableScrollWrapper>
        <S.TableInnerContent>
          <S.TableHeaderRow>
            <S.ColCenter>#</S.ColCenter>
            <div>{t("transactions:itemsTable.header_item_name")}</div>
            <div>{t("transactions:itemsTable.header_category")}</div>
            <S.ColRight>
              {t("transactions:itemsTable.header_quantity")}
            </S.ColRight>
            <S.ColRight>{t("transactions:itemsTable.header_price")}</S.ColRight>
            <S.ColRight>
              {t("transactions:itemsTable.header_amount")}
            </S.ColRight>
            <div>{t("transactions:itemsTable.header_note")}</div>
            <div></div>
          </S.TableHeaderRow>

          {items.length > 0 ? (
            items.map((item, idx) => (
              <ItemRow
                key={item.tempId || idx}
                idx={idx}
                item={item}
                actions={actions}
                categories={categories}
              />
            ))
          ) : (
            <S.EmptyState>
              {t("transactions:itemsTable.status_empty")}
            </S.EmptyState>
          )}
        </S.TableInnerContent>
      </S.TableScrollWrapper>

      <S.ItemsFooter>
        <span
          style={{
            fontSize: "0.75rem",
            fontWeight: 600,
            color: "var(--color-text-secondary)",
            textTransform: "uppercase",
          }}
        >
          {t("transactions:itemsTable.footer_total")}
        </span>
        <S.TotalAmount>
          {formatMoney(itemsTotal, displayCurrency, language)}
        </S.TotalAmount>
      </S.ItemsFooter>
    </S.ItemsContainer>
  );
};
