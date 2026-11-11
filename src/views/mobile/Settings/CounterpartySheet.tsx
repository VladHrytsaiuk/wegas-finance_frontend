import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { HiCheck } from "react-icons/hi2";

import type { Counterparty, CounterpartyCategory } from "../../../types";
import { useCounterpartyData } from "../../../hooks/Counterparties/useCounterpartyData";
import { CounterpartyTile } from "../../../mobile/counterpartyTile";
import { AppearancePicker } from "../../../mobile/ui/AppearancePicker";
import { ConfirmSheet } from "../../../mobile/ui/ConfirmSheet";
import { Footnote, RowInput } from "../../../mobile/ui/Field";
import { Group, Meta, Row, Section } from "../../../mobile/ui/Group";
import { Segmented } from "../../../mobile/ui/Segmented";
import { PrimaryButton, Sheet, SheetTextButton } from "../../../mobile/ui/Sheet";
import { Tile } from "../../../mobile/ui/Tile";
import { CP_KINDS, type CpKind } from "./catalog";

// Контрагент: тип, назва, іконка або SVG-логотип, категорія; видалення.
// Колір контрагента задає його категорія — власного кольору в записі немає.

const DEFAULT_ICON: Record<CpKind, string> = { shop: "HiBuildingStorefront", person: "HiUser", other: "HiGlobeAlt" };
const MAX_LOGO_BYTES = 20 * 1024;
/** Так само, як у бекенді: борг менше 10 копійок не рахується. */
const hasDebt = (cp?: Counterparty) => !!cp?.balances?.some((b) => Math.abs(b.balance) > 10);

interface CounterpartySheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  counterparty?: Counterparty;
  categories: CounterpartyCategory[];
  defaultType: CpKind;
}

export function CounterpartySheet({ open, onOpenChange, counterparty, categories, defaultType }: CounterpartySheetProps) {
  const navigate = useNavigate();
  const { actions } = useCounterpartyData();
  const fileInput = useRef<HTMLInputElement>(null);
  const editing = !!counterparty;
  const [type, setType] = useState<CpKind>((counterparty?.type as CpKind) ?? defaultType);
  const [name, setName] = useState(counterparty?.name ?? "");
  const [icon, setIcon] = useState(counterparty?.icon || DEFAULT_ICON[(counterparty?.type as CpKind) ?? defaultType]);
  const [logo, setLogo] = useState(counterparty?.logo ?? "");
  const [categoryId, setCategoryId] = useState(counterparty?.category_id ?? "");
  const [appearance, setAppearance] = useState(false);
  const [pickCategory, setPickCategory] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [debtNote, setDebtNote] = useState(false);

  const options = categories.filter((c) => c.type === type);
  const category = categories.find((c) => c.id === categoryId);
  const isPerson = type === "person";
  const pending = actions.createCp.isPending || actions.updateCp.isPending;

  const changeType = (next: CpKind) => {
    if (next === type) return;
    setType(next);
    // Категорія іншого типу не підходить; іконка за замовчуванням — лише для нового.
    if (category && category.type !== next) setCategoryId("");
    if (!editing) setIcon(DEFAULT_ICON[next]);
    if (next === "person") setLogo("");
  };

  const pickLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (file.type !== "image/svg+xml") return void toast.error("Лише SVG-файли");
    if (file.size > MAX_LOGO_BYTES) return void toast.error("Логотип завеликий (до 20 КБ)");
    const reader = new FileReader();
    reader.onloadend = () => setLogo(reader.result as string);
    reader.readAsDataURL(file);
  };

  const save = () => {
    const data = {
      ...(counterparty ?? {}),
      name: name.trim(),
      type,
      icon: isPerson ? "HiUser" : icon,
      logo: isPerson ? "" : logo,
      category_id: categoryId || null,
    };
    const opts = { onSuccess: () => onOpenChange(false) };
    if (counterparty) actions.updateCp.mutate({ ...data, id: counterparty.id }, opts);
    else actions.createCp.mutate(data, opts);
  };

  const remove = () => {
    if (!counterparty) return;
    if (hasDebt(counterparty)) return setDebtNote(true);
    setConfirmDelete(true);
  };

  const preview = { logo: isPerson ? "" : logo, icon: isPerson ? "HiUser" : icon, type };

  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      title={editing ? "Контрагент" : "Новий контрагент"}
      footer={
        <PrimaryButton type="button" disabled={!name.trim() || pending} onClick={save}>
          {editing ? "Зберегти" : "Додати"}
        </PrimaryButton>
      }
    >
      <Segmented label="Тип контрагента" options={CP_KINDS} value={type} onChange={changeType} />

      <Section>
        <Group>
          <Row
            title="Назва"
            trailing={<RowInput aria-label="Назва контрагента" value={name} onChange={(e) => setName(e.target.value)} />}
          />
          {isPerson ? (
            <Row leading={<CounterpartyTile cp={preview} category={category} />} title="Іконка" trailing={<Meta>Фіксована для людини</Meta>} inset={58} />
          ) : (
            <>
              <Row
                onClick={logo ? undefined : () => setAppearance(true)}
                leading={<CounterpartyTile cp={preview} category={category} />}
                title="Іконка"
                trailing={logo ? <Meta>Замінена логотипом</Meta> : undefined}
                inset={58}
                chevron={!logo}
              />
              <Row
                onClick={logo ? () => setLogo("") : () => fileInput.current?.click()}
                title="SVG-логотип"
                trailing={<Meta>{logo ? "Прибрати" : "Завантажити"}</Meta>}
              />
            </>
          )}
          <Row
            onClick={() => setPickCategory(true)}
            title="Категорія"
            trailing={<Meta>{category?.name ?? "Без категорії"}</Meta>}
            chevron
          />
        </Group>
        {!isPerson && <Footnote>Логотип — лише SVG до 20 КБ; він замінює іконку.</Footnote>}
      </Section>
      <input ref={fileInput} type="file" accept=".svg,image/svg+xml" hidden onChange={pickLogo} />

      {editing && (
        <Section>
          <Group>
            <Row onClick={remove} title={<span style={{ color: "#ff3b30" }}>Видалити контрагента</span>} />
          </Group>
        </Section>
      )}

      <AppearancePicker
        hideColor
        open={appearance}
        onOpenChange={setAppearance}
        color={category?.color ?? "#64748b"}
        icon={icon}
        onChange={(v) => setIcon(v.icon)}
      />

      <Sheet
        nested
        open={pickCategory}
        onOpenChange={setPickCategory}
        title="Категорія"
        hideCancel
        trailing={
          <SheetTextButton type="button" $bold onClick={() => setPickCategory(false)}>
            Готово
          </SheetTextButton>
        }
      >
        <Group>
          <Row
            onClick={() => {
              setCategoryId("");
              setPickCategory(false);
            }}
            title="Без категорії"
            trailing={!categoryId ? <HiCheck size={20} color="var(--m-accent)" aria-label="Обрано" /> : undefined}
          />
          {options.map((c) => (
            <Row
              key={c.id}
              onClick={() => {
                setCategoryId(c.id);
                setPickCategory(false);
              }}
              leading={<Tile iconName={c.icon} color={c.color} size={30} />}
              title={c.name}
              trailing={categoryId === c.id ? <HiCheck size={20} color="var(--m-accent)" aria-label="Обрано" /> : undefined}
              inset={58}
            />
          ))}
        </Group>
        {options.length === 0 && <Footnote>Для цього типу категорій ще немає. Створіть її через «+» на екрані «Контрагенти».</Footnote>}
      </Sheet>

      <ConfirmSheet
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        message={`Видалити «${counterparty?.name}»?`}
        actions={[
          {
            label: "Видалити",
            destructive: true,
            onSelect: () => counterparty && actions.deleteCp.mutate(counterparty.id, { onSuccess: () => onOpenChange(false) }),
          },
        ]}
      />
      <ConfirmSheet
        open={debtNote}
        onOpenChange={setDebtNote}
        message="Не можна видалити контрагента з непогашеним боргом. Спершу спишіть борг або погасіть його в «Боргах»."
        actions={[{ label: "Відкрити «Борги»", onSelect: () => navigate("/debts") }]}
      />
    </Sheet>
  );
}
