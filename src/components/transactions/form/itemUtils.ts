import type { TransactionItem } from "../../../types";

export const DISCOUNT_ITEM_NAME = "Знижка";

export const isDiscountItem = (
  item: Partial<TransactionItem>,
): boolean =>
  item.name === DISCOUNT_ITEM_NAME || item.name === "Знижка за чеком";

