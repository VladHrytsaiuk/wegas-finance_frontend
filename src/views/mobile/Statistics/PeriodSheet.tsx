import styled from "styled-components";
import { HiCheck } from "react-icons/hi2";

import { Group, Row, Section } from "../../../mobile/ui/Group";
import { PrimaryButton, Sheet } from "../../../mobile/ui/Sheet";
import { PERIODS, type CustomRange, type PeriodKey } from "./statistics";

// Вибір періоду: готові варіанти й свій діапазон двома датами.

const DateField = styled.input`
  /* без явної ширини поле дати в Safari розпирає всю панель */
  width: 6.6em;
  min-width: 0;
  border: none;
  background: none;
  outline: none;
  font: inherit;
  font-size: 17px;
  color: var(--m-label);
  text-align: right;

  &::-webkit-date-and-time-value {
    text-align: right;
  }
`;

const Check = () => <HiCheck size={20} color="var(--m-accent)" aria-label="Обрано" />;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  period: PeriodKey;
  custom: CustomRange;
  onPeriod: (key: PeriodKey) => void;
  onCustom: (range: CustomRange) => void;
}

export function PeriodSheet({ open, onOpenChange, period, custom, onPeriod, onCustom }: Props) {
  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      title="Період"
      hideCancel
      footer={
        <PrimaryButton type="button" onClick={() => onOpenChange(false)}>
          Готово
        </PrimaryButton>
      }
    >
      <Group>
        {PERIODS.map((p) => (
          <Row
            key={p.key}
            title={p.label}
            trailing={period === p.key ? <Check /> : undefined}
            onClick={() => {
              onPeriod(p.key);
              onOpenChange(false);
            }}
          />
        ))}
        <Row
          title="Свій період"
          trailing={period === "custom" ? <Check /> : undefined}
          onClick={() => onPeriod("custom")}
        />
      </Group>

      {period === "custom" && (
        <Section caption="Діапазон">
          <Group>
            <Row
              title="Від"
              trailing={
                <DateField
                  type="date"
                  aria-label="Початок періоду"
                  value={custom.from}
                  max={custom.to || undefined}
                  onChange={(e) => onCustom({ ...custom, from: e.target.value })}
                />
              }
            />
            <Row
              title="До"
              trailing={
                <DateField
                  type="date"
                  aria-label="Кінець періоду"
                  value={custom.to}
                  min={custom.from || undefined}
                  onChange={(e) => onCustom({ ...custom, to: e.target.value })}
                />
              }
            />
          </Group>
        </Section>
      )}
    </Sheet>
  );
}
