import { useMemo, useState } from "react";
import { HiCheck, HiOutlineBuildingOffice2, HiOutlineBuildingStorefront, HiOutlineUser } from "react-icons/hi2";
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
export function CategoryPicker({ open, onOpenChange, categories, value, onSelect, noneLabel }: CategoryPickerProps) {
  const [query, setQuery] = useState("");

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    const parents = categories.filter((c) => !c.parent_id);
    return parents
      .map((parent) => {
        const children = categories.filter((c) => c.parent_id === parent.id);
        const items = [parent, ...children].filter((c) => !q || c.name.toLowerCase().includes(q));
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
        <Section key={parent.id} caption={items.length > 1 ? parent.name : undefined}>
          <Group>
            {items.map((c) => (
              <Row
                key={c.id}
                onClick={() => pick(c.id)}
                leading={<Tile iconName={c.icon} color={c.color} size={30} />}
                title={c.id === parent.id && items.length > 1 ? `${c.name} — загалом` : c.name}
                trailing={c.id === value ? <Check aria-label="Обрано" /> : undefined}
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
  value: string;
  onSelect: (id: string) => void;
  language: string;
}

export function AccountPicker({ open, onOpenChange, title, accounts, value, onSelect, language }: AccountPickerProps) {
  return (
    <Sheet nested open={open} onOpenChange={onOpenChange} title={title}>
      <Group>
        {accounts.map((account) => (
          <Row
            key={account.id}
            onClick={() => {
              onSelect(account.id);
              onOpenChange(false);
            }}
            leading={<AccountTile account={account} size={30} />}
            title={account.name}
            trailing={
              account.id === value ? (
                <Check aria-label="Обрано" />
              ) : (
                <Meta>{formatMoney(account.balance, account.currency, language)}</Meta>
              )
            }
            inset={58}
          />
        ))}
      </Group>
    </Sheet>
  );
}

interface PersonOption {
  id: string;
  name: string;
  logo?: string;
  icon?: string;
  type?: string;
}

// Без логотипа — іконка за типом контрагента.
const fallbackIcon = (type?: string) =>
  type === "shop" ? (
    <HiOutlineBuildingStorefront size={17} />
  ) : type === "person" ? (
    <HiOutlineUser size={17} />
  ) : (
    <HiOutlineBuildingOffice2 size={17} />
  );

interface CounterpartyPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  people: PersonOption[];
  value: string;
  onSelect: (id: string) => void;
  /** Створити нового контрагента з введеним іменем. */
  onCreate: (name: string) => void;
  isCreating: boolean;
  title?: string;
  searchLabel?: string;
  placeholder?: string;
  /** «Не вказувати» — прибрати вибір (для необов'язкового поля). */
  onClear?: () => void;
}

export function CounterpartyPicker({
  open,
  onOpenChange,
  people,
  value,
  onSelect,
  onCreate,
  isCreating,
  title = "Хто",
  searchLabel = "Пошук людини",
  placeholder = "Імʼя",
  onClear,
}: CounterpartyPickerProps) {
  const [query, setQuery] = useState("");
  const q = query.trim();
  const filtered = people.filter((p) => !q || p.name.toLowerCase().includes(q.toLowerCase()));
  const exists = people.some((p) => p.name.toLowerCase() === q.toLowerCase());

  return (
    <Sheet nested open={open} onOpenChange={onOpenChange} title={title}>
      <SearchField value={query} onChange={setQuery} placeholder={placeholder} label={searchLabel} />
      {onClear && !q && (
        <Group>
          <Row
            onClick={() => {
              onClear();
              onOpenChange(false);
            }}
            title="Не вказувати"
          />
        </Group>
      )}
      {q && !exists && (
        <Group>
          <Row
            onClick={() => {
              onCreate(q);
              setQuery("");
            }}
            title={isCreating ? "Додаємо…" : `Додати «${q}»`}
            inset={16}
          />
        </Group>
      )}
      {filtered.length > 0 && (
        <Group>
          {filtered.map((p) => (
            <Row
              key={p.id}
              onClick={() => {
                onSelect(p.id);
                onOpenChange(false);
              }}
              leading={
                p.logo || p.icon ? (
                  <Tile logo={p.logo} iconName={p.icon} size={30} />
                ) : (
                  <Tile icon={fallbackIcon(p.type)} size={30} />
                )
              }
              title={p.name}
              trailing={p.id === value ? <Check aria-label="Обрано" /> : undefined}
              inset={58}
            />
          ))}
        </Group>
      )}
    </Sheet>
  );
}
