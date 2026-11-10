import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { HiCheck } from "react-icons/hi2";
import styled from "styled-components";

import type { ShoppingList } from "../../../services/apiShopping";
import { useUsers } from "../../../hooks/Settings/useUsers";
import { useUserRole } from "../../../hooks/useUserRole";
import { DEFAULT_NOTE_COLOR, NOTE_COLORS } from "../../../utils/constants";
import { Group, Row, Section } from "../../../mobile/ui/Group";
import { PrimaryButton, Sheet } from "../../../mobile/ui/Sheet";
import { ListTile } from "./ListTile";
import {
  parseHiddenFrom,
  resolveVisibility,
  type ShoppingVisibility,
} from "./shopping";
import { useShoppingActions } from "./useShoppingActions";

// Створення й налаштування списку: назва, колір і видимість (уся сім'я /
// тільки я / приховати від вибраних учасників) — усе, що вміла NoteOptions.

const Field = styled.input`
  flex: 1;
  width: 100%;
  min-width: 0;
  border: none;
  background: none;
  outline: none;
  font: inherit;
  font-size: 17px;
  color: var(--m-label);

  &::placeholder {
    color: var(--m-label-3);
  }
`;

const Colors = styled.div`
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 8px;
  padding: 12px 16px;
  background: var(--m-surface);
  border-radius: var(--m-radius-group);
`;

const Swatch = styled.button<{ $color: string; $active: boolean }>`
  display: grid;
  place-items: center;
  aspect-ratio: 1;
  min-width: 0;
  padding: 0;
  border-radius: 50%;
  background: ${(p) => p.$color};
  color: #3a3a3c;
  cursor: pointer;
  border: ${(p) =>
    p.$active ? "2px solid var(--m-accent)" : "0.5px solid rgba(60, 60, 67, 0.25)"};
`;

const Check = () => <HiCheck size={18} color="var(--m-accent)" aria-hidden="true" />;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Без списку — створення нового. */
  list?: ShoppingList;
}

export function ShoppingListSheet({ open, onOpenChange, list }: Props) {
  const navigate = useNavigate();
  const { user } = useUserRole();
  const { users } = useUsers();
  const { createList, updateList } = useShoppingActions();

  const [title, setTitle] = useState(list?.title ?? "");
  const [color, setColor] = useState(list?.color || DEFAULT_NOTE_COLOR);
  const [mode, setMode] = useState<ShoppingVisibility>(
    (list?.visibility as ShoppingVisibility) || "public",
  );
  const [hiddenIds, setHiddenIds] = useState<string[]>(
    parseHiddenFrom(list?.hidden_from),
  );

  const others = users.filter((u) => String(u.id) !== String(user?.id));
  const pending = createList.isPending || updateList.isPending;
  const canSave = title.trim().length > 0 && !pending;

  const toggleMember = (id: string) =>
    setHiddenIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  const save = async () => {
    if (!canSave) return;
    const body = {
      title: title.trim(),
      color,
      ...resolveVisibility(mode, hiddenIds),
    };
    if (list) {
      await updateList.mutateAsync({ id: list.id, ...body });
      onOpenChange(false);
    } else {
      const created = await createList.mutateAsync(body);
      onOpenChange(false);
      // Порожній список нікому не потрібен — одразу відкриваємо його для пунктів.
      if (created?.id) navigate(`/shopping/${created.id}`);
    }
  };

  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      title={list ? "Налаштування списку" : "Новий список"}
      footer={
        <PrimaryButton type="button" disabled={!canSave} onClick={save}>
          {list ? "Зберегти" : "Створити"}
        </PrimaryButton>
      }
    >
      <Group>
        <Row
          leading={<ListTile color={color} size={36} />}
          title={
            <Field
              type="text"
              aria-label="Назва списку"
              placeholder="Назва списку"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus={!list}
            />
          }
        />
      </Group>

      <Section caption="Колір">
        <Colors role="radiogroup" aria-label="Колір списку">
          {NOTE_COLORS.map((c) => (
            <Swatch
              key={c.value}
              type="button"
              role="radio"
              aria-checked={color === c.value}
              aria-label={c.name}
              $color={c.value}
              $active={color === c.value}
              onClick={() => setColor(c.value)}
            >
              {color === c.value && <HiCheck size={16} />}
            </Swatch>
          ))}
        </Colors>
      </Section>

      <Section caption="Хто бачить">
        <Group>
          <Row
            title="Уся сім'я"
            trailing={mode === "public" ? <Check /> : undefined}
            onClick={() => {
              setMode("public");
              setHiddenIds([]);
            }}
          />
          <Row
            title="Тільки я"
            trailing={mode === "private" ? <Check /> : undefined}
            onClick={() => setMode("private")}
          />
          {others.length > 0 && (
            <Row
              title="Приховати від…"
              subtitle={
                mode === "hidden" && hiddenIds.length === 0
                  ? "Виберіть, від кого"
                  : undefined
              }
              trailing={mode === "hidden" ? <Check /> : undefined}
              onClick={() => setMode("hidden")}
            />
          )}
        </Group>
      </Section>

      {mode === "hidden" && others.length > 0 && (
        <Section caption="Не бачитимуть список">
          <Group>
            {others.map((member) => (
              <Row
                key={member.id}
                title={member.name}
                trailing={hiddenIds.includes(member.id) ? <Check /> : undefined}
                onClick={() => toggleMember(member.id)}
              />
            ))}
          </Group>
        </Section>
      )}
    </Sheet>
  );
}
