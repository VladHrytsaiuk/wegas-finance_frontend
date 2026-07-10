import { useForm } from "react-hook-form";
import styled from "styled-components";
import { format } from "date-fns";
import { HiCalendar, HiCalculator, HiCurrencyDollar } from "react-icons/hi2";
import { useTranslation } from "react-i18next";

import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import { useUtilityReadings } from "../../hooks/Utility/useUtility";
import Spinner from "../ui/Spinner";
import type { UtilityMeter } from "../../types";

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
  meter: UtilityMeter;
}

interface AddReadingFormValues {
  date: string;
  value: string;
  tariff: string | number;
}

export default function AddReadingForm({ onCloseModal, meter }: Props) {
  const { t } = useTranslation();
  const { addReading } = useUtilityReadings(meter?.id);

  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<AddReadingFormValues>({
    defaultValues: {
      date: format(new Date(), "yyyy-MM-dd"),
      value: "",
      // 🔥 Ініціалізуємо поточним тарифом лічильника
      tariff: meter?.tariff || "",
    },
  });

  const onSubmit = (data: AddReadingFormValues) => {
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
        {t("stats_utility:addReadingModal.title", { name: meter?.name })}
      </h3>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <InfoBox>
          {t("stats_utility:addReadingModal.prev_reading")}{" "}
          <strong>
            {meter?.last_reading_value ?? 0} {meter?.unit}
          </strong>
        </InfoBox>

        <Input
          label={t("stats_utility:addReadingModal.date_label")}
          type="date"
          icon={<HiCalendar />}
          {...register("date", { required: true })}
        />

        <Input
          label={t("stats_utility:addReadingModal.current_value_label", {
            unit: meter?.unit,
          })}
          type="number"
          step="0.01"
          icon={<HiCalculator />}
          placeholder={t("stats_utility:addReadingModal.placeholder_value")}
          {...register("value", { required: true })}
          autoFocus
        />

        {/* 🔥 БЛОК ЗМІНИ ТАРИФУ */}
        <TariffBox>
          <div className="hint">
            {t("stats_utility:addReadingModal.tariff_hint")}
          </div>
          <Input
            label={t("stats_utility:addReadingModal.tariff_label", {
              currency: meter?.currency,
            })}
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
            {t("common:common.cancel")}
          </Button>
          <Button variation="primary" type="submit" disabled={isSubmitting}>
            {isSubmitting ? <Spinner size="small" /> : t("common:common.save")}
          </Button>
        </div>
      </Form>
    </div>
  );
}
