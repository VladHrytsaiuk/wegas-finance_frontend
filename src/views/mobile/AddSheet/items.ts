import { DISCOUNT_ITEM_NAME, isDiscountItem } from "../../../components/transactions/form/itemUtils";

// Товари ручного чека: чернетка в панелі «+» і перетворення для API.

export interface DraftItem {
  name: string;
  quantity: number;
  /** Ціна за одиницю, копійки. */
  price: number;
}

export interface KnownItem {
  name: string;
  price: number;
}

/** Копійки → текст для поля: 140, 42,5 → «42,50». */
export function minorToInput(minor: number) {
  if (!minor) return "";
  return minor % 100 === 0 ? String(minor / 100) : (minor / 100).toFixed(2).replace(".", ",");
}

export function itemsTotal(items: DraftItem[], discount: number) {
  return items.reduce((sum, item) => sum + item.quantity * item.price, 0) - discount;
}

/** Позиції для API; знижка — окремий рядок з від'ємною ціною, як у старій формі. */
export function toApiItems(items: DraftItem[], discount: number) {
  const rows = items.map((item) => ({
    name: item.name,
    quantity: item.quantity,
    price_per_unit: item.price,
    total_amount: item.quantity * item.price,
  }));
  if (discount > 0) {
    rows.push({ name: DISCOUNT_ITEM_NAME, quantity: 1, price_per_unit: -discount, total_amount: -discount });
  }
  return rows;
}

/** Відомі товари з минулих чеків: назва й остання ціна, без знижок. */
export function knownItemsFrom(transactions: { items?: { name: string; price_per_unit: number }[] }[]) {
  const known = new Map<string, KnownItem>();
  for (const tx of transactions) {
    for (const item of tx.items || []) {
      const key = item.name.trim().toLowerCase();
      if (!key || isDiscountItem(item) || known.has(key)) continue;
      known.set(key, { name: item.name.trim(), price: item.price_per_unit });
    }
  }
  return [...known.values()];
}
