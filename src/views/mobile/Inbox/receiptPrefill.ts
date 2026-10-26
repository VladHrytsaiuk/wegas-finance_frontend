import { format } from "date-fns";

import type { InboxEntry } from "../../../services/apiInbox";
import { emptyInitial, type SheetInitial } from "../AddSheet/editState";
import { minorToInput } from "../AddSheet/items";

// Операція з чека: усе, що відомо з чека, вже заповнено (як «Створити
// транзакцію» на старій сторінці чека).
export function initialFromReceipt(entry: InboxEntry): SheetInitial {
  const source = entry.receipt_source;
  const total = entry.total ?? source?.total ?? 0;
  const occurredAt = entry.occurred_at ?? source?.receipt_date ?? null;
  const items = (source?.items ?? []).map((item) => ({
    name: item.name,
    quantity: item.quantity || 1,
    price: item.price_per_unit,
    categoryId: item.category_id || "",
    total: item.total_amount,
  }));
  const itemsSum = items.reduce((sum, item) => sum + item.total, 0);
  // Знижка, яку магазин не розніс по цінах: різниця між товарами й сумою чека.
  const discount = items.length && itemsSum > total ? itemsSum - total : 0;
  const date = occurredAt ? new Date(occurredAt) : null;

  return {
    ...emptyInitial(),
    kind: "expense",
    amount: minorToInput(total),
    categoryId: source?.category?.id ?? "",
    accountId: entry.selected_account_id ?? "",
    merchantId: source?.counterparty?.id ?? "",
    ...(date
      ? { date: format(date, "yyyy-MM-dd"), time: format(date, "HH:mm") }
      : {}),
    note: entry.note || "",
    items,
    discount,
    discountName: "Знижка за чеком",
  };
}
