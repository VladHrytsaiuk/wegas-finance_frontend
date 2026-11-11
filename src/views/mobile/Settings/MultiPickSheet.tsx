import { useState, type ReactNode } from "react";
import { HiCheck } from "react-icons/hi2";

import { Group, Row } from "../../../mobile/ui/Group";
import { SearchField } from "../../../mobile/ui/SearchField";
import { PrimaryButton, Sheet, SheetTextButton } from "../../../mobile/ui/Sheet";
import { matches } from "./catalog";

// Вибір кількох значень зі списку: пошук, «Скинути»; вибір батьківського
// пункту вибирає й усі вкладені (як у старому дереві категорій).

export interface PickOption {
  id: string;
  label: string;
  leading?: ReactNode;
  /** Вкладені пункти: вибір батька вибирає їх теж. */
  children?: string[];
  /** Вкладений пункт показується з відступом. */
  nested?: boolean;
}

interface MultiPickSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  options: PickOption[];
  value: string[];
  onChange: (ids: string[]) => void;
}

export function MultiPickSheet({ open, onOpenChange, title, options, value, onChange }: MultiPickSheetProps) {
  const [query, setQuery] = useState("");
  const selected = new Set(value);
  const visible = options.filter((o) => matches(o.label, query));

  const toggle = (option: PickOption) => {
    const ids = [option.id, ...(option.children ?? [])];
    const next = new Set(value);
    const all = ids.every((id) => next.has(id));
    ids.forEach((id) => (all ? next.delete(id) : next.add(id)));
    onChange([...next]);
  };

  return (
    <Sheet
      nested
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      hideCancel
      trailing={
        <SheetTextButton type="button" $bold onClick={() => onOpenChange(false)}>
          Готово
        </SheetTextButton>
      }
      footer={
        value.length > 0 ? (
          <PrimaryButton type="button" onClick={() => onChange([])} style={{ background: "var(--m-fill)", color: "var(--m-accent)" }}>
            Скинути ({value.length})
          </PrimaryButton>
        ) : undefined
      }
    >
      {options.length > 6 && <SearchField value={query} onChange={setQuery} label={`Пошук: ${title}`} />}
      <Group>
        {visible.map((option) => (
          <Row
            key={option.id}
            onClick={() => toggle(option)}
            leading={option.nested ? <span style={{ display: "flex", paddingLeft: 22 }}>{option.leading}</span> : option.leading}
            title={option.label}
            trailing={selected.has(option.id) ? <HiCheck size={20} color="var(--m-accent)" aria-label="Обрано" /> : undefined}
            inset={option.leading ? (option.nested ? 84 : 58) : 16}
          />
        ))}
      </Group>
    </Sheet>
  );
}
