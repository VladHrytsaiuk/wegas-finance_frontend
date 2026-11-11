import { useState } from "react";

import type { CounterpartyCategory } from "../../../types";
import { useCounterpartyData } from "../../../hooks/Counterparties/useCounterpartyData";
import { AppearancePicker } from "../../../mobile/ui/AppearancePicker";
import { ConfirmSheet } from "../../../mobile/ui/ConfirmSheet";
import { Footnote, RowInput } from "../../../mobile/ui/Field";
import { Group, Meta, Row, Section } from "../../../mobile/ui/Group";
import { Segmented } from "../../../mobile/ui/Segmented";
import { PrimaryButton, Sheet } from "../../../mobile/ui/Sheet";
import { Tile } from "../../../mobile/ui/Tile";
import { CP_KINDS, type CpKind } from "./catalog";

// Категорія контрагентів: тип (лише при створенні), назва, вигляд; видалення.

interface CpCategorySheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: CounterpartyCategory;
  defaultType: CpKind;
}

export function CpCategorySheet({ open, onOpenChange, category, defaultType }: CpCategorySheetProps) {
  const { actions } = useCounterpartyData();
  const editing = !!category;
  const [type, setType] = useState<CpKind>((category?.type as CpKind) ?? defaultType);
  const [name, setName] = useState(category?.name ?? "");
  const [color, setColor] = useState(category?.color || "#64748b");
  const [icon, setIcon] = useState(category?.icon || "HiTag");
  const [appearance, setAppearance] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const pending = actions.createCat.isPending || actions.updateCat.isPending;

  const save = () => {
    const opts = { onSuccess: () => onOpenChange(false) };
    const data = { name: name.trim(), type, color, icon };
    if (category) actions.updateCat.mutate({ ...data, id: category.id }, opts);
    else actions.createCat.mutate(data, opts);
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
      {editing ? (
        <Section>
          <Group>
            <Row title="Тип" trailing={<Meta>{CP_KINDS.find((k) => k.value === type)?.label}</Meta>} />
          </Group>
          <Footnote>Тип категорії після створення не змінюється.</Footnote>
        </Section>
      ) : (
        <Segmented label="Тип категорії" options={CP_KINDS} value={type} onChange={setType} />
      )}

      <Section>
        <Group>
          <Row
            title="Назва"
            trailing={<RowInput aria-label="Назва категорії контрагентів" value={name} onChange={(e) => setName(e.target.value)} />}
          />
          <Row
            onClick={() => setAppearance(true)}
            leading={<Tile iconName={icon} color={color} size={30} />}
            title="Вигляд"
            trailing={<Meta>Колір, іконка</Meta>}
            inset={58}
            chevron
          />
        </Group>
      </Section>

      {editing && (
        <Section>
          <Group>
            <Row onClick={() => setConfirmDelete(true)} title={<span style={{ color: "#ff3b30" }}>Видалити категорію</span>} />
          </Group>
          <Footnote>Контрагенти з цієї категорії залишаться, але без категорії.</Footnote>
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
      <ConfirmSheet
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        message={`Видалити категорію «${category?.name}»?`}
        actions={[
          {
            label: "Видалити",
            destructive: true,
            onSelect: () => category && actions.deleteCat.mutate(category.id, { onSuccess: () => onOpenChange(false) }),
          },
        ]}
      />
    </Sheet>
  );
}
