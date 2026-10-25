import { useMemo, useState } from "react";
import { HiCheck } from "react-icons/hi2";
import styled from "styled-components";

import type { Category } from "../../../types";
import type { Account } from "../../../services/apiAccounts";
import { formatMoney } from "../../../utils/helpers";
import { bankLogo } from "../../../mobile/bankLogo";
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
}

// Категорії згруповані за батьківською: батьківська теж вибирається.
export function CategoryPicker({ open, onOpenChange, categories, value, onSelect }: CategoryPickerProps) {
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
            leading={<Tile logo={bankLogo(account)} iconName="HiOutlineWallet" size={30} />}
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
