import { useState, useEffect, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { HiCloudArrowUp, HiXMark, HiCheck } from "react-icons/hi2";

import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { AmountInput } from "../ui/AmountInput";
import { BaseSelect } from "../ui/Select/BaseSelect";
import type { WishlistGroup } from "../../types";
import { useModal } from "../ui/Modal";
import * as S from "./WishlistModals.styles";
import {
  useWishlistItemForm,
  type WishlistItemFormData,
} from "../../hooks/Wishlist/useWishlistForms";
import Spinner from "../ui/Spinner";
import { useIsMobile } from "../../hooks/useIsMobile";

interface Props {
  onCloseModal?: () => void;
  groups: WishlistGroup[];
  onCreate: (data: WishlistItemFormData) => void;
  defaultGroupId?: string;
}

export default function CreateWishModal({
  onCloseModal,
  groups,
  onCreate,
  defaultGroupId,
}: Props) {
  const { t } = useTranslation();
  const { setIsDirty, close } = useModal();
  const isMobile = useIsMobile();
  const [currentStep, setCurrentStep] = useState(1);

  const { state, actions, handlers, fileInputRef } = useWishlistItemForm(
    undefined,
    defaultGroupId,
  );

  useEffect(() => {
    setIsDirty(state.isDirty);
  }, [state.isDirty, setIsDirty]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!state.name.trim()) return;

    if (isMobile && currentStep < 3) {
      setCurrentStep((prev) => prev + 1);
      return;
    }

    onCreate(handlers.getPayload());
    setIsDirty(false);
    close();
  };

  return (
    <S.ModalContainer style={S.ModalContainerOverrides}>
      <S.Header>
        <S.Title>{t("shopping_wishlist:wishlist.add_item")}</S.Title>
      </S.Header>

      {isMobile && (
        <S.ProgressWrapper>
          <S.StepIndicator>
            {[1, 2, 3].map((step) => (
              <S.StepItem
                key={step}
                $active={currentStep === step}
                $completed={currentStep > step}
              >
                <S.StepNumber
                  $active={currentStep === step}
                  $completed={currentStep > step}
                >
                  {currentStep > step ? <HiCheck size={12} /> : step}
                </S.StepNumber>
                <S.StepLabel $active={currentStep === step}>
                  {step === 1
                    ? t("shopping_wishlist:wishlist.step_details")
                    : step === 2
                    ? t("shopping_wishlist:wishlist.step_params")
                    : t("shopping_wishlist:wishlist.step_photo")}
                </S.StepLabel>
              </S.StepItem>
            ))}
          </S.StepIndicator>
        </S.ProgressWrapper>
      )}

      <S.Content>
        <S.WishForm onSubmit={handleSubmit} id="create-wish-form">
          {/* Left Column: Image Upload (Step 3 on mobile) */}
          {(!isMobile || currentStep === 3) && (
            <S.LeftColumn>
              <S.ImageUploadContainer
                onClick={() => {
                  if (!state.isCompressing) fileInputRef.current?.click();
                }}
              >
                {state.isCompressing ? (
                  <S.UploadPlaceholder>
                    <Spinner size="3rem" />
                    <span>{t("common:common.loading")}</span>
                  </S.UploadPlaceholder>
                ) : state.photoPreview ? (
                  <>
                    <S.PreviewImage src={state.photoPreview} alt="Preview" />
                    <S.RemovePhotoButton>
                      <Button
                        type="button"
                        variation="secondary"
                        onClick={handlers.handleRemovePhoto}
                        size="small"
                      >
                        <HiXMark size={14} />
                      </Button>
                    </S.RemovePhotoButton>
                  </>
                ) : (
                  <S.UploadPlaceholder>
                    <HiCloudArrowUp />
                    <span>{t("shopping_wishlist:wishlist.click_to_upload")}</span>
                  </S.UploadPlaceholder>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: "none" }}
                  accept="image/*"
                  onChange={handlers.handleFileSelect}
                />
              </S.ImageUploadContainer>
            </S.LeftColumn>
          )}

          {/* Right Column: Details (Step 1 & Step 2 on mobile) */}
          {(!isMobile || currentStep === 1 || currentStep === 2) && (
            <S.RightColumn>
              {(!isMobile || currentStep === 1) && (
                <>
                  <S.FieldGroup>
                    <S.Label>{t("shopping_wishlist:wishlist.item_name")}</S.Label>
                    <Input
                      autoFocus
                      required
                      placeholder={t("shopping_wishlist:wishlist.item_name_placeholder", "AirPods Pro")}
                      value={state.name}
                      onChange={(e) => actions.setName(e.target.value)}
                    />
                  </S.FieldGroup>

                  <S.FieldGroup>
                    <S.Label>{t("shopping_wishlist:wishlist.link")}</S.Label>
                    <Input
                      type="url"
                      placeholder="https://..."
                      value={state.url}
                      onChange={(e) => actions.setUrl(e.target.value)}
                    />
                  </S.FieldGroup>
                </>
              )}

              {(!isMobile || currentStep === 2) && (
                <>
                  <S.InputGroup>
                    <S.FieldGroup>
                      <S.Label>{t("shopping_wishlist:wishlist.price")}</S.Label>
                      <AmountInput
                        value={state.price}
                        onChange={(val) => actions.setPrice(val)}
                        placeholder="0.00"
                      />
                    </S.FieldGroup>
                    <S.FieldGroup>
                      <S.Label>{t("common:common.currency")}</S.Label>
                      <BaseSelect triggerLabel={state.currency}>
                        {["UAH", "USD", "EUR"].map((c) => (
                          <S.SelectOption
                            key={c}
                            $isSelected={state.currency === c}
                            onClick={() => actions.setCurrency(c)}
                          >
                            {c}
                          </S.SelectOption>
                        ))}
                      </BaseSelect>
                    </S.FieldGroup>
                  </S.InputGroup>

                  <S.InputGroup>
                    <S.FieldGroup>
                      <S.Label>{t("shopping_wishlist:wishlist.group")}</S.Label>
                      <BaseSelect
                        triggerLabel={
                          state.groupId
                            ? groups.find((g) => g.id === state.groupId)?.name
                            : t("shopping_wishlist:wishlist.select_group_none")
                        }
                      >
                        <S.SelectOption
                          $isSelected={state.groupId === ""}
                          onClick={() => actions.setGroupId("")}
                        >
                          {t("shopping_wishlist:wishlist.select_group_none")}
                        </S.SelectOption>
                        {groups.map((g) => (
                          <S.SelectOption
                            key={g.id}
                            $isSelected={state.groupId === g.id}
                            onClick={() => actions.setGroupId(g.id)}
                          >
                            {g.name}
                          </S.SelectOption>
                        ))}
                      </BaseSelect>
                    </S.FieldGroup>

                    <S.FieldGroup>
                      <S.Label>{t("shopping_wishlist:wishlist.priority")}</S.Label>
                      <BaseSelect
                        triggerLabel={
                          state.priority === 3
                            ? "🔥 " + t("shopping_wishlist:wishlist.priority_high")
                            : state.priority === 2
                              ? "⚡ " + t("shopping_wishlist:wishlist.priority_medium")
                              : "☕ " + t("shopping_wishlist:wishlist.priority_low")
                        }
                      >
                        <S.SelectOption
                          $isSelected={state.priority === 1}
                          onClick={() => actions.setPriority(1)}
                        >
                          ☕ {t("shopping_wishlist:wishlist.priority_low")}
                        </S.SelectOption>
                        <S.SelectOption
                          $isSelected={state.priority === 2}
                          onClick={() => actions.setPriority(2)}
                        >
                          ⚡ {t("shopping_wishlist:wishlist.priority_medium")}
                        </S.SelectOption>
                        <S.SelectOption
                          $isSelected={state.priority === 3}
                          onClick={() => actions.setPriority(3)}
                        >
                          🔥 {t("shopping_wishlist:wishlist.priority_high")}
                        </S.SelectOption>
                      </BaseSelect>
                    </S.FieldGroup>
                  </S.InputGroup>
                </>
              )}
            </S.RightColumn>
          )}
        </S.WishForm>
      </S.Content>

      <S.FooterActions>
        {isMobile && currentStep > 1 ? (
          <Button
            type="button"
            variation="secondary"
            onClick={(e) => {
              e.preventDefault();
              setCurrentStep((prev) => prev - 1);
            }}
          >
            {t("common:common.return")}
          </Button>
        ) : (
          <Button type="button" variation="secondary" onClick={onCloseModal}>
            {t("common:common.cancel")}
          </Button>
        )}

        {isMobile && currentStep < 3 ? (
          <Button
            type="button"
            variation="primary"
            disabled={currentStep === 1 && !state.name.trim()}
            onClick={(e) => {
              e.preventDefault();
              setCurrentStep((prev) => prev + 1);
            }}
          >
            {t("common:common.next")}
          </Button>
        ) : (
          <Button
            type="submit"
            variation="primary"
            disabled={!state.name.trim()}
            form="create-wish-form"
          >
            {t("common:common.save")}
          </Button>
        )}
      </S.FooterActions>
    </S.ModalContainer>
  );
}
