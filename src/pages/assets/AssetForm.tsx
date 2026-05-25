import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Controller } from "react-hook-form";
import {
  HiPaperClip,
  HiXMark,
  HiCheck,
  HiCube,
  HiBanknotes,
  HiDocumentText,
  HiOutlineDocumentPlus,
  HiOutlinePhoto,
} from "react-icons/hi2";

import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { BaseSelect } from "../../components/ui/Select/BaseSelect";
import { type Asset } from "../../types";

import ConfirmCloseModal from "../../components/ui/ConfirmCloseModal";
import { Overlay, StyledModal } from "../../components/ui/Modal";

import { useAssetForm } from "../../hooks/Assets/useAssetForm";
import Spinner from "../../components/ui/Spinner";
import * as S from "./AssetForm.styles";
import { getUploadedFileUrl } from "../../utils/helpers";

interface SelectOption {
  value: string;
  label: string;
}

function SimpleSelect({
  value,
  onChange,
  options,
  placeholder,
  hasError,
}: {
  value: string;
  onChange: (val: string) => void;
  options: SelectOption[];
  placeholder?: string;
  hasError?: boolean;
}) {
  const currentLabel = (options || []).find((o) => o.value === value)?.label;
  return (
    <BaseSelect
      triggerLabel={currentLabel}
      placeholder={placeholder}
      onClear={value ? () => onChange("") : undefined}
      hasError={hasError}
    >
      <S.SelectOptions>
        {(options || []).map((option) => (
          <S.OptionItem
            key={option.value}
            $isActive={option.value === value}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </S.OptionItem>
        ))}
      </S.SelectOptions>
    </BaseSelect>
  );
}

interface AssetFormProps {
  onCloseModal?: () => void;
  assetToEdit?: Asset;
}

export default function AssetForm({
  onCloseModal,
  assetToEdit,
}: AssetFormProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const { form, files, documents, actions, t, isDirty } = useAssetForm({
    assetToEdit,
    onCloseModal,
  });

  const { register, control, handleSubmit, isSubmitting, trigger, errors } = form;

  const handleCloseAttempt = () => {
    isDirty ? setShowConfirm(true) : onCloseModal?.();
  };

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        if (showConfirm) {
          setShowConfirm(false);
        } else {
          handleCloseAttempt();
        }
      }
    };
    document.addEventListener("keydown", handleEsc, true);
    return () => document.removeEventListener("keydown", handleEsc, true);
  }, [showConfirm, isDirty]);

  const nextStep = async (e?: React.MouseEvent | React.FormEvent) => {
    e?.preventDefault();
    if (!trigger) {
      setCurrentStep(2);
      return;
    }
    const isValid = await trigger(["type", "name", "price", "currency", "purchase_date"]);
    if (isValid) {
      setCurrentStep(2);
    }
  };

  const prevStep = () => setCurrentStep(1);

  const handleActualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep === 1) {
      nextStep(e);
      return;
    }
    handleSubmit(actions.onSubmit)(e);
  };

  const totalFiles = (files?.existing?.length || 0) + (files?.list?.length || 0);
  const totalDocs = (documents?.existing?.length || 0) + (documents?.list?.length || 0);

  return (
    <>
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

      <S.FormContainer>
        <S.FormHeader>
          <S.FormTitle>
            {assetToEdit ? t("assets:assetForm.title_edit") : t("assets:assetForm.title_new")}
          </S.FormTitle>
        </S.FormHeader>

        <S.ProgressWrapper>
          <S.StepIndicator>
            {[1, 2].map((step) => (
              <S.StepItem
                key={step}
                $active={currentStep === step}
                $completed={currentStep > step}
              >
                <S.StepNumber
                  $active={currentStep === step}
                  $completed={currentStep > step}
                >
                  {currentStep > step ? <HiCheck /> : step}
                </S.StepNumber>
                <S.StepLabel $active={currentStep === step}>
                  {step === 1 && t("goals_debts:goalDetails.title_section_info")}
                  {step === 2 && t("goals_debts:goalDetails.title_section_media", "Медіа та Примітки")}
                </S.StepLabel>
              </S.StepItem>
            ))}
          </S.StepIndicator>
        </S.ProgressWrapper>

        <S.ScrollArea>
          <S.StyledForm
            id="asset-form"
            onSubmit={handleActualSubmit}
          >
            {currentStep === 1 && (
              <S.Column>
                <S.SectionTitle>
                  <HiCube /> {t("goals_debts:goalDetails.title_section_info")}
                </S.SectionTitle>

                <S.Grid columns="1fr 2fr">
                  <S.FormGroup>
                    <S.Label>{t("assets:assetForm.label_type")}</S.Label>
                    <Controller
                      name="type"
                      control={control}
                      rules={{ required: true }}
                      render={({ field }) => (
                        <SimpleSelect
                          {...field}
                          placeholder={t("assets:assetForm.placeholder_type")}
                          hasError={!!errors?.type}
                          options={[
                            {
                              value: "electronics",
                              label: t("assets:assetForm.type_electronics"),
                            },
                            {
                              value: "furniture",
                              label: t("assets:assetForm.type_furniture"),
                            },
                            { value: "car", label: t("assets:assetForm.type_car") },
                            {
                              value: "real_estate",
                              label: t("assets:assetForm.type_real_estate"),
                            },
                            { value: "other", label: t("assets:assetForm.type_other") },
                          ]}
                        />
                      )}
                    />
                    {errors?.type && <S.ErrorText>{t("common:validation.required")}</S.ErrorText>}
                  </S.FormGroup>

                  <S.FormGroup>
                    <S.Label>{t("assets:assetForm.label_name")}</S.Label>
                    <Input
                      type="text"
                      $hasError={!!errors?.name}
                      {...register("name", { required: true })}
                      placeholder={t("assets:assetForm.placeholder_name")}
                    />
                    {errors?.name && <S.ErrorText>{t("common:validation.required")}</S.ErrorText>}
                  </S.FormGroup>
                </S.Grid>

                <S.Grid columns="1fr 0.8fr 1fr">
                  <S.FormGroup>
                    <S.Label>{t("assets:assetForm.label_price")}</S.Label>
                    <Input
                      type="number"
                      step="0.01"
                      $hasError={!!errors?.price}
                      {...register("price", { required: true })}
                      placeholder="0.00"
                    />
                    {errors?.price && <S.ErrorText>{t("common:validation.required")}</S.ErrorText>}
                  </S.FormGroup>

                  <S.FormGroup>
                    <S.Label>{t("assets:assetForm.label_currency")}</S.Label>
                    <Controller
                      name="currency"
                      control={control}
                      render={({ field }) => (
                        <SimpleSelect
                          {...field}
                          options={[
                            { value: "UAH", label: "UAH" },
                            { value: "USD", label: "USD" },
                            { value: "EUR", label: "EUR" },
                          ]}
                        />
                      )}
                    />
                  </S.FormGroup>

                  <S.FormGroup>
                    <S.Label>{t("assets:assetForm.label_date")}</S.Label>
                    <Input
                      type="date"
                      $hasError={!!errors?.purchase_date}
                      {...register("purchase_date", { required: true })}
                    />
                    {errors?.purchase_date && <S.ErrorText>{t("common:validation.required")}</S.ErrorText>}
                  </S.FormGroup>
                </S.Grid>

                <S.Grid columns="1fr 1fr">
                  <S.FormGroup>
                    <S.Label>{t("assets:assetForm.label_serial")}</S.Label>
                    <Input {...register("serial_number")} placeholder="S/N" />
                  </S.FormGroup>
                  <S.FormGroup>
                    <S.Label>{t("assets:assetForm.label_warranty")}</S.Label>
                    <Input type="date" {...register("warranty_end")} />
                  </S.FormGroup>
                </S.Grid>
              </S.Column>
            )}

            {currentStep === 2 && (
              <S.Column>
                <S.SectionTitle>
                  <HiDocumentText /> {t("assets:assetForm.section_finance", "Деталі")}
                </S.SectionTitle>

                <S.FormGroup>
                  <S.Label>{t("assets:assetForm.label_note", "Примітка")}</S.Label>
                  <S.TextArea
                    rows={3}
                    {...register("note")}
                    placeholder="..."
                  />
                </S.FormGroup>

                <S.Grid columns="1fr 1fr" style={{ marginTop: "1rem" }}>
                  <S.FormGroup>
                    <S.Label>
                      <HiOutlinePhoto
                        style={{ marginRight: "4px", verticalAlign: "middle" }}
                      />
                      {t("assets:assetForm.label_files", "Фотографії")}
                    </S.Label>
                    <S.FileUploadContainer>
                      <S.FileUploadControls>
                        <S.HiddenInput
                          type="file"
                          id="asset-files"
                          accept="image/*"
                          multiple
                          onChange={files?.onChange}
                        />

                        {files?.isCompressing ? (
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "10px",
                              color: "var(--color-text-secondary)",
                            }}
                          >
                            <Spinner size="2rem" />
                            <span style={{ fontSize: "0.9rem" }}>
                              {t("common:common.loading")}
                            </span>
                          </div>
                        ) : (
                          <label htmlFor="asset-files">
                            <Button
                              variation="secondary"
                              as="span"
                              size="small"
                              type="button"
                              style={{
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                gap: "5px",
                              }}
                            >
                              <HiPaperClip />{" "}
                              {t("assets:assetForm.button_add_files", "Додати фото")}
                            </Button>
                          </label>
                        )}

                        {!files?.isCompressing && (
                          <S.FileCount>{totalFiles} вибрано</S.FileCount>
                        )}
                      </S.FileUploadControls>

                      {totalFiles > 0 && (
                        <S.ImageGallery>
                          {(files?.existing || []).map((f: any, idx: number) => {
                            const fullUrl = getUploadedFileUrl(f.path);

                            return (
                              <S.ThumbnailWrapper key={`ex-${idx}`}>
                                <S.Thumbnail src={fullUrl} alt={`Фото ${idx + 1}`} />
                                <S.RemoveThumbBtn
                                  type="button"
                                  onClick={() => files?.onRemoveExisting(idx)}
                                >
                                  <HiXMark size={14} />
                                </S.RemoveThumbBtn>
                              </S.ThumbnailWrapper>
                            );
                          })}
                          {(files?.list || []).map((file: File, idx: number) => {
                            const objectUrl = URL.createObjectURL(file);
                            return (
                              <S.ThumbnailWrapper key={`new-${idx}`}>
                                <S.Thumbnail
                                  src={objectUrl}
                                  alt={`Нове фото ${idx + 1}`}
                                />
                                <S.RemoveThumbBtn
                                  type="button"
                                  onClick={() => files?.onRemove(idx)}
                                >
                                  <HiXMark size={14} />
                                </S.RemoveThumbBtn>
                              </S.ThumbnailWrapper>
                            );
                          })}
                        </S.ImageGallery>
                      )}
                    </S.FileUploadContainer>
                  </S.FormGroup>

                  <S.FormGroup>
                    <S.Label>
                      <HiDocumentText
                        style={{ marginRight: "4px", verticalAlign: "middle" }}
                      />
                      {t("assets:assetForm.label_documents", "Документи (PDF, DOC)")}
                    </S.Label>
                    <S.FileUploadContainer>
                      <S.FileUploadControls>
                        <S.HiddenInput
                          type="file"
                          id="asset-docs"
                          accept=".pdf,.doc,.docx"
                          multiple
                          onChange={documents?.onChange}
                        />
                        <label htmlFor="asset-docs">
                          <Button
                            variation="secondary"
                            as="span"
                            size="small"
                            type="button"
                            style={{
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: "5px",
                            }}
                          >
                            <HiOutlineDocumentPlus />{" "}
                            {t("assets:assetForm.button_add_doc", "Додати документ")}
                          </Button>
                        </label>
                        <S.FileCount>{totalDocs} вибрано</S.FileCount>
                      </S.FileUploadControls>

                      {totalDocs > 0 && (
                        <S.DocList>
                          {(documents?.existing || []).map((doc: any, idx: number) => (
                            <S.DocItem key={`ex-doc-${idx}`}>
                              <S.DocInfo>
                                <HiDocumentText size={18} />
                                <S.DocName title={doc.name}>{doc.name}</S.DocName>
                              </S.DocInfo>
                              <S.RemoveDocBtn
                                type="button"
                                onClick={() => documents?.onRemoveExisting(idx)}
                              >
                                <HiXMark size={16} />
                              </S.RemoveDocBtn>
                            </S.DocItem>
                          ))}

                          {(documents?.list || []).map((doc: File, idx: number) => (
                            <S.DocItem key={`new-doc-${idx}`}>
                              <S.DocInfo>
                                <HiDocumentText size={18} />
                                <S.DocName title={doc.name}>{doc.name}</S.DocName>
                              </S.DocInfo>
                              <S.RemoveDocBtn
                                type="button"
                                onClick={() => documents?.onRemove(idx)}
                              >
                                <HiXMark size={16} />
                              </S.RemoveDocBtn>
                            </S.DocItem>
                          ))}
                        </S.DocList>
                      )}
                    </S.FileUploadContainer>
                  </S.FormGroup>
                </S.Grid>
              </S.Column>
            )}
          </S.StyledForm>
        </S.ScrollArea>

        <S.FormFooter>
          {currentStep === 1 ? (
            <>
              <Button
                variation="secondary"
                type="button"
                onClick={handleCloseAttempt}
              >
                {t("common:common.cancel")}
              </Button>
              <Button type="button" onClick={nextStep}>
                {t("common:common.next")}
              </Button>
            </>
          ) : (
            <>
              <Button variation="secondary" type="button" onClick={prevStep}>
                {t("common:common.return")}
              </Button>
              <Button
                type="submit"
                form="asset-form"
                disabled={isSubmitting || files?.isCompressing}
              >
                {isSubmitting
                  ? t("common:common.saving")
                  : assetToEdit
                    ? t("common:shared.save_changes")
                    : t("common:common.add")}
              </Button>
            </>
          )}
        </S.FormFooter>
      </S.FormContainer>
    </>
  );
}
