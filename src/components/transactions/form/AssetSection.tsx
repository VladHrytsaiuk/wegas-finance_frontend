import React, { memo } from "react";
import { HiChevronDown, HiChevronUp, HiCube, HiExclamationTriangle, HiTruck } from "react-icons/hi2";
import { useTranslation } from "react-i18next";

import { AssetSelector } from "./AssetSelector";
import * as S from "./styles";
import type { CreateAssetOnFlyInput } from "../../../services/apiTransactions";

interface AssetSectionProps {
  transactionType: string;
  isOpen: boolean;
  assetId: string;
  newAsset: CreateAssetOnFlyInput | null;
  setAssetId: (value: string) => void;
  setNewAsset: (value: CreateAssetOnFlyInput | null) => void;
  transactionDate: number;
  mileage: string;
  setMileage: (value: string) => void;
  onToggle: () => void;
  onToggleKeyDown: (e: React.KeyboardEvent) => void;
  isCarSelected: boolean;
  currentMileage?: number | null;
}

function AssetSectionComponent({
  transactionType,
  isOpen,
  assetId,
  newAsset,
  setAssetId,
  setNewAsset,
  transactionDate,
  mileage,
  setMileage,
  onToggle,
  onToggleKeyDown,
  isCarSelected,
  currentMileage,
}: AssetSectionProps) {
  const { t } = useTranslation();

  return (
    <S.AssetSection>
      <S.DetailsTriggerButton
        type="button"
        onClick={onToggle}
        onKeyDown={onToggleKeyDown}
        $desktopVariant="subtle"
      >
        <HiCube />
        {isOpen
          ? t(
              "transactions:transactionForm.hide_asset_option",
              "Прибрати актив",
            )
          : t(
              "transactions:transactionForm.add_asset_option",
              "Додати актив",
            )}
        {isOpen ? <HiChevronUp /> : <HiChevronDown />}
      </S.DetailsTriggerButton>

      {isOpen && (
        <S.AssetContentWrapper>
          <AssetSelector
            transactionType={transactionType}
            assetId={assetId}
            setAssetId={setAssetId}
            newAsset={newAsset}
            setNewAsset={setNewAsset}
            transactionDate={transactionDate}
          />

          {isCarSelected && (
            <S.AssetMileageContainer>
              <S.Label>
                <S.AssetMileageLabelInner>
                  <HiTruck />
                  {t(
                    "transactions:transactionForm.label_mileage",
                    "Пробіг (км)",
                  )}
                </S.AssetMileageLabelInner>
              </S.Label>

              <S.AssetMileageInput
                type="number"
                placeholder={`Поточний: ${currentMileage || 0} км`}
                value={mileage}
                onChange={(e) => setMileage(e.target.value)}
              />

              {mileage && Number(mileage) > (currentMileage || 0) ? (
                <S.AssetWarningBlock>
                  <S.AssetWarningIconWrapper>
                    <HiExclamationTriangle size={20} />
                  </S.AssetWarningIconWrapper>
                  <div>
                    <S.AssetWarningTitle>
                      Оновлення даних авто
                    </S.AssetWarningTitle>
                    <span>
                      Ви вказали новий пробіг. Ця транзакція автоматично
                      оновить <b>загальний пробіг</b> та <b>дату останнього ТО</b>{" "}
                      в картці активу.
                    </span>
                  </div>
                </S.AssetWarningBlock>
              ) : (
                mileage && (
                  <S.AssetHistoryHint>
                    ℹ️ Це історичний запис (менше поточного {currentMileage} км)
                  </S.AssetHistoryHint>
                )
              )}
            </S.AssetMileageContainer>
          )}
        </S.AssetContentWrapper>
      )}
    </S.AssetSection>
  );
}

export const AssetSection = memo(
  AssetSectionComponent,
  (prev, next) =>
    prev.transactionType === next.transactionType &&
    prev.isOpen === next.isOpen &&
    prev.assetId === next.assetId &&
    prev.newAsset === next.newAsset &&
    prev.setAssetId === next.setAssetId &&
    prev.setNewAsset === next.setNewAsset &&
    prev.transactionDate === next.transactionDate &&
    prev.mileage === next.mileage &&
    prev.setMileage === next.setMileage &&
    prev.onToggle === next.onToggle &&
    prev.onToggleKeyDown === next.onToggleKeyDown &&
    prev.isCarSelected === next.isCarSelected &&
    prev.currentMileage === next.currentMileage,
);

AssetSection.displayName = "AssetSection";
