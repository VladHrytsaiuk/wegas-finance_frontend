import { useRef, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import {
  HiOutlineCube,
  HiHashtag,
  HiTag,
  HiCheck,
  HiPaperClip,
  HiTruck, // Іконка для авто
} from "react-icons/hi2";

import { BaseSelect } from "../../ui/Select/BaseSelect";
import { focusNextElement } from "../../../utils/focusUtils";
import { type CreateAssetOnFlyInput } from "../../../services/apiTransactions";
import { isModKeyPressed } from "../../../utils/platform";
import * as S from "./AssetSelector.styles";

interface AssetCreationFormProps {
  newAsset: CreateAssetOnFlyInput | null;
  setNewAsset: (asset: CreateAssetOnFlyInput | null) => void;
  onFinish: (save: boolean) => void;
}

export const AssetCreationForm = ({
  newAsset,
  setNewAsset,
  onFinish,
}: AssetCreationFormProps) => {
  const { t } = useTranslation();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const createFormRef = useRef<HTMLDivElement>(null);
  const saveBtnRef = useRef<HTMLButtonElement>(null);

  const [localDate, setLocalDate] = useState("");
  const isInputFocused = useRef(false);

  useEffect(() => {
    if (isInputFocused.current) return;

    if (newAsset?.warranty_end) {
      const formatted = format(new Date(newAsset.warranty_end), "yyyy-MM-dd");
      setLocalDate(formatted);
    } else {
      setLocalDate("");
    }
  }, [newAsset?.warranty_end]);

  const ASSET_TYPES = [
    { value: "electronics", label: t("assets:assetForm.type_electronics") },
    { value: "furniture", label: t("assets:assetForm.type_furniture") },
    { value: "real_estate", label: t("assets:assetForm.type_real_estate") },
    { value: "car", label: t("assets:assetForm.type_car") },
    { value: "other", label: t("assets:assetForm.type_other") },
  ];

  const handleNewAssetChange = (field: string, value: any) => {
    if (newAsset) setNewAsset({ ...newAsset, [field]: value });
  };

  const handleWarrantyDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const [year] = val.split("-");
    if (year && year.length > 4) return;

    setLocalDate(val);

    if (!newAsset) return;

    if (!val) {
      setNewAsset({ ...newAsset, warranty_end: undefined });
    } else {
      const dateObj = new Date(val);
      if (!isNaN(dateObj.getTime())) {
        setNewAsset({ ...newAsset, warranty_end: dateObj.getTime() });
      }
    }
  };

  const handleFilesAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && newAsset) {
      const newFiles = Array.from(e.target.files);
      const updatedFiles = [...(newAsset.warrantyFiles || []), ...newFiles];
      handleNewAssetChange("warrantyFiles", updatedFiles);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const target = e.target as HTMLElement;
      if (target.tagName === "BUTTON") return;
      focusNextElement(target);
    }
  };

  const handleWrapperKeyDown = (e: React.KeyboardEvent) => {
    if (isModKeyPressed(e) && (e.key === "s" || e.key === "S")) {
      e.preventDefault();
      e.stopPropagation();
      handleSave();
    }
  };

  const handleSave = (e?: React.SyntheticEvent) => {
    e?.preventDefault();
    if (!newAsset?.name) {
      createFormRef.current?.querySelector("input")?.focus();
      return;
    }
    onFinish(true);
    setTimeout(() => {
      if (saveBtnRef.current) focusNextElement(saveBtnRef.current);
    }, 0);
  };

  const handleCancel = (e?: React.SyntheticEvent) => {
    e?.preventDefault();
    onFinish(false);
  };

  return (
    <S.Wrapper ref={createFormRef} onKeyDownCapture={handleWrapperKeyDown}>
      <S.Label>{t("assets:assetSelector.create_title")}</S.Label>
      <S.CreateContainer>
        <S.Row>
          <S.IconBox>
            <HiOutlineCube size={20} />
          </S.IconBox>
          <S.InlineInput
            autoFocus
            placeholder={t("assets:assetForm.placeholder_name")}
            value={newAsset?.name || ""}
            onChange={(e) => handleNewAssetChange("name", e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </S.Row>
        <S.Row>
          <S.IconBox>
            <HiHashtag size={18} />
          </S.IconBox>
          <S.InlineInput
            placeholder={t("assets:assetForm.placeholder_serial")}
            value={newAsset?.serial_number || ""}
            onChange={(e) =>
              handleNewAssetChange("serial_number", e.target.value)
            }
            onKeyDown={handleKeyDown}
          />
        </S.Row>
        <S.Row>
          <S.IconBox>
            <HiTag size={18} />
          </S.IconBox>
          <div style={{ flex: 1 }}>
            <BaseSelect
              placeholder={t("assets:assetForm.placeholder_type")}
              triggerLabel={
                ASSET_TYPES.find((t) => t.value === newAsset?.type)?.label
              }
            >
              {ASSET_TYPES.map((t) => (
                <S.SelectItem
                  key={t.value}
                  type="button"
                  $isActive={newAsset?.type === t.value}
                  onClick={() => handleNewAssetChange("type", t.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleNewAssetChange("type", t.value);
                      e.currentTarget.click();
                    }
                  }}
                >
                  {t.label}
                  {newAsset?.type === t.value && <HiCheck size={16} />}
                </S.SelectItem>
              ))}
            </BaseSelect>
          </div>
        </S.Row>

        {/* 🔥 ПОЛЕ ПРОБІГУ (ТІЛЬКИ ДЛЯ АВТО) */}
        {newAsset?.type === "car" && (
          <S.Row>
            <S.IconBox>
              <HiTruck size={18} />
            </S.IconBox>
            <S.InlineInput
              type="number"
              placeholder={t(
                "assetForm.placeholder_mileage",
                "Початковий пробіг (км)",
              )}
              value={newAsset?.mileage || ""}
              onChange={(e) =>
                handleNewAssetChange("mileage", Number(e.target.value))
              }
              onKeyDown={handleKeyDown}
            />
          </S.Row>
        )}

        <S.Row>
          <div
            style={{ display: "flex", alignItems: "center", gap: 6, flex: 1 }}
          >
            <span
              style={{
                fontSize: "0.8rem",
                color: "var(--color-text-secondary)",
              }}
            >
              {t("assets:assetForm.label_warranty_short", "Гарантія:")}
            </span>
            <S.DateInput
              type="date"
              max="9999-12-31"
              value={localDate}
              onChange={handleWarrantyDateChange}
              onKeyDown={handleKeyDown}
              onFocus={() => (isInputFocused.current = true)}
              onBlur={() => (isInputFocused.current = false)}
            />
          </div>
          <S.UploadButton
            type="button"
            onClick={() => fileInputRef.current?.click()}
            $hasFiles={(newAsset?.warrantyFiles?.length || 0) > 0}
            title={t("assets:assetForm.button_add_files")}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,.pdf"
              style={{ display: "none" }}
              onChange={handleFilesAdd}
            />
            <HiPaperClip size={16} />
            {(newAsset?.warrantyFiles?.length || 0) > 0 && (
              <S.FileCountBadge>
                {newAsset?.warrantyFiles?.length}
              </S.FileCountBadge>
            )}
          </S.UploadButton>
        </S.Row>
        <S.ButtonsRow>
          <S.ActionButton
            type="button"
            $variant="secondary"
            onClick={handleCancel}
          >
            {t("assets:assetForm.button_cancel")}
          </S.ActionButton>
          <S.ActionButton
            ref={saveBtnRef}
            type="button"
            $variant="primary"
            onClick={handleSave}
          >
            {t("assets:assetForm.button_save")}
          </S.ActionButton>
        </S.ButtonsRow>
      </S.CreateContainer>
    </S.Wrapper>
  );
};
