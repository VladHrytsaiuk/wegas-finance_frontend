import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { HiPhoto, HiUser, HiXMark } from "react-icons/hi2";

import { Input } from "../../ui/Input";
import { Button } from "../../ui/Button";
import { ColorPicker, IconPicker } from "../../ui/ColorIconPicker";
import { TypeSelector } from "./TypeSelector";
import { CategorySelect } from "../../categories/CategorySelect";
import { useModal } from "../../ui/Modal";

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
  const { setIsDirty } = useModal();

  const {
    form: {
      register,
      formState: { errors, isDirty },
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

  useEffect(() => {
    setIsDirty(isDirty);
    return () => setIsDirty(false);
  }, [isDirty, setIsDirty]);

  return (
    <S.Form onSubmit={submitHandler} key={defaultValues?.id || "new"}>
      <S.Title>{title}</S.Title>

      {/* 1. Type (Person / Shop) */}
      <S.FormRow>
        <S.Label>{t("counterparties:counterpartyForm.label_type")}</S.Label>
        <TypeSelector selectedType={selectedType} onSelect={handleTypeSelect} />
      </S.FormRow>

      {/* 2. Appearance (Color, Icon, SVG) */}
      <S.FormRow>
        <S.Label>{t("counterparties:counterpartyForm.label_appearance")}</S.Label>
        <S.PickerContainer>
          {isPerson ? (
            <S.PersonStaticBadge>
              <S.IconContainer>
                <HiUser />
              </S.IconContainer>
              <span>{t("counterparties:counterpartyForm.person_icon_fixed")}</span>
            </S.PersonStaticBadge>
          ) : (
            <>
              {showLogoPreview ? (
                <S.LogoPreviewContainer style={{ flex: 1 }}>
                  <S.LogoBox>
                    <img src={logoPreviewSrc} alt="Logo" />
                  </S.LogoBox>
                  <S.LogoInfo>
                    <S.LogoTextMain>SVG Logo</S.LogoTextMain>
                  </S.LogoInfo>
                  <Button
                    type="button"
                    variation="danger"
                    size="small"
                    onClick={handleRemoveLogo}
                    style={{ padding: "4px" }}
                  >
                    <HiXMark size={16} />
                  </Button>
                </S.LogoPreviewContainer>
              ) : (
                <>
                  <ColorPicker
                    color={currentColor}
                    onColorChange={(c) => setValue("color", c, { shouldDirty: true })}
                    square
                  />
                  <IconPicker
                    icon={currentIcon}
                    onIconChange={(i) => setValue("icon", i, { shouldDirty: true })}
                    color={currentColor}
                    square
                  />
                  
                  {(selectedType === "shop" || selectedType === "other") && (
                    <>
                      <S.DividerText>{t("counterparties:counterpartyForm.divider_or")}</S.DividerText>
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
                        onClick={triggerFileUpload}
                        style={{ flex: 1, height: "44px", justifyContent: "center", gap: "8px" }}
                      >
                        <HiPhoto size={20} />
                        <span>SVG</span>
                      </Button>
                    </>
                  )}
                </>
              )}
            </>
          )}
        </S.PickerContainer>
      </S.FormRow>

      {/* 3. Name & Category Combined */}
      <S.CompactRow>
        <S.FieldGroup style={{ flex: 1 }}>
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
        </S.FieldGroup>

        <S.FieldGroup style={{ flex: 1.5 }}>
          <S.Label>{t("counterparties:counterpartyForm.label_category")}</S.Label>
          <CategorySelect
            categories={availableCategories}
            value={currentCategoryId}
            onChange={(id) => setValue("category_id", id, { shouldDirty: true })}
          />
        </S.FieldGroup>
      </S.CompactRow>

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
