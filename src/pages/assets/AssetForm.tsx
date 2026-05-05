import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Controller, useWatch } from "react-hook-form";
import {
  HiPaperClip,
  HiXMark,
  HiHome,
  HiTruck,
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
}: {
  value: string;
  onChange: (val: string) => void;
  options: SelectOption[];
  placeholder?: string;
}) {
  const currentLabel = options.find((o) => o.value === value)?.label;
  return (
    <BaseSelect
      triggerLabel={currentLabel}
      placeholder={placeholder}
      onClear={value ? () => onChange("") : undefined}
    >
      <S.SelectOptions>
        {options.map((option) => (
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

  // 🔥 Витягуємо об'єкт documents з хука
  const { form, files, documents, actions, t, isDirty } = useAssetForm({
    assetToEdit,
    onCloseModal,
  });

  const { register, control, handleSubmit, isSubmitting } = form;

  const watchedType = useWatch({ control, name: "type" });
  const isCar = watchedType === "car";
  const isRealEstate = watchedType === "real_estate";
  const showStandardDetails = !isCar && !isRealEstate;

  const handleCloseAttempt = () => {
    isDirty ? setShowConfirm(true) : onCloseModal?.();
  };

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        showConfirm ? setShowConfirm(false) : handleCloseAttempt();
      }
    };
    document.addEventListener("keydown", handleEsc, true);
    return () => document.removeEventListener("keydown", handleEsc, true);
  }, [showConfirm, isDirty]);

  const totalFiles = files.existing.length + files.list.length;
  const totalDocs = documents.existing.length + documents.list.length;

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

      <S.FormContainer as="form" onSubmit={handleSubmit(actions.onSubmit)}>
        <S.FormHeader>
          <S.FormTitle>
            {assetToEdit ? t("assets:assetForm.title_edit") : t("assets:assetForm.title_new")}
          </S.FormTitle>
        </S.FormHeader>

        <S.ScrollArea>
          <S.Grid columns="1fr 2fr">
            <S.FormGroup>
              <S.Label>{t("assets:assetForm.label_type")}</S.Label>
              <Controller
                name="type"
                control={control}
                render={({ field }) => (
                  <SimpleSelect
                    {...field}
                    placeholder={t("assets:assetForm.placeholder_type")}
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
            </S.FormGroup>

            <S.FormGroup>
              <S.Label>{t("assets:assetForm.label_name")}</S.Label>
              <Input
                type="text"
                {...register("name", { required: true })}
                placeholder={t("assets:assetForm.placeholder_name")}
              />
            </S.FormGroup>
          </S.Grid>

          {isCar && (
            <>
              <S.SectionTitle>
                <HiTruck /> {t("assets:assetForm.section_car_details", "Автомобіль")}
              </S.SectionTitle>
              <S.Grid columns="1.5fr 1fr 1fr">
                <S.FormGroup>
                  <S.Label>VIN</S.Label>
                  <Input {...register("vin_code")} placeholder="WBA..." />
                </S.FormGroup>
                <S.FormGroup>
                  <S.Label>{t("assets:assetForm.label_mileage", "Пробіг")}</S.Label>
                  <Input type="number" {...register("mileage")} />
                </S.FormGroup>
                <S.FormGroup>
                  <S.Label>
                    {t("assets:assetForm.label_insurance", "Страховка")}
                  </S.Label>
                  <Input type="date" {...register("insurance_expiry")} />
                </S.FormGroup>
              </S.Grid>
              <S.Grid columns="1fr 2fr">
                <S.FormGroup>
                  <S.Label>
                    {t("assets:assetForm.label_last_service", "Останнє ТО")}
                  </S.Label>
                  <Input type="date" {...register("last_service_date")} />
                </S.FormGroup>
                {!assetToEdit && (
                  <div
                    style={{
                      fontSize: "0.8rem",
                      color: "gray",
                      alignSelf: "center",
                      paddingTop: "1rem",
                    }}
                  >
                    ℹ️{" "}
                    {t(
                      "assetForm.hint_initial_mileage",
                      "Початковий пробіг буде встановлено автоматично.",
                    )}
                  </div>
                )}
              </S.Grid>
            </>
          )}

          {isRealEstate && (
            <>
              <S.SectionTitle>
                <HiHome /> {t("assets:assetForm.section_re_details", "Нерухомість")}
              </S.SectionTitle>
              <S.Grid columns="2fr 1fr 1fr">
                <S.FormGroup>
                  <S.Label>{t("assets:assetForm.label_address", "Адреса")}</S.Label>
                  <Input {...register("address")} />
                </S.FormGroup>
                <S.FormGroup>
                  <S.Label>{t("assets:assetForm.label_area", "Площа (м²)")}</S.Label>
                  <Input type="number" step="0.01" {...register("area")} />
                </S.FormGroup>
                <S.FormGroup>
                  <S.Label>
                    {t("assets:assetForm.label_cadastral", "Кадастр #")}
                  </S.Label>
                  <Input {...register("cadastral_num")} />
                </S.FormGroup>
              </S.Grid>
            </>
          )}

          <S.SectionTitle>
            <HiBanknotes /> {t("assets:assetForm.section_finance", "Деталі")}
          </S.SectionTitle>

          <S.Grid columns="1fr 0.8fr 1fr">
            <S.FormGroup>
              <S.Label>{t("assets:assetForm.label_price")}</S.Label>
              <Input
                type="number"
                step="0.01"
                {...register("price", { required: true })}
              />
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
                {...register("purchase_date", { required: true })}
              />
            </S.FormGroup>
          </S.Grid>

          {showStandardDetails && (
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
          )}

          <S.FormGroup>
            <S.Label>{t("assets:assetForm.label_note", "Примітка")}</S.Label>
            <Input
              as="textarea"
              rows={2}
              {...register("note")}
              style={{ paddingTop: "8px", resize: "none" }}
            />
          </S.FormGroup>

          <S.Grid columns="1fr 1fr" style={{ marginTop: "1rem" }}>
            {/* --- СЕКЦІЯ ФОТОГРАФІЙ --- */}
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
                    onChange={files.onChange}
                  />

                  {files.isCompressing ? (
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
                        Завантаження...
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

                  {!files.isCompressing && (
                    <S.FileCount>{totalFiles} вибрано</S.FileCount>
                  )}
                </S.FileUploadControls>

                {totalFiles > 0 && (
                  <S.ImageGallery>
                    {files.existing.map((f: any, idx: number) => {
                      const fullUrl = getUploadedFileUrl(f.path);

                      return (
                        <S.ThumbnailWrapper key={`ex-${idx}`}>
                          <S.Thumbnail src={fullUrl} alt={`Фото ${idx + 1}`} />
                          <S.RemoveThumbBtn
                            type="button"
                            onClick={() => files.onRemoveExisting(idx)}
                          >
                            <HiXMark size={14} />
                          </S.RemoveThumbBtn>
                        </S.ThumbnailWrapper>
                      );
                    })}
                    {files.list.map((file, idx) => {
                      const objectUrl = URL.createObjectURL(file);
                      return (
                        <S.ThumbnailWrapper key={`new-${idx}`}>
                          <S.Thumbnail
                            src={objectUrl}
                            alt={`Нове фото ${idx + 1}`}
                          />
                          <S.RemoveThumbBtn
                            type="button"
                            onClick={() => files.onRemove(idx)}
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

            {/* --- 🔥 СЕКЦІЯ ДОКУМЕНТІВ --- */}
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
                    onChange={documents.onChange}
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
                    {/* Існуючі документи з БД */}
                    {documents.existing.map((doc, idx) => (
                      <S.DocItem key={`ex-doc-${idx}`}>
                        <S.DocInfo>
                          <HiDocumentText size={18} />
                          <S.DocName title={doc.name}>{doc.name}</S.DocName>
                        </S.DocInfo>
                        <S.RemoveDocBtn
                          type="button"
                          onClick={() => documents.onRemoveExisting(idx)}
                        >
                          <HiXMark size={16} />
                        </S.RemoveDocBtn>
                      </S.DocItem>
                    ))}

                    {/* Нові документи, які щойно обрали */}
                    {documents.list.map((doc, idx) => (
                      <S.DocItem key={`new-doc-${idx}`}>
                        <S.DocInfo>
                          <HiDocumentText size={18} />
                          <S.DocName title={doc.name}>{doc.name}</S.DocName>
                        </S.DocInfo>
                        <S.RemoveDocBtn
                          type="button"
                          onClick={() => documents.onRemove(idx)}
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
        </S.ScrollArea>

        <S.FormFooter>
          <Button
            variation="secondary"
            type="button"
            onClick={handleCloseAttempt}
          >
            {t("common:common.cancel")}
          </Button>
          <Button type="submit" disabled={isSubmitting || files.isCompressing}>
            {isSubmitting
              ? t("common:common.saving")
              : assetToEdit
                ? t("common:shared.save_changes")
                : t("common:common.add")}
          </Button>
        </S.FormFooter>
      </S.FormContainer>
    </>
  );
}
