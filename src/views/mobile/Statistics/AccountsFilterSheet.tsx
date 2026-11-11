import { useMemo, useState } from "react";
import styled from "styled-components";
import { HiCheck } from "react-icons/hi2";

import type { Account } from "../../../services/apiAccounts";
import type { UserProfile } from "../../../services/apiUsers";
import { AccountTile } from "../../../mobile/accountTile";
import { Group, Meta, Row, Section } from "../../../mobile/ui/Group";
import { SearchField } from "../../../mobile/ui/SearchField";
import { PrimaryButton, Sheet, SheetTextButton } from "../../../mobile/ui/Sheet";

// Які рахунки враховувати: усі або вибрані, згруповані за власником.

const TextAction = styled.button.attrs({ type: "button" })`
  padding: 0;
  color: var(--m-accent);
  border: none;
  background: none;
  font: inherit;
  font-size: 13px;
  cursor: pointer;
`;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accounts: Account[];
  users: UserProfile[];
  meId?: string;
  value: string[];
  onChange: (ids: string[]) => void;
}

export function AccountsFilterSheet({ open, onOpenChange, accounts, users, meId, value, onChange }: Props) {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();

  const groups = useMemo(() => {
    const visible = accounts.filter((a) => !q || a.name.toLowerCase().includes(q));
    const owners = new Map<string, Account[]>();
    visible.forEach((a) => owners.set(a.user_id, [...(owners.get(a.user_id) ?? []), a]));
    const nameOf = (id: string) =>
      id === meId ? "Мої" : (users.find((u) => u.id === id)?.name ?? "Інші");
    return [...owners.entries()]
      .map(([id, list]) => ({ id, caption: nameOf(id), list }))
      .sort((a, b) => (a.id === meId ? -1 : b.id === meId ? 1 : a.caption.localeCompare(b.caption, "uk")));
  }, [accounts, users, meId, q]);

  const toggle = (id: string) =>
    onChange(value.includes(id) ? value.filter((v) => v !== id) : [...value, id]);

  const toggleGroup = (ids: string[]) => {
    const all = ids.every((id) => value.includes(id));
    onChange(all ? value.filter((v) => !ids.includes(v)) : [...new Set([...value, ...ids])]);
  };

  const check = <HiCheck size={20} color="var(--m-accent)" aria-label="Обрано" />;

  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      title="Рахунки"
      hideCancel
      trailing={
        value.length > 0 ? (
          <SheetTextButton type="button" onClick={() => onChange([])}>
            Скинути
          </SheetTextButton>
        ) : undefined
      }
      footer={
        <PrimaryButton type="button" onClick={() => onOpenChange(false)}>
          Готово
        </PrimaryButton>
      }
    >
      {accounts.length > 6 && <SearchField value={query} onChange={setQuery} label="Пошук рахунків" />}

      {!q && (
        <Group>
          <Row title="Усі рахунки" trailing={value.length === 0 ? check : undefined} onClick={() => onChange([])} />
        </Group>
      )}

      {groups.map((g) => {
        const ids = g.list.map((a) => a.id);
        const allOn = ids.every((id) => value.includes(id));
        return (
          <Section
            key={g.id}
            caption={groups.length > 1 || g.id === meId ? g.caption : "Рахунки"}
            action={
              g.list.length > 1 ? (
                <TextAction aria-label={`${allOn ? "Зняти" : "Обрати"} всі: ${g.caption}`} onClick={() => toggleGroup(ids)}>
                  {allOn ? "Зняти всі" : "Обрати всі"}
                </TextAction>
              ) : undefined
            }
          >
            <Group>
              {g.list.map((a) => (
                <Row
                  key={a.id}
                  leading={<AccountTile account={a} size={36} />}
                  title={a.name}
                  subtitle={<Meta>{a.currency}</Meta>}
                  trailing={value.includes(a.id) ? check : undefined}
                  onClick={() => toggle(a.id)}
                  inset={64}
                />
              ))}
            </Group>
          </Section>
        );
      })}

      {q && groups.length === 0 && <Meta>Нічого не знайдено</Meta>}
    </Sheet>
  );
}
