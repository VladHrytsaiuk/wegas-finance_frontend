// Спільне для довідників (категорії, теги, контрагенти): сортування, системні записи.

export type CatalogSort = "default" | "name-asc" | "name-desc";

export const CATALOG_SORTS: { value: CatalogSort; label: string }[] = [
  { value: "default", label: "Як у списку" },
  { value: "name-asc", label: "Назва (А–Я)" },
  { value: "name-desc", label: "Назва (Я–А)" },
];

export function sortByName<T extends { name: string }>(items: T[], sort: CatalogSort): T[] {
  if (sort === "default") return items;
  const dir = sort === "name-asc" ? 1 : -1;
  return [...items].sort((a, b) => dir * a.name.localeCompare(b.name, "uk", { sensitivity: "base" }));
}

/** Системний запис при зміні стає локальним записом родини. */
export const copyOnWriteMessage = (name: string) =>
  `Змінити системний запис «${name}»? Після збереження він стане локальним записом родини й більше не отримуватиме глобальні оновлення платформи.`;

export const matches = (name: string, query: string) =>
  !query.trim() || name.toLowerCase().includes(query.trim().toLowerCase());

export type CpKind = "shop" | "person" | "other";
export const CP_KINDS: { value: CpKind; label: string }[] = [
  { value: "shop", label: "Магазин" },
  { value: "person", label: "Людина" },
  { value: "other", label: "Інше" },
];
