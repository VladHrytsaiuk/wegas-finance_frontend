import { useRef, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useQuery } from "@tanstack/react-query";
import {
  HiXMark,
  HiPhoto,
  HiCheck,
  HiCube,
  HiCurrencyDollar,
  HiCloudArrowUp,
  HiLink,
  HiGlobeAlt,
  HiLockClosed,
  HiEye,
} from "react-icons/hi2";

import Modal, {
  Overlay,
  StyledModal,
  ModalCloseButton,
  useModal,
} from "../ui/Modal";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { ColorIconPicker } from "../ui/ColorIconPicker";
import { DateRangePicker } from "../ui/DateRangePicker";
import { BaseSelect } from "../ui/Select/BaseSelect";
import Spinner from "../ui/Spinner";
import ConfirmCloseModal from "../ui/ConfirmCloseModal";

import { useCreateGoalForm } from "../../hooks/Goals/useCreateGoalForm";
import { getMeApi } from "../../services/apiUsers";

import * as S from "./CreateGoalModal.styles";
import type { Goal } from "../../types";

interface CreateGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingGoal?: Goal | null;
}

const CURRENCIES = ["UAH", "USD", "EUR"];

export default function CreateGoalModal(props: CreateGoalModalProps) {
  if (!props.isOpen) return null;
  return <CreateGoalFormContent {...props} />;
}

function CreateGoalFormContent({
  onClose,
  editingGoal,
  isOpen,
}: CreateGoalModalProps) {
  const { isDirty, setIsDirty } = useModal();
  const [showConfirm, setShowConfirm] = useState(false);

  const { data: currentUser } = useQuery({
    queryKey: ["me"],
    queryFn: getMeApi,
    staleTime: Infinity,
  });

  const {
    formState: f,
    data: { availableAccounts, isLoading, users },
    handleSubmit,
    t,
  } = useCreateGoalForm(isOpen, onClose, editingGoal);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Виключаємо себе зі списку для приховування
  const membersToHideFrom = users.filter((u) => u.id !== currentUser?.id);

  const handleCloseAttempt = () => {
    if (isDirty) {
      setShowConfirm(true);
    } else {
      setIsDirty(false);
      onClose();
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (showConfirm) {
          setShowConfirm(false);
          e.stopPropagation();
        } else {
          handleCloseAttempt();
        }
      }
    };
    document.addEventListener("keydown", handleKeyDown, true);
    return () => document.removeEventListener("keydown", handleKeyDown, true);
  }, [isDirty, showConfirm]);

  const modalContent = (
    <Overlay onClick={handleCloseAttempt}>
      <StyledModal
        onClick={(e) => e.stopPropagation()}
        style={S.ModalContainerOverrides}
      >
        <ModalCloseButton onClick={handleCloseAttempt}>
          <HiXMark />
        </ModalCloseButton>

        <S.Container>
          <S.Header>
            <S.Title>
              {editingGoal ? t("goals_debts:goals.edit_title") : t("goals_debts:goals.create_title")}
            </S.Title>
          </S.Header>

          <S.Content>
            <S.Form id="goal-form" onSubmit={handleSubmit}>
              <S.Grid>
                {/* ЛІВА КОЛОНКА */}
                <S.Column>
                  <S.SectionTitle>
                    <HiCube /> {t("counterparties:counterpartyForm.label_appearance")}
                  </S.SectionTitle>

                  <S.FieldGroup>
                    <S.Label>{t("goals_debts:goals.label_name")}</S.Label>
                    <Input
                      value={f.name}
                      onChange={(e) => f.setName(e.target.value)}
                      required
                      autoFocus={!showConfirm}
                      placeholder={t("goals_debts:goals.placeholder_name")}
                    />
                  </S.FieldGroup>

                  <S.AmountRow>
                    <S.FieldGroup>
                      <S.Label>{t("goals_debts:goals.label_amount")}</S.Label>
                      <Input
                        type="number"
                        value={f.amount}
                        onChange={(e) => f.setAmount(e.target.value)}
                        required
                        step="0.01"
                        placeholder="0.00"
                      />
                    </S.FieldGroup>
                    <S.FieldGroup>
                      <S.Label>{t("goals_debts:goals.filter_currency")}</S.Label>
                      <BaseSelect
                        triggerLabel={f.currency}
                        disabled={!!editingGoal}
                      >
                        {CURRENCIES.map((curr) => (
                          <S.SelectOption
                            key={curr}
                            onClick={() => f.setCurrency(curr)}
                            $isSelected={f.currency === curr}
                          >
                            {curr}
                            {f.currency === curr && <HiCheck />}
                          </S.SelectOption>
                        ))}
                      </BaseSelect>
                    </S.FieldGroup>
                  </S.AmountRow>

                  <S.FieldGroup>
                    <S.Label>{t("goals_debts:goals.label_deadline")}</S.Label>
                    <S.DateInputWrapper>
                      <DateRangePicker
                        mode="single"
                        dateFrom={f.deadline}
                        onDateChange={(ts) => f.setDeadline(new Date(ts))}
                      />
                    </S.DateInputWrapper>
                  </S.FieldGroup>

                  {!editingGoal && (
                    <>
                      <S.SectionTitle style={{ marginTop: "1rem" }}>
                        <HiCurrencyDollar /> {t("goals_debts:goals.section_link_account")}
                      </S.SectionTitle>
                      <S.FundingContainer>
                        <S.FundingCard
                          $isSelected={f.linkMode === "new"}
                          onClick={() => f.setLinkMode("new")}
                        >
                          <S.CardHeader>
                            <S.RadioCircle $isSelected={f.linkMode === "new"} />
                            <span style={{ fontWeight: 600 }}>
                              {t("goals_debts:goals.link_mode_new")}
                            </span>
                          </S.CardHeader>
                          {f.linkMode === "new" && (
                            <S.CardContent onClick={(e) => e.stopPropagation()}>
                              <Input
                                label={t("goals_debts:goals.label_new_account_name")}
                                value={f.newAccountName}
                                onChange={(e) =>
                                  f.setNewAccountName(e.target.value)
                                }
                                size="small"
                                placeholder={t("goals_debts:goals.placeholder_name")}
                              />
                            </S.CardContent>
                          )}
                        </S.FundingCard>

                        <S.FundingCard
                          $isSelected={f.linkMode === "existing"}
                          onClick={() => f.setLinkMode("existing")}
                        >
                          <S.CardHeader>
                            <S.RadioCircle
                              $isSelected={f.linkMode === "existing"}
                            />
                            <span style={{ fontWeight: 600 }}>
                              {t("goals_debts:goals.link_mode_existing")}
                            </span>
                          </S.CardHeader>
                          {f.linkMode === "existing" && (
                            <S.CardContent onClick={(e) => e.stopPropagation()}>
                              <BaseSelect
                                triggerLabel={
                                  availableAccounts.find(
                                    (a) => a.id === f.selectedAccountId,
                                  )?.name || t("common:ui.select_placeholder_default")
                                }
                              >
                                {availableAccounts.length === 0 ? (
                                  <div
                                    style={{
                                      padding: "0.8rem",
                                      color: "gray",
                                      textAlign: "center",
                                    }}
                                  >
                                    {t("common:ui.status_not_found")}
                                  </div>
                                ) : (
                                  availableAccounts.map((acc) => (
                                    <S.SelectOption
                                      key={acc.id}
                                      onClick={() =>
                                        f.setSelectedAccountId(acc.id)
                                      }
                                      $isSelected={
                                        f.selectedAccountId === acc.id
                                      }
                                    >
                                      <div
                                        style={{
                                          display: "flex",
                                          flexDirection: "column",
                                        }}
                                      >
                                        <span style={{ fontWeight: 500 }}>
                                          {acc.name}
                                        </span>
                                        <span
                                          style={{
                                            fontSize: "0.75rem",
                                            opacity: 0.7,
                                          }}
                                        >
                                          {(acc.balance / 100).toFixed(2)}{" "}
                                          {acc.currency}
                                        </span>
                                      </div>
                                      {f.selectedAccountId === acc.id && (
                                        <HiCheck />
                                      )}
                                    </S.SelectOption>
                                  ))
                                )}
                              </BaseSelect>
                            </S.CardContent>
                          )}
                        </S.FundingCard>

                        <S.FundingCard
                          $isSelected={f.linkMode === "none"}
                          onClick={() => f.setLinkMode("none")}
                        >
                          <S.CardHeader>
                            <S.RadioCircle
                              $isSelected={f.linkMode === "none"}
                            />
                            <span style={{ fontWeight: 600 }}>
                              {t("goals_debts:goals.link_mode_none")}
                            </span>
                          </S.CardHeader>
                        </S.FundingCard>
                      </S.FundingContainer>
                    </>
                  )}
                </S.Column>

                {/* ПРАВА КОЛОНКА */}
                <S.Column>
                  <S.SectionTitle>
                    <HiPhoto /> {t("assets:assetForm.label_files_short")}
                  </S.SectionTitle>
                  <S.FieldGroup>
                    <S.Label>{t("assets:assetForm.label_files_short")}</S.Label>
                    <input
                      type="file"
                      ref={fileInputRef}
                      style={{ display: "none" }}
                      accept="image/*"
                      onChange={f.handleFileChange}
                    />
                    {/* 🔥 ОНОВЛЕНИЙ КОНТЕЙНЕР ФОТО ЗІ СПІНЕРОМ 🔥 */}
                    <S.ImageUploadContainer
                      onClick={() => {
                        if (!f.isCompressing) fileInputRef.current?.click();
                      }}
                    >
                      {f.isCompressing ? (
                        <S.UploadPlaceholder>
                          <Spinner size="3rem" />
                          <span style={{ marginTop: "8px" }}>
                            {t("common:common.loading", "Завантаження...")}
                          </span>
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
                              style={{ padding: "4px" }}
                            >
                              <HiXMark />
                            </Button>
                          </S.RemovePhotoButton>
                        </>
                      ) : (
                        <S.UploadPlaceholder>
                          <HiCloudArrowUp size={40} />
                          <span>
                            {t("counterparties:counterpartyForm.button_upload_logo")}
                          </span>
                        </S.UploadPlaceholder>
                      )}
                    </S.ImageUploadContainer>
                  </S.FieldGroup>

                  {/* СЕКЦІЯ ПРИВАТНОСТІ */}
                  <S.FieldGroup>
                    <S.Label>
                      {t("goals_debts:goals.label_visibility", "Видимість")}
                    </S.Label>
                    <div style={{ display: "flex", gap: "1rem" }}>
                      <S.FundingCard
                        $isSelected={f.visibility === "public"}
                        onClick={() => {
                          f.setVisibility("public");
                        }}
                        style={{ flex: 1, padding: "0.8rem" }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                          }}
                        >
                          <HiGlobeAlt size={18} />
                          <span style={{ fontWeight: 600, fontSize: "0.9rem" }}>
                            {t("goals_debts:goals.visibility_public", "Сім'я")}
                          </span>
                        </div>
                      </S.FundingCard>
                      <S.FundingCard
                        $isSelected={f.visibility === "private"}
                        onClick={() => {
                          f.setVisibility("private");
                        }}
                        style={{ flex: 1, padding: "0.8rem" }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                          }}
                        >
                          <HiLockClosed size={18} />
                          <span style={{ fontWeight: 600, fontSize: "0.9rem" }}>
                            {t("goals_debts:goals.visibility_private", "Приватна")}
                          </span>
                        </div>
                      </S.FundingCard>
                    </div>

                    {/* 🔥 МУЛЬТИСЕЛЕКТ ДЛЯ ПРИХОВУВАННЯ */}
                    {f.visibility === "public" &&
                      membersToHideFrom.length > 0 && (
                        <div
                          style={{
                            marginTop: "0.8rem",
                            padding: "0.8rem",
                            backgroundColor: "var(--color-bg-page)",
                            borderRadius: "8px",
                            border: "1px solid var(--color-border)",
                          }}
                        >
                          <S.Label
                            style={{
                              fontSize: "0.8rem",
                              display: "flex",
                              alignItems: "center",
                              gap: "0.4rem",
                              marginBottom: "0.5rem",
                            }}
                          >
                            <HiEye /> Приховати від (необов'язково):
                          </S.Label>

                          <div
                            style={{
                              display: "flex",
                              flexWrap: "wrap",
                              gap: "6px",
                            }}
                          >
                            {membersToHideFrom.map((user) => (
                              <S.SelectOption
                                key={user.id}
                                $isSelected={f.hiddenFrom.includes(user.id)}
                                onClick={() => f.toggleHiddenUser(user.id)}
                                style={{
                                  border: "1px solid var(--color-border)",
                                  borderRadius: "8px",
                                  padding: "6px 12px",
                                  backgroundColor: f.hiddenFrom.includes(
                                    user.id,
                                  )
                                    ? "var(--color-brand-50)"
                                    : "var(--color-bg-surface)",
                                }}
                              >
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "6px",
                                  }}
                                >
                                  <span
                                    style={{
                                      fontSize: "0.85rem",
                                      fontWeight: 500,
                                    }}
                                  >
                                    {user.name}
                                  </span>
                                  {f.hiddenFrom.includes(user.id) && (
                                    <HiCheck
                                      size={14}
                                      color="var(--color-brand-600)"
                                    />
                                  )}
                                </div>
                              </S.SelectOption>
                            ))}
                          </div>
                        </div>
                      )}

                    <p
                      style={{
                        fontSize: "0.75rem",
                        color: "var(--color-text-tertiary)",
                        marginTop: "6px",
                        lineHeight: "1.3",
                      }}
                    >
                      {f.visibility === "public"
                        ? f.hiddenFrom.length > 0
                          ? "Ціль бачать усі, окрім обраних осіб."
                          : t(
                              "goals.desc_public",
                              "Усі члени сім'ї бачитимуть цю ціль.",
                            )
                        : t(
                            "goals.desc_private",
                            "Тільки ви бачитимете цю ціль.",
                          )}
                    </p>
                  </S.FieldGroup>

                  <S.FieldGroup>
                    <S.Label>{t("counterparties:counterpartyForm.label_note")}</S.Label>
                    <S.TextArea
                      value={f.description}
                      onChange={(e) => f.setDescription(e.target.value)}
                      placeholder={t("counterparties:counterpartyForm.placeholder_note")}
                    />
                  </S.FieldGroup>
                  <S.FieldGroup>
                    <S.Label>
                      <HiLink /> {t("goals_debts:goals.label_link")}
                    </S.Label>
                    <Input
                      value={f.externalLink}
                      onChange={(e) => f.setExternalLink(e.target.value)}
                      placeholder="https://..."
                    />
                  </S.FieldGroup>
                  <S.FieldGroup>
                    <S.Label>
                      {t("goals_debts:goals.label_color")} & {t("goals_debts:goals.label_icon")}
                    </S.Label>
                    <ColorIconPicker
                      color={f.color}
                      onColorChange={f.setColor}
                      icon={f.icon}
                      onIconChange={f.setIcon}
                    />
                  </S.FieldGroup>
                </S.Column>
              </S.Grid>
            </S.Form>
          </S.Content>

          <S.Footer>
            <Button
              variation="secondary"
              type="button"
              onClick={handleCloseAttempt}
              disabled={isLoading}
            >
              {t("common:common.close")}
            </Button>
            <Button
              variation="primary"
              type="submit"
              form="goal-form"
              disabled={isLoading}
            >
              {isLoading ? (
                <Spinner size="small" />
              ) : editingGoal ? (
                t("common:shared.save_changes")
              ) : (
                t("goals_debts:goals.button_create_first")
              )}
            </Button>
          </S.Footer>
        </S.Container>
      </StyledModal>
    </Overlay>
  );

  const confirmModalContent = showConfirm ? (
    <Overlay
      onClick={() => setShowConfirm(false)}
      style={S.ConfirmOverlayStyles}
    >
      <StyledModal
        onClick={(e) => e.stopPropagation()}
        style={S.ConfirmModalOverrides}
      >
        <ConfirmCloseModal
          onConfirm={() => {
            setIsDirty(false);
            onClose();
          }}
          onCloseModal={() => setShowConfirm(false)}
        />
      </StyledModal>
    </Overlay>
  ) : null;

  return createPortal(
    <>
      {modalContent}
      {confirmModalContent}
    </>,
    document.body,
  );
}
