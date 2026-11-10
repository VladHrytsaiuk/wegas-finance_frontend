import type { ShoppingList } from "../../../services/apiShopping";

// Логіка списків покупок без розмітки: пошук, фільтр, сортування, «приховано від».

export type ShoppingVisibility = "public" | "private" | "hidden";
export type ShoppingFilter = "all" | ShoppingVisibility;
export type ShoppingSort = "date-desc" | "date-asc" | "title-asc";

export const SHOPPING_FILTERS: { value: ShoppingFilter; label: string }[] = [
  { value: "all", label: "Усі" },
  { value: "public", label: "Сім'я" },
  { value: "private", label: "Тільки я" },
  { value: "hidden", label: "Приховано" },
];

export const SHOPPING_SORTS: { value: ShoppingSort; label: string }[] = [
  { value: "date-desc", label: "Спочатку нові" },
  { value: "date-asc", label: "Спочатку старі" },
  { value: "title-asc", label: "За назвою" },
];

export const parseHiddenFrom = (value?: string): string[] =>
  value ? value.split(",").filter(Boolean) : [];

/** Старий NoteOptions: нікого не вибрали — список відкритий усій родині. */
export function resolveVisibility(
  mode: ShoppingVisibility,
  hiddenIds: string[],
): { visibility: ShoppingVisibility; hidden_from: string } {
  if (mode === "private") return { visibility: "private", hidden_from: "" };
  if (mode === "hidden" && hiddenIds.length > 0) {
    return { visibility: "hidden", hidden_from: hiddenIds.join(",") };
  }
  return { visibility: "public", hidden_from: "" };
}

export const boughtCount = (list: ShoppingList) =>
  list.items.filter((item) => item.is_bought).length;

/** Пошук і за назвою списку, і за назвами пунктів — як у старій сторінці. */
export function matchingItemName(
  list: ShoppingList,
  query: string,
): string | null {
  const q = query.trim().toLowerCase();
  if (!q || list.title.toLowerCase().includes(q)) return null;
  return list.items.find((i) => i.name.toLowerCase().includes(q))?.name ?? null;
}

export function filterShoppingLists(
  lists: ShoppingList[],
  opts: { query: string; filter: ShoppingFilter; sort: ShoppingSort },
): ShoppingList[] {
  const q = opts.query.trim().toLowerCase();
  const result = lists.filter((list) => {
    if (opts.filter !== "all" && list.visibility !== opts.filter) return false;
    if (!q) return true;
    return (
      list.title.toLowerCase().includes(q) ||
      list.items.some((item) => item.name.toLowerCase().includes(q))
    );
  });
  result.sort((a, b) => {
    switch (opts.sort) {
      case "date-asc":
        return (a.created_at || 0) - (b.created_at || 0);
      case "title-asc":
        return a.title.localeCompare(b.title, "uk");
      default:
        return (b.created_at || 0) - (a.created_at || 0);
    }
  });
  return result;
}
