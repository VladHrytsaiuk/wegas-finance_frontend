import { useMemo, useState } from "react";
import { HiPlus } from "react-icons/hi2";
import styled from "styled-components";

import type { Counterparty, CounterpartyCategory } from "../../../types";
import { useCounterpartyData } from "../../../hooks/Counterparties/useCounterpartyData";
import { usePageTitle } from "../../../hooks/usePageTitle";
import { useUserRole } from "../../../hooks/useUserRole";
import { CounterpartyTile } from "../../../mobile/counterpartyTile";
import { ConfirmSheet } from "../../../mobile/ui/ConfirmSheet";
import { TextAction } from "../../../mobile/ui/Field";
import { Group, Meta, Row, Section } from "../../../mobile/ui/Group";
import { ScreenState } from "../../../mobile/ui/Loader";
import { NavButton } from "../../../mobile/ui/NavBar";
import { SearchField } from "../../../mobile/ui/SearchField";
import { Segmented } from "../../../mobile/ui/Segmented";
import { CATALOG_SORTS, copyOnWriteMessage, matches, sortByName, type CatalogSort, type CpKind } from "./catalog";
import { CpCategorySheet } from "./CpCategorySheet";
import { CounterpartySheet } from "./CounterpartySheet";
import { SettingsScreen } from "./SettingsScreen";
import { SortBar } from "./SortBar";

// Контрагенти: магазини, люди, інші; групи за категоріями; пошук і сортування.

const Empty = styled.p`
  margin: 0;
  padding: 24px 16px;
  border-radius: var(--m-radius-group);
  background: var(--m-surface);
  text-align: center;
  font-size: 15px;
  color: var(--m-label-2);
`;

type Filter = "all" | CpKind;
const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "Усі" },
  { value: "shop", label: "Магазини" },
  { value: "person", label: "Люди" },
  { value: "other", label: "Інше" },
];
const TYPE_PLURAL: Record<CpKind, string> = { shop: "Магазини", person: "Люди", other: "Інше" };

interface Block {
  key: string;
  caption: string;
  category?: CounterpartyCategory;
  items: Counterparty[];
}

export default function MobileCounterparties() {
  usePageTitle("Контрагенти");
  const { canManageStructure } = useUserRole();
  const { counterparties, categories, isLoading } = useCounterpartyData();
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<CatalogSort>("default");
  const [sortOpen, setSortOpen] = useState(false);
  const [addChoice, setAddChoice] = useState(false);
  const [newCp, setNewCp] = useState(false);
  const [newCat, setNewCat] = useState(false);
  const [editCp, setEditCp] = useState<Counterparty | null>(null);
  const [editCat, setEditCat] = useState<CounterpartyCategory | null>(null);
  const [system, setSystem] = useState<{ cp?: Counterparty; cat?: CounterpartyCategory } | null>(null);

  const blocks = useMemo<Block[]>(() => {
    const list = Array.isArray(counterparties) ? counterparties : [];
    const cats = Array.isArray(categories) ? categories : [];
    const types = filter === "all" ? (["shop", "person", "other"] as CpKind[]) : [filter];
    const q = query.trim();
    const result: Block[] = [];
    for (const type of types) {
      const ofType = list.filter((cp) => cp.type === type);
      const knownIds = new Set(cats.map((c) => c.id));
      for (const cat of sortByName(cats.filter((c) => c.type === type), sort)) {
        const own = matches(cat.name, q);
        const items = sortByName(
          ofType.filter((cp) => cp.category_id === cat.id && (own || matches(cp.name, q))),
          sort,
        );
        if (q && !own && items.length === 0) continue;
        result.push({ key: cat.id, caption: filter === "all" ? `${cat.name} · ${TYPE_PLURAL[type]}` : cat.name, category: cat, items });
      }
      const loose = sortByName(
        ofType.filter((cp) => (!cp.category_id || !knownIds.has(cp.category_id)) && matches(cp.name, q)),
        sort,
      );
      if (loose.length > 0) {
        result.push({ key: `none-${type}`, caption: filter === "all" ? `Без категорії · ${TYPE_PLURAL[type]}` : "Без категорії", items: loose });
      }
    }
    return result;
  }, [counterparties, categories, filter, query, sort]);

  const openCp = (cp: Counterparty) => {
    if (!canManageStructure) return;
    if (cp.global_template_id) setSystem({ cp });
    else setEditCp(cp);
  };
  const openCat = (cat: CounterpartyCategory) => {
    if (!canManageStructure) return;
    if (cat.global_template_id) setSystem({ cat });
    else setEditCat(cat);
  };

  const defaultType: CpKind = filter === "all" ? "shop" : filter;
  const categoryOf = (cp: Counterparty) => categories.find((c) => c.id === cp.category_id);

  return (
    <SettingsScreen
      title="Контрагенти"
      trailing={
        canManageStructure ? (
          <NavButton type="button" aria-label="Новий контрагент або категорія" onClick={() => setAddChoice(true)}>
            <HiPlus size={24} />
          </NavButton>
        ) : undefined
      }
    >
      <Segmented label="Тип контрагентів" options={FILTERS} value={filter} onChange={setFilter} />
      <SearchField value={query} onChange={setQuery} label="Пошук контрагентів" />
      {blocks.length > 0 && <SortBar sort={sort} onOpen={() => setSortOpen(true)} />}

      {isLoading ? (
        <ScreenState loading>Завантаження…</ScreenState>
      ) : blocks.length === 0 ? (
        <Empty>{query ? "Нічого не знайдено" : "Контрагентів ще немає. Натисніть «+», щоб додати."}</Empty>
      ) : (
        blocks.map((block) => (
          <Section
            key={block.key}
            caption={block.caption}
            action={
              block.category && canManageStructure ? (
                <TextAction onClick={() => openCat(block.category!)}>Змінити</TextAction>
              ) : undefined
            }
          >
            <Group>
              {block.items.length === 0 ? (
                <Row title={<Meta>Порожньо</Meta>} />
              ) : (
                block.items.map((cp) => (
                  <Row
                    key={cp.id}
                    onClick={canManageStructure ? () => openCp(cp) : undefined}
                    leading={<CounterpartyTile cp={cp} category={categoryOf(cp)} size={34} />}
                    title={cp.name}
                    chevron={canManageStructure}
                    inset={62}
                  />
                ))
              )}
            </Group>
          </Section>
        ))
      )}

      <ConfirmSheet
        open={addChoice}
        onOpenChange={setAddChoice}
        message="Додати"
        actions={[
          { label: "Новий контрагент", onSelect: () => setNewCp(true) },
          { label: "Нова категорія", onSelect: () => setNewCat(true) },
        ]}
      />
      <ConfirmSheet
        open={sortOpen}
        onOpenChange={setSortOpen}
        message="Сортувати контрагентів"
        actions={CATALOG_SORTS.map((s) => ({ label: s.value === sort ? `✓ ${s.label}` : s.label, onSelect: () => setSort(s.value) }))}
      />
      <ConfirmSheet
        open={!!system}
        onOpenChange={(o) => !o && setSystem(null)}
        message={copyOnWriteMessage(system?.cp?.name ?? system?.cat?.name ?? "")}
        actions={[
          {
            label: "Продовжити",
            onSelect: () => {
              if (system?.cp) setEditCp(system.cp);
              if (system?.cat) setEditCat(system.cat);
              setSystem(null);
            },
          },
        ]}
      />
      {newCp && (
        <CounterpartySheet open={newCp} onOpenChange={(o) => !o && setNewCp(false)} categories={categories} defaultType={defaultType} />
      )}
      {editCp && (
        <CounterpartySheet
          key={editCp.id}
          open={!!editCp}
          onOpenChange={(o) => !o && setEditCp(null)}
          counterparty={editCp}
          categories={categories}
          defaultType={defaultType}
        />
      )}
      {newCat && <CpCategorySheet open={newCat} onOpenChange={(o) => !o && setNewCat(false)} defaultType={defaultType} />}
      {editCat && (
        <CpCategorySheet
          key={editCat.id}
          open={!!editCat}
          onOpenChange={(o) => !o && setEditCat(null)}
          category={editCat}
          defaultType={defaultType}
        />
      )}
    </SettingsScreen>
  );
}
