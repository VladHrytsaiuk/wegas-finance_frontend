import type { WishlistGroup, WishlistItem } from "../../../types";

// Логіка вішлісту без розмітки: фільтри, сортування й підрахунки старих хуків
// useWishlistGroupFilters / useWishlistFilters.

export const VIRTUAL_MY = "virtual-my";
export const VIRTUAL_SHARED = "virtual-shared";

export const PRIORITIES = [
  { value: 3, label: "🔥 Високий" },
  { value: 2, label: "⚡ Середній" },
  { value: 1, label: "☕ Низький" },
];
export const priorityLabel = (p?: number) =>
  PRIORITIES.find((x) => x.value === (p || 1))?.label ?? PRIORITIES[2].label;

export const parseIds = (value?: string | null): string[] =>
  value ? value.split(",").filter(Boolean) : [];

/** Свої бачимо завжди; чужі — не приватні й не сховані від нас. */
export const canSee = (
  obj: { user_id: string; visibility: string; hidden_from?: string | null },
  me: string,
) =>
  obj.user_id === me ||
  (obj.visibility !== "private" && !parseIds(obj.hidden_from).includes(me));

// ---------- групи ----------

export type GroupSort = "name-asc" | "name-desc" | "count-desc" | "count-asc";
export const GROUP_SORTS: { value: GroupSort; label: string }[] = [
  { value: "name-asc", label: "Назва (А–Я)" },
  { value: "name-desc", label: "Назва (Я–А)" },
  { value: "count-desc", label: "Найбільше бажань" },
  { value: "count-asc", label: "Найменше бажань" },
];

export interface GroupFilters {
  author: string[]; // "me" | "others"
  visibility: string[]; // "public" | "private"
}

export interface GroupEntry {
  group: WishlistGroup;
  count: number;
  /** Назва бажання, через яке група знайдена пошуком. */
  hit: string | null;
}

export function processGroups(
  groups: WishlistGroup[],
  items: WishlistItem[],
  opts: { query: string; filters: GroupFilters; sort: GroupSort },
  me: string,
): GroupEntry[] {
  const q = opts.query.trim().toLowerCase();
  const { author, visibility } = opts.filters;
  return groups
    .filter((g) => canSee(g, me))
    .filter((g) => {
      const isMine = g.user_id === me;
      if (author.length > 0 && !(author.includes("me") && isMine) && !(author.includes("others") && !isMine))
        return false;
      if (visibility.length > 0 && !visibility.includes(g.visibility)) return false;
      return true;
    })
    .map((group) => {
      const own = items.filter((i) => i.group_id === group.id);
      const nameMatch = !q || group.name.toLowerCase().includes(q);
      const hit = !q || nameMatch ? null : own.find((i) => i.name.toLowerCase().includes(q))?.name ?? null;
      return { group, count: own.length, hit, show: nameMatch || !!hit };
    })
    .filter((e) => e.show)
    .map(({ group, count, hit }) => ({ group, count, hit }))
    .sort((a, b) => {
      switch (opts.sort) {
        case "name-desc":
          return b.group.name.localeCompare(a.group.name, "uk");
        case "count-desc":
          return b.count - a.count;
        case "count-asc":
          return a.count - b.count;
        default:
          return a.group.name.localeCompare(b.group.name, "uk");
      }
    });
}

/** «Мої бажання» й «Спільні» — бажання без групи; з пошуком не показуємо (як було). */
export function virtualGroups(
  items: WishlistItem[],
  me: string,
  query: string,
  filters: GroupFilters,
) {
  const loose = items.filter((i) => !i.group_id);
  const mine = loose.filter((i) => i.user_id === me).length;
  const shared = loose.length - mine;
  const hide = !!query.trim();
  const only = filters.author;
  return {
    mine: !hide && mine > 0 && (only.length === 0 || only.includes("me")) ? mine : 0,
    shared: !hide && shared > 0 && (only.length === 0 || only.includes("others")) ? shared : 0,
  };
}

// ---------- бажання ----------

export type ItemSort =
  | "priority-desc"
  | "priority-asc"
  | "price-desc"
  | "price-asc"
  | "newest"
  | "oldest"
  | "name-asc"
  | "name-desc";

export const ITEM_SORTS: { value: ItemSort; label: string }[] = [
  { value: "priority-desc", label: "Пріоритет (високий)" },
  { value: "priority-asc", label: "Пріоритет (низький)" },
  { value: "price-desc", label: "Найдорожчі" },
  { value: "price-asc", label: "Найдешевші" },
  { value: "newest", label: "Спочатку нові" },
  { value: "oldest", label: "Спочатку старі" },
  { value: "name-asc", label: "Назва (А–Я)" },
  { value: "name-desc", label: "Назва (Я–А)" },
];

export interface ItemFilters {
  status: string[]; // planning | bought
  availability: string[]; // available | reserved_by_me
  priority: string[]; // "1" | "2" | "3"
  author: string[]; // me | others
}

export const EMPTY_ITEM_FILTERS: ItemFilters = {
  status: [],
  availability: [],
  priority: [],
  author: [],
};

export const countFilters = (f: ItemFilters) =>
  f.status.length + f.availability.length + f.priority.length + f.author.length;

export function itemsOfGroup(
  items: WishlistItem[],
  groupId: string,
  me: string,
): WishlistItem[] {
  return items.filter((i) => {
    if (groupId === VIRTUAL_MY) return !i.group_id && i.user_id === me;
    if (groupId === VIRTUAL_SHARED) return !i.group_id && i.user_id !== me;
    return i.group_id === groupId;
  });
}

export function filterItems(
  items: WishlistItem[],
  opts: { query: string; filters: ItemFilters; sort: ItemSort },
  me: string,
): WishlistItem[] {
  const q = opts.query.trim().toLowerCase();
  const { status, availability, priority, author } = opts.filters;
  return items
    .filter((item) => {
      if (!canSee(item, me)) return false;
      if (q && !item.name.toLowerCase().includes(q)) return false;
      if (status.length > 0 && !status.includes(item.status)) return false;
      if (priority.length > 0 && !priority.includes(String(item.priority))) return false;
      if (author.length > 0) {
        const mine = item.user_id === me;
        if (!(author.includes("me") && mine) && !(author.includes("others") && !mine)) return false;
      }
      if (availability.length > 0) {
        const byMe = item.reserved_by === me;
        // Як у старому фільтрі: «Вільні» — не зарезервовані кимось іншим.
        const free = !item.reserved_by || byMe;
        const okFree = availability.includes("available") && free;
        const okMine = availability.includes("reserved_by_me") && byMe;
        if (!okFree && !okMine) return false;
      }
      return true;
    })
    .sort((a, b) => {
      switch (opts.sort) {
        case "priority-asc":
          return (a.priority || 0) - (b.priority || 0);
        case "price-desc":
          return (b.price || 0) - (a.price || 0);
        case "price-asc":
          return (a.price || 0) - (b.price || 0);
        case "newest":
          return Number(b.created_at || 0) - Number(a.created_at || 0);
        case "oldest":
          return Number(a.created_at || 0) - Number(b.created_at || 0);
        case "name-asc":
          return a.name.localeCompare(b.name, "uk");
        case "name-desc":
          return b.name.localeCompare(a.name, "uk");
        default:
          return (b.priority || 0) - (a.priority || 0);
      }
    });
}
