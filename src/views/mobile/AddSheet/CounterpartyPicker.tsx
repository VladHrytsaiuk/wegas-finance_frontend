import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { HiCheck } from "react-icons/hi2";
import styled from "styled-components";

import type { Counterparty } from "../../../types";
import { getCpCategoriesApi } from "../../../services/apiCounterparties";
import { Sheet, PrimaryButton } from "../../../mobile/ui/Sheet";
import { Section, Group, Row } from "../../../mobile/ui/Group";
import { SearchField } from "../../../mobile/ui/SearchField";
import { Segmented } from "../../../mobile/ui/Segmented";
import { CounterpartyTile } from "../../../mobile/counterpartyTile";

// Вибір контрагента з тими ж групами, що й у старій формі: тип (магазини,
// інше, люди) → категорія контрагента → контрагенти. Зверху — часті.

export type CounterpartyType = "shop" | "person" | "other";

export interface NewCounterparty {
  name: string;
  type: CounterpartyType;
  category_id?: string;
}

const TYPE_CAPTION: Record<CounterpartyType, string> = {
  shop: "Магазини",
  other: "Інше",
  person: "Люди",
};

const Check = styled(HiCheck)`
  width: 20px;
  height: 20px;
  color: var(--m-accent);
`;

const NameInput = styled.input`
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

const ChipRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const Chip = styled.button<{ $active: boolean }>`
  height: 34px;
  padding: 0 14px;
  border: none;
  border-radius: 17px;
  font: inherit;
  font-size: 15px;
  cursor: pointer;
  color: ${(p) => (p.$active ? "var(--m-on-accent)" : "var(--m-label)")};
  background: ${(p) => (p.$active ? "var(--m-accent)" : "var(--m-surface)")};
`;

interface CounterpartyPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  counterparties: Counterparty[];
  /** Скільки разів контрагент траплявся в останніх операціях — для «Часті». */
  usage: Map<string, number>;
  /** Порядок груп: для витрати магазини перші, для боргу — люди. */
  typeOrder: CounterpartyType[];
  value: string;
  onSelect: (id: string) => void;
  onCreate: (data: NewCounterparty) => void;
  isCreating: boolean;
  /** «Не вказувати» — для необов'язкового поля. */
  onClear?: () => void;
}

export function CounterpartyPicker({
  open,
  onOpenChange,
  title,
  counterparties,
  usage,
  typeOrder,
  value,
  onSelect,
  onCreate,
  isCreating,
  onClear,
}: CounterpartyPickerProps) {
  const [query, setQuery] = useState("");
  // Чернетка нового контрагента; null — показуємо список.
  const [draft, setDraft] = useState<NewCounterparty | null>(null);

  const { data: cpCategories = [] } = useQuery({
    queryKey: ["cp-categories-for-select"],
    queryFn: getCpCategoriesApi,
    enabled: open,
    staleTime: 5 * 60 * 1000,
  });
  const categoryOf = (cp: Counterparty) =>
    cpCategories.find((c) => c.id === cp.category_id);

  const q = query.trim().toLowerCase();
  const exists = counterparties.some((c) => c.name.toLowerCase() === q);

  const sections = useMemo(() => {
    const byUsage = (a: Counterparty, b: Counterparty) =>
      (usage.get(b.id) || 0) - (usage.get(a.id) || 0) ||
      a.name.localeCompare(b.name);
    const matches = (cp: Counterparty) =>
      !q ||
      cp.name.toLowerCase().includes(q) ||
      !!cpCategories
        .find((c) => c.id === cp.category_id)
        ?.name.toLowerCase()
        .includes(q);
    const visible = counterparties.filter(matches);

    const result: { key: string; caption: string; items: Counterparty[] }[] =
      [];
    if (!q) {
      const frequent = visible
        .filter((cp) => usage.get(cp.id))
        .sort(byUsage)
        .slice(0, 5);
      if (frequent.length)
        result.push({ key: "frequent", caption: "Часті", items: frequent });
    }
    for (const type of typeOrder) {
      const ofType = visible.filter((cp) => (cp.type || "other") === type);
      const categories = cpCategories
        .filter((c) => c.type === type)
        .sort((a, b) => a.name.localeCompare(b.name));
      for (const category of categories) {
        const items = ofType
          .filter((cp) => cp.category_id === category.id)
          .sort(byUsage);
        if (items.length)
          result.push({ key: category.id, caption: category.name, items });
      }
      const rest = ofType
        .filter(
          (cp) =>
            !cp.category_id || !categories.some((c) => c.id === cp.category_id),
        )
        .sort(byUsage);
      if (rest.length)
        result.push({
          key: `type-${type}`,
          caption: TYPE_CAPTION[type],
          items: rest,
        });
    }
    return result;
  }, [counterparties, cpCategories, usage, typeOrder, q]);

  const close = (next: boolean) => {
    if (!next) {
      setDraft(null);
      setQuery("");
    }
    onOpenChange(next);
  };

  const pick = (id: string) => {
    onSelect(id);
    close(false);
  };

  if (draft) {
    const draftCategories = cpCategories
      .filter((c) => c.type === draft.type)
      .sort((a, b) => a.name.localeCompare(b.name));
    return (
      <Sheet
        nested
        open={open}
        onOpenChange={close}
        onCancel={() => setDraft(null)}
        title="Новий контрагент"
        footer={
          <PrimaryButton
            type="button"
            disabled={!draft.name.trim() || isCreating}
            onClick={() => {
              onCreate({ ...draft, name: draft.name.trim() });
              setDraft(null);
              setQuery("");
            }}
          >
            {isCreating ? "Додаємо…" : "Додати"}
          </PrimaryButton>
        }
      >
        <Group>
          <Row
            title={
              <NameInput
                type="text"
                aria-label="Назва контрагента"
                placeholder="Назва"
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              />
            }
          />
        </Group>
        <Segmented
          label="Тип контрагента"
          value={draft.type}
          onChange={(type) =>
            setDraft({ ...draft, type, category_id: undefined })
          }
          options={[
            { value: "shop", label: "Магазин" },
            { value: "person", label: "Людина" },
            { value: "other", label: "Інше" },
          ]}
        />
        {draftCategories.length > 0 && (
          <Section caption="Категорія">
            <ChipRow role="group" aria-label="Категорія контрагента">
              {draftCategories.map((c) => (
                <Chip
                  key={c.id}
                  type="button"
                  $active={draft.category_id === c.id}
                  aria-pressed={draft.category_id === c.id}
                  onClick={() =>
                    setDraft({
                      ...draft,
                      category_id:
                        draft.category_id === c.id ? undefined : c.id,
                    })
                  }
                >
                  {c.name}
                </Chip>
              ))}
            </ChipRow>
          </Section>
        )}
      </Sheet>
    );
  }

  return (
    <Sheet nested open={open} onOpenChange={close} title={title}>
      <SearchField
        value={query}
        onChange={setQuery}
        placeholder="Пошук"
        label="Пошук контрагента"
      />
      {q && !exists && (
        <Group>
          <Row
            onClick={() => setDraft({ name: query.trim(), type: typeOrder[0] })}
            title={`Додати «${query.trim()}»`}
            inset={16}
          />
        </Group>
      )}
      {onClear && !q && value && (
        <Group>
          <Row
            onClick={() => {
              onClear();
              close(false);
            }}
            title="Не вказувати"
          />
        </Group>
      )}
      {sections.map((section) => (
        <Section key={section.key} caption={section.caption}>
          <Group>
            {section.items.map((cp) => (
              <Row
                key={cp.id}
                onClick={() => pick(cp.id)}
                leading={<CounterpartyTile cp={cp} category={categoryOf(cp)} />}
                title={cp.name}
                trailing={
                  cp.id === value ? <Check aria-label="Обрано" /> : undefined
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
