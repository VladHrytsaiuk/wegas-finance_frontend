import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import {
  HiHashtag,
  HiTag,
  HiCheck,
  HiPaperClip,
} from "react-icons/hi2";

import { BaseSelect } from "../../ui/Select/BaseSelect";
import { focusNextElement } from "../../../utils/focusUtils";
import { type CreateAssetOnFlyInput } from "../../../services/apiTransactions";
import * as S from "./AssetSelector.styles";
import { Input } from "../../ui/Input";
import { isModifierPressed } from "../../../utils/platform";

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

  const [draftDate, setDraftDate] = useState<string | null>(null);
  const localDate =
    draftDate !== null
      ? draftDate
      : newAsset?.warranty_end
        ? format(new Date(newAsset.warranty_end), "yyyy-MM-dd")
        : "";

  const ASSET_TYPES = [
    { value: "electronics", label: t("assets:assetForm.type_electronics") },
    { value: "furniture", label: t("assets:assetForm.type_furniture") },
    { value: "real_estate", label: t("assets:assetForm.type_real_estate") },
    { value: "car", label: t("assets:assetForm.type_car") },
    { value: "other", label: t("assets:assetForm.type_other") },
  ];

  const handleNewAssetChange = (
    field: keyof CreateAssetOnFlyInput,
    value: CreateAssetOnFlyInput[keyof CreateAssetOnFlyInput],
  ) => {
    if (newAsset) setNewAsset({ ...newAsset, [field]: value });
  };

  const handleWarrantyDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const [year] = val.split("-");
    if (year && year.length > 4) return;

    setDraftDate(val);

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
    if (isModifierPressed(e) && e.code === "KeyS") {
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

  return (
    <S.FlyFormWrapper ref={createFormRef} onKeyDown={handleWrapperKeyDown}>
      <S.FlyFormRow>
        <S.FlyFormGroup style={{ flex: 2 }}>
          <S.FlyLabel>
            <HiTag /> {t("assets:assetForm.label_name")}
          </S.FlyLabel>
          <Input
            autoFocus
            placeholder={t("assets:assetForm.placeholder_name")}
            value={newAsset?.name || ""}
            onChange={(e) => handleNewAssetChange("name", e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </S.FlyFormGroup>

        <S.FlyFormGroup style={{ flex: 1 }}>
          <S.FlyLabel>
            <HiHashtag /> {t("assets:assetForm.label_price")}
          </S.FlyLabel>
          <Input
            type="number"
            placeholder="0.00"
            value={newAsset?.balance || ""}
            onChange={(e) =>
              handleNewAssetChange("balance", parseFloat(e.target.value))
            }
            onKeyDown={handleKeyDown}
          />
        </S.FlyFormGroup>
      </S.FlyFormRow>

      <S.FlyFormRow>
        <S.FlyFormGroup style={{ flex: 1 }}>
          <S.FlyLabel>{t("assets:assetForm.label_type")}</S.FlyLabel>
          <BaseSelect
            options={ASSET_TYPES}
            value={newAsset?.type || "other"}
            onChange={(val) => handleNewAssetChange("type", val)}
          />
        </S.FlyFormGroup>

        <S.FlyFormGroup style={{ flex: 1 }}>
          <S.FlyLabel>{t("assets:assetForm.label_warranty_end")}</S.FlyLabel>
          <Input
            type="date"
            value={localDate}
            onChange={handleWarrantyDateChange}
            onFocus={() => {
              setDraftDate(localDate);
            }}
            onBlur={() => {
              setDraftDate(null);
            }}
          />
        </S.FlyFormGroup>
      </S.FlyFormRow>

      {/* Warranty Files Section */}
      <S.FlyFormGroup>
        <S.FlyLabel>
          <HiPaperClip /> {t("assets:assetForm.label_warranty_files")}
        </S.FlyLabel>
        <S.FilesRow>
          <S.AddFileBtn
            type="button"
            onClick={() => fileInputRef.current?.click()}
          >
            <HiPlus size={20} />
          </S.AddFileBtn>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            hidden
            onChange={handleFilesAdd}
          />
          {newAsset?.warrantyFiles?.map((f, i) => (
            <S.FileBadge key={i}>
              <span>{f.name}</span>
              <button
                type="button"
                onClick={() => {
                  const updated = (newAsset.warrantyFiles || []).filter(
                    (_, idx) => idx !== i,
                  );
                  handleNewAssetChange("warrantyFiles", updated);
                }}
              >
                &times;
              </button>
            </S.FileBadge>
          ))}
        </S.FilesRow>
      </S.FlyFormGroup>

      <S.FlyActions>
        <S.FlyButton
          ref={saveBtnRef}
          $primary
          type="button"
          onClick={() => onFinish(true)}
        >
          <HiCheck /> {t("common:actions.save")}
        </S.FlyButton>
        <S.FlyButton type="button" onClick={() => onFinish(false)}>
          {t("common:actions.cancel")}
        </S.FlyButton>
      </S.FlyActions>
    </S.FlyFormWrapper>
  );
};

const HiPlus = ({ size }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);
