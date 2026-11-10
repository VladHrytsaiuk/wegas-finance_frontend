import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { HiOutlineEyeSlash, HiOutlineLockClosed, HiPlus } from "react-icons/hi2";
import styled from "styled-components";

import { getShoppingListsApi } from "../../../services/apiShopping";
import { useUsers } from "../../../hooks/Settings/useUsers";
import { useUserRole } from "../../../hooks/useUserRole";
import { Amount, Group, Meta, Row, Section } from "../../../mobile/ui/Group";
import { ConfirmSheet } from "../../../mobile/ui/ConfirmSheet";
import { ScreenState } from "../../../mobile/ui/Loader";
import { NavBar, NavButton } from "../../../mobile/ui/NavBar";
import { LargeTitle } from "../../../mobile/ui/Screen";
import { SearchField } from "../../../mobile/ui/SearchField";
import { ListTile } from "./ListTile";
import { ShoppingListSheet } from "./ShoppingListSheet";
import {
  boughtCount,
  filterShoppingLists,
  matchingItemName,
  SHOPPING_FILTERS,
  SHOPPING_SORTS,
  type ShoppingFilter,
  type ShoppingSort,
} from "./shopping";

// Покупки: списки як у «Нагадуваннях» — колір, скільки лишилось купити, чий список.

const Page = styled.div.attrs<{ "data-m-screen"?: string }>({
  "data-m-screen": "",
})`
  min-height: 100%;
  background: var(--m-bg);
  color: var(--m-label);
  font-family: var(--m-font);
  -webkit-font-smoothing: antialiased;
`;

const Body = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 0 16px 32px;
`;

const Chips = styled.div`
  display: flex;
  gap: 8px;
  margin: 0 -16px;
  padding: 0 16px;
  overflow-x: auto;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const Chip = styled.button<{ $active: boolean }>`
  flex-shrink: 0;
  height: 32px;
  padding: 0 14px;
  border: none;
  border-radius: 16px;
  font: inherit;
  font-size: 15px;
  white-space: nowrap;
  cursor: pointer;
  color: ${(p) => (p.$active ? "var(--m-on-accent)" : "var(--m-label)")};
  background: ${(p) => (p.$active ? "var(--m-accent)" : "var(--m-surface)")};
`;

const SortButton = styled.button.attrs({ type: "button" })`
  padding: 0;
  color: var(--m-accent);
  border: none;
  background: none;
  font: inherit;
  font-size: 13px;
  cursor: pointer;
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

const Sub = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
`;

export default function MobileShopping() {
  const navigate = useNavigate();
  const { user } = useUserRole();
  const { users } = useUsers();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<ShoppingFilter>("all");
  const [sort, setSort] = useState<ShoppingSort>("date-desc");
  const [sortOpen, setSortOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  const { data: lists = [], isLoading } = useQuery({
    queryKey: ["shopping-lists"],
    queryFn: getShoppingListsApi,
  });
  const visible = useMemo(
    () => filterShoppingLists(lists, { query, filter, sort }),
    [lists, query, filter, sort],
  );

  const authorOf = (userId: string) =>
    String(userId) === String(user?.id)
      ? null
      : users.find((u) => String(u.id) === String(userId))?.name || "Інший учасник";

  return (
    <Page>
      <NavBar
        backLabel="Ще"
        onBack={() => navigate("/more")}
        trailing={
          <NavButton
            type="button"
            aria-label="Новий список"
            onClick={() => setCreating(true)}
          >
            <HiPlus size={24} />
          </NavButton>
        }
      />
      <Body>
        <LargeTitle title="Покупки" />

        {lists.length > 0 && (
          <>
            <SearchField
              value={query}
              onChange={setQuery}
              label="Пошук списків і товарів"
            />
            <Chips role="group" aria-label="Хто бачить">
              {SHOPPING_FILTERS.map((f) => (
                <Chip
                  key={f.value}
                  type="button"
                  $active={filter === f.value}
                  onClick={() => setFilter(f.value)}
                >
                  {f.label}
                </Chip>
              ))}
            </Chips>
          </>
        )}

        {isLoading && <ScreenState loading>Завантаження…</ScreenState>}

        {visible.length > 0 && (
          <Section
            caption={`Списки · ${visible.length}`}
            action={
              <SortButton onClick={() => setSortOpen(true)}>
                {SHOPPING_SORTS.find((s) => s.value === sort)?.label}
              </SortButton>
            }
          >
            <Group>
              {visible.map((list) => {
                const bought = boughtCount(list);
                const left = list.items.length - bought;
                const author = authorOf(list.user_id);
                const hit = matchingItemName(list, query);
                return (
                  <Row
                    key={list.id}
                    to={`/shopping/${list.id}`}
                    leading={<ListTile color={list.color} />}
                    title={list.title}
                    subtitle={
                      <Sub>
                        {list.visibility === "private" && (
                          <HiOutlineLockClosed size={12} aria-label="Тільки я" />
                        )}
                        {list.visibility === "hidden" && (
                          <HiOutlineEyeSlash size={12} aria-label="Приховано" />
                        )}
                        {hit
                          ? `Є «${hit}»`
                          : list.items.length === 0
                            ? "Порожній список"
                            : left === 0
                              ? "Усе куплено"
                              : `Куплено ${bought} з ${list.items.length}`}
                      </Sub>
                    }
                    trailing={
                      <>
                        {left > 0 && <Amount>{left}</Amount>}
                        {author && <Meta>{author}</Meta>}
                      </>
                    }
                    chevron
                    inset={72}
                  />
                );
              })}
            </Group>
          </Section>
        )}

        {!isLoading && lists.length === 0 && (
          <Empty>
            Створіть перший список покупок — і додавайте в нього товари.
            Натисніть «+».
          </Empty>
        )}
        {!isLoading && lists.length > 0 && visible.length === 0 && (
          <Empty>Нічого не знайдено</Empty>
        )}
      </Body>

      <ConfirmSheet
        open={sortOpen}
        onOpenChange={setSortOpen}
        message="Сортувати списки"
        actions={SHOPPING_SORTS.map((s) => ({
          label: s.value === sort ? `✓ ${s.label}` : s.label,
          onSelect: () => setSort(s.value),
        }))}
      />
      {creating && (
        <ShoppingListSheet
          open={creating}
          onOpenChange={(open) => !open && setCreating(false)}
        />
      )}
    </Page>
  );
}
