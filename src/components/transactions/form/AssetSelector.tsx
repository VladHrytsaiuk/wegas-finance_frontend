import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import {
  HiOutlineCube,
  HiPlus,
  HiCheck,
  HiPencil,
  HiMagnifyingGlass,
  HiXMark,
  HiChevronDown,
} from "react-icons/hi2";

import { useAssetSelector } from "../../../hooks/Assets/useAssetSelector";
import { AssetCreationForm } from "./AssetCreationForm";
import * as S from "./AssetSelector.styles";

export const AssetSelector = ({
  transactionType,
  assetId,
  setAssetId,
  newAsset,
  setNewAsset,
  transactionDate,
}: any) => {
  const { t } = useTranslation();

  const { state, actions, refs } = useAssetSelector({
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

  return (
    <S.Wrapper ref={refs.triggerRef}>
      <S.Trigger
        ref={refs.triggerBtnRef}
        // 🔥 ВИПРАВЛЕННЯ ТУТ:
        // 1. Прибрали type="button"
        // 2. Додали role="button" (для семантики)
        // 3. Додали tabIndex={0} (щоб працював Tab)
        role="button"
        tabIndex={0}
        $isOpen={state.isOpen}
        onClick={() => actions.setIsOpen(!state.isOpen)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
            e.preventDefault();
            actions.setIsOpen(!state.isOpen);
          }
        }}
      >
        <S.ContentWrapper>
          {newAsset ? (
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
          ) : (
            <S.Placeholder>{t("assetSelector.placeholder")}</S.Placeholder>
          )}
        </S.ContentWrapper>

        <S.IconWrapper>
          {(assetId || newAsset) && (
            <S.ClearButton
              // Ця кнопка тепер всередині DIV, це легально в HTML
              type="button"
              tabIndex={-1}
              onClick={(e) => {
                e.stopPropagation();
                setAssetId("");
                setNewAsset(null);
                refs.triggerBtnRef.current?.focus();
              }}
            >
              <HiXMark size={16} />
            </S.ClearButton>
          )}
          <HiChevronDown
            size={16}
            style={{
              transform: state.isOpen ? "rotate(180deg)" : "rotate(0)",
              transition: "transform 0.2s",
            }}
          />
        </S.IconWrapper>
      </S.Trigger>

      {state.isOpen &&
        createPortal(
          <S.PortalMenu
            ref={refs.menuRef}
            onKeyDown={actions.handleMenuKeyDown}
            style={{
              top: state.style.top,
              left: state.style.left,
              width:
                typeof state.style.width === "number"
                  ? `${state.style.width}px`
                  : state.style.width || "100%",
              minWidth: "250px",
              maxHeight: "350px",
              overflow: "hidden",
            }}
          >
            {/* ... вміст меню без змін ... */}
            <S.SearchWrapper>
              <S.SearchInputContainer>
                <HiMagnifyingGlass
                  style={{
                    position: "absolute",
                    left: "8px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#9ca3af",
                  }}
                />
                <S.SearchInput
                  ref={refs.searchInputRef}
                  value={state.search}
                  onChange={(e) => actions.setSearch(e.target.value)}
                  placeholder={t("assetSelector.search_placeholder")}
                  autoComplete="off"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && state.search) {
                      e.preventDefault();
                      actions.handleStartCreate();
                    }
                    e.stopPropagation();
                  }}
                />
              </S.SearchInputContainer>
            </S.SearchWrapper>

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
                    <HiPencil size={16} /> {t("assetSelector.edit_draft")}:{" "}
                    {newAsset.name}
                  </div>
                </S.SelectItem>
              )}

              {state.filteredAssets.map((asset: any) => (
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
                    ? t("assetSelector.press_enter_create")
                    : t("assetSelector.list_empty")}
                </S.EmptyState>
              )}

              {state.search &&
                !state.filteredAssets.some(
                  (a: any) =>
                    a.name.toLowerCase() === state.search.toLowerCase(),
                ) && (
                  <S.CreateActionBtn
                    type="button"
                    onClick={actions.handleStartCreate}
                  >
                    <HiPlus size={16} />{" "}
                    {t("assetSelector.btn_create_named", {
                      name: state.search,
                    })}
                  </S.CreateActionBtn>
                )}
            </S.List>
          </S.PortalMenu>,
          document.body,
        )}
    </S.Wrapper>
  );
};
