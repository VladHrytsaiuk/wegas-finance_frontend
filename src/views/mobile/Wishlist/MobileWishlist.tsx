import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  HiOutlineEyeSlash,
  HiOutlineLockClosed,
  HiOutlineUser,
  HiOutlineUsers,
  HiPlus,
} from "react-icons/hi2";
import styled from "styled-components";

import { getWishlistGroupsApi, getWishlistItemsApi } from "../../../services/apiWishlist";
import { useUserRole } from "../../../hooks/useUserRole";
import { Chip, ChipRow } from "../../../mobile/ui/Chips";
import { ConfirmSheet } from "../../../mobile/ui/ConfirmSheet";
import { Group, Meta, Row, Section } from "../../../mobile/ui/Group";
import { ScreenState } from "../../../mobile/ui/Loader";
import { NavBar, NavButton } from "../../../mobile/ui/NavBar";
import { LargeTitle } from "../../../mobile/ui/Screen";
import { SearchField } from "../../../mobile/ui/SearchField";
import { Tile } from "../../../mobile/ui/Tile";
import { WishFormSheet } from "./WishFormSheet";
import { WishGroupSheet } from "./WishGroupSheet";
import {
  GROUP_SORTS,
  parseIds,
  processGroups,
  virtualGroups,
  VIRTUAL_MY,
  VIRTUAL_SHARED,
  type GroupFilters,
  type GroupSort,
} from "./wishlist";

// Вішліст: групи (папки) бажань, віртуальні «Мої» і «Спільні» для бажань без групи.

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

const FILTER_CHIPS: { key: keyof GroupFilters; value: string; label: string }[] = [
  { key: "author", value: "me", label: "Мої папки" },
  { key: "author", value: "others", label: "Спільні папки" },
  { key: "visibility", value: "public", label: "Публічні" },
  { key: "visibility", value: "private", label: "Приватні" },
];

const countLabel = (n: number) => {
  const last = n % 10;
  const tens = n % 100;
  const word =
    tens >= 11 && tens <= 14
      ? "бажань"
      : last === 1
        ? "бажання"
        : last >= 2 && last <= 4
          ? "бажання"
          : "бажань";
  return `${n} ${word}`;
};

export default function MobileWishlist() {
  const navigate = useNavigate();
  const { user } = useUserRole();
  const me = user?.id ?? "";
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<GroupFilters>({ author: [], visibility: [] });
  const [sort, setSort] = useState<GroupSort>("name-asc");
  const [sortOpen, setSortOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [creating, setCreating] = useState<"group" | "wish" | null>(null);

  const { data: groups = [], isLoading: loadingGroups } = useQuery({
    queryKey: ["wishlist-groups"],
    queryFn: getWishlistGroupsApi,
  });
  const { data: items = [], isLoading: loadingItems } = useQuery({
    queryKey: ["wishlist-items", undefined],
    queryFn: () => getWishlistItemsApi(undefined),
  });
  const isLoading = loadingGroups || loadingItems;

  const entries = useMemo(
    () => (me ? processGroups(groups, items, { query, filters, sort }, me) : []),
    [groups, items, query, filters, sort, me],
  );
  const virtual = useMemo(
    () => virtualGroups(items, me, query, filters),
    [items, me, query, filters],
  );
  const toggle = (key: keyof GroupFilters, value: string) =>
    setFilters((prev) => ({
      ...prev,
      [key]: prev[key].includes(value)
        ? prev[key].filter((v) => v !== value)
        : [...prev[key], value],
    }));
  const anyFilter = !!query.trim() || filters.author.length > 0 || filters.visibility.length > 0;
  const shown = entries.length + (virtual.mine ? 1 : 0) + (virtual.shared ? 1 : 0);

  return (
    <Page>
      <NavBar
        backLabel="Ще"
        onBack={() => navigate("/more")}
        trailing={
          <NavButton type="button" aria-label="Додати до вішлісту" onClick={() => setAddOpen(true)}>
            <HiPlus size={24} />
          </NavButton>
        }
      />
      <Body>
        <LargeTitle title="Вішліст" />

        {(groups.length > 0 || items.length > 0) && (
          <>
            <SearchField value={query} onChange={setQuery} label="Пошук груп і бажань" />
            <ChipRow role="group" aria-label="Фільтри груп">
              {FILTER_CHIPS.map((c) => (
                <Chip
                  key={`${c.key}-${c.value}`}
                  type="button"
                  $active={filters[c.key].includes(c.value)}
                  aria-pressed={filters[c.key].includes(c.value)}
                  onClick={() => toggle(c.key, c.value)}
                >
                  {c.label}
                </Chip>
              ))}
            </ChipRow>
          </>
        )}

        {isLoading && <ScreenState loading>Завантаження…</ScreenState>}

        {shown > 0 && (
          <Section
            caption={`Групи · ${shown}`}
            action={
              <SortButton onClick={() => setSortOpen(true)}>
                {GROUP_SORTS.find((s) => s.value === sort)?.label}
              </SortButton>
            }
          >
            <Group>
              {virtual.mine > 0 && (
                <Row
                  to={`/wishlist/${VIRTUAL_MY}`}
                  leading={<Tile icon={<HiOutlineUser size={22} />} tint="blue" size={44} />}
                  title="Мої бажання"
                  subtitle={countLabel(virtual.mine)}
                  chevron
                  inset={72}
                />
              )}
              {virtual.shared > 0 && (
                <Row
                  to={`/wishlist/${VIRTUAL_SHARED}`}
                  leading={<Tile icon={<HiOutlineUsers size={22} />} tint="orange" size={44} />}
                  title="Спільні бажання"
                  subtitle={countLabel(virtual.shared)}
                  chevron
                  inset={72}
                />
              )}
              {entries.map(({ group, count, hit }) => (
                <Row
                  key={group.id}
                  to={`/wishlist/${group.id}`}
                  leading={<Tile iconName={group.icon} color={group.color} size={44} />}
                  title={group.name}
                  subtitle={
                    <Sub>
                      {group.visibility === "private" && (
                        <HiOutlineLockClosed size={12} aria-label="Тільки я" />
                      )}
                      {group.visibility !== "private" && parseIds(group.hidden_from).length > 0 && (
                        <HiOutlineEyeSlash size={12} aria-label="Приховано від когось" />
                      )}
                      {hit ? `Є «${hit}»` : countLabel(count)}
                    </Sub>
                  }
                  trailing={group.user_id !== me ? <Meta>Спільна</Meta> : undefined}
                  chevron
                  inset={72}
                />
              ))}
            </Group>
          </Section>
        )}

        {!isLoading && groups.length === 0 && items.length === 0 && (
          <Empty>
            Створіть першу групу або додайте бажання, щоб почати. Натисніть «+».
          </Empty>
        )}
        {!isLoading && (groups.length > 0 || items.length > 0) && anyFilter && shown === 0 && (
          <Empty>Нічого не знайдено</Empty>
        )}
      </Body>

      <ConfirmSheet
        open={addOpen}
        onOpenChange={setAddOpen}
        message="Що додати?"
        actions={[
          { label: "Нове бажання", onSelect: () => setCreating("wish") },
          { label: "Нова група", onSelect: () => setCreating("group") },
        ]}
      />
      <ConfirmSheet
        open={sortOpen}
        onOpenChange={setSortOpen}
        message="Сортувати групи"
        actions={GROUP_SORTS.map((s) => ({
          label: s.value === sort ? `✓ ${s.label}` : s.label,
          onSelect: () => setSort(s.value),
        }))}
      />
      {creating === "group" && (
        <WishGroupSheet open onOpenChange={(open) => !open && setCreating(null)} />
      )}
      {creating === "wish" && (
        <WishFormSheet open onOpenChange={(open) => !open && setCreating(null)} groups={groups} />
      )}
    </Page>
  );
}
