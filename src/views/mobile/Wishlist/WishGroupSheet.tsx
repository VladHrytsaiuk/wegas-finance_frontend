import { useState } from "react";
import { HiCheck } from "react-icons/hi2";
import styled from "styled-components";

import type { WishlistGroup } from "../../../types";
import { useUsers } from "../../../hooks/Settings/useUsers";
import { useUserRole } from "../../../hooks/useUserRole";
import { DEFAULT_WISHLIST_GROUP_COLOR } from "../../../utils/constants";
import { AppearancePicker } from "../../../mobile/ui/AppearancePicker";
import { Group, Meta, Row, Section } from "../../../mobile/ui/Group";
import { PrimaryButton, Sheet } from "../../../mobile/ui/Sheet";
import { Tile } from "../../../mobile/ui/Tile";
import { parseIds } from "./wishlist";
import { useWishlistActions } from "./useWishlistActions";

// Створення й зміна групи: назва, колір та іконка, видимість (публічна /
// приватна) і — для публічної — «приховати від» вибраних учасників.

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

const Check = () => <HiCheck size={18} color="var(--m-accent)" aria-hidden="true" />;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  group?: WishlistGroup;
}

export function WishGroupSheet({ open, onOpenChange, group }: Props) {
  const { user } = useUserRole();
  const { users } = useUsers();
  const { createGroup, updateGroup } = useWishlistActions();
  const [name, setName] = useState(group?.name ?? "");
  const [color, setColor] = useState(group?.color || DEFAULT_WISHLIST_GROUP_COLOR);
  const [icon, setIcon] = useState(group?.icon || "HiFolder");
  const [priv, setPriv] = useState(group?.visibility === "private");
  const [hidden, setHidden] = useState<string[]>(parseIds(group?.hidden_from));
  const [appearance, setAppearance] = useState(false);

  const others = users.filter((u) => String(u.id) !== String(user?.id));
  const pending = createGroup.isPending || updateGroup.isPending;
  const canSave = name.trim().length > 0 && !pending;

  const toggle = (id: string) =>
    setHidden((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const save = async () => {
    if (!canSave) return;
    const body = {
      name: name.trim(),
      color,
      icon,
      visibility: priv ? ("private" as const) : ("public" as const),
      hidden_from: priv ? "" : hidden.join(","),
    };
    if (group) await updateGroup.mutateAsync({ id: group.id, ...body });
    else await createGroup.mutateAsync(body);
    onOpenChange(false);
  };

  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      title={group ? "Група" : "Нова група"}
      footer={
        <PrimaryButton type="button" disabled={!canSave} onClick={save}>
          {group ? "Зберегти" : "Створити"}
        </PrimaryButton>
      }
    >
      <Group>
        <Row
          leading={<Tile iconName={icon} color={color} size={36} />}
          title={
            <Field
              type="text"
              aria-label="Назва групи"
              placeholder="Назва, напр. Техніка"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus={!group}
            />
          }
        />
        <Row
          title="Колір та іконка"
          trailing={<Meta>Змінити</Meta>}
          chevron
          onClick={() => setAppearance(true)}
        />
      </Group>

      <Section caption="Хто бачить">
        <Group>
          <Row
            title="Уся сім'я"
            trailing={!priv ? <Check /> : undefined}
            onClick={() => setPriv(false)}
          />
          <Row
            title="Тільки я"
            trailing={priv ? <Check /> : undefined}
            onClick={() => setPriv(true)}
          />
        </Group>
      </Section>

      {!priv && others.length > 0 && (
        <Section caption="Приховати від">
          <Group>
            {others.map((member) => (
              <Row
                key={member.id}
                title={member.name}
                trailing={hidden.includes(member.id) ? <Check /> : undefined}
                onClick={() => toggle(member.id)}
              />
            ))}
          </Group>
        </Section>
      )}

      <AppearancePicker
        open={appearance}
        onOpenChange={setAppearance}
        color={color}
        icon={icon}
        onChange={(v) => {
          setColor(v.color);
          setIcon(v.icon);
        }}
      />
    </Sheet>
  );
}
