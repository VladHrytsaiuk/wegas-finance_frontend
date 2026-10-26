import { useMemo, useState } from "react";
import { HiCheck } from "react-icons/hi2";
import styled from "styled-components";

import type { Category } from "../../../types";
import type { Account } from "../../../services/apiAccounts";
import { formatMoney } from "../../../utils/helpers";
import { AccountTile } from "../../../mobile/accountTile";
import { Sheet } from "../../../mobile/ui/Sheet";
import { Section, Group, Row, Meta } from "../../../mobile/ui/Group";
import { SearchField } from "../../../mobile/ui/SearchField";
import { Tile } from "../../../mobile/ui/Tile";

const Check = styled(HiCheck)`
  width: 20px;
  height: 20px;
  color: var(--m-accent);
`;

interface CategoryPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: Category[];
  value: string;
  onSelect: (id: string) => void;
  /** Пункт «без власної категорії» зверху (значення ""). */
  noneLabel?: string;
}

// Категорії згруповані за батьківською: батьківська теж вибирається.
export function CategoryPicker({
  open,
  onOpenChange,
  categories,
  value,
  onSelect,
  noneLabel,
}: CategoryPickerProps) {
  const [query, setQuery] = useState("");

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    const parents = categories.filter((c) => !c.parent_id);
    return parents
      .map((parent) => {
        const children = categories.filter((c) => c.parent_id === parent.id);
        const items = [parent, ...children].filter(
          (c) => !q || c.name.toLowerCase().includes(q),
        );
        return { parent, items };
      })
      .filter((g) => g.items.length > 0);
  }, [categories, query]);

  const pick = (id: string) => {
    onSelect(id);
    onOpenChange(false);
  };

  return (
    <Sheet nested open={open} onOpenChange={onOpenChange} title="Категорія">
      <SearchField value={query} onChange={setQuery} label="Пошук категорії" />
      {noneLabel && !query && (
        <Group>
          <Row
            onClick={() => pick("")}
            title={noneLabel}
            trailing={value === "" ? <Check aria-label="Обрано" /> : undefined}
          />
        </Group>
      )}
      {groups.map(({ parent, items }) => (
        <Section
          key={parent.id}
          caption={items.length > 1 ? parent.name : undefined}
        >
          <Group>
            {items.map((c) => (
              <Row
                key={c.id}
                onClick={() => pick(c.id)}
                leading={<Tile iconName={c.icon} color={c.color} size={30} />}
                title={
                  c.id === parent.id && items.length > 1
                    ? `${c.name} — загалом`
                    : c.name
                }
                trailing={
                  c.id === value ? <Check aria-label="Обрано" /> : undefined
                }
                inset={58}
              />
            ))}
          </Group>
        </Section>
      ))}
    </Sheet>
  );
}

interface AccountPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  accounts: Account[];
  users: { id: string; name: string }[];
  currentUserId?: string;
  value: string;
  onSelect: (id: string) => void;
  language: string;
}

// Як у старій формі: рахунки згруповані за власником (мої — першими), у групі
// звичайні рахунки перед синхронізованими з банком.
export function AccountPicker({
  open,
  onOpenChange,
  title,
  accounts,
  users,
  currentUserId,
  value,
  onSelect,
  language,
}: AccountPickerProps) {
  const [query, setQuery] = useState("");

  const owners = useMemo(() => {
    const q = query.trim().toLowerCase();
    const visible = accounts
      .filter((a) => !q || a.name.toLowerCase().includes(q))
      .sort(
        (a, b) =>
          Number(!!a.is_synced) - Number(!!b.is_synced) ||
          a.name.localeCompare(b.name),
      );
    const groups = new Map<string, Account[]>();
    for (const account of visible) {
      const key = account.user_id || "";
      groups.set(key, [...(groups.get(key) || []), account]);
    }
    return [...groups.entries()]
      .sort(
        ([a], [b]) => Number(b === currentUserId) - Number(a === currentUserId),
      )
      .map(([userId, items]) => ({
        userId,
        caption:
          userId === currentUserId
            ? "Мої"
            : users.find((u) => u.id === userId)?.name || "Інші",
        items,
      }));
  }, [accounts, users, currentUserId, query]);

  return (
    <Sheet nested open={open} onOpenChange={onOpenChange} title={title}>
      {accounts.length > 8 && (
        <SearchField value={query} onChange={setQuery} label="Пошук рахунку" />
      )}
      {owners.map((owner) => (
        <Section
          key={owner.userId}
          caption={owners.length > 1 ? owner.caption : undefined}
        >
          <Group>
            {owner.items.map((account) => (
              <Row
                key={account.id}
                onClick={() => {
                  onSelect(account.id);
                  setQuery("");
                  onOpenChange(false);
                }}
                leading={<AccountTile account={account} size={30} />}
                title={account.name}
                subtitle={
                  account.is_synced ? "Синхронізується з банком" : undefined
                }
                trailing={
                  account.id === value ? (
                    <Check aria-label="Обрано" />
                  ) : (
                    <Meta>
                      {formatMoney(account.balance, account.currency, language)}
                    </Meta>
                  )
                }
                inset={58}
              />
            ))}
          </Group>
        </Section>
      ))}
    </Sheet>
  );
}
