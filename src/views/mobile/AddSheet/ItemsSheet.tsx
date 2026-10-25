import { useId, useState } from "react";
import { HiMinus, HiPlus } from "react-icons/hi2";
import styled from "styled-components";

import { formatMoney } from "../../../utils/helpers";
import { Sheet, SheetTextButton } from "../../../mobile/ui/Sheet";
import { Section, Group, Row, Amount, Meta } from "../../../mobile/ui/Group";
import { itemsTotal, minorToInput, type DraftItem, type KnownItem } from "./items";

// Ручне введення чека: товари по одному, знижка окремо, сума рахується сама.

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
  currency: string;
  language: string;
}

export function ItemsSheet({ open, onOpenChange, items, discount, onChange, known, currency, language }: ItemsSheetProps) {
  const listId = useId();
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState("");
  const [discountText, setDiscountText] = useState(() => minorToInput(discount));
  const [editing, setEditing] = useState<number | null>(null);

  const money = (minor: number) => formatMoney(minor, currency, language);
  const priceMinor = toMinor(price);
  const canAdd = name.trim().length > 0 && priceMinor > 0 && quantity > 0;

  const clearDraft = () => {
    setName("");
    setQuantity(1);
    setPrice("");
    setEditing(null);
  };

  const submit = () => {
    if (!canAdd) return;
    const item = { name: name.trim(), quantity, price: priceMinor };
    const next = editing === null ? [...items, item] : items.map((it, i) => (i === editing ? item : it));
    onChange(next, discount);
    clearDraft();
  };

  const edit = (index: number) => {
    const item = items[index];
    setName(item.name);
    setQuantity(item.quantity);
    setPrice(minorToInput(item.price));
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
    const match = known.find((k) => k.name.toLowerCase() === value.trim().toLowerCase());
    if (match && !price) setPrice(minorToInput(match.price));
  };

  const changeDiscount = (value: string) => {
    const text = onlyAmount(value);
    setDiscountText(text);
    onChange(items, toMinor(text));
  };

  const total = itemsTotal(items, discount);

  return (
    <Sheet
      nested
      open={open}
      onOpenChange={onOpenChange}
      title="Товари"
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
                type="text"
                aria-label="Назва товару"
                placeholder="Назва"
                list={listId}
                value={name}
                onChange={(e) => changeName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submit()}
                enterKeyHint="next"
              />
            }
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
                  onChange={(e) => setQuantity(Math.max(1, Number.parseInt(e.target.value.replace(/\D/g, ""), 10) || 1))}
                />
                <StepButton type="button" aria-label="Більше" onClick={() => setQuantity((q) => q + 1)}>
                  <HiPlus size={18} />
                </StepButton>
              </Stepper>
            }
          />
          <Row
            title="Ціна за шт."
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
        <datalist id={listId}>
          {known.map((k) => (
            <option key={k.name} value={k.name} />
          ))}
        </datalist>
      </Section>

      <AddButton type="button" disabled={!canAdd} onClick={submit}>
        {editing === null ? (quantity > 1 && priceMinor ? `Додати · ${money(quantity * priceMinor)}` : "Додати товар") : "Зберегти зміни"}
      </AddButton>
      {editing !== null && (
        <RemoveButton type="button" onClick={remove}>
          Видалити товар
        </RemoveButton>
      )}

      {items.length > 0 && (
        <Section caption={`У чеку · ${items.length}`}>
          <Group>
            {items.map((item, index) => (
              <Row
                key={`${item.name}-${index}`}
                onClick={() => edit(index)}
                title={item.name}
                subtitle={item.quantity > 1 ? `${item.quantity} × ${money(item.price)}` : undefined}
                trailing={<Amount>{money(item.quantity * item.price)}</Amount>}
              />
            ))}
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
    </Sheet>
  );
}
