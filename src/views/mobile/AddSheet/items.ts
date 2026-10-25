import { DISCOUNT_ITEM_NAME, isDiscountItem } from "../../../components/transactions/form/itemUtils";

// Товари ручного чека: чернетка в панелі «+» і перетворення для API.

export interface DraftItem {
  name: string;
  quantity: number;
  /** Ціна за одиницю, копійки. */
  price: number;
  /** Порожньо — як у самої операції. */
  categoryId: string;
}

export interface KnownItem {
  name: string;
  price: number;
  categoryId: string;
}

/** Копійки → текст для поля: 140, 42,5 → «42,50». */
export function minorToInput(minor: number) {
  if (!minor) return "";
  return minor % 100 === 0 ? String(minor / 100) : (minor / 100).toFixed(2).replace(".", ",");
}

export function itemsTotal(items: DraftItem[], discount: number) {
  return items.reduce((sum, item) => sum + item.quantity * item.price, 0) - discount;
}

/** Категорія, на яку припадає найбільша сума товарів, або "". */
export function dominantCategory(items: DraftItem[]) {
  const sums = new Map<string, number>();
  for (const item of items) {
    if (item.categoryId) sums.set(item.categoryId, (sums.get(item.categoryId) || 0) + item.quantity * item.price);
  }
  return [...sums.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "";
}

/**
 * Позиції для API. Товар без категорії отримує категорію операції явно — так
 * вибір користувача потрапляє в історію, з якої бекенд підбирає категорії.
 * Знижка — окремий рядок з від'ємною ціною, як у старій формі.
 */
export function toApiItems(items: DraftItem[], discount: number, fallbackCategoryId: string) {
  const rows = items.map((item) => ({
    name: item.name,
    quantity: item.quantity,
    price_per_unit: item.price,
    total_amount: item.quantity * item.price,
    category_id: item.categoryId || fallbackCategoryId || null,
  }));
  if (discount > 0) {
    rows.push({
      name: DISCOUNT_ITEM_NAME,
      quantity: 1,
      price_per_unit: -discount,
      total_amount: -discount,
      category_id: null,
    });
  }
  return rows;
}

const itemKey = (name: string) => name.trim().toLowerCase();

/** Відомі товари з минулих чеків (від нових до старих): назва, остання ціна й категорія. */
export function knownItemsFrom(
  transactions: { items?: { name: string; price_per_unit: number; category_id?: string | null }[] }[],
) {
  const known = new Map<string, KnownItem>();
  for (const tx of transactions) {
    for (const item of tx.items || []) {
      const key = itemKey(item.name);
      if (!key || isDiscountItem(item) || known.has(key)) continue;
      known.set(key, { name: item.name.trim(), price: item.price_per_unit, categoryId: item.category_id || "" });
    }
  }
  return [...known.values()];
}

export function findKnown(known: KnownItem[], name: string) {
  const key = itemKey(name);
  return key ? known.find((k) => itemKey(k.name) === key) : undefined;
}

/** Підказки під полем назви: спершу ті, що починаються з введеного. */
export function suggestKnown(known: KnownItem[], query: string, limit = 6) {
  const q = itemKey(query);
  if (!q) return [];
  const starts = known.filter((k) => itemKey(k.name).startsWith(q) && itemKey(k.name) !== q);
  const contains = known.filter((k) => !itemKey(k.name).startsWith(q) && itemKey(k.name).includes(q));
  return [...starts, ...contains].slice(0, limit);
}
