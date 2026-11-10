import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { HiOutlineEllipsisHorizontalCircle, HiOutlineGift, HiPlus } from "react-icons/hi2";
import styled from "styled-components";

import { getWishlistGroupsApi, getWishlistItemsApi } from "../../../services/apiWishlist";
import { useSettings } from "../../../context/SettingsContext";
import { useUsers } from "../../../hooks/Settings/useUsers";
import { useUserRole } from "../../../hooks/useUserRole";
import { usePageTitle } from "../../../hooks/usePageTitle";
import { formatMoney, getUploadedFileUrl } from "../../../utils/helpers";
import { Chip, ChipRow } from "../../../mobile/ui/Chips";
import { ConfirmSheet, type ConfirmAction } from "../../../mobile/ui/ConfirmSheet";
import { Group, Meta, Row, Section } from "../../../mobile/ui/Group";
import { ScreenState } from "../../../mobile/ui/Loader";
import { NavBar, NavButton } from "../../../mobile/ui/NavBar";
import { LargeTitle } from "../../../mobile/ui/Screen";
import { SearchField } from "../../../mobile/ui/SearchField";
import { Tile } from "../../../mobile/ui/Tile";
import { WishDetailSheet } from "./WishDetailSheet";
import { WishFilterSheet } from "./WishFilterSheet";
import { WishFormSheet } from "./WishFormSheet";
import { WishGroupSheet } from "./WishGroupSheet";
import { useWishlistActions } from "./useWishlistActions";
import {
  countFilters,
  EMPTY_ITEM_FILTERS,
  filterItems,
  ITEM_SORTS,
  itemsOfGroup,
  priorityLabel,
  VIRTUAL_MY,
  VIRTUAL_SHARED,
  type ItemFilters,
  type ItemSort,
} from "./wishlist";

// Бажання однієї групи: пошук, фільтри, сортування; своє — купити/змінити/видалити,
// чуже — зарезервувати як подарунок. Власник групи змінює або видаляє її тут.

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

const Title = styled.span<{ $done: boolean }>`
  text-decoration: ${(p) => (p.$done ? "line-through" : "none")};
  color: ${(p) => (p.$done ? "var(--m-label-2)" : "inherit")};
`;

const Bar = styled.span`
  display: flex;
  align-items: center;
  gap: 12px;
`;

export default function MobileWishlistItems() {
  const { groupId = "" } = useParams();
  const navigate = useNavigate();
  const { language } = useSettings();
  const { user } = useUserRole();
  const { users } = useUsers();
  const { deleteGroup } = useWishlistActions();
  const me = user?.id ?? "";

  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<ItemFilters>(EMPTY_ITEM_FILTERS);
  const [sort, setSort] = useState<ItemSort>("priority-desc");
  const [sortOpen, setSortOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [editingGroup, setEditingGroup] = useState(false);
  const [deletingGroup, setDeletingGroup] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);

  const { data: groups = [], isLoading: loadingGroups } = useQuery({
    queryKey: ["wishlist-groups"],
    queryFn: getWishlistGroupsApi,
  });
  const { data: items = [], isLoading: loadingItems } = useQuery({
    queryKey: ["wishlist-items", undefined],
    queryFn: () => getWishlistItemsApi(undefined),
  });

  const isVirtual = groupId === VIRTUAL_MY || groupId === VIRTUAL_SHARED;
  const group = groups.find((g) => g.id === groupId);
  const title =
    groupId === VIRTUAL_MY ? "Мої бажання" : groupId === VIRTUAL_SHARED ? "Спільні бажання" : group?.name ?? "Група";
  usePageTitle(title);

  const groupItems = useMemo(() => itemsOfGroup(items, groupId, me), [items, groupId, me]);
  const visible = useMemo(
    () => (me ? filterItems(groupItems, { query, filters, sort }, me) : []),
    [groupItems, query, filters, sort, me],
  );
  const opened = items.find((i) => i.id === openId);
  const authorOf = (userId: string) =>
    userId === me ? "Моє" : users.find((u) => String(u.id) === String(userId))?.name || "Невідомо";

  if (!isVirtual && !group) {
    return (
      <Page>
        <NavBar backLabel="Вішліст" onBack={() => navigate("/wishlist")} />
        <ScreenState loading={loadingGroups}>
          {loadingGroups ? "Завантаження…" : "Групу не знайдено"}
        </ScreenState>
      </Page>
    );
  }

  const isOwner = !!group && group.user_id === me;
  const menu: ConfirmAction[] = [
    { label: "Змінити групу", onSelect: () => setEditingGroup(true) },
    { label: "Видалити групу", destructive: true, onSelect: () => setDeletingGroup(true) },
  ];
  const filterCount = countFilters(filters);
  const loading = loadingGroups || loadingItems;

  return (
    <Page>
      <NavBar
        backLabel="Вішліст"
        onBack={() => navigate("/wishlist")}
        trailing={
          <Bar>
            {isOwner && (
              <NavButton type="button" aria-label="Дії з групою" onClick={() => setMenuOpen(true)}>
                <HiOutlineEllipsisHorizontalCircle size={26} />
              </NavButton>
            )}
            <NavButton type="button" aria-label="Нове бажання" onClick={() => setCreating(true)}>
              <HiPlus size={24} />
            </NavButton>
          </Bar>
        }
      />
      <Body>
        <LargeTitle title={title} />

        {groupItems.length > 0 && (
          <>
            <SearchField value={query} onChange={setQuery} label="Пошук бажань" />
            <ChipRow>
              <Chip type="button" $active={filterCount > 0} onClick={() => setFiltersOpen(true)}>
                Фільтри{filterCount > 0 ? ` · ${filterCount}` : ""}
              </Chip>
            </ChipRow>
          </>
        )}

        {loading && <ScreenState loading>Завантаження…</ScreenState>}

        {visible.length > 0 && (
          <Section
            caption={`Бажання · ${visible.length}`}
            action={
              <SortButton onClick={() => setSortOpen(true)}>
                {ITEM_SORTS.find((s) => s.value === sort)?.label}
              </SortButton>
            }
          >
            <Group>
              {visible.map((item) => {
                const bought = item.status === "bought";
                const byMe = item.reserved_by === me;
                const mine = item.user_id === me;
                const photo = getUploadedFileUrl(item.photo_url);
                return (
                  <Row
                    key={item.id}
                    onClick={() => setOpenId(item.id)}
                    leading={
                      <Tile
                        logo={photo || undefined}
                        icon={<HiOutlineGift size={22} />}
                        tint="gray"
                        size={44}
                      />
                    }
                    title={<Title $done={bought}>{item.name}</Title>}
                    subtitle={[
                      priorityLabel(item.priority),
                      !mine && authorOf(item.user_id),
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                    trailing={
                      <>
                        <span style={{ fontWeight: 500 }}>
                          {item.price
                            ? formatMoney(item.price, item.currency || "UAH", language)
                            : "—"}
                        </span>
                        {bought ? (
                          <Meta>Придбано</Meta>
                        ) : !mine && item.reserved_by ? (
                          <Meta>{byMe ? "Ви купуєте" : "Резерв"}</Meta>
                        ) : null}
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

        {!loading && groupItems.length === 0 && (
          <Empty>У групі ще немає бажань. Натисніть «+», щоб додати перше.</Empty>
        )}
        {!loading && groupItems.length > 0 && visible.length === 0 && (
          <Empty>Нічого не знайдено</Empty>
        )}
      </Body>

      <ConfirmSheet
        open={sortOpen}
        onOpenChange={setSortOpen}
        message="Сортувати бажання"
        actions={ITEM_SORTS.map((s) => ({
          label: s.value === sort ? `✓ ${s.label}` : s.label,
          onSelect: () => setSort(s.value),
        }))}
      />
      <ConfirmSheet open={menuOpen} onOpenChange={setMenuOpen} message={title} actions={menu} />
      <ConfirmSheet
        open={deletingGroup}
        onOpenChange={setDeletingGroup}
        message={`Видалити групу «${title}»? Бажання з неї залишаться без групи.`}
        actions={[
          {
            label: "Видалити групу",
            destructive: true,
            onSelect: () =>
              group &&
              deleteGroup
                .mutateAsync(group.id)
                .then(() => navigate("/wishlist", { replace: true }))
                .catch(() => undefined),
          },
        ]}
      />
      <WishFilterSheet
        open={filtersOpen}
        onOpenChange={setFiltersOpen}
        filters={filters}
        onChange={setFilters}
      />
      {creating && (
        <WishFormSheet
          open={creating}
          onOpenChange={(open) => !open && setCreating(false)}
          groups={groups}
          defaultGroupId={isVirtual ? undefined : groupId}
        />
      )}
      {editingGroup && group && (
        <WishGroupSheet
          open={editingGroup}
          onOpenChange={(open) => !open && setEditingGroup(false)}
          group={group}
        />
      )}
      {opened && (
        <WishDetailSheet
          open
          onOpenChange={(open) => !open && setOpenId(null)}
          item={opened}
          groups={groups}
          me={me}
          authorName={authorOf(opened.user_id)}
        />
      )}
    </Page>
  );
}
