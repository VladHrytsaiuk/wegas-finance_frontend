import { useState } from "react";
import { format } from "date-fns";
import styled from "styled-components";

import type { UtilityMeter } from "../../../types";
import { useUtilityReadings } from "../../../hooks/Utility/useUtility";
import { useSettings } from "../../../context/SettingsContext";
import { formatMoney } from "../../../utils/helpers";
import { Group, Meta, Row, Section } from "../../../mobile/ui/Group";
import { PrimaryButton, Sheet } from "../../../mobile/ui/Sheet";
import { fmtNumber } from "./utility";

// Внесення показника: дата, цифри (не менші за попередні) і тариф на цей
// момент — новий тариф запам'ятовується в лічильнику.

const Field = styled.input`
  flex: 1;
  width: 38vw;
  max-width: 180px;
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

const ErrorText = styled.p`
  margin: 0;
  padding: 0 16px;
  font-size: 13px;
  color: #ff3b30;
`;

const toNumber = (value: string) => Number(value.replace(",", "."));

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  meter: UtilityMeter;
}

export function ReadingSheet({ open, onOpenChange, meter }: Props) {
  const { language } = useSettings();
  const { addReading } = useUtilityReadings(meter.id);
  const [date, setDate] = useState(() => format(new Date(), "yyyy-MM-dd"));
  const [value, setValue] = useState("");
  const [tariff, setTariff] = useState(String(meter.tariff ?? ""));
  const [saving, setSaving] = useState(false);

  const previous = meter.last_reading_value ?? 0;
  const hasPrevious = !!meter.last_reading_date;
  const valueNumber = toNumber(value);
  const tariffNumber = toNumber(tariff);

  const lower =
    value.trim() !== "" &&
    hasPrevious &&
    new Date(`${date}T12:00:00`).getTime() >= (meter.last_reading_date ?? 0) &&
    valueNumber < previous;
  const valid =
    value.trim() !== "" &&
    Number.isFinite(valueNumber) &&
    valueNumber >= 0 &&
    Number.isFinite(tariffNumber) &&
    tariffNumber > 0 &&
    !!date &&
    !lower;

  // Як рахує бекенд: різниця з попереднім. Перший показник лічильника — точка
  // відліку (без нарахування); інтернет і квартплата платяться з першого запису.
  const flatFee = meter.type === "internet" || meter.type === "rent";
  const baseline = !hasPrevious && !flatFee;
  const consumed = valid
    ? baseline
      ? 0
      : valueNumber - (hasPrevious ? previous : 0)
    : 0;
  const estimate = Math.round(consumed * tariffNumber * 100);

  const save = () => {
    if (!valid || saving) return;
    setSaving(true);
    addReading(
      {
        meter_id: meter.id,
        date: new Date(`${date}T12:00:00`).getTime(),
        value: valueNumber,
        tariff_at_date: tariffNumber,
      },
      {
        onSuccess: () => {
          setSaving(false);
          onOpenChange(false);
        },
        onError: () => setSaving(false),
      },
    );
  };

  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      title="Внести показник"
      footer={
        <PrimaryButton type="button" disabled={!valid || saving} onClick={save}>
          Зберегти
        </PrimaryButton>
      }
    >
      <Group>
        <Row
          title="Попередній показник"
          trailing={
            <Meta>
              {hasPrevious ? `${fmtNumber(previous)} ${meter.unit}` : "немає"}
            </Meta>
          }
        />
        <Row
          title="Дата"
          trailing={
            <Field
              type="date"
              aria-label="Дата зняття"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          }
        />
        <Row
          title={`Показник, ${meter.unit}`}
          trailing={
            <Field
              type="text"
              inputMode="decimal"
              aria-label="Поточний показник"
              placeholder="0"
              value={value}
              onChange={(e) => setValue(e.target.value.replace(/[^\d.,]/g, ""))}
              autoFocus
            />
          }
        />
      </Group>
      {lower && (
        <ErrorText>Показник не може бути меншим за попередній ({fmtNumber(previous)}).</ErrorText>
      )}

      <Section caption="Тариф">
        <Group>
          <Row
            title={`Ціна за 1 ${meter.unit}`}
            trailing={
              <Field
                type="text"
                inputMode="decimal"
                aria-label="Тариф на цей момент"
                value={tariff}
                onChange={(e) => setTariff(e.target.value.replace(/[^\d.,]/g, ""))}
              />
            }
          />
        </Group>
        <Meta as="p" style={{ margin: 0, padding: "0 16px" }}>
          Якщо тариф змінився, введіть нову ціну: вона збережеться для цього
          показника й стане поточною для лічильника.
        </Meta>
      </Section>

      {valid && baseline && (
        <Meta as="p" style={{ margin: 0, padding: "0 16px" }}>
          Це перший показник: він стане точкою відліку, нарахування не буде.
        </Meta>
      )}
      {valid && !baseline && (
        <Group>
          <Row
            title="До сплати орієнтовно"
            subtitle={`${fmtNumber(consumed, 3)} ${meter.unit} × ${fmtNumber(tariffNumber, 4)}`}
            trailing={<strong>{formatMoney(estimate, meter.currency, language)}</strong>}
          />
        </Group>
      )}
    </Sheet>
  );
}
