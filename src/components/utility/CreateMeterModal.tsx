import { useState, useEffect, useMemo, useCallback } from "react";
import { createPortal } from "react-dom";
import styled from "styled-components";
import { useTranslation } from "react-i18next";
import {
  HiBolt,
  HiBeaker,
  HiFire,
  HiWifi,
  HiHome,
  HiSun,
  HiCheck,
} from "react-icons/hi2";

import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import CounterpartySelect from "../counterparties/CounterpartySelect";
import { AssetSelector } from "../transactions/form/AssetSelector";
import { BaseSelect } from "../ui/Select/BaseSelect";

// 🔥 Нові імпорти
import ConfirmCloseModal from "../ui/ConfirmCloseModal";
import { Overlay, StyledModal } from "../ui/Modal";
import { useCreateMeterForm } from "../../hooks/Utility/useCreateMeterForm";

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: 500px;
  max-width: 100%;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
`;

const SectionLabel = styled.label`
  display: block;
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--color-text-secondary);
  margin-bottom: 0.5rem;
`;

const TypeOption = styled.div<{ $isActive: boolean }>`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  cursor: pointer;
  border-radius: var(--radius-sm);
  background-color: ${(props) =>
    props.$isActive ? "var(--color-bg-hover)" : "transparent"};
  color: var(--color-text-main);
  font-size: 0.95rem;
  &:hover {
    background-color: var(--color-bg-hover);
  }
  svg {
    font-size: 1.2rem;
  }
`;

const SelectorWrapper = styled.div`
  position: relative;
  z-index: 10;
`;

interface Props {
  onCloseModal?: () => void;
  meterToEdit?: any;
}

export default function CreateMeterForm({ onCloseModal, meterToEdit }: Props) {
  const { t } = useTranslation();
  // 🔥 Локальний стейт для підтвердження
  const [showConfirm, setShowConfirm] = useState(false);

  const SERVICE_TYPES = useMemo(
    () => [
      {
        value: "electricity",
        label: t("stats_utility:serviceTypes.electricity"),
        unit: "kW",
        icon: <HiBolt color="#f59e0b" />,
      },
      {
        value: "water",
        label: t("stats_utility:serviceTypes.water"),
        unit: "m3",
        icon: <HiBeaker color="#3b82f6" />,
      },
      {
        value: "gas",
        label: t("stats_utility:serviceTypes.gas"),
        unit: "m3",
        icon: <HiFire color="#ef4444" />,
      },
      {
        value: "internet",
        label: t("stats_utility:serviceTypes.internet"),
        unit: t("stats_utility:serviceTypes.unit_month"),
        icon: <HiWifi color="#10b981" />,
      },
      {
        value: "rent",
        label: t("stats_utility:serviceTypes.rent"),
        unit: t("stats_utility:serviceTypes.unit_month"),
        icon: <HiHome color="#6366f1" />,
      },
      {
        value: "heating",
        label: t("stats_utility:serviceTypes.heating"),
        unit: "Gcal",
        icon: <HiSun color="#f97316" />,
      },
    ],
    [t],
  );

  // Підключаємо наш новий хук
  const { form, assets, data, actions, isDirty } = useCreateMeterForm({
    onCloseModal,
    meterToEdit,
  });

  const {
    register,
    handleSubmit,
    setValue,
    isSubmitting,
    currentType,
    currentCP,
  } = form;

  // 1. Функція спроби закриття
  const handleCloseAttempt = useCallback(() => {
    if (isDirty) {
      setShowConfirm(true);
    } else {
      onCloseModal?.();
    }
  }, [isDirty, onCloseModal]);

  // 2. Обробка ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation(); // Зупиняємо спливання
        if (showConfirm) {
          setShowConfirm(false);
        } else {
          handleCloseAttempt();
        }
      }
    };
    document.addEventListener("keydown", handleEsc, true);
    return () => document.removeEventListener("keydown", handleEsc, true);
  }, [showConfirm, handleCloseAttempt]);

  const handleTypeChange = (typeValue: string) => {
    setValue("type", typeValue);
    const typeConfig = SERVICE_TYPES.find((t) => t.value === typeValue);
    if (typeConfig) setValue("unit", typeConfig.unit);
  };

  const activeTypeConfig = SERVICE_TYPES.find((t) => t.value === currentType);

  // Use a stable date reference
  const [sessionDate] = useState(() => Date.now());

  return (
    <>
      {/* --- CONFIRMATION MODAL (PORTAL) --- */}
      {showConfirm &&
        createPortal(
          <Overlay
            style={{ zIndex: 11000 }}
            onClick={(e) => {
              e.stopPropagation();
              setShowConfirm(false);
            }}
          >
            <StyledModal
              onClick={(e) => e.stopPropagation()}
              style={{
                zIndex: 11001,
                width: "fit-content",
                maxWidth: "28rem",
                padding: "2.4rem",
              }}
            >
              <ConfirmCloseModal
                onConfirm={() => {
                  setShowConfirm(false);
                  onCloseModal?.();
                }}
                onCloseModal={() => setShowConfirm(false)}
              />
            </StyledModal>
          </Overlay>,
          document.body,
        )}

      {/* --- FORM WRAPPER (для ширини) --- */}
      <div
        style={{ minWidth: "500px" }}
        onClick={(e) => e.stopPropagation()} // Захист від закриття при кліку на форму
      >
        <h2
          style={{
            marginBottom: "1.5rem",
            fontSize: "1.5rem",
            fontWeight: "bold",
          }}
        >
          {data.isEdit
            ? t("stats_utility:createMeterModal.title_edit")
            : t("stats_utility:createMeterModal.title_add")}
        </h2>

        <Form onSubmit={handleSubmit(actions.onSubmit)}>
          <div>
            <SectionLabel>
              {t("stats_utility:createMeterModal.name_label")}
            </SectionLabel>
            <Input
              placeholder={t("stats_utility:createMeterModal.placeholder_name")}
              {...register("name", { required: true })}
              autoFocus
            />
          </div>

          <FormRow>
            <div>
              <SectionLabel>
                {t("stats_utility:createMeterModal.type_label")}
              </SectionLabel>
              <BaseSelect
                triggerLabel={
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    {activeTypeConfig?.icon}{" "}
                    {activeTypeConfig?.label ||
                      t("stats_utility:createMeterModal.placeholder_type")}
                  </div>
                }
              >
                {SERVICE_TYPES.map((t) => (
                  <TypeOption
                    key={t.value}
                    onClick={() => handleTypeChange(t.value)}
                    $isActive={currentType === t.value}
                  >
                    {t.icon} <span style={{ flex: 1 }}>{t.label}</span>
                    {currentType === t.value && (
                      <HiCheck color="var(--color-brand-600)" />
                    )}
                  </TypeOption>
                ))}
              </BaseSelect>
            </div>
            <div>
              <SectionLabel>
                {t("stats_utility:createMeterModal.unit_label")}
              </SectionLabel>
              <Input
                placeholder={t("stats_utility:createMeterModal.placeholder_unit")}
                {...register("unit", { required: true })}
              />
            </div>
          </FormRow>

          <FormRow>
            <div>
              <SectionLabel>
                {t("stats_utility:createMeterModal.tariff_label")}
              </SectionLabel>
              <Input
                type="number"
                step="0.0001"
                placeholder="0.00"
                {...register("tariff", { required: true })}
              />
            </div>
            <div>
              <SectionLabel>
                {t("stats_utility:createMeterModal.account_number_label")}
              </SectionLabel>
              <Input
                placeholder={t(
                  "stats_utility:createMeterModal.placeholder_account",
                )}
                {...register("personal_account")}
              />
            </div>
          </FormRow>

          <SelectorWrapper>
            <SectionLabel>
              {t("stats_utility:createMeterModal.asset_label")}
            </SectionLabel>
            <AssetSelector
              transactionType="expense"
              assetId={assets.assetId}
              setAssetId={assets.setAssetId}
              newAsset={assets.newAsset}
              setNewAsset={assets.setNewAsset}
              transactionDate={sessionDate}
            />
          </SelectorWrapper>

          <SelectorWrapper>
            <SectionLabel>
              {t("stats_utility:createMeterModal.provider_label")}
            </SectionLabel>
            <CounterpartySelect
              counterparties={data.utilityProviders}
              value={currentCP}
              onChange={(id) => setValue("counterparty_id", id)}
              hasError={!currentCP && isSubmitting}
              initialExpanded={data.expandedIds}
              priorityCategoryId={data.priorityCategoryId}
            />
          </SelectorWrapper>

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "10px",
              marginTop: "1rem",
            }}
          >
            <Button
              variation="secondary"
              // 🔥 Використовуємо розумне закриття
              onClick={handleCloseAttempt}
              type="button"
            >
              {t("common:common.cancel")}
            </Button>
            <Button variation="primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? t("common:shared.saving") : t("common:common.save")}
            </Button>
          </div>
        </Form>
      </div>
    </>
  );
}
