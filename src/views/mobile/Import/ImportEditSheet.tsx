import { useState } from "react";
import { format } from "date-fns";

import type { Category, Counterparty } from "../../../types";
import type { ExtendedTransaction } from "../../../components/import/ImportTypes";
import { categoryLabel } from "../../../mobile/categoryLabel";
import { Footnote, RowInput } from "../../../mobile/ui/Field";
import { Group, Meta, Row, Section } from "../../../mobile/ui/Group";
import { Segmented } from "../../../mobile/ui/Segmented";
import { PrimaryButton, Sheet } from "../../../mobile/ui/Sheet";
import { CategoryPicker } from "../AddSheet/Pickers";
import { CounterpartyPicker, type NewCounterparty } from "../AddSheet/CounterpartyPicker";

// Рядок виписки: тип, сума, контрагент, категорія, опис; для дубліката — порівняння з базою.

const TYPES = [
  { value: "expense", label: "Витрата" },
  { value: "income", label: "Дохід" },
  { value: "transfer", label: "Переказ" },
];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction: ExtendedTransaction;
  categories: Category[];
  counterparties: Counterparty[];
  currency: string;
  onSave: (updated: Partial<ExtendedTransaction>) => void;
  onCreateCounterparty: (data: NewCounterparty) => Promise<Counterparty | undefined>;
  money: (minor: number) => string;
}

export function ImportEditSheet({ open, onOpenChange, transaction, categories, counterparties, onSave, onCreateCounterparty, money }: Props) {
  const [type, setType] = useState<string>(transaction.type);
  const [amount, setAmount] = useState(String(Math.abs(transaction.amount) / 100));
  const [desc, setDesc] = useState(transaction.description ?? "");
  const [cpId, setCpId] = useState(transaction.counterparty_id ?? "");
  const [cpName, setCpName] = useState(transaction.counterparty_name ?? "");
  const [catId, setCatId] = useState(transaction.category_id ?? "");
  const [picker, setPicker] = useState<null | "category" | "counterparty">(null);
  const [creating, setCreating] = useState(false);

  const existing = transaction.existing_transaction;
  const cp = counterparties.find((c) => c.id === cpId);
  const valid = Number(amount.replace(",", ".")) > 0;

  const save = () => {
    const cents = Math.round(Number(amount.replace(",", ".")) * 100);
    onSave({
      type: type as ExtendedTransaction["type"],
      amount: cents * (type === "expense" ? -1 : 1),
      description: desc,
      counterparty_id: type === "transfer" ? "" : cpId,
      counterparty_name: type === "transfer" ? "" : cp?.name ?? cpName,
      category_id: type === "transfer" ? "" : catId,
    });
  };

  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      title="Рядок виписки"
      footer={
        <PrimaryButton type="button" disabled={!valid} onClick={save}>
          Зберегти
        </PrimaryButton>
      }
    >
      <Segmented label="Тип операції" options={TYPES} value={type} onChange={setType} />

      <Section>
        <Group>
          <Row
            title="Сума"
            trailing={<RowInput aria-label="Сума" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^\d.,]/g, ""))} />}
          />
          <Row title="Опис" trailing={<RowInput aria-label="Опис" value={desc} onChange={(e) => setDesc(e.target.value)} />} />
          <Row title="Дата" trailing={<Meta>{format(new Date(transaction.date), "dd.MM.yyyy HH:mm")}</Meta>} />
        </Group>
      </Section>

      {type !== "transfer" && (
        <Section>
          <Group>
            <Row onClick={() => setPicker("counterparty")} title="Контрагент" trailing={<Meta>{cp?.name ?? (cpName || "Не вказано")}</Meta>} chevron />
            {!cpId && (
              <Row
                title="Назва вручну"
                trailing={<RowInput aria-label="Назва контрагента вручну" value={cpName} onChange={(e) => setCpName(e.target.value)} />}
              />
            )}
            <Row
              onClick={() => setPicker("category")}
              title="Категорія"
              trailing={<Meta>{categoryLabel(categories, catId) ?? "Без категорії"}</Meta>}
              chevron
            />
          </Group>
          {transaction.predicted_category && !catId && <Footnote>Прогноз банку не збігся з жодною вашою категорією.</Footnote>}
        </Section>
      )}

      {existing && (
        <Section caption={transaction.is_duplicate ? "Точний дублікат · вже в базі" : "Схожа операція в базі"}>
          <Group>
            <Row title="Дата" trailing={<Meta>{format(new Date(existing.date), "dd.MM.yyyy HH:mm")}</Meta>} />
            <Row title="Сума" trailing={<Meta>{money(Math.abs(existing.amount))}</Meta>} />
            {existing.counterparty?.name && <Row title="Контрагент" trailing={<Meta>{existing.counterparty.name}</Meta>} />}
            {existing.category?.name && <Row title="Категорія" trailing={<Meta>{existing.category.name}</Meta>} />}
            {existing.note && <Row title="Нотатка" subtitle={existing.note} wrapSubtitle />}
          </Group>
          {transaction.match_reason && <Footnote>{transaction.match_reason}</Footnote>}
        </Section>
      )}

      <CategoryPicker
        open={picker === "category"}
        onOpenChange={(o) => !o && setPicker(null)}
        categories={categories.filter((c) => c.type === (type === "income" ? "income" : "expense"))}
        value={catId}
        onSelect={setCatId}
        noneLabel="Без категорії"
      />
      <CounterpartyPicker
        open={picker === "counterparty"}
        onOpenChange={(o) => !o && setPicker(null)}
        title="Контрагент"
        counterparties={counterparties.filter((c) => !c.is_archived)}
        usage={new Map()}
        typeOrder={type === "income" ? ["other", "person", "shop"] : ["shop", "other", "person"]}
        value={cpId}
        onSelect={(id) => {
          setCpId(id);
          setPicker(null);
        }}
        onCreate={async (data) => {
          setCreating(true);
          const created = await onCreateCounterparty(data);
          setCreating(false);
          if (created) {
            setCpId(created.id);
            setPicker(null);
          }
        }}
        isCreating={creating}
        onClear={() => {
          setCpId("");
          setPicker(null);
        }}
      />
    </Sheet>
  );
}
