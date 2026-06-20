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
import { useIsMobile } from "../../hooks/useIsMobile";

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: 100%;
  max-width: 500px;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }
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

// --- STEPPER STYLED COMPONENTS ---
const ProgressWrapper = styled.div`
  background-color: var(--color-bg-surface);
  padding: 0.5rem 0;
  flex-shrink: 0;
  margin-bottom: 1rem;
`;

const StepIndicator = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  margin-bottom: 0.5rem;

  &::before {
    content: "";
    position: absolute;
    top: 50%;
    left: 0;
    right: 0;
    height: 1px;
    background-color: var(--color-border);
    transform: translateY(-50%);
    z-index: 0;
  }
`;

const StepItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.35rem;
  z-index: 1;
  background-color: var(--color-bg-surface);
  padding: 0 0.5rem;
`;

const StepNumber = styled.div<{ $active: boolean; $completed: boolean }>`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.75rem;
  transition: all 0.3s ease;

  background-color: ${(props) =>
    props.$active || props.$completed
      ? "var(--color-brand-600)"
      : "var(--color-bg-page)"};
  color: ${(props) =>
    props.$active || props.$completed ? "white" : "var(--color-text-tertiary)"};
  border: 2px solid
    ${(props) =>
      props.$active || props.$completed
        ? "var(--color-brand-600)"
        : "var(--color-border)"};
`;

const StepLabel = styled.span<{ $active: boolean }>`
  font-size: 0.65rem;
  font-weight: 700;
  text-align: center;
  color: ${(props) =>
    props.$active ? "var(--color-text-main)" : "var(--color-text-tertiary)"};
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

interface Props {
  onCloseModal?: () => void;
  meterToEdit?: any;
}

export default function CreateMeterForm({ onCloseModal, meterToEdit }: Props) {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  
  // 🔥 Локальний стейт для підтвердження та кроків на мобільці
  const [showConfirm, setShowConfirm] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

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
    trigger,
    watch,
    errors,
    isSubmitting,
    isSubmitted,
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

  // Степінг-навігація на мобілці
  const handleNextStep = async (e?: React.MouseEvent | React.KeyboardEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (currentStep === 1) {
      const isValid = await trigger(["name", "type", "unit"]);
      if (isValid) {
        setTimeout(() => setCurrentStep(2), 0);
      }
    } else if (currentStep === 2) {
      const isValid = await trigger(["tariff"]);
      if (isValid) {
        setTimeout(() => setCurrentStep(3), 0);
      }
    }
  };

  const handleFormKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (isMobile) {
        handleNextStep(e);
      }
    }
  };

  const handlePrevStep = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

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
        style={{
          width: "100%",
          maxWidth: "500px",
          minWidth: isMobile ? "auto" : "500px",
        }}
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

        <Form
          onSubmit={
            isMobile && currentStep < 3
              ? (e) => e.preventDefault()
              : handleSubmit(actions.onSubmit)
          }
          onKeyDown={handleFormKeyDown}
        >
          {isMobile && (
            <ProgressWrapper>
              <StepIndicator>
                {[1, 2, 3].map((step) => (
                  <StepItem key={step}>
                    <StepNumber
                      $active={currentStep === step}
                      $completed={currentStep > step}
                    >
                      {currentStep > step ? <HiCheck /> : step}
                    </StepNumber>
                    <StepLabel $active={currentStep === step}>
                      {step === 1 && t("stats_utility:createMeterModal.step_info", "Параметри")}
                      {step === 2 && t("stats_utility:createMeterModal.step_tariff", "Тариф")}
                      {step === 3 && t("stats_utility:createMeterModal.step_provider", "Провайдер")}
                    </StepLabel>
                  </StepItem>
                ))}
              </StepIndicator>
            </ProgressWrapper>
          )}

          {/* STEP 1: General Info (name, type, unit) */}
          {(!isMobile || currentStep === 1) && (
            <>
              <div>
                <SectionLabel>
                  {t("stats_utility:createMeterModal.name_label")}
                </SectionLabel>
                <Input
                  placeholder={t("stats_utility:createMeterModal.placeholder_name")}
                  {...register("name", { required: t("common:validation.required", "Це поле обов'язкове") })}
                  $hasError={!!errors.name}
                  autoFocus
                />
                {errors.name && (
                  <span style={{ color: "var(--color-red-600)", fontSize: "0.75rem", marginTop: "0.25rem", display: "block" }}>
                    {errors.name.message as string}
                  </span>
                )}
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
                    {...register("unit", { required: t("common:validation.required", "Це поле обов'язкове") })}
                    $hasError={!!errors.unit}
                  />
                  {errors.unit && (
                    <span style={{ color: "var(--color-red-600)", fontSize: "0.75rem", marginTop: "0.25rem", display: "block" }}>
                      {errors.unit.message as string}
                    </span>
                  )}
                </div>
              </FormRow>
            </>
          )}

          {/* STEP 2: Pricing & Account (tariff, personal_account) */}
          {(!isMobile || currentStep === 2) && (
            <FormRow>
              <div>
                <SectionLabel>
                  {t("stats_utility:createMeterModal.tariff_label")}
                </SectionLabel>
                <Input
                  type="number"
                  step="0.0001"
                  placeholder="0.00"
                  {...register("tariff", { required: t("common:validation.required", "Це поле обов'язкове") })}
                  $hasError={!!errors.tariff}
                  autoFocus={isMobile}
                />
                {errors.tariff && (
                  <span style={{ color: "var(--color-red-600)", fontSize: "0.75rem", marginTop: "0.25rem", display: "block" }}>
                    {errors.tariff.message as string}
                  </span>
                )}
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
          )}

          {/* STEP 3: Providers & Assets (asset, provider) */}
          {(!isMobile || currentStep === 3) && (
            <>
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
                  hasError={!currentCP && isSubmitted}
                  initialExpanded={data.expandedIds}
                  priorityCategoryId={data.priorityCategoryId}
                />
              </SelectorWrapper>
            </>
          )}

          {/* ACTIONS */}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "10px",
              marginTop: "1rem",
            }}
          >
            {isMobile && currentStep > 1 ? (
              <Button
                key="btn-prev"
                variation="secondary"
                onClick={handlePrevStep}
                type="button"
              >
                {t("common:common.return")}
              </Button>
            ) : (
              <Button
                key="btn-cancel"
                variation="secondary"
                onClick={handleCloseAttempt}
                type="button"
              >
                {t("common:common.cancel")}
              </Button>
            )}

            {isMobile && currentStep < 3 ? (
              <Button
                key="btn-next"
                variation="primary"
                onClick={handleNextStep}
                type="button"
              >
                {t("common:common.next")}
              </Button>
            ) : (
              <Button
                key="btn-submit"
                variation="primary"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? t("common:shared.saving") : t("common:common.save")}
              </Button>
            )}
          </div>
        </Form>
      </div>
    </>
  );
}
