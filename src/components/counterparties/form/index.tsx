import { useTranslation } from "react-i18next";
import { HiPhoto, HiTrash, HiUser } from "react-icons/hi2";

import { Input } from "../../ui/Input";
import { Button } from "../../ui/Button";
import { ColorIconPicker } from "../../ui/ColorIconPicker";
import { TypeSelector } from "./TypeSelector";
import { CategorySelect } from "../../categories/CategorySelect";

import * as S from "./styles";
import { useCounterpartyForm } from "../../../hooks/Counterparties/useCounterpartyForm";

interface CounterpartyFormProps {
  onSubmit: (data: any) => void;
  defaultValues?: any;
  isLoading?: boolean;
}

export default function CounterpartyForm({
  onSubmit,
  defaultValues,
  isLoading = false,
}: CounterpartyFormProps) {
  const { t } = useTranslation();

  const {
    form: {
      register,
      formState: { errors },
      setValue,
    },
    refs: { fileInputRef },
    values: {
      selectedType,
      currentCategoryId,
      currentColor,
      currentIcon,
      logoPreviewSrc,
      title,
    },
    uiState: { isPerson, showLogoPreview, showIconPicker, availableCategories },
    handlers: {
      handleTypeSelect,
      handleFileSelect,
      handleRemoveLogo,
      submitHandler,
      triggerFileUpload,
      onClose,
    },
  } = useCounterpartyForm({ onSubmit, defaultValues });

  return (
    <S.Form onSubmit={submitHandler}>
      <S.Title>{title}</S.Title>

      {/* 1. Type */}
      <S.FormRow>
        <S.Label>{t("counterparties:counterpartyForm.label_type")}</S.Label>
        <TypeSelector selectedType={selectedType} onSelect={handleTypeSelect} />
      </S.FormRow>

      {/* 2. Appearance */}
      <S.FormRow>
        <S.Label>{t("counterparties:counterpartyForm.label_appearance")}</S.Label>

        {isPerson && (
          <S.PersonStaticBadge>
            <S.IconContainer>
              <HiUser />
            </S.IconContainer>
            <span>{t("counterparties:counterpartyForm.person_icon_fixed")}</span>
          </S.PersonStaticBadge>
        )}

        {showLogoPreview && (
          <S.LogoPreviewContainer>
            <S.LogoBox>
              <img src={logoPreviewSrc} alt="Logo" />
            </S.LogoBox>
            <S.LogoInfo>
              <S.LogoTextMain>
                {t("counterparties:counterpartyForm.logo_active_status")}
              </S.LogoTextMain>
              <S.LogoTextSub>
                {t("counterparties:counterpartyForm.logo_active_hint")}
              </S.LogoTextSub>
            </S.LogoInfo>
            <Button
              type="button"
              variation="danger"
              size="small"
              onClick={handleRemoveLogo}
              icon={<HiTrash />}
            >
              {t("common:common.delete")}
            </Button>
          </S.LogoPreviewContainer>
        )}

        {showIconPicker && (
          <S.PickerContainer>
            <ColorIconPicker
              color={currentColor}
              icon={currentIcon}
              onColorChange={(c) => setValue("color", c, { shouldDirty: true })}
              onIconChange={(i) => setValue("icon", i, { shouldDirty: true })}
            />

            {selectedType === "shop" && (
              <>
                <S.DividerContainer>
                  <S.DividerLine />
                  <S.DividerText>
                    {t("counterparties:counterpartyForm.divider_or", "АБО")}
                  </S.DividerText>
                  <S.DividerLine />
                </S.DividerContainer>

                <input
                  type="file"
                  accept=".svg"
                  hidden
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                />
                <Button
                  type="button"
                  variation="secondary"
                  size="medium"
                  onClick={triggerFileUpload}
                  icon={<HiPhoto />}
                  style={{ width: "100%", justifyContent: "center" }}
                >
                  {t("counterparties:counterpartyForm.button_upload_logo")}
                </Button>
              </>
            )}
          </S.PickerContainer>
        )}
      </S.FormRow>

      {/* 3. Name */}
      <S.FormRow>
        <S.Label>{t("counterparties:counterpartyForm.label_name")}</S.Label>
        <Input
          placeholder={t("counterparties:counterpartyForm.placeholder_name_default")}
          {...register("name", {
            required: t("counterparties:counterpartyForm.required_name_error"),
          })}
          autoComplete="off"
        />
        {errors.name && (
          <S.ErrorMessage>{String(errors.name.message)}</S.ErrorMessage>
        )}
      </S.FormRow>

      {/* 4. Category */}
      <S.FormRow>
        <S.Label>{t("counterparties:counterpartyForm.label_category")}</S.Label>
        <CategorySelect
          categories={availableCategories}
          value={currentCategoryId}
          onChange={(id) => setValue("category_id", id, { shouldDirty: true })}
        />
      </S.FormRow>

      {/* 5. Note */}
      <S.FormRow>
        <S.Label>{t("counterparties:counterpartyForm.label_note")}</S.Label>
        <Input as="textarea" rows={3} {...register("note")} />
      </S.FormRow>

      <S.Footer>
        <Button
          variation="secondary"
          type="button"
          onClick={onClose}
          disabled={isLoading}
        >
          {t("counterparties:counterpartyForm.button_cancel")}
        </Button>
        <Button disabled={isLoading} type="submit">
          {isLoading
            ? t("counterparties:counterpartyForm.button_saving")
            : t("counterparties:counterpartyForm.button_save")}
        </Button>
      </S.Footer>
    </S.Form>
  );
}
