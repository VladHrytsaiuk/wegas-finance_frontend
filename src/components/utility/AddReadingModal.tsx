import { useForm } from "react-hook-form";
import styled from "styled-components";
import { format } from "date-fns";
import { HiCalendar, HiCalculator, HiCurrencyDollar } from "react-icons/hi2";

import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import { useUtilityReadings } from "../../hooks/Utility/useUtility";
import Spinner from "../ui/Spinner";

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  min-width: 400px;
`;

const InfoBox = styled.div`
  background: var(--color-bg-secondary);
  padding: 1rem;
  border-radius: var(--radius-md);
  font-size: 0.95rem;
  color: var(--color-text-secondary);
  margin-bottom: 0.5rem;
  strong {
    color: var(--color-text-main);
  }
`;

const TariffBox = styled.div`
  background: var(--color-brand-50);
  border: 1px solid var(--color-brand-100);
  padding: 10px;
  border-radius: var(--radius-md);
  margin-bottom: 10px;

  label {
    color: var(--color-brand-800);
    font-weight: 600;
  }

  .hint {
    font-size: 0.8rem;
    color: var(--color-brand-600);
    margin-bottom: 8px;
  }
`;

interface Props {
  onCloseModal?: () => void;
  meter: any;
}

export default function AddReadingForm({ onCloseModal, meter }: Props) {
  const { addReading } = useUtilityReadings(meter?.id);

  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm({
    defaultValues: {
      date: format(new Date(), "yyyy-MM-dd"),
      value: "",
      // 🔥 Ініціалізуємо поточним тарифом лічильника
      tariff: meter?.tariff || "",
    },
  });

  const onSubmit = (data: any) => {
    addReading(
      {
        meter_id: meter.id,
        date: new Date(data.date).getTime(),
        value: Number(data.value),
        // 🔥 Відправляємо актуальний тариф на цей момент
        tariff_at_date: Number(data.tariff),
      },
      {
        onSuccess: () => {
          onCloseModal?.();
        },
      },
    );
  };

  return (
    <div>
      <h3
        style={{ marginBottom: "1.5rem", fontSize: "1.3rem", fontWeight: 600 }}
      >
        Внести показники: {meter?.name}
      </h3>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <InfoBox>
          Попередній показник:{" "}
          <strong>
            {meter?.last_reading_value ?? 0} {meter?.unit}
          </strong>
        </InfoBox>

        <Input
          label="Дата зняття"
          type="date"
          icon={<HiCalendar />}
          {...register("date", { required: true })}
        />

        <Input
          label={`Поточні цифри (${meter?.unit})`}
          type="number"
          step="0.01"
          icon={<HiCalculator />}
          placeholder="Більше ніж попередні"
          {...register("value", { required: true })}
          autoFocus
        />

        {/* 🔥 БЛОК ЗМІНИ ТАРИФУ */}
        <TariffBox>
          <div className="hint">
            Якщо тариф змінився, введіть нову ціну. Вона збережеться для цього
            місяця та оновить лічильник.
          </div>
          <Input
            label={`Тариф (${meter?.currency})`}
            type="number"
            step="0.0001" // Більша точність для газу/електрики
            icon={<HiCurrencyDollar />}
            {...register("tariff", { required: true })}
            style={{ fontWeight: "bold", color: "var(--color-brand-900)" }}
          />
        </TariffBox>

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "10px",
            marginTop: "1rem",
          }}
        >
          <Button variation="secondary" onClick={onCloseModal} type="button">
            Скасувати
          </Button>
          <Button variation="primary" type="submit" disabled={isSubmitting}>
            {isSubmitting ? <Spinner size="small" /> : "Зберегти"}
          </Button>
        </div>
      </Form>
    </div>
  );
}
