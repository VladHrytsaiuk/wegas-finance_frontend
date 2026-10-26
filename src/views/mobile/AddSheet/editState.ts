import { format } from "date-fns";

import { isDiscountItem } from "../../../components/transactions/form/itemUtils";
import type { TransactionFull } from "../Transaction/transactionFull";
import { minorToInput, type DraftItem } from "./items";

// Початковий стан панелі: порожній для нової операції або з наявної — для
// редагування.

export type Kind = "expense" | "income" | "transfer" | "debt";
export type DebtType = "loan_give" | "loan_repay" | "debt_take" | "debt_repay";

const DEBT_TYPES = new Set<string>([
  "loan_give",
  "loan_repay",
  "debt_take",
  "debt_repay",
]);

export interface SheetInitial {
  kind: Kind;
  debtType: DebtType;
  amount: string;
  categoryId: string;
  accountId: string;
  targetAccountId: string;
  counterpartyId: string;
  merchantId: string;
  date: string;
  time: string;
  note: string;
  items: DraftItem[];
  discount: number;
  /** Назва рядка знижки, щоб не перейменувати «Знижка за чеком» при збереженні. */
  discountName?: string;
  /** Знижка з прив'язаного чека. */
  discountSourceId?: string;
  tagIds: string[];
  assetId: string;
  mileage: string;
}

export function emptyInitial(): SheetInitial {
  const now = new Date();
  return {
    kind: "expense",
    debtType: "loan_give",
    amount: "",
    categoryId: "",
    accountId: "",
    targetAccountId: "",
    counterpartyId: "",
    merchantId: "",
    date: format(now, "yyyy-MM-dd"),
    time: format(now, "HH:mm"),
    note: "",
    items: [],
    discount: 0,
    tagIds: [],
    assetId: "",
    mileage: "",
  };
}

export function initialFromTransaction(tx: TransactionFull): SheetInitial {
  const type = (tx.type || "").toLowerCase();
  const kind: Kind = type.startsWith("transfer")
    ? "transfer"
    : DEBT_TYPES.has(type)
      ? "debt"
      : type === "income"
        ? "income"
        : "expense";
  const date = new Date(tx.date);

  // Переказ: «звідки» і «куди» з точки зору грошей, а не половини переказу.
  const partnerId = tx.related_transaction?.account_id ?? "";
  const [fromId, toId] =
    type === "transfer_in"
      ? [partnerId, tx.account_id]
      : [tx.account_id, partnerId];

  const goods = (tx.items || []).filter(
    (i) => !(isDiscountItem(i) || i.total_amount < 0),
  );
  const discounts = (tx.items || []).filter(
    (i) => isDiscountItem(i) || i.total_amount < 0,
  );

  return {
    kind,
    debtType: kind === "debt" ? (type as DebtType) : "loan_give",
    amount: minorToInput(Math.abs(tx.amount)),
    categoryId: tx.category_id || "",
    accountId: kind === "transfer" ? fromId : tx.account_id,
    targetAccountId: kind === "transfer" ? toId : "",
    counterpartyId: kind === "debt" ? tx.counterparty_id || "" : "",
    merchantId:
      kind === "expense" || kind === "income" ? tx.counterparty_id || "" : "",
    date: format(date, "yyyy-MM-dd"),
    time: format(date, "HH:mm"),
    note: tx.note || "",
    items: goods.map((i) => ({
      name: i.name,
      quantity: i.quantity || 1,
      price:
        i.price_per_unit ||
        (i.quantity ? Math.round(i.total_amount / i.quantity) : i.total_amount),
      categoryId: i.category_id || "",
      total: i.total_amount,
      receiptSourceId: i.receipt_source_id || undefined,
    })),
    discount: discounts.reduce((sum, i) => sum + Math.abs(i.total_amount), 0),
    discountName: discounts[0]?.name,
    discountSourceId: discounts[0]?.receipt_source_id || undefined,
    tagIds: (tx.tags || []).map((t) => t.id),
    assetId: tx.asset_id || "",
    mileage: tx.mileage ? String(tx.mileage) : "",
  };
}
