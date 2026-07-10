import { useTranslation } from "react-i18next";
import {
  HiOutlineCube,
  HiPlus,
  HiCheck,
  HiPencil,
} from "react-icons/hi2";

import { useAssetSelector } from "../../../hooks/Assets/useAssetSelector";
import { AssetCreationForm } from "./AssetCreationForm";
import * as S from "./AssetSelector.styles";
import { BaseSelect } from "../../ui/Select/BaseSelect";
import type { CreateAssetOnFlyInput } from "../../../services/apiTransactions";
import type { Asset, TransactionType } from "../../../types";

interface AssetSelectorProps {
  transactionType: TransactionType | "transfer";
  assetId: string;
  setAssetId: (value: string) => void;
  newAsset: CreateAssetOnFlyInput | null;
  setNewAsset: (value: CreateAssetOnFlyInput | null) => void;
  transactionDate?: number;
}

export const AssetSelector = ({
  transactionType,
  assetId,
  setAssetId,
  newAsset,
  setNewAsset,
  transactionDate,
}: AssetSelectorProps) => {
  const { t } = useTranslation();

  const { state, actions } = useAssetSelector({
    assetId,
    setAssetId,
    newAsset,
    setNewAsset,
    transactionDate,
  });

  if (transactionType === "transfer") return null;

  if (state.isEditing) {
    return (
      <AssetCreationForm
        newAsset={newAsset}
        setNewAsset={setNewAsset}
        onFinish={actions.handleFinishEditing}
      />
    );
  }

  const triggerLabel = newAsset ? (
    <div
      style={{
        display: "flex",
        gap: 8,
        alignItems: "center",
        color: "var(--color-brand-600)",
        fontWeight: 500,
      }}
    >
      <HiPlus size={16} /> {newAsset.name}
    </div>
  ) : assetId && state.selectedAssetName ? (
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      <HiOutlineCube /> {state.selectedAssetName}
    </div>
  ) : null;

  return (
    <BaseSelect
      triggerLabel={triggerLabel}
      placeholder={t("assets:assetSelector.placeholder")}
      onClear={assetId || newAsset ? () => {
        setAssetId("");
        setNewAsset(null);
      } : undefined}
      searchValue={state.search}
      onSearchChange={actions.setSearch}
      menuWidth="350px"
    >
      <S.List>
        {newAsset && (
          <S.SelectItem
            type="button"
            $isDraft
            onClick={actions.handleStartCreate}
          >
            <div
              style={{ display: "flex", gap: 8, alignItems: "center" }}
            >
              <HiPencil size={16} /> {t("assets:assetSelector.edit_draft")}:{" "}
              {newAsset.name}
            </div>
          </S.SelectItem>
        )}

        {state.filteredAssets.map((asset: Asset) => (
          <S.SelectItem
            key={asset.id}
            type="button"
            $isActive={String(asset.id) === String(assetId)}
            onClick={() => actions.handleSelectAsset(asset.id)}
          >
            <div style={{ display: "flex", gap: 8 }}>
              <HiOutlineCube size={16} /> {asset.name}
            </div>
            {String(asset.id) === String(assetId) && (
              <HiCheck size={16} />
            )}
          </S.SelectItem>
        ))}

        {state.filteredAssets.length === 0 && !newAsset && (
          <S.EmptyState>
            {state.search
              ? t("assets:assetSelector.press_enter_create")
              : t("assets:assetSelector.list_empty")}
          </S.EmptyState>
        )}

        {state.search &&
          !state.filteredAssets.some(
            (a: Asset) =>
              a.name.toLowerCase() === state.search.toLowerCase(),
          ) && (
            <S.CreateActionBtn
              type="button"
              onClick={actions.handleStartCreate}
            >
              <HiPlus size={16} />{" "}
              {t("assets:assetSelector.btn_create_named", {
                name: state.search,
              })}
            </S.CreateActionBtn>
          )}
      </S.List>
    </BaseSelect>
  );
};
