import { useMemo, useState } from "react";
import { HiPlus } from "react-icons/hi2";
import styled from "styled-components";

import type { Category } from "../../../types";
import { useCategoryData } from "../../../hooks/Categories/useCategoryData";
import { usePageTitle } from "../../../hooks/usePageTitle";
import { useUserRole } from "../../../hooks/useUserRole";
import { ConfirmSheet } from "../../../mobile/ui/ConfirmSheet";
import { Group, Meta, Row, Section } from "../../../mobile/ui/Group";
import { ScreenState } from "../../../mobile/ui/Loader";
import { NavButton } from "../../../mobile/ui/NavBar";
import { SearchField } from "../../../mobile/ui/SearchField";
import { Segmented } from "../../../mobile/ui/Segmented";
import { Tile } from "../../../mobile/ui/Tile";
import { CategorySheet } from "./CategorySheet";
import { CATALOG_SORTS, copyOnWriteMessage, matches, sortByName, type CatalogSort } from "./catalog";
import { SettingsScreen } from "./SettingsScreen";
import { SortBar } from "./SortBar";

// Категорії: витрати й доходи, верхній рівень і підкатегорії; пошук і сортування.

const Indent = styled.span`
  display: flex;
  padding-left: 22px;
`;

const Empty = styled.p`
  margin: 0;
  padding: 24px 16px;
  border-radius: var(--m-radius-group);
  background: var(--m-surface);
  text-align: center;
  font-size: 15px;
  color: var(--m-label-2);
`;

const KINDS = [
  { value: "expense" as const, label: "Витрати" },
  { value: "income" as const, label: "Доходи" },
];

export default function MobileCategories() {
  usePageTitle("Категорії");
  const { canManageStructure } = useUserRole();
  const { categories, isLoading } = useCategoryData();
  const [kind, setKind] = useState<"expense" | "income">("expense");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<CatalogSort>("default");
  const [sortOpen, setSortOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [systemItem, setSystemItem] = useState<Category | null>(null);

  const roots = useMemo(() => {
    const ofType = categories.filter((c) => c.type === kind);
    const byParent = new Map<string, Category[]>();
    ofType.forEach((c) => {
      if (c.parent_id) byParent.set(c.parent_id, [...(byParent.get(c.parent_id) ?? []), c]);
    });
    const ids = new Set(ofType.map((c) => c.id));
    // Без батька, або батько видалений — показуємо серед верхніх.
    const top = ofType.filter((c) => !c.parent_id || !ids.has(c.parent_id));
    return sortByName(top, sort)
      .map((root) => ({
        root,
        children: sortByName(byParent.get(root.id) ?? [], sort),
      }))
      // Пошук: збіг у назві, у підкатегорії або в батьківській.
      .map(({ root, children }) => {
        if (!query.trim()) return { root, children };
        const own = matches(root.name, query);
        return { root, children: own ? children : children.filter((c) => matches(c.name, query)), show: own || children.some((c) => matches(c.name, query)) };
      })
      .filter((x) => !query.trim() || ("show" in x ? x.show : true));
  }, [categories, kind, query, sort]);

  const open = (category: Category) => {
    if (!canManageStructure) return;
    if (category.global_template_id) setSystemItem(category);
    else setEditing(category);
  };

  return (
    <SettingsScreen
      title="Категорії"
      trailing={
        canManageStructure ? (
          <NavButton type="button" aria-label="Нова категорія" onClick={() => setCreating(true)}>
            <HiPlus size={24} />
          </NavButton>
        ) : undefined
      }
    >
      <Segmented label="Тип категорій" options={KINDS} value={kind} onChange={setKind} />
      {categories.length > 6 && <SearchField value={query} onChange={setQuery} label="Пошук категорій" />}
      {roots.length > 1 && <SortBar sort={sort} onOpen={() => setSortOpen(true)} />}

      {isLoading ? (
        <ScreenState loading>Завантаження…</ScreenState>
      ) : roots.length === 0 ? (
        <Empty>{query ? "Нічого не знайдено" : `Ще немає категорій ${kind === "expense" ? "витрат" : "доходів"}`}</Empty>
      ) : (
        <Section caption={`Категорії · ${roots.length}`}>
          <Group>
            {roots.flatMap(({ root, children }) => [
              <Row
                key={root.id}
                onClick={canManageStructure ? () => open(root) : undefined}
                leading={<Tile iconName={root.icon} color={root.color} size={34} />}
                title={root.name}
                trailing={children.length > 0 ? <Meta>{children.length}</Meta> : undefined}
                chevron={canManageStructure}
                inset={62}
              />,
              ...children.map((child) => (
                <Row
                  key={child.id}
                  onClick={canManageStructure ? () => open(child) : undefined}
                  leading={
                    <Indent>
                      <Tile iconName={child.icon} color={child.color} size={28} />
                    </Indent>
                  }
                  title={child.name}
                  chevron={canManageStructure}
                  inset={84}
                />
              )),
            ])}
          </Group>
        </Section>
      )}

      <ConfirmSheet
        open={sortOpen}
        onOpenChange={setSortOpen}
        message="Сортувати категорії"
        actions={CATALOG_SORTS.map((s) => ({ label: s.value === sort ? `✓ ${s.label}` : s.label, onSelect: () => setSort(s.value) }))}
      />
      <ConfirmSheet
        open={!!systemItem}
        onOpenChange={(o) => !o && setSystemItem(null)}
        message={copyOnWriteMessage(systemItem?.name ?? "")}
        actions={[
          {
            label: "Продовжити",
            onSelect: () => {
              setEditing(systemItem);
              setSystemItem(null);
            },
          },
        ]}
      />
      {creating && (
        <CategorySheet open={creating} onOpenChange={(o) => !o && setCreating(false)} categories={categories} defaultType={kind} />
      )}
      {editing && (
        <CategorySheet
          key={editing.id}
          open={!!editing}
          onOpenChange={(o) => !o && setEditing(null)}
          category={editing}
          categories={categories}
          defaultType={kind}
        />
      )}
    </SettingsScreen>
  );
}
