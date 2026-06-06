import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom"; // 🔥 Додано для порталу
import {
  HiUser,
  HiOutlineSwatch,
  HiOutlineBanknotes,
  HiCreditCard,
  HiCurrencyDollar,
  HiLockClosed,
  HiArchiveBox,
  HiEnvelope,
  HiBeaker,
  HiNoSymbol,
  HiFlag,
} from "react-icons/hi2";
import { useTranslation } from "react-i18next";
import styled from "styled-components";

// UI Components
import { Button } from "../../ui/Button";
import { Input } from "../../ui/Input";
import { BaseSelect } from "../../ui/Select/BaseSelect";
import Modal, { useModal, Overlay, StyledModal } from "../../ui/Modal"; // 🔥 Додано імпорти стилів модалки

// Новий селект
import StorageTypeSelect from "./StorageTypeSelect";

// Custom Hooks & Styles
import { useAccountForm } from "../../../hooks/Accounts/useAccountForm";
import { SkinSelector } from "./SkinSelector";
import * as S from "./AccountForm.styles";
import { focusNextElement } from "../../../utils/focusUtils";
import { BANK_SKINS } from "../bankSkins";
import { getModKey } from "../../../utils/platform";

import {
  CASH_COLORS,
  BankLogo,
  PAYMENT_SYSTEMS,
  PaymentSystemLogo,
} from "./CardStyles";

import {
  CreditCardContainer as BankCardStyled,
  CashCardStyled,
  CardHeader,
  CardChip,
  CardNumber,
  CardBalance,
  CardFooter,
  CardOwner,
  CashCardHeader,
  CashName,
  TypeBadge,
} from "../AccountCard.styles";
import { formatMoney } from "../../../utils/helpers";
import ConfirmUnlinkGoal from "./ConfirmUnlinkGoal";
import { CURRENCY_SYMBOLS } from "../../../utils/currency";
import { CurrencySymbol } from "../../ui/CurrencySymbol";
import { SmartIcon } from "../../../utils/IconMap";

interface AccountFormProps {
  onSubmit: (data: any, options?: any) => void;
  isLoading: boolean;
  users: any[];
  defaultValues?: any;
  onClose?: () => void;
  onCloseModal?: () => void;
}

// --- Helpers ---
const LabelWithLock = ({
  label,
  isLocked,
}: {
  label: string;
  isLocked?: boolean;
}) => (
  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
    {label}
    {isLocked && (
      <HiLockClosed
        style={{ color: "var(--color-text-tertiary)", cursor: "help" }}
        title="Це поле синхронізується з банком, його не можна змінити вручну."
      />
    )}
  </div>
);

const DisabledWrapper = styled.div<{ $disabled?: boolean }>`
  ${(props) =>
    props.$disabled &&
    `
    opacity: 0.6;
    pointer-events: none;
    cursor: not-allowed;
  `}
`;

const FormattedCardNumber = ({ number }: { number: string }) => (
  <CardNumber>
    <span
      style={{
        fontSize: "1.4rem",
        letterSpacing: "-2px",
        lineHeight: 0.5,
        marginTop: "-10px",
        display: "inline-block",
        marginRight: "6px",
      }}
    >
      •••• •••• ••••{" "}
    </span>
    <span style={{ fontSize: "1.1rem", letterSpacing: "2px" }}>
      {number || "0000"}
    </span>
  </CardNumber>
);

const handleTabKey = (e: React.KeyboardEvent) => {
  if (e.key === "Tab") {
    e.preventDefault();
    focusNextElement(document.activeElement as HTMLElement, e.shiftKey);
  }
};

export function AccountForm(props: AccountFormProps) {
  return <AccountFormContent {...props} />;
}

export function AccountFormContent(props: AccountFormProps) {
  const { t } = useTranslation();
  const { users, isLoading, onClose, onCloseModal, defaultValues } = props;
  const { state, actions, refs } = useAccountForm(props);
  const { setIsDirty } = useModal();

  // 🔥 ЛОКАЛЬНИЙ СТЕЙТ для модалки відв'язки
  const [showUnlinkConfirm, setShowUnlinkConfirm] = useState(false);

  useEffect(() => {
    setIsDirty(state.isDirty);
    return () => setIsDirty(false);
  }, [state.isDirty, setIsDirty]);

  const isSynced = defaultValues?.is_synced;

  // Derived Values
  const skin = BANK_SKINS[state.skinKey] || BANK_SKINS["monobank-black"];
  const currentUserId = localStorage.getItem("user_id");

  const ownerName = state.ownerId
    ? users.find((u: any) => u.id === state.ownerId)?.name
    : users.find((u: any) => u.id === currentUserId)?.name ||
      t("accounts:accountForm.owner_me");

  const selectedPaymentSystem = PAYMENT_SYSTEMS.find(
    (ps) => ps.value === state.paymentSystem,
  );

  const selectedGoal = state.goals.find((g: any) => g.id === state.goalId);

  const currencyOptions = [
    {
      value: "UAH",
      label: "UAH",
      icon: <CurrencySymbol symbol={CURRENCY_SYMBOLS.UAH} size="20px" />,
    },
    {
      value: "USD",
      label: "USD",
      icon: <CurrencySymbol symbol={CURRENCY_SYMBOLS.USD} size="20px" />,
    },
    {
      value: "EUR",
      label: "EUR",
      icon: <CurrencySymbol symbol={CURRENCY_SYMBOLS.EUR} size="20px" />,
    },
  ];

  const ownerOptions = [
    { value: "", label: t("accounts:accountForm.owner_me"), icon: <HiUser /> },
    ...users
      .filter((u: any) => u.id !== currentUserId)
      .map((u: any) => ({
        value: u.id,
        label: `${u.name} (${u.email})`,
        icon: (
          <div
            style={{
              width: 20,
              height: 20,
              borderRadius: "50%",
              background: "#eee",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "10px",
              fontWeight: "bold",
              color: "#555",
            }}
          >
            {u.name[0]}
          </div>
        ),
      })),
  ];

  const handleTypeClick = (newType: string) => {
    if (newType === state.type) return;

    // 🔥 УМОВА:
    const hasRealGoal =
      state.isEditing &&
      state.type === "savings" &&
      state.goalId &&
      state.goalId.trim().length > 5;

    if (hasRealGoal && newType !== "savings") {
      actions.setPendingType(newType);
      // 🔥 ЗАМІСТЬ open(), використовуємо локальний стейт
      setShowUnlinkConfirm(true);
    } else {
      actions.setType(newType);
    }
  };

  const selectedCurrencyOption = currencyOptions.find(
    (o) => o.value === state.currency,
  );
  const selectedOwnerOption = ownerOptions.find(
    (o) => o.value === state.ownerId,
  );

  const selectedStorageType = state.storageTypes.find(
    (st: any) => st.id === state.storageTypeId,
  );

  // --- Helper для рендеру іконки в PREVIEW ---
  const renderPreviewIcon = () => {
    if (state.type === "cash") return <HiOutlineBanknotes size={18} />;
    const slug = selectedStorageType?.slug;
    switch (slug) {
      case "envelope":
        return <HiEnvelope size={18} />;
      case "safe":
        return <HiLockClosed size={18} />;
      case "jar":
        return <HiBeaker size={18} />;
      default:
        return <HiArchiveBox size={18} />;
    }
  };

  const renderPreviewLabel = () => {
    if (state.type === "cash") return t("accounts:accountForm.type_cash");
    return selectedStorageType?.name || t("accounts:accountForm.type_savings");
  };

  const modKey = getModKey();

  return (
    <S.FormContainer onKeyDown={handleTabKey}>
      {/* 🔥 MANUAL PORTAL FOR UNLINK CONFIRMATION */}
      {showUnlinkConfirm &&
        createPortal(
          <Overlay
            style={{ zIndex: 3000 }} // Вищий за основну форму
            onClick={() => setShowUnlinkConfirm(false)}
          >
            <StyledModal
              onClick={(e) => e.stopPropagation()}
              style={{
                zIndex: 3001,
                width: "fit-content",
                maxWidth: "28rem",
                padding: "2.4rem",
              }}
            >
              <ConfirmUnlinkGoal
                goalName={selectedGoal?.name || ""}
                onConfirm={() => {
                  actions.confirmTypeChange();
                  setShowUnlinkConfirm(false);
                }}
                onCloseModal={() => {
                  actions.setPendingType(null);
                  setShowUnlinkConfirm(false);
                }}
              />
            </StyledModal>
          </Overlay>,
          document.body,
        )}

      <S.Form ref={refs.formRef} onSubmit={actions.handleSubmit} noValidate>
        {/* TYPE SELECTOR */}
        <DisabledWrapper $disabled={isSynced}>
          <div style={{ marginBottom: "0.5rem" }}>
            <label className="label">
              <LabelWithLock
                label={t("accounts:accountForm.label_account_type")}
                isLocked={isSynced}
              />
            </label>
            <S.SegmentControl>
              <S.SegmentButton
                as="button"
                type="button"
                ref={refs.initialFocusRef}
                $active={state.type === "card"}
                onClick={() => handleTypeClick("card")}
                disabled={isSynced}
              >
                <HiCreditCard style={{ marginRight: 6 }} />{" "}
                {t("accounts:accountForm.type_card")}
              </S.SegmentButton>
              <S.SegmentButton
                as="button"
                type="button"
                $active={state.type === "cash"}
                onClick={() => handleTypeClick("cash")}
                disabled={isSynced}
              >
                <HiOutlineBanknotes style={{ marginRight: 6 }} />{" "}
                {t("accounts:accountForm.type_cash")}
              </S.SegmentButton>
              <S.SegmentButton
                as="button"
                type="button"
                $active={state.type === "savings"}
                onClick={() => handleTypeClick("savings")}
                disabled={isSynced}
              >
                <HiCurrencyDollar style={{ marginRight: 6 }} />{" "}
                {t("accounts:accountForm.type_savings")}
              </S.SegmentButton>
            </S.SegmentControl>
          </div>
        </DisabledWrapper>

        {/* --- NAME & CURRENCY --- */}
        <div style={{ display: "flex", gap: "1rem" }}>
          {/* NAME */}
          <div style={{ flex: 1 }}>
            <label className="label">{t("accounts:accountForm.label_name")}</label>
            <Input
              value={state.name}
              onChange={(e) => {
                actions.setName(e.target.value);
                actions.clearError("name");
              }}
              placeholder={
                state.type === "card"
                  ? t("accounts:accountForm.placeholder_name_card")
                  : t("accounts:accountForm.placeholder_name_cash")
              }
              $hasError={!!state.errors.name}
            />
            {state.errors.name && (
              <S.ErrorText>{state.errors.name}</S.ErrorText>
            )}
          </div>

          {/* CURRENCY */}
          <div style={{ width: "130px" }}>
            <label className="label">
              <LabelWithLock
                label={t("accounts:accountForm.label_currency")}
                isLocked={isSynced}
              />
            </label>
            <DisabledWrapper $disabled={isSynced}>
              <BaseSelect
                triggerLabel={
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    {selectedCurrencyOption?.icon}{" "}
                    {selectedCurrencyOption?.label}
                  </div>
                }
              >
                {currencyOptions.map((opt) => (
                  <S.SelectItem
                    key={opt.value}
                    type="button"
                    $isSelected={opt.value === state.currency}
                    onClick={() => actions.setCurrency(opt.value)}
                  >
                    {opt.icon} {opt.label}
                  </S.SelectItem>
                ))}
              </BaseSelect>
            </DisabledWrapper>
          </div>
        </div>

        {/* --- CARD SPECIFIC FIELDS --- */}
        {state.type === "card" && (
          <div style={{ display: "flex", gap: "1rem" }}>
            <div style={{ flex: 1 }}>
              <label className="label">
                {t("accounts:accountForm.label_card_number")}
              </label>
              <Input
                value={state.cardNumber}
                onChange={(e) => {
                  actions.setCardNumber(e.target.value.slice(0, 4));
                  actions.clearError("cardNumber");
                }}
                placeholder="1234"
                maxLength={4}
                hasError={!!state.errors.cardNumber}
              />
              {state.errors.cardNumber && (
                <S.ErrorText>{state.errors.cardNumber}</S.ErrorText>
              )}
            </div>

            <div style={{ width: "160px" }}>
              <label className="label">Система</label>
              <BaseSelect
                triggerLabel={
                  selectedPaymentSystem ? (
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 8 }}
                    >
                      <img
                        src={`/banks/${selectedPaymentSystem.value}.svg`}
                        alt={selectedPaymentSystem.label}
                        style={{ height: "18px", width: "auto" }}
                      />
                      <span>{selectedPaymentSystem.label}</span>
                    </div>
                  ) : (
                    <span style={{ opacity: 0.6 }}>Auto</span>
                  )
                }
              >
                {PAYMENT_SYSTEMS.map((sys) => (
                  <S.SelectItem
                    key={sys.value}
                    type="button"
                    $isSelected={state.paymentSystem === sys.value}
                    onClick={() =>
                      actions.setPaymentSystem(
                        state.paymentSystem === sys.value ? "" : sys.value,
                      )
                    }
                  >
                    <img
                      src={`/banks/${sys.value}.svg`}
                      alt={sys.label}
                      style={{ height: "20px", width: "auto" }}
                    />
                    {sys.label}
                  </S.SelectItem>
                ))}
              </BaseSelect>
            </div>
          </div>
        )}

        {/* --- SAVINGS SPECIFIC FIELDS --- */}
        {state.type === "savings" && (
          <>
            <div>
              <label className="label">Тип скарбнички</label>
              <StorageTypeSelect
                types={state.storageTypes}
                value={state.storageTypeId}
                onChange={actions.setStorageTypeId}
                onCreate={actions.handleCreateStorageType}
              />
            </div>

            {/* ВИБІР ЦІЛІ */}
            <div>
              <label className="label">Приєднати до цілі</label>
              <BaseSelect
                triggerLabel={
                  selectedGoal ? (
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 8 }}
                    >
                      <SmartIcon iconName={selectedGoal.icon} color={selectedGoal.color} />
                      <span>{selectedGoal.name}</span>
                    </div>
                  ) : (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        opacity: 0.6,
                      }}
                    >
                      <HiNoSymbol />
                      <span>Без цілі</span>
                    </div>
                  )
                }
              >
                <S.SelectItem
                  type="button"
                  $isSelected={state.goalId === ""}
                  onClick={() => actions.setGoalId("")}
                >
                  <HiNoSymbol /> Не прив'язувати
                </S.SelectItem>
                {state.goals.map((goal: any) => (
                  <S.SelectItem
                    key={goal.id}
                    type="button"
                    $isSelected={goal.id === state.goalId}
                    onClick={() => actions.setGoalId(goal.id)}
                  >
                    <SmartIcon iconName={goal.icon} color={goal.color} />
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <span>{goal.name}</span>
                      <small style={{ fontSize: "0.7rem", opacity: 0.6 }}>
                        {formatMoney(goal.target_amount, goal.currency)}
                      </small>
                    </div>
                  </S.SelectItem>
                ))}
              </BaseSelect>
            </div>
          </>
        )}

        {/* --- BALANCE --- */}
        <div>
          <label className="label">
            <LabelWithLock
              label={
                state.isEditing
                  ? t("accounts:accountForm.label_balance_adjust")
                  : t("accounts:accountForm.label_balance_initial")
              }
              isLocked={isSynced}
            />
          </label>
          <Input
            type="number"
            value={state.balance}
            onChange={(e) => {
              actions.setBalance(e.target.value);
              actions.clearError("balance");
            }}
            placeholder="0.00"
            $hasError={!!state.errors.balance}
            disabled={isSynced}
            style={isSynced ? { opacity: 0.7, cursor: "not-allowed" } : {}}
          />
          {state.errors.balance && (
            <S.ErrorText>{state.errors.balance}</S.ErrorText>
          )}
        </div>

        {/* --- COLOR (FOR CASH & SAVINGS) --- */}
        {state.type !== "card" && (
          <div>
            <label className="label">{t("accounts:accountForm.label_color")}</label>
            <S.ColorGrid>
              {CASH_COLORS.map((c) => (
                <S.ColorSwatch
                  as="button"
                  key={c}
                  type="button"
                  $color={c}
                  $selected={state.color === c}
                  onClick={() => actions.setColor(c)}
                />
              ))}
            </S.ColorGrid>
          </div>
        )}

        {/* --- OWNER --- */}
        <div>
          <label className="label">{t("accounts:accountForm.label_owner")}</label>
          <BaseSelect
            placeholder={t("accounts:accountForm.owner_placeholder")}
            triggerLabel={
              selectedOwnerOption ? (
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {selectedOwnerOption.icon} {selectedOwnerOption.label}
                </div>
              ) : null
            }
          >
            {ownerOptions.map((opt) => (
              <S.SelectItem
                key={opt.value}
                type="button"
                $isSelected={opt.value === state.ownerId}
                onClick={() => actions.setOwnerId(opt.value)}
              >
                {opt.icon} {opt.label}
              </S.SelectItem>
            ))}
          </BaseSelect>
        </div>

        {/* --- ACTIONS --- */}
        <S.FooterRow>
          <Button
            type="button"
            onClick={onCloseModal || onClose}
            variation="secondary"
          >
            {t("accounts:accountForm.button_cancel")}
          </Button>

          <Button
            style={{ width: "auto" }}
            disabled={isLoading}
            type="submit"
            title={`${modKey} + Enter`}
          >
            {state.isEditing
              ? t("accounts:accountForm.button_save")
              : t("accounts:accountForm.button_create")}
          </Button>
        </S.FooterRow>
      </S.Form>

      {/* --- RIGHT COLUMN: PREVIEW --- */}
      <S.RightColumn>
        <div>
          <S.PreviewLabel>{t("accounts:accountForm.label_preview")}</S.PreviewLabel>
          <S.PreviewSection>
            <div style={{ width: "100%", pointerEvents: "none" }}>
              {state.type === "card" ? (
                <BankCardStyled
                  $bg={skin.bg}
                  $color={skin.color}
                  $border={skin.border}
                >
                  <CardHeader>
                    <BankLogo skin={skin} />
                  </CardHeader>

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "2px",
                    }}
                  >
                    <CardChip />
                    <FormattedCardNumber number={state.cardNumber} />
                    <div
                      style={{
                        fontSize: "0.75rem",
                        opacity: 0.7,
                        fontWeight: 600,
                        marginTop: "0.4rem",
                        textTransform: "uppercase",
                        letterSpacing: "1px",
                      }}
                    >
                      {state.name || t("accounts:accountForm.default_card_name")}
                    </div>
                    {ownerName && (
                      <CardOwner>
                        <HiUser size={10} style={{ opacity: 0.7 }} />
                        {ownerName}
                      </CardOwner>
                    )}
                  </div>

                  <CardFooter>
                    <CardBalance>
                      {state.currency === "USD"
                        ? "$"
                        : state.currency === "EUR"
                          ? "€"
                          : "₴"}{" "}
                      {state.balance || "0.00"}
                    </CardBalance>
                    <div
                      style={{
                        position: "absolute",
                        bottom: "0rem",
                        right: "0rem",
                        opacity: 0.8,
                      }}
                    >
                      <PaymentSystemLogo
                        system={state.paymentSystem || "mastercard"}
                        color={skin.color}
                      />
                    </div>
                  </CardFooter>
                </BankCardStyled>
              ) : (
                <CashCardStyled $color={state.color}>
                  <CashCardHeader>
                    <CashName>
                      {state.name || t("accounts:accountForm.placeholder_name_cash")}
                    </CashName>

                    <TypeBadge>
                      {renderPreviewIcon()}
                      <span>{renderPreviewLabel()}</span>
                    </TypeBadge>
                  </CashCardHeader>

                  <div style={{ marginTop: "auto" }}>
                    <CardBalance style={{ color: "var(--color-text-main)" }}>
                      {state.currency === "USD" ? "$" : "₴"}{" "}
                      {state.balance || "0.00"}
                    </CardBalance>
                    <div
                      style={{
                        fontSize: "0.75rem",
                        color: "var(--color-text-light)",
                        marginTop: "0.5rem",
                        display: "flex",
                        gap: "0.5rem",
                        alignItems: "center",
                      }}
                    >
                      <HiUser /> {ownerName}
                    </div>
                  </div>
                </CashCardStyled>
              )}
            </div>
          </S.PreviewSection>
        </div>

        {state.type === "card" && (
          <Modal>
            <Modal.Open opens="skin-selector-modal">
              <S.ChangeSkinBtn
                ref={refs.skinBtnRef}
                type="button"
                onClick={() => {
                  const currentSkin = BANK_SKINS[state.skinKey];
                  const targetTab = currentSkin
                    ? currentSkin.bankId
                    : "monobank";
                  actions.setActiveBankTab(targetTab);
                }}
                title={`${modKey} + I`}
              >
                <HiOutlineSwatch /> {t("accounts:accountForm.button_change_skin")}
              </S.ChangeSkinBtn>
            </Modal.Open>
            <Modal.Window name="skin-selector-modal">
              <SkinSelector
                activeBankTab={state.activeBankTab}
                setActiveBankTab={actions.setActiveBankTab}
                skinKey={state.skinKey}
                setSkinKey={actions.setSkinKey}
              />
            </Modal.Window>
          </Modal>
        )}
      </S.RightColumn>
    </S.FormContainer>
  );
}
