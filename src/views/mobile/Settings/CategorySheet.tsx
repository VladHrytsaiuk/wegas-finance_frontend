import { useState } from "react";
import { HiCheck } from "react-icons/hi2";

import type { Category } from "../../../types";
import { useCategoryData } from "../../../hooks/Categories/useCategoryData";
import { AppearancePicker } from "../../../mobile/ui/AppearancePicker";
import { ConfirmSheet } from "../../../mobile/ui/ConfirmSheet";
import { Footnote, RowInput } from "../../../mobile/ui/Field";
import { Group, Meta, Row, Section } from "../../../mobile/ui/Group";
import { SearchField } from "../../../mobile/ui/SearchField";
import { Segmented } from "../../../mobile/ui/Segmented";
import { PrimaryButton, Sheet, SheetTextButton } from "../../../mobile/ui/Sheet";
import { Tile } from "../../../mobile/ui/Tile";
import { matches } from "./catalog";

// Категорія: тип, назва, вигляд, батьківська категорія; видалення.

type Kind = "expense" | "income";
const KINDS = [
  { value: "expense" as Kind, label: "Витрата" },
  { value: "income" as Kind, label: "Дохід" },
];
const DEFAULT_COLOR: Record<Kind, string> = { expense: "#f97316", income: "#22c55e" };

interface CategorySheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Без категорії — створюємо нову. */
  category?: Category;
  categories: Category[];
  defaultType: Kind;
}

export function CategorySheet({ open, onOpenChange, category, categories, defaultType }: CategorySheetProps) {
  const { actions } = useCategoryData();
  const editing = !!category;
  const [type, setType] = useState<Kind>((category?.type as Kind) ?? defaultType);
  const [name, setName] = useState(category?.name ?? "");
  const [color, setColor] = useState(category?.color || DEFAULT_COLOR[defaultType]);
  const [icon, setIcon] = useState(category?.icon || "HiTag");
  const [parentId, setParentId] = useState(category?.parent_id || "");
  const [appearance, setAppearance] = useState(false);
  const [pickParent, setPickParent] = useState(false);
  const [parentQuery, setParentQuery] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  const children = category ? categories.filter((c) => c.parent_id === category.id) : [];
  // Батьком може бути лише верхня категорія того ж типу; та, що має підкатегорії, сама підкатегорією не стає.
  const parents = categories.filter((c) => !c.parent_id && c.id !== category?.id && c.type === type);
  const parent = categories.find((c) => c.id === parentId);
  const pending = actions.create.isPending || actions.update.isPending;

  const changeType = (next: Kind) => {
    if (next === type) return;
    setType(next);
    setParentId("");
    if (!editing) setColor(DEFAULT_COLOR[next]);
  };

  const save = () => {
    const data = { name: name.trim(), type, icon, color, parent_id: (parentId || null) as string };
    const options = { onSuccess: () => onOpenChange(false) };
    if (category) actions.update.mutate({ ...data, id: category.id }, options);
    else actions.create.mutate(data, options);
  };

  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      title={editing ? "Категорія" : "Нова категорія"}
      footer={
        <PrimaryButton type="button" disabled={!name.trim() || pending} onClick={save}>
          {editing ? "Зберегти" : "Додати"}
        </PrimaryButton>
      }
    >
      <Segmented label="Тип категорії" options={KINDS} value={type} onChange={changeType} />

      <Section>
        <Group>
          <Row
            title="Назва"
            trailing={<RowInput aria-label="Назва категорії" value={name} onChange={(e) => setName(e.target.value)} />}
          />
          <Row
            onClick={() => setAppearance(true)}
            leading={<Tile iconName={icon} color={color} size={30} />}
            title="Вигляд"
            trailing={<Meta>Колір, іконка</Meta>}
            inset={58}
            chevron
          />
          <Row
            onClick={children.length === 0 ? () => setPickParent(true) : undefined}
            title="Батьківська"
            trailing={<Meta>{parent?.name ?? "Немає"}</Meta>}
            chevron={children.length === 0}
          />
        </Group>
        {children.length > 0 && (
          <Footnote>У цієї категорії є підкатегорії, тому вона сама не може стати підкатегорією.</Footnote>
        )}
      </Section>

      {editing && (
        <Section>
          <Group>
            <Row onClick={() => setConfirmDelete(true)} title={<span style={{ color: "#ff3b30" }}>Видалити категорію</span>} />
          </Group>
          <Footnote>Операції не видаляються. Підкатегорії стануть окремими категоріями.</Footnote>
        </Section>
      )}

      <AppearancePicker
        open={appearance}
        onOpenChange={setAppearance}
        color={color}
        icon={icon}
        onChange={(v) => {
          setColor(v.color);
          setIcon(v.icon);
        }}
      />

      <Sheet nested open={pickParent} onOpenChange={setPickParent} title="Батьківська" hideCancel
        trailing={<SheetTextButton type="button" $bold onClick={() => setPickParent(false)}>Готово</SheetTextButton>}>
        {parents.length > 6 && <SearchField value={parentQuery} onChange={setParentQuery} label="Пошук категорії" />}
        <Group>
          <Row
            onClick={() => {
              setParentId("");
              setPickParent(false);
            }}
            title="Немає (верхній рівень)"
            trailing={!parentId ? <HiCheck size={20} color="var(--m-accent)" aria-label="Обрано" /> : undefined}
          />
          {parents
            .filter((c) => matches(c.name, parentQuery))
            .map((c) => (
              <Row
                key={c.id}
                onClick={() => {
                  setParentId(c.id);
                  setPickParent(false);
                }}
                leading={<Tile iconName={c.icon} color={c.color} size={30} />}
                title={c.name}
                trailing={parentId === c.id ? <HiCheck size={20} color="var(--m-accent)" aria-label="Обрано" /> : undefined}
                inset={58}
              />
            ))}
        </Group>
      </Sheet>

      <ConfirmSheet
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        message={`Видалити категорію «${category?.name}»?`}
        actions={[
          {
            label: "Видалити",
            destructive: true,
            onSelect: () => category && actions.delete.mutate(category.id, { onSuccess: () => onOpenChange(false) }),
          },
        ]}
      />
    </Sheet>
  );
}
