import { useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { HiMinus, HiPlus } from "react-icons/hi2";
import styled from "styled-components";

import type { Category } from "../../../types";
import { useDebounce } from "../../../hooks/useDebounce";
import { predictCategoryApi } from "../../../services/apiTransactions";
import { formatMoney } from "../../../utils/helpers";
import { Sheet, SheetTextButton } from "../../../mobile/ui/Sheet";
import { Section, Group, Row, Amount, Meta } from "../../../mobile/ui/Group";
import { Tile } from "../../../mobile/ui/Tile";
import { categoryLabel } from "../../../mobile/categoryLabel";
import { CategoryPicker } from "./Pickers";
import {
  findKnown,
  itemTotal,
  itemsTotal,
  minorToInput,
  suggestKnown,
  type DraftItem,
  type KnownItem,
} from "./items";

// Ручне введення чека: товари по одному, у кожного своя категорія (підбирається
// за історією), знижка окремо, сума рахується сама.

const FieldInput = styled.input`
  flex: 1;
  width: 100%;
  min-width: 0;
  border: none;
  background: none;
  outline: none;
  font: inherit;
  font-size: 17px;
  color: var(--m-label);
  text-align: right;

  &::placeholder {
    color: var(--m-label-3);
  }
`;

const NameInput = styled(FieldInput)`
  text-align: left;
`;

const Stepper = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  border-radius: 9px;
  background: var(--m-fill);
`;

const StepButton = styled.button`
  display: grid;
  place-items: center;
  width: 40px;
  height: 32px;
  border: none;
  background: none;
  color: var(--m-label);
  cursor: pointer;

  &:disabled {
    color: var(--m-label-3);
  }
`;

const StepValue = styled.input`
  width: 36px;
  border: none;
  background: none;
  outline: none;
  font: inherit;
  font-size: 17px;
  font-variant-numeric: tabular-nums;
  text-align: center;
  color: var(--m-label);
`;

// Підказки з минулих чеків — рядок чипів, як QuickType над клавіатурою.
const Suggestions = styled.div`
  display: flex;
  gap: 8px;
  margin: -12px -16px 0;
  padding: 0 16px;
  overflow-x: auto;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const Suggestion = styled.button`
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  max-width: 220px;
  padding: 6px 12px;
  border: none;
  border-radius: 12px;
  background: var(--m-surface);
  font: inherit;
  text-align: left;
  cursor: pointer;

  strong {
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 15px;
    font-weight: 500;
    color: var(--m-label);
  }

  span {
    font-size: 12px;
    color: var(--m-label-2);
  }
`;

const AddButton = styled.button`
  height: 44px;
  border: none;
  border-radius: 12px;
  background: var(--m-surface);
  color: var(--m-accent);
  font: inherit;
  font-size: 17px;
  font-weight: 600;
  cursor: pointer;

  &:disabled {
    color: var(--m-label-3);
  }
`;

const RemoveButton = styled(SheetTextButton)`
  justify-self: center;
  margin-top: -12px;
  color: #ff3b30;
`;

const Total = styled(Amount)`
  font-weight: 600;
`;

// Сума з будь-яким роздільником → копійки.
function toMinor(value: string) {
  const number = Number.parseFloat(value.replace(/\s/g, "").replace(",", "."));
  return Number.isFinite(number) && number > 0 ? Math.round(number * 100) : 0;
}

const onlyAmount = (value: string) => value.replace(/[^\d.,\s]/g, "");

interface ItemsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: DraftItem[];
  discount: number;
  onChange: (items: DraftItem[], discount: number) => void;
  known: KnownItem[];
  categories: Category[];
  /** Категорія операції — для товарів без власної. */
  mainCategoryId: string;
  currency: string;
  language: string;
}

export function ItemsSheet({
  open,
  onOpenChange,
  items,
  discount,
  onChange,
  known,
  categories,
  mainCategoryId,
  currency,
  language,
}: ItemsSheetProps) {
  const nameInput = useRef<HTMLInputElement>(null);
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState("");
  // null — категорію ще не обирали вручну, тоді вона підбирається сама.
  const [pickedCategory, setPickedCategory] = useState<string | null>(null);
  const [discountText, setDiscountText] = useState(() => minorToInput(discount));
  const [editing, setEditing] = useState<number | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [nameFocused, setNameFocused] = useState(false);

  const money = (minor: number) => formatMoney(minor, currency, language);
  const categoryName = (id: string) => categoryLabel(categories, id);

  // Знайомий товар — категорія з історії одразу; новий — питаємо бекенд.
  const exact = findKnown(known, name);
  const debouncedName = useDebounce(name.trim(), 400);
  const { data: predicted } = useQuery({
    queryKey: ["predictCategory", debouncedName],
    queryFn: () => predictCategoryApi(debouncedName),
    enabled: open && pickedCategory === null && !exact?.categoryId && debouncedName.length >= 3,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
  const autoCategory = exact?.categoryId || (debouncedName === name.trim() ? predicted : "") || "";
  const draftCategory = pickedCategory ?? (categoryName(autoCategory) ? autoCategory : "");

  const priceMinor = toMinor(price);
  const canAdd = name.trim().length > 0 && priceMinor > 0 && quantity > 0;
  const suggestions = nameFocused ? suggestKnown(known, name) : [];

  const clearDraft = () => {
    setName("");
    setQuantity(1);
    setPrice("");
    setPickedCategory(null);
    setEditing(null);
  };

  const submit = () => {
    if (!canAdd) return;
    // Сума з чека лишається, якщо кількість і ціну не чіпали (вагові товари).
    const original = editing === null ? undefined : items[editing];
    const keepTotal =
      original && original.quantity === quantity && original.price === priceMinor ? original.total : undefined;
    const item = { name: name.trim(), quantity, price: priceMinor, categoryId: draftCategory, total: keepTotal };
    const next = editing === null ? [...items, item] : items.map((it, i) => (i === editing ? item : it));
    onChange(next, discount);
    clearDraft();
    // Наступний товар — одразу з клавіатурою.
    nameInput.current?.focus();
  };

  const edit = (index: number) => {
    const item = items[index];
    setName(item.name);
    setQuantity(item.quantity);
    setPrice(minorToInput(item.price));
    setPickedCategory(item.categoryId);
    setEditing(index);
  };

  const remove = () => {
    if (editing === null) return;
    onChange(
      items.filter((_, i) => i !== editing),
      discount,
    );
    clearDraft();
  };

  // Знайомий товар — одразу підставляємо його останню ціну.
  const changeName = (value: string) => {
    setName(value);
    const match = findKnown(known, value);
    if (match && !price) setPrice(minorToInput(match.price));
  };

  const pickSuggestion = (item: KnownItem) => {
    setName(item.name);
    setPrice(minorToInput(item.price));
    setNameFocused(false);
  };

  const changeDiscount = (value: string) => {
    const text = onlyAmount(value);
    setDiscountText(text);
    onChange(items, toMinor(text));
  };

  const total = itemsTotal(items, discount);
  const mainName = categoryName(mainCategoryId);
  const draftCategoryLabel = draftCategory
    ? categoryName(draftCategory)
    : mainName
      ? `Як в операції · ${mainName}`
      : "Як в операції";

  return (
    <Sheet
      nested
      open={open}
      onOpenChange={onOpenChange}
      title="Товари"
      hideCancel
      trailing={
        <SheetTextButton type="button" $bold onClick={() => onOpenChange(false)}>
          Готово
        </SheetTextButton>
      }
    >
      <Section caption={editing === null ? "Новий товар" : "Редагування"}>
        <Group>
          <Row
            title={
              <NameInput
                ref={nameInput}
                type="text"
                aria-label="Назва товару"
                placeholder="Назва"
                autoComplete="off"
                value={name}
                onChange={(e) => changeName(e.target.value)}
                onFocus={() => setNameFocused(true)}
                onBlur={() => setTimeout(() => setNameFocused(false), 150)}
                onKeyDown={(e) => e.key === "Enter" && submit()}
                enterKeyHint="next"
              />
            }
          />
          <Row
            onClick={() => setPickerOpen(true)}
            title="Категорія"
            trailing={<Meta>{draftCategoryLabel}</Meta>}
            chevron
          />
          <Row
            title="Кількість"
            trailing={
              <Stepper>
                <StepButton
                  type="button"
                  aria-label="Менше"
                  disabled={quantity <= 1}
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                >
                  <HiMinus size={18} />
                </StepButton>
                <StepValue
                  type="text"
                  inputMode="numeric"
                  aria-label="Кількість"
                  value={quantity}
                  onChange={(e) =>
                    setQuantity(Math.max(1, Number.parseInt(e.target.value.replace(/\D/g, ""), 10) || 1))
                  }
                />
                <StepButton type="button" aria-label="Більше" onClick={() => setQuantity((q) => q + 1)}>
                  <HiPlus size={18} />
                </StepButton>
              </Stepper>
            }
          />
          <Row
            title={quantity > 1 ? "Ціна за шт." : "Ціна"}
            trailing={
              <FieldInput
                type="text"
                inputMode="decimal"
                aria-label="Ціна"
                placeholder="0,00"
                value={price}
                onChange={(e) => setPrice(onlyAmount(e.target.value))}
                onKeyDown={(e) => e.key === "Enter" && submit()}
                enterKeyHint="done"
              />
            }
          />
        </Group>
      </Section>

      {suggestions.length > 0 && (
        <Suggestions role="group" aria-label="Раніше купували">
          {suggestions.map((s) => (
            <Suggestion
              key={s.name}
              type="button"
              onPointerDown={(e) => e.preventDefault()}
              onClick={() => pickSuggestion(s)}
            >
              <strong>{s.name}</strong>
              <span>{[money(s.price), categoryName(s.categoryId)].filter(Boolean).join(" · ")}</span>
            </Suggestion>
          ))}
        </Suggestions>
      )}

      <AddButton type="button" disabled={!canAdd} onClick={submit}>
        {editing !== null
          ? "Зберегти зміни"
          : quantity > 1 && priceMinor
            ? `Додати · ${money(quantity * priceMinor)}`
            : "Додати товар"}
      </AddButton>
      {editing !== null && (
        <RemoveButton type="button" onClick={remove}>
          Видалити товар
        </RemoveButton>
      )}

      {items.length > 0 && (
        <Section caption={`У чеку · ${items.length}`}>
          <Group>
            {items.map((item, index) => {
              const category = categories.find((c) => c.id === (item.categoryId || mainCategoryId));
              return (
                <Row
                  key={`${item.name}-${index}`}
                  onClick={() => edit(index)}
                  leading={<Tile iconName={category?.icon} color={category?.color} size={30} />}
                  title={item.name}
                  subtitle={[categoryName(category?.id ?? ""), item.quantity > 1 ? `${item.quantity} × ${money(item.price)}` : ""]
                    .filter(Boolean)
                    .join(" · ")}
                  trailing={<Amount>{money(itemTotal(item))}</Amount>}
                  inset={58}
                />
              );
            })}
          </Group>
        </Section>
      )}

      <Group>
        <Row
          title="Знижка"
          trailing={
            <FieldInput
              type="text"
              inputMode="decimal"
              aria-label="Знижка"
              placeholder="0,00"
              value={discountText}
              onChange={(e) => changeDiscount(e.target.value)}
            />
          }
        />
        <Row title="Разом" trailing={total > 0 ? <Total>{money(total)}</Total> : <Meta>—</Meta>} />
      </Group>

      <CategoryPicker
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        categories={categories}
        value={draftCategory}
        onSelect={setPickedCategory}
        noneLabel={mainName ? `Як в операції · ${mainName}` : "Як в операції"}
      />
    </Sheet>
  );
}
