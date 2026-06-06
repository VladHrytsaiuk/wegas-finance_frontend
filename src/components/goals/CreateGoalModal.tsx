import { useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  HiXMark,
  HiCheck,
  HiCube,
  HiCurrencyDollar,
  HiCloudArrowUp,
  HiGlobeAlt,
  HiLockClosed,
  HiEye,
} from "react-icons/hi2";

import {
  Overlay,
  StyledModal,
  ModalCloseButton,
  useModal,
} from "../ui/Modal";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { AmountInput } from "../ui/AmountInput";
import { ColorPicker, IconPicker } from "../ui/ColorIconPicker";
import { DateRangePicker } from "../ui/DateRangePicker";
import { BaseSelect } from "../ui/Select/BaseSelect";
import Spinner from "../ui/Spinner";
import ConfirmCloseModal from "../ui/ConfirmCloseModal";

import { useCreateGoalForm } from "../../hooks/Goals/useCreateGoalForm";

import * as S from "./CreateGoalModal.styles";
import type { Goal } from "../../types";
import { CURRENCY_SYMBOLS } from "../../utils/currency";
import { CurrencySymbol } from "../ui/CurrencySymbol";

interface CreateGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingGoal?: Goal | null;
}

const CURRENCIES = ["UAH", "USD", "EUR"];

/**
 * Dumb UI Component for Goal Creation/Editing.
 * Strictly separates business logic via useCreateGoalForm custom hook.
 */
export default function CreateGoalModal(props: CreateGoalModalProps) {
  if (!props.isOpen) return null;
  return <CreateGoalFormContent {...props} />;
}

function CreateGoalFormContent({
  onClose,
  editingGoal,
  isOpen,
}: CreateGoalModalProps) {
  const { setIsDirty } = useModal();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    wizard: w,
    formState: f,
    data: d,
    handleSubmit,
    t,
  } = useCreateGoalForm(isOpen, onClose, editingGoal);

  // Sync ESC key handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (w.showConfirm) {
          w.setShowConfirm(false);
          e.stopPropagation();
        } else {
          w.handleCloseAttempt();
        }
      }
    };
    document.addEventListener("keydown", handleKeyDown, true);
    return () => document.removeEventListener("keydown", handleKeyDown, true);
  }, [w]);

  const modalContent = (
    <Overlay onClick={w.handleCloseAttempt}>
      <StyledModal
        onClick={(e) => e.stopPropagation()}
        style={S.ModalContainerOverrides}
      >
        <ModalCloseButton onClick={w.handleCloseAttempt}>
          <HiXMark />
        </ModalCloseButton>

        <S.Container>
          <S.Header>
            <S.Title>
              {editingGoal
                ? t("goals_debts:goals.edit_title")
                : t("goals_debts:goals.create_title")}
            </S.Title>
          </S.Header>

          <S.ProgressWrapper>
            <S.StepIndicator>
              {[1, 2, 3].map((step) => (
                <S.StepItem
                  key={step}
                  $active={w.currentStep === step}
                  $completed={w.currentStep > step}
                >
                  <S.StepNumber
                    $active={w.currentStep === step}
                    $completed={w.currentStep > step}
                  >
                    {w.currentStep > step ? <HiCheck /> : step}
                  </S.StepNumber>
                  <S.StepLabel $active={w.currentStep === step}>
                    {step === 1 && t("goals_debts:goalDetails.title_section_info")}
                    {step === 2 && t("goals_debts:goalDetails.title_section_finance")}
                    {step === 3 && t("goals_debts:goalDetails.title_section_visual")}
                  </S.StepLabel>
                </S.StepItem>
              ))}
            </S.StepIndicator>
          </S.ProgressWrapper>

          <S.Content>
            <S.Form id="goal-form" onSubmit={handleSubmit}>
              {w.currentStep === 1 && (
                <S.Column>
                  <S.SectionTitle>
                    <HiCube /> {t("goals_debts:goalDetails.title_section_info")}
                  </S.SectionTitle>

                  <S.FieldGroup>
                    <S.Label>{t("goals_debts:goals.label_name")}</S.Label>
                    <Input
                      value={f.name}
                      onChange={(e) => {
                        f.setName(e.target.value);
                        if (w.errors.name) w.setErrors((prev) => ({ ...prev, name: "" }));
                      }}
                      required
                      autoFocus={!w.showConfirm}
                      placeholder={t("goals_debts:goals.placeholder_name")}
                      $hasError={!!w.errors.name}
                    />
                    {w.errors.name && <S.ErrorText>{w.errors.name}</S.ErrorText>}
                  </S.FieldGroup>

                  <S.AmountRow>
                    <S.FieldGroup>
                      <S.Label>{t("goals_debts:goals.label_amount")}</S.Label>
                      <AmountInput
                        value={f.amount}
                        onChange={(val) => {
                          f.setAmount(val);
                          if (w.errors.amount)
                            w.setErrors((prev) => ({ ...prev, amount: "" }));
                        }}
                        hasError={!!w.errors.amount}
                        placeholder="0.00"
                      />
                      {w.errors.amount && <S.ErrorText>{w.errors.amount}</S.ErrorText>}
                    </S.FieldGroup>
                    <S.FieldGroup>
                      <S.Label>{t("common:common.currency")}</S.Label>
                      <BaseSelect
                        triggerLabel={
                          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <CurrencySymbol
                              symbol={CURRENCY_SYMBOLS[f.currency] || f.currency}
                              size="18px"
                            />
                            {f.currency}
                          </div>
                        }
                        disabled={!!editingGoal}
                      >
                        {CURRENCIES.map((curr) => (
                          <S.SelectOption
                            key={curr}
                            onClick={() => f.setCurrency(curr)}
                            $isSelected={f.currency === curr}
                          >
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              <CurrencySymbol
                                symbol={CURRENCY_SYMBOLS[curr] || curr}
                                size="18px"
                              />
                              {curr}
                            </div>
                            {f.currency === curr && <HiCheck />}
                          </S.SelectOption>
                        ))}
                      </BaseSelect>
                    </S.FieldGroup>
                  </S.AmountRow>

                  <S.FieldGroup>
                    <S.Label>{t("goals_debts:goals.label_deadline")}</S.Label>
                    <S.DateInputWrapper style={w.errors.deadline ? { borderColor: "var(--color-red-500)" } : {}}>
                      <DateRangePicker
                        mode="single"
                        dateFrom={f.deadline}
                        onDateChange={(ts) => {
                          f.setDeadline(new Date(ts));
                          if (w.errors.deadline) w.setErrors((prev) => ({ ...prev, deadline: "" }));
                        }}
                        min={new Date().toISOString().split("T")[0]}
                        minDate={new Date()}
                      />
                    </S.DateInputWrapper>
                    {w.errors.deadline && <S.ErrorText>{w.errors.deadline}</S.ErrorText>}
                  </S.FieldGroup>
                </S.Column>
              )}

              {w.currentStep === 2 && (
                <S.Column>
                  {!editingGoal && (
                    <>
                      <S.SectionTitle>
                        <HiCurrencyDollar /> {t("goals_debts:goals.section_link_account")}
                      </S.SectionTitle>

                      <S.FundingContainer>
                        <S.FundingCard
                          $isSelected={f.linkMode === "new"}
                          onClick={() => {
                            f.setLinkMode("new");
                            w.setErrors((prev) => ({ ...prev, linkMode: "" }));
                          }}
                          $error={!!w.errors.linkMode}
                        >
                          <S.CardHeader>
                            <S.RadioCircle $isSelected={f.linkMode === "new"} />
                            <span>{t("goals_debts:goals.link_mode_new")}</span>
                          </S.CardHeader>
                        </S.FundingCard>

                        <S.FundingCard
                          $isSelected={f.linkMode === "existing"}
                          onClick={() => {
                            f.setLinkMode("existing");
                            w.setErrors((prev) => ({ ...prev, linkMode: "" }));
                          }}
                          $error={!!w.errors.linkMode}
                        >
                          <S.CardHeader>
                            <S.RadioCircle $isSelected={f.linkMode === "existing"} />
                            <span>{t("goals_debts:goals.link_mode_existing")}</span>
                          </S.CardHeader>
                        </S.FundingCard>

                        <S.FundingCard
                          $isSelected={f.linkMode === "none"}
                          onClick={() => {
                            f.setLinkMode("none");
                            w.setErrors((prev) => ({ ...prev, linkMode: "" }));
                          }}
                          $error={!!w.errors.linkMode}
                        >
                          <S.CardHeader>
                            <S.RadioCircle $isSelected={f.linkMode === "none"} />
                            <span>{t("goals_debts:goals.link_mode_none")}</span>
                          </S.CardHeader>
                        </S.FundingCard>
                      </S.FundingContainer>
                      {w.errors.linkMode && <S.ErrorText>{w.errors.linkMode}</S.ErrorText>}

                      {f.linkMode === "new" && (
                        <S.CardContent>
                          <Input
                            label={t("goals_debts:goals.label_new_account_name")}
                            value={f.newAccountName}
                            onChange={(e) => {
                              f.setNewAccountName(e.target.value);
                              if (w.errors.newAccountName)
                                w.setErrors((prev) => ({ ...prev, newAccountName: "" }));
                            }}
                            size="small"
                            placeholder={t("goals_debts:goals.placeholder_name")}
                            $hasError={!!w.errors.newAccountName}
                          />
                          {w.errors.newAccountName && <S.ErrorText>{w.errors.newAccountName}</S.ErrorText>}
                        </S.CardContent>
                      )}

                      {f.linkMode === "existing" && (
                        <S.CardContent>
                          <BaseSelect
                            triggerLabel={
                              d.availableAccounts.find((a) => a.id === f.selectedAccountId)?.name ||
                              t("goals_debts:goals.label_existing_account")
                            }
                            hasError={!!w.errors.selectedAccountId}
                          >
                            {d.availableAccounts.length === 0 ? (
                              <div style={{ padding: "0.8rem", color: "gray", textAlign: "center" }}>
                                {t("common:ui.status_not_found")}
                              </div>
                            ) : (
                              d.availableAccounts.map((acc) => (
                                <S.SelectOption
                                  key={acc.id}
                                  onClick={() => {
                                    f.setSelectedAccountId(acc.id);
                                    if (w.errors.selectedAccountId)
                                      w.setErrors((prev) => ({ ...prev, selectedAccountId: "" }));
                                  }}
                                  $isSelected={f.selectedAccountId === acc.id}
                                >
                                  <div style={{ display: "flex", flexDirection: "column" }}>
                                    <span style={{ fontWeight: 500 }}>{acc.name}</span>
                                    <span style={{ fontSize: "0.75rem", opacity: 0.7 }}>
                                      {(acc.balance / 100).toFixed(2)} {acc.currency}
                                    </span>
                                  </div>
                                  {f.selectedAccountId === acc.id && <HiCheck />}
                                </S.SelectOption>
                              ))
                            )}
                          </BaseSelect>
                          {w.errors.selectedAccountId && <S.ErrorText>{w.errors.selectedAccountId}</S.ErrorText>}
                        </S.CardContent>
                      )}
                    </>
                  )}

                  <S.SectionTitle style={{ marginTop: "0.5rem" }}>
                    <HiGlobeAlt /> {t("goals_debts:goals.label_visibility")}
                  </S.SectionTitle>
                  <S.FieldGroup>
                    <div style={{ display: "flex", gap: "0.75rem" }}>
                      <S.FundingCard
                        $isSelected={f.visibility === "public"}
                        onClick={() => {
                          f.setVisibility("public");
                          w.setErrors((prev) => ({ ...prev, visibility: "" }));
                        }}
                        $error={!!w.errors.visibility}
                        style={{ flex: 1, padding: "0.6rem" }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                          <HiGlobeAlt size={16} />
                          <span style={{ fontWeight: 600, fontSize: "0.85rem" }}>
                            {t("goals_debts:goals.visibility_public")}
                          </span>
                        </div>
                      </S.FundingCard>
                      <S.FundingCard
                        $isSelected={f.visibility === "private"}
                        onClick={() => {
                          f.setVisibility("private");
                          w.setErrors((prev) => ({ ...prev, visibility: "" }));
                        }}
                        $error={!!w.errors.visibility}
                        style={{ flex: 1, padding: "0.6rem" }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                          <HiLockClosed size={16} />
                          <span style={{ fontWeight: 600, fontSize: "0.85rem" }}>
                            {t("goals_debts:goals.visibility_private")}
                          </span>
                        </div>
                      </S.FundingCard>
                    </div>
                    {w.errors.visibility && <S.ErrorText>{w.errors.visibility}</S.ErrorText>}

                    {f.visibility === "public" && d.membersToHideFrom.length > 0 && (
                      <div
                        style={{
                          marginTop: "0.5rem",
                          padding: "0.6rem",
                          backgroundColor: "var(--color-bg-page)",
                          borderRadius: "6px",
                          border: "1px solid var(--color-border)",
                        }}
                      >
                        <S.Label
                          style={{
                            fontSize: "0.75rem",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.3rem",
                            marginBottom: "0.4rem",
                          }}
                        >
                          <HiEye /> {t("common:common.hide_from")}:
                        </S.Label>

                        <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                          {d.membersToHideFrom.map((user) => (
                            <S.SelectOption
                              key={user.id}
                              $isSelected={f.hiddenFrom.includes(user.id)}
                              onClick={() => f.toggleHiddenUser(user.id)}
                              style={{
                                border: "1px solid var(--color-border)",
                                borderRadius: "6px",
                                padding: "4px 8px",
                                fontSize: "0.8rem",
                                backgroundColor: f.hiddenFrom.includes(user.id)
                                  ? "var(--color-brand-50)"
                                  : "var(--color-bg-surface)",
                              }}
                            >
                              <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                                {user.name}
                                {f.hiddenFrom.includes(user.id) && (
                                  <HiCheck size={12} color="var(--color-brand-600)" />
                                )}
                              </div>
                            </S.SelectOption>
                          ))}
                        </div>
                      </div>
                    )}
                  </S.FieldGroup>
                </S.Column>
              )}

              {w.currentStep === 3 && (
                <S.Grid style={{ gap: "1.5rem", alignItems: "stretch" }}>
                  <S.FieldGroup style={{ height: "100%" }}>
                    <S.Label>{t("goals_debts:goalDetails.note_description")}</S.Label>
                    <S.TextArea
                      value={f.description}
                      onChange={(e) => f.setDescription(e.target.value)}
                      placeholder={t("counterparties:counterpartyForm.placeholder_note")}
                      style={{ flex: 1, height: "100%" }}
                    />
                  </S.FieldGroup>

                  <S.FieldGroup style={{ height: "100%" }}>
                    <S.Label>{t("assets:assetForm.label_files_short")}</S.Label>
                    <input
                      type="file"
                      ref={fileInputRef}
                      style={{ display: "none" }}
                      accept="image/*"
                      onChange={f.handleFileChange}
                    />
                    <S.ImageUploadContainer
                      onClick={() => {
                        if (!f.isCompressing) fileInputRef.current?.click();
                      }}
                      style={{ height: "150px" }}
                    >
                      {f.isCompressing ? (
                        <S.UploadPlaceholder>
                          <Spinner size="2rem" />
                          <span style={{ marginTop: "4px" }}>{t("common:shared.loading")}</span>
                        </S.UploadPlaceholder>
                      ) : f.photoPreview ? (
                        <>
                          <S.PreviewImage src={f.photoPreview} alt="Preview" />
                          <S.RemovePhotoButton>
                            <Button
                              variation="secondary"
                              size="small"
                              $danger
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                f.handleRemovePhoto();
                              }}
                              style={{ padding: "2px" }}
                            >
                              <HiXMark size={14} />
                            </Button>
                          </S.RemovePhotoButton>
                        </>
                      ) : (
                        <S.UploadPlaceholder>
                          <HiCloudArrowUp size={30} />
                          <span>{t("counterparties:counterpartyForm.button_upload_logo")}</span>
                        </S.UploadPlaceholder>
                      )}
                    </S.ImageUploadContainer>
                  </S.FieldGroup>

                  <S.FieldGroup>
                    <S.Label>{t("goals_debts:goals.label_link")}</S.Label>
                    <Input
                      value={f.externalLink}
                      onChange={(e) => f.setExternalLink(e.target.value)}
                      placeholder="https://..."
                      style={{ height: "38px" }}
                    />
                  </S.FieldGroup>

                  <div style={{ display: "flex", flexDirection: "row", gap: "1rem", alignItems: "flex-end" }}>
                    <S.FieldGroup style={{ flex: "0 0 auto" }}>
                      <S.Label>{t("goals_debts:goals.label_color")}</S.Label>
                      <ColorPicker color={f.color} onColorChange={f.setColor} />
                    </S.FieldGroup>
                    <S.FieldGroup style={{ flex: "0 0 auto" }}>
                      <S.Label>{t("goals_debts:goals.label_icon")}</S.Label>
                      <IconPicker icon={f.icon} onIconChange={f.setIcon} color={f.color} />
                    </S.FieldGroup>
                  </div>
                </S.Grid>
              )}
            </S.Form>
          </S.Content>

          <S.Footer>
            <Button
              variation="secondary"
              type="button"
              onClick={w.handleCloseAttempt}
              disabled={d.isLoading}
              size="small"
            >
              {t("common:common.close")}
            </Button>

            {w.currentStep > 1 && (
              <Button
                variation="secondary"
                type="button"
                onClick={w.prevStep}
                disabled={d.isLoading}
                size="small"
              >
                {t("common:common.return")}
              </Button>
            )}

            {w.currentStep < w.totalSteps ? (
              <Button
                variation="primary"
                type="button"
                onClick={w.nextStep}
                disabled={d.isLoading}
                size="small"
              >
                {t("common:common.next")}
              </Button>
            ) : (
              <Button
                variation="primary"
                type="submit"
                form="goal-form"
                disabled={d.isLoading}
                size="small"
              >
                {d.isLoading ? (
                  <Spinner size="small" />
                ) : editingGoal ? (
                  t("common:shared.save_changes")
                ) : (
                  t("goals_debts:goals.button_create_first")
                )}
              </Button>
            )}
          </S.Footer>
        </S.Container>
      </StyledModal>
    </Overlay>
  );

  const confirmModalContent = w.showConfirm ? (
    <Overlay onClick={() => w.setShowConfirm(false)} style={S.ConfirmOverlayStyles}>
      <StyledModal onClick={(e) => e.stopPropagation()} style={S.ConfirmModalOverrides}>
        <ConfirmCloseModal
          onConfirm={() => {
            setIsDirty(false);
            onClose();
          }}
          onCloseModal={() => w.setShowConfirm(false)}
        />
      </StyledModal>
    </Overlay>
  ) : null;

  return createPortal(
    <>
      {modalContent}
      {confirmModalContent}
    </>,
    document.body
  );
}
