import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  HiCheck,
  HiEllipsisHorizontalCircle,
  HiOutlineEyeSlash,
  HiOutlineLockClosed,
  HiOutlinePlusCircle,
  HiOutlineTrash,
} from "react-icons/hi2";
import styled from "styled-components";

import {
  getShoppingListsApi,
  type ShoppingItem,
} from "../../../services/apiShopping";
import { useUsers } from "../../../hooks/Settings/useUsers";
import { useUserRole } from "../../../hooks/useUserRole";
import { usePageTitle } from "../../../hooks/usePageTitle";
import { Group, Row, Section } from "../../../mobile/ui/Group";
import { ConfirmSheet, type ConfirmAction } from "../../../mobile/ui/ConfirmSheet";
import { ScreenState } from "../../../mobile/ui/Loader";
import { NavBar, NavButton } from "../../../mobile/ui/NavBar";
import { ListTile } from "./ListTile";
import { ShoppingListSheet } from "./ShoppingListSheet";
import { parseHiddenFrom } from "./shopping";
import { useShoppingActions } from "./useShoppingActions";

// Один список: пункти з відміткою «куплено», додавання підряд, перейменування,
// видалення, «Куплено» окремо з очищенням, налаштування й видалення списку.

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
  padding: 8px 16px 32px;
`;

const Head = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 4px;
`;

const HeadText = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const TitleInput = styled.input`
  width: 100%;
  min-width: 0;
  padding: 0;
  border: none;
  background: none;
  outline: none;
  font: inherit;
  font-size: 28px;
  line-height: 34px;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--m-label);
`;

const Sub = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: var(--m-label-2);
`;

const ItemInput = styled.input<{ $done?: boolean }>`
  flex: 1;
  width: 100%;
  min-width: 0;
  padding: 0;
  border: none;
  background: none;
  outline: none;
  font: inherit;
  font-size: 17px;
  color: ${(p) => (p.$done ? "var(--m-label-3)" : "var(--m-label)")};
  text-decoration: ${(p) => (p.$done ? "line-through" : "none")};

  &::placeholder {
    color: var(--m-label-3);
  }
`;

const Circle = styled.button<{ $on: boolean }>`
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 26px;
  height: 26px;
  padding: 0;
  border-radius: 50%;
  cursor: pointer;
  color: var(--m-on-accent);
  border: 1.5px solid ${(p) => (p.$on ? "var(--m-accent)" : "var(--m-label-3)")};
  background: ${(p) => (p.$on ? "var(--m-accent)" : "transparent")};
`;

const IconButton = styled.button`
  display: grid;
  place-items: center;
  padding: 4px;
  border: none;
  background: none;
  cursor: pointer;
  color: #ff3b30;
`;

const SectionButton = styled.button.attrs({ type: "button" })`
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

const Bar = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

interface ItemRowProps {
  item: ShoppingItem;
  editing: boolean;
  onToggle: (item: ShoppingItem) => void;
  onRename: (item: ShoppingItem, name: string) => void;
  onDelete: (item: ShoppingItem) => void;
}

function ItemRow({ item, editing, onToggle, onRename, onDelete }: ItemRowProps) {
  const [name, setName] = useState(item.name);

  const commit = () => {
    const next = name.trim();
    if (!next) setName(item.name);
    else if (next !== item.name) onRename(item, next);
  };

  return (
    <Row
      inset={54}
      leading={
        <Circle
          type="button"
          role="checkbox"
          aria-checked={item.is_bought}
          aria-label={`${item.is_bought ? "Повернути в список" : "Куплено"}: ${item.name}`}
          $on={item.is_bought}
          onClick={() => onToggle(item)}
        >
          {item.is_bought && <HiCheck size={16} />}
        </Circle>
      }
      title={
        <ItemInput
          type="text"
          aria-label="Назва пункту"
          $done={item.is_bought}
          value={name}
          readOnly={item.is_bought}
          enterKeyHint="done"
          onChange={(e) => setName(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter") e.currentTarget.blur();
          }}
        />
      }
      trailing={
        editing ? (
          <IconButton
            type="button"
            aria-label={`Видалити: ${item.name}`}
            onClick={() => onDelete(item)}
          >
            <HiOutlineTrash size={22} />
          </IconButton>
        ) : undefined
      }
    />
  );
}

export default function MobileShoppingList() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const { user } = useUserRole();
  const { users } = useUsers();
  const actions = useShoppingActions();
  const [newItem, setNewItem] = useState("");
  const [editing, setEditing] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [clearOpen, setClearOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [titleDraft, setTitleDraft] = useState<string | null>(null);

  const { data: lists = [], isLoading } = useQuery({
    queryKey: ["shopping-lists"],
    queryFn: getShoppingListsApi,
  });
  const list = lists.find((l) => l.id === id);
  usePageTitle(list?.title ?? "Покупки");

  const back = (
    <NavBar backLabel="Покупки" onBack={() => navigate("/shopping")} />
  );

  if (!list) {
    return (
      <Page>
        {back}
        <ScreenState loading={isLoading}>
          {isLoading ? "Завантаження…" : "Список не знайдено"}
        </ScreenState>
      </Page>
    );
  }

  const active = list.items.filter((i) => !i.is_bought);
  const bought = list.items.filter((i) => i.is_bought);
  const isMine = String(list.user_id) === String(user?.id);
  const author = isMine
    ? null
    : users.find((u) => String(u.id) === String(list.user_id))?.name ||
      "Інший учасник";
  const hiddenNames = parseHiddenFrom(list.hidden_from)
    .map((uid) => users.find((u) => String(u.id) === uid)?.name)
    .filter(Boolean)
    .join(", ");

  const commitTitle = () => {
    const next = (titleDraft ?? list.title).trim();
    setTitleDraft(null);
    if (next && next !== list.title) {
      actions.updateList.mutate({ id: list.id, title: next });
    }
  };

  const addItem = (e: React.FormEvent) => {
    e.preventDefault();
    const name = newItem.trim();
    if (!name) return;
    actions.addItem.mutate({ listId: list.id, name });
    setNewItem(""); // фокус лишається в полі — можна вводити наступний товар
  };

  const toggle = (item: ShoppingItem) =>
    actions.toggleItem.mutate({ id: item.id, is_bought: !item.is_bought });

  const menu: ConfirmAction[] = [
    { label: "Налаштування списку", onSelect: () => setSettingsOpen(true) },
    {
      label: editing ? "Готово" : "Змінити пункти",
      onSelect: () => setEditing((v) => !v),
    },
    ...(bought.length > 0
      ? [{ label: "Очистити куплені", onSelect: () => setClearOpen(true) }]
      : []),
    {
      label: "Видалити список",
      destructive: true,
      onSelect: () => setDeleteOpen(true),
    },
  ];

  return (
    <Page>
      <NavBar
        backLabel="Покупки"
        onBack={() => navigate("/shopping")}
        trailing={
          <Bar>
            {editing && (
              <NavButton type="button" onClick={() => setEditing(false)}>
                Готово
              </NavButton>
            )}
            <NavButton
              type="button"
              aria-label="Дії зі списком"
              onClick={() => setMenuOpen(true)}
            >
              <HiEllipsisHorizontalCircle size={26} />
            </NavButton>
          </Bar>
        }
      />
      <Body>
        <Head>
          <ListTile color={list.color} size={48} />
          <HeadText>
            <TitleInput
              type="text"
              aria-label="Назва списку"
              value={titleDraft ?? list.title}
              enterKeyHint="done"
              onChange={(e) => setTitleDraft(e.target.value)}
              onBlur={commitTitle}
              onKeyDown={(e) => {
                if (e.key === "Enter") e.currentTarget.blur();
              }}
            />
            <Sub>
              {list.visibility === "private" && (
                <>
                  <HiOutlineLockClosed size={13} /> Тільки я
                </>
              )}
              {list.visibility === "hidden" && (
                <>
                  <HiOutlineEyeSlash size={13} /> Приховано
                  {hiddenNames ? `: ${hiddenNames}` : ""}
                </>
              )}
              {list.visibility === "public" && "Уся сім'я"}
              {author ? ` · ${author}` : ""}
            </Sub>
          </HeadText>
        </Head>

        <form onSubmit={addItem}>
          <Group>
            <Row
              inset={54}
              leading={
                <HiOutlinePlusCircle
                  size={26}
                  color="var(--m-accent)"
                  aria-hidden="true"
                />
              }
              title={
                <ItemInput
                  type="text"
                  aria-label="Додати пункт"
                  placeholder="Додати пункт"
                  value={newItem}
                  enterKeyHint="done"
                  onChange={(e) => setNewItem(e.target.value)}
                />
              }
            />
          </Group>
        </form>

        {active.length > 0 && (
          <Group>
            {active.map((item) => (
              <ItemRow
                key={item.id}
                item={item}
                editing={editing}
                onToggle={toggle}
                onRename={(it, name) =>
                  actions.renameItem.mutate({ id: it.id, name })
                }
                onDelete={(it) => actions.deleteItem.mutate(it.id)}
              />
            ))}
          </Group>
        )}

        {list.items.length === 0 && (
          <Empty>У списку ще нічого немає. Додайте перший товар.</Empty>
        )}
        {list.items.length > 0 && active.length === 0 && (
          <Empty>Усе куплено 🎉</Empty>
        )}

        {bought.length > 0 && (
          <Section
            caption={`Куплено · ${bought.length}`}
            action={
              <SectionButton onClick={() => setClearOpen(true)}>
                Очистити
              </SectionButton>
            }
          >
            <Group>
              {bought.map((item) => (
                <ItemRow
                  key={item.id}
                  item={item}
                  editing={editing}
                  onToggle={toggle}
                  onRename={() => undefined}
                  onDelete={(it) => actions.deleteItem.mutate(it.id)}
                />
              ))}
            </Group>
          </Section>
        )}
      </Body>

      <ConfirmSheet
        open={menuOpen}
        onOpenChange={setMenuOpen}
        message={list.title}
        actions={menu}
      />
      <ConfirmSheet
        open={clearOpen}
        onOpenChange={setClearOpen}
        message={`Видалити куплені пункти (${bought.length}) зі списку?`}
        actions={[
          {
            label: "Очистити куплені",
            destructive: true,
            onSelect: () => actions.clearBought.mutate(list.id),
          },
        ]}
      />
      <ConfirmSheet
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        message={`Видалити список «${list.title}» разом з усіма пунктами?`}
        actions={[
          {
            label: "Видалити список",
            destructive: true,
            onSelect: () =>
              actions.deleteList
                .mutateAsync(list.id)
                .then(() => navigate("/shopping", { replace: true }))
                .catch(() => undefined),
          },
        ]}
      />
      {settingsOpen && (
        <ShoppingListSheet
          open={settingsOpen}
          onOpenChange={(open) => !open && setSettingsOpen(false)}
          list={list}
        />
      )}
    </Page>
  );
}
