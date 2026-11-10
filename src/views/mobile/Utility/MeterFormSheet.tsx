import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import styled from "styled-components";

import type { UtilityMeter } from "../../../types";
import { getAssets } from "../../../services/apiAssets";
import {
  createCounterpartyApi,
  getCounterpartiesApi,
} from "../../../services/apiCounterparties";
import { useUtilityMeters } from "../../../hooks/Utility/useUtility";
import { Group, Row, Section } from "../../../mobile/ui/Group";
import { ConfirmSheet } from "../../../mobile/ui/ConfirmSheet";
import { PrimaryButton, Sheet } from "../../../mobile/ui/Sheet";
import { AssetPicker, type NewAssetDraft } from "../AddSheet/AssetPicker";
import {
  CounterpartyPicker,
  type NewCounterparty,
} from "../AddSheet/CounterpartyPicker";
import { SERVICE_TYPES, serviceType } from "./utility";

// Створення й зміна лічильника: усі поля старої CreateMeterModal — назва, тип
// (одиниця підставляється), одиниця, тариф, номер рахунку, нерухомість (або
// нова) і обов'язковий постачальник.

// Праве поле займає частину рядка, щоб назва зліва не обрізалась.
const Field = styled.input<{ $align?: "left" | "right" }>`
  flex: 1;
  width: ${(p) => (p.$align === "left" ? "100%" : "38vw")};
  max-width: ${(p) => (p.$align === "left" ? "none" : "180px")};
  min-width: 0;
  border: none;
  background: none;
  outline: none;
  font: inherit;
  font-size: 17px;
  color: var(--m-label);
  text-align: ${(p) => p.$align ?? "right"};

  &::placeholder {
    color: var(--m-label-3);
  }
`;

const ChipRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const Chip = styled.button<{ $active: boolean; $color: string }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 36px;
  padding: 0 14px;
  border: none;
  border-radius: 18px;
  font: inherit;
  font-size: 15px;
  cursor: pointer;
  color: ${(p) => (p.$active ? "var(--m-on-accent)" : "var(--m-label)")};
  background: ${(p) => (p.$active ? "var(--m-accent)" : "var(--m-surface)")};

  svg {
    color: ${(p) => (p.$active ? "var(--m-on-accent)" : p.$color)};
  }
`;

const Value = styled.span`
  display: block;
  max-width: 46vw;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 17px;
  color: var(--m-label-2);
`;

const Hint = styled.p`
  margin: 0;
  padding: 0 16px;
  font-size: 13px;
  color: var(--m-label-2);
`;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  meter?: UtilityMeter;
  /** Скільки в лічильника показників: з показниками його видалити не можна. */
  readingsCount?: number;
  onDeleted?: () => void;
}

export function MeterFormSheet({
  open,
  onOpenChange,
  meter,
  readingsCount = 0,
  onDeleted,
}: Props) {
  const { create, update, remove } = useUtilityMeters();
  const [name, setName] = useState(meter?.name ?? "");
  const [type, setType] = useState(meter?.type ?? "electricity");
  const [unit, setUnit] = useState(meter?.unit ?? "kW");
  const [tariff, setTariff] = useState(meter ? String(meter.tariff) : "");
  const [account, setAccount] = useState(meter?.personal_account ?? "");
  const [assetId, setAssetId] = useState(meter?.asset_id ?? "");
  const [newAsset, setNewAsset] = useState<NewAssetDraft | null>(null);
  const [providerId, setProviderId] = useState(meter?.counterparty_id ?? "");
  const [picker, setPicker] = useState<"asset" | "provider" | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [saving, setSaving] = useState(false);
  const [creatingProvider, setCreatingProvider] = useState(false);

  const { data: assets = [] } = useQuery({
    queryKey: ["assets"],
    queryFn: getAssets,
  });
  const { data: counterparties = [], refetch } = useQuery({
    queryKey: ["counterparties"],
    queryFn: getCounterpartiesApi,
  });

  const tariffNumber = Number(tariff.replace(",", "."));
  const valid =
    name.trim() &&
    unit.trim() &&
    providerId &&
    tariff.trim() !== "" &&
    Number.isFinite(tariffNumber) &&
    tariffNumber >= 0;

  const assetName = newAsset
    ? `Новий: ${newAsset.name}`
    : assets.find((a) => a.id === assetId)?.name;
  const provider = counterparties.find((c) => c.id === providerId);

  const chooseType = (value: string) => {
    setType(value);
    // Як у старій формі: одиниця підставляється за типом.
    setUnit(serviceType(value).unit);
  };

  const save = () => {
    if (!valid || saving) return;
    setSaving(true);
    const payload = {
      name: name.trim(),
      type,
      unit: unit.trim(),
      tariff: tariffNumber,
      personal_account: account.trim(),
      currency: "UAH",
      asset_id: newAsset ? null : assetId || null,
      new_asset: newAsset
        ? {
            name: newAsset.name,
            type: newAsset.type,
            serial_number: "",
            warranty_end: newAsset.warranty_end ?? 0,
            note: "",
          }
        : null,
      counterparty_id: providerId,
    };
    const options = {
      onSuccess: () => {
        setSaving(false);
        onOpenChange(false);
      },
      onError: () => setSaving(false),
    };
    if (meter) update({ id: meter.id, data: payload }, options);
    else create(payload, options);
  };

  const createProvider = async (data: NewCounterparty) => {
    setCreatingProvider(true);
    try {
      const created = await createCounterpartyApi(data);
      await refetch();
      if (created?.id) setProviderId(created.id);
      setPicker(null);
    } catch {
      toast.error("Не вдалося створити постачальника");
    } finally {
      setCreatingProvider(false);
    }
  };

  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      title={meter ? "Лічильник" : "Нова послуга"}
      footer={
        <PrimaryButton type="button" disabled={!valid || saving} onClick={save}>
          {meter ? "Зберегти" : "Додати"}
        </PrimaryButton>
      }
    >
      <Group>
        <Row
          title={
            <Field
              $align="left"
              type="text"
              aria-label="Назва послуги"
              placeholder="Напр. Світло (квартира)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus={!meter}
            />
          }
        />
      </Group>

      <Section caption="Тип послуги">
        <ChipRow role="group" aria-label="Тип послуги">
          {SERVICE_TYPES.map(({ value, label, color, Icon }) => (
            <Chip
              key={value}
              type="button"
              $active={type === value}
              $color={color}
              aria-pressed={type === value}
              onClick={() => chooseType(value)}
            >
              <Icon size={18} aria-hidden="true" />
              {label}
            </Chip>
          ))}
        </ChipRow>
      </Section>

      <Group>
        <Row
          title="Одиниця"
          trailing={
            <Field
              type="text"
              aria-label="Одиниця виміру"
              placeholder="kW, m3"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
            />
          }
        />
        <Row
          title="Тариф, ₴ за од."
          trailing={
            <Field
              type="text"
              inputMode="decimal"
              aria-label="Тариф"
              placeholder="0,00"
              value={tariff}
              onChange={(e) => setTariff(e.target.value.replace(/[^\d.,]/g, ""))}
            />
          }
        />
        <Row
          title="Номер рахунку"
          trailing={
            <Field
              type="text"
              aria-label="Номер рахунку"
              placeholder="З квитанції"
              value={account}
              onChange={(e) => setAccount(e.target.value)}
            />
          }
        />
      </Group>

      <Group>
        <Row
          title="Нерухомість / авто"
          trailing={<Value>{assetName ?? "Не вказано"}</Value>}
          chevron
          onClick={() => setPicker("asset")}
        />
        <Row
          title="Постачальник"
          trailing={<Value>{provider?.name ?? "Вибрати"}</Value>}
          chevron
          onClick={() => setPicker("provider")}
        />
      </Group>
      {!providerId && <Hint>Постачальник обов'язковий: на нього рахується борг.</Hint>}

      {meter && (
        <Group>
          <Row
            title={
              <span style={{ color: readingsCount ? "var(--m-label-3)" : "#ff3b30" }}>
                Видалити лічильник
              </span>
            }
            subtitle={
              readingsCount > 0
                ? "Є показники — видалити не можна"
                : undefined
            }
            onClick={readingsCount > 0 ? undefined : () => setConfirmDelete(true)}
          />
        </Group>
      )}

      <AssetPicker
        open={picker === "asset"}
        onOpenChange={(next) => !next && setPicker(null)}
        assetId={assetId}
        newAsset={newAsset}
        canCreate
        simple
        operationDate={Date.now()}
        onChange={(id, created) => {
          setAssetId(id);
          setNewAsset(created);
        }}
      />
      <CounterpartyPicker
        open={picker === "provider"}
        onOpenChange={(next) => !next && setPicker(null)}
        title="Постачальник"
        counterparties={counterparties.filter((c) => !c.is_archived)}
        usage={new Map()}
        typeOrder={["other", "shop", "person"]}
        value={providerId}
        onSelect={setProviderId}
        onCreate={createProvider}
        isCreating={creatingProvider}
      />
      <ConfirmSheet
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        message={`Видалити лічильник «${meter?.name}»?`}
        actions={[
          {
            label: "Видалити лічильник",
            destructive: true,
            onSelect: () =>
              meter &&
              remove(meter.id, {
                onSuccess: () => {
                  onOpenChange(false);
                  onDeleted?.();
                },
              }),
          },
        ]}
      />
    </Sheet>
  );
}
