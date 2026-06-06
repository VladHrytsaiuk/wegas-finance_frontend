import React, { useMemo, useEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  HiArrowRight,
  HiListBullet,
  HiPhoto,
  HiChevronDown,
  HiChevronUp,
  HiCube,
  HiLockClosed,
  HiTruck,
  HiExclamationTriangle,
  HiPaperClip,
} from "react-icons/hi2";

// Context & Services
import { useSettings } from "../../../context/SettingsContext";
import { getAccountsApi } from "../../../services/apiAccounts";
import { getCategoriesApi } from "../../../services/apiCategories";
import { getCounterpartiesApi } from "../../../services/apiCounterparties";
import { getTagsApi, createTagApi } from "../../../services/apiTags";
import { getAssets } from "../../../services/apiAssets";
import { getUsersApi } from "../../../services/apiUsers";

// UI Components
import { Button } from "../../ui/Button";
import Spinner from "../../ui/Spinner";
import { TypeSelector } from "./TypeSelector";
import { AccountSelect } from "../../accounts/form/AccountSelect";
import { AmountInput } from "../../ui/AmountInput";
import { CategorySelect } from "../../categories/CategorySelect";
import CounterpartySelect from "../../counterparties/CounterpartySelect";
import TagSelect from "../../tags/TagSelect";
import { DateRangePicker } from "../../ui/DateRangePicker";
import { TimePicker } from "../../ui/TimePicker";
import { ItemsTable } from "./ItemsTable";
import { AssetSelector } from "./AssetSelector";
import { Overlay, StyledModal } from "../../ui/Modal";

import * as S from "./styles";
import toast from "react-hot-toast";

const LabelWithLock = ({
  label,
  isLocked,
}: {
  label: string;
  isLocked?: boolean;
}) => (
  <S.LabelLockWrapper>
    {label}
    {isLocked && (
      <S.LockIconWrapper title="Синхронізовані дані (змінювати заборонено)">
        <HiLockClosed />
      </S.LockIconWrapper>
    )}
  </S.LabelLockWrapper>
);

interface FormContentProps {
  state: any;
  actions: any;
  handlers: any;
  refs: any;
  onCloseModal?: () => void;
  modalRef: React.RefObject<HTMLDivElement>;
}

export const FormContent: React.FC<FormContentProps> = ({
  state,
  actions,
  handlers,
  refs,
  onCloseModal,
  modalRef,
}) => {
  const { t } = useTranslation();
  const { currency: baseCurrency } = useSettings();
  const queryClient = useQueryClient();
  const { form } = state;

  const [showAssetUnlinkModal, setShowAssetUnlinkModal] = useState(false);

  const { data: accounts = [], isLoading: loadAcc } = useQuery({
    queryKey: ["accounts"],
    queryFn: getAccountsApi,
  });
  const { data: categories = [], isLoading: loadCat } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategoriesApi,
  });
  const { data: counterparties = [], isLoading: loadCp } = useQuery({
    queryKey: ["counterparties"],
    queryFn: getCounterpartiesApi,
  });
  const { data: users = [], isLoading: loadUsers } = useQuery({
    queryKey: ["users"],
    queryFn: getUsersApi,
  });
  const { data: tags = [], isLoading: loadTags } = useQuery({
    queryKey: ["tags"],
    queryFn: getTagsApi,
  });
  const { data: assets = [] } = useQuery({
    queryKey: ["assets"],
    queryFn: getAssets,
  });

  const { toggleAssetPanel } = actions;
  const isAssetPanelOpen = form.isAssetPanelOpen;

  useEffect(() => {
    if (form.assetId && !isAssetPanelOpen) {
      toggleAssetPanel();
    }
  }, [form.assetId, isAssetPanelOpen, toggleAssetPanel]);

  const { mutate: createTag, isPending: isCreatingTag } = useMutation({
    mutationFn: createTagApi,
    onSuccess: (newTag) => {
      toast.success(
        t("transactions:transactionForm.alert_tag_create_success", {
          name: newTag.name,
        }),
      );
      queryClient.invalidateQueries({ queryKey: ["tags"] });
      actions.setTagIds([...form.tagIds, newTag.id]);
    },
    onError: () =>
      toast.error(t("transactions:transactionForm.alert_tag_create_error")),
  });

  const activeAccount = accounts.find(
    (a: any) => String(a.id) === String(form.accountId),
  );
  const targetAccount = accounts.find(
    (a: any) => String(a.id) === String(form.targetAccountId),
  );

  const selectedAsset = assets.find(
    (a: any) => String(a.id) === String(form.assetId),
  );
  const isCarSelected = selectedAsset?.type === "car";

  const isSourceSynced = activeAccount?.is_synced;
  const isTargetSynced = targetAccount?.is_synced;

  const isLocked = state.isEditSession && isSourceSynced;
  const isTransferLocked =
    state.isEditSession && (isSourceSynced || isTargetSynced);

  const sourceCurrency = activeAccount?.currency || baseCurrency;
  const targetCurrency = targetAccount?.currency || baseCurrency;

  const isMultiCurrency =
    form.type === "transfer" &&
    form.targetAccountId &&
    sourceCurrency !== targetCurrency;
  const isDebt = [
    "loan_give",
    "loan_repay",
    "debt_take",
    "debt_repay",
  ].includes(form.type);

  const availableCategories = useMemo(
    () => categories.filter((c: any) => c.type === form.type),
    [categories, form.type],
  );

  const exchangeRate = useMemo(() => {
    const sent = parseFloat(state.localAmount);
    const received = parseFloat(state.localTargetAmount);
    if (!sent || !received) return null;
    return (received / sent).toFixed(4);
  }, [state.localAmount, state.localTargetAmount]);

  const handleToggleAssetPanel = () => {
    if (!form.isAssetPanelOpen) {
      actions.toggleAssetPanel();
      return;
    }
    const hasData = form.assetId || form.newAsset || form.mileage;
    if (hasData) {
      setShowAssetUnlinkModal(true);
    } else {
      actions.toggleAssetPanel();
    }
  };

  const confirmUnlinkAsset = () => {
    actions.setAssetId("");
    actions.setNewAsset(null);
    actions.setMileage("");
    actions.toggleAssetPanel();
    setShowAssetUnlinkModal(false);
  };

  const handleSaveKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "Tab" && !e.shiftKey) {
      e.preventDefault();
      if (modalRef.current) {
        const activeTypeBtn = modalRef.current.querySelector(
          'button[data-active="true"]',
        ) as HTMLElement;
        if (activeTypeBtn) {
          activeTypeBtn.focus();
        } else {
          const firstEl = modalRef.current.querySelector(
            "input, select",
          ) as HTMLElement;
          firstEl?.focus();
        }
      }
    }
  };

  const getTransactionDate = useCallback(() => {
    return form.date ? new Date(form.date).getTime() : Date.now();
  }, [form.date]);

  if (loadAcc || loadCat || loadCp || loadTags || loadUsers) return <Spinner />;

  return (
    <>
      {showAssetUnlinkModal &&
        createPortal(
          <Overlay
            onClick={(e) => {
              e.stopPropagation();
              setShowAssetUnlinkModal(false);
            }}
          >
            <StyledModal onClick={(e) => e.stopPropagation()}>
              <S.UnlinkModalContent>
                <S.UnlinkModalIconWrapper>
                  <HiExclamationTriangle size={24} />
                </S.UnlinkModalIconWrapper>
                <div>
                  <S.UnlinkModalTitle>Відв'язати актив?</S.UnlinkModalTitle>
                  <S.UnlinkModalText>
                    Ви ввели дані (пробіг або обрали актив). Якщо ви закриєте це
                    меню, дані будуть втрачені.
                  </S.UnlinkModalText>
                </div>
                <S.UnlinkModalButtons>
                  <Button
                    variation="secondary"
                    onClick={() => setShowAssetUnlinkModal(false)}
                  >
                    Скасувати
                  </Button>
                  <Button variation="danger" onClick={confirmUnlinkAsset}>
                    Відв'язати
                  </Button>
                </S.UnlinkModalButtons>
              </S.UnlinkModalContent>
            </StyledModal>
          </Overlay>,
          document.body,
        )}

      <S.FormScrollArea>
        <div style={isLocked ? { pointerEvents: "none", opacity: 0.7 } : {}}>
          <TypeSelector
            value={form.type}
            onChange={actions.setType}
            disabled={isLocked}
          />
        </div>

        <S.RowGroup $columns="6fr 4fr">
          <div>
            <S.Label>
              <LabelWithLock
                label={
                  form.type === "income"
                    ? t(
                        "transactions:transactionForm.label_income_account",
                        "На рахунок",
                      )
                    : t(
                        "transactions:transactionForm.label_from_account",
                        "З рахунку",
                      )
                }
                isLocked={isLocked}
              />
            </S.Label>
            <div style={isLocked ? { pointerEvents: "none", opacity: 0.8 } : {}}>
              <AccountSelect
                accounts={accounts}
                users={users}
                value={form.accountId}
                onChange={(val: string) => {
                  actions.setAccountId(val);
                  actions.clearError("accountId");
                }}
                hasError={!!state.errors.accountId}
              />
            </div>
            {state.errors.accountId && (
              <S.ErrorText>{state.errors.accountId}</S.ErrorText>
            )}
          </div>

          <S.InputWrapper>
            <S.Label>
              <S.AmountLabelInner>
                <span>
                  {isMultiCurrency
                    ? t("transactions:transactionForm.label_sent_amount")
                    : t("transactions:transactionForm.label_amount")}
                </span>
                {isLocked && (
                  <S.LockIconWrapper title="Синхронізовані дані">
                    <HiLockClosed />
                  </S.LockIconWrapper>
                )}
                {sourceCurrency && (
                  <S.CurrencyHint>({sourceCurrency})</S.CurrencyHint>
                )}
              </S.AmountLabelInner>
            </S.Label>

            <AmountInput
              value={state.localAmount}
              onChange={(val) => actions.setLocalAmount(val)}
              disabled={isLocked}
              hasError={!!state.errors.amount}
              placeholder="0.00"
            />
            {state.errors.amount && (
              <S.ErrorText>{state.errors.amount}</S.ErrorText>
            )}
          </S.InputWrapper>
        </S.RowGroup>

        <S.RowGroup $columns="1fr 120px">
          <div>
            <S.Label>
              <LabelWithLock
                label={t("transactions:transactionForm.label_date")}
                isLocked={isLocked}
              />
            </S.Label>
            <div style={isLocked ? { pointerEvents: "none", opacity: 0.7 } : {}}>
              <DateRangePicker
                mode="single"
                date={form.date ? new Date(form.date).getTime() : null}
                onDateChange={(ts) => {
                  actions.setDate(format(new Date(ts), "yyyy-MM-dd"));
                  actions.clearError("date");
                }}
              />
            </div>
            {state.errors.date && <S.ErrorText>{state.errors.date}</S.ErrorText>}
          </div>
          <div>
            <S.Label>
              <LabelWithLock
                label={t("transactions:transactionForm.label_time")}
                isLocked={isLocked}
              />
            </S.Label>
            <div style={isLocked ? { pointerEvents: "none", opacity: 0.7 } : {}}>
              <TimePicker value={state.timeStr} onChange={actions.setTimeStr} />
            </div>
          </div>
        </S.RowGroup>

        <S.ConditionalFieldsContainer>
          {form.type === "transfer" ? (
            <>
              <S.TransferDetailsHeader>
                <HiArrowRight />{" "}
                {t("transactions:transactionForm.transfer_details_text")}
              </S.TransferDetailsHeader>
              <S.RowGroup $columns={isMultiCurrency ? "6fr 4fr" : "1fr"}>
                <div>
                  <S.Label>
                    <LabelWithLock
                      label={t("transactions:transactionForm.label_to_account")}
                      isLocked={isTransferLocked}
                    />
                  </S.Label>
                  <div
                    style={
                      isTransferLocked
                        ? { pointerEvents: "none", opacity: 0.8 }
                        : {}
                    }
                  >
                    <AccountSelect
                      accounts={accounts.filter(
                        (a: any) => String(a.id) !== String(form.accountId),
                      )}
                      users={users}
                      value={form.targetAccountId}
                      onChange={(val: string) => {
                        actions.setTargetAccountId(val);
                        actions.clearError("targetAccountId");
                      }}
                      placeholder={t(
                        "transactions:transactionForm.placeholder_select_account",
                      )}
                      hasError={!!state.errors.targetAccountId}
                    />
                  </div>
                  {state.errors.targetAccountId && (
                    <S.ErrorText>{state.errors.targetAccountId}</S.ErrorText>
                  )}
                </div>

                {isMultiCurrency && (
                  <S.InputWrapper>
                    <S.Label>
                      <S.AmountLabelInner>
                        <span>
                          {t(
                            "transactions:transactionForm.label_received_amount",
                          )}
                        </span>
                        {isTransferLocked && <HiLockClosed />}
                        {targetCurrency && (
                          <S.CurrencyHint>({targetCurrency})</S.CurrencyHint>
                        )}
                      </S.AmountLabelInner>
                    </S.Label>
                    <AmountInput
                      value={state.localTargetAmount}
                      onChange={(val) => actions.setLocalTargetAmount(val)}
                      disabled={isTransferLocked}
                      hasError={!!state.errors.targetAmount}
                      placeholder="0.00"
                    />
                    {state.errors.targetAmount && (
                      <S.ErrorText>{state.errors.targetAmount}</S.ErrorText>
                    )}
                    {exchangeRate && (
                      <S.ExchangeRateHint>
                        1 {sourceCurrency} ≈ {exchangeRate} {targetCurrency}
                      </S.ExchangeRateHint>
                    )}
                  </S.InputWrapper>
                )}
              </S.RowGroup>
            </>
          ) : (
            <S.RowGroup $columns={isDebt ? "2fr 1fr" : "1fr 1fr 1fr"}>
              {!isDebt && (
                <div>
                  <S.Label>
                    {t("transactions:transactionForm.label_category")}
                  </S.Label>
                  <CategorySelect
                    categories={availableCategories}
                    value={form.categoryId}
                    onChange={(val: string) => {
                      actions.setCategoryId(val);
                      actions.clearError("categoryId");
                    }}
                    hasError={!!state.errors.categoryId}
                  />
                  {state.errors.categoryId && (
                    <S.ErrorText>{state.errors.categoryId}</S.ErrorText>
                  )}
                </div>
              )}
              <div>
                <S.Label>
                  {t("transactions:transactionForm.label_counterparty")}
                  {isDebt && <S.RequiredStar> *</S.RequiredStar>}
                </S.Label>
                <CounterpartySelect
                  counterparties={counterparties}
                  value={form.counterpartyId}
                  onChange={(val: string) => {
                    actions.setCounterpartyId(val);
                    actions.clearError("counterpartyId");
                  }}
                  hasError={!!state.errors.counterpartyId}
                />
                {state.errors.counterpartyId && (
                  <S.ErrorText>{state.errors.counterpartyId}</S.ErrorText>
                )}
              </div>
              <div>
                <S.Label>{t("transactions:transactionForm.label_tags")}</S.Label>
                <TagSelect
                  tags={tags}
                  value={form.tagIds}
                  onChange={actions.setTagIds}
                  onCreate={(name) => createTag({ name, color: "#6366f1" })}
                  isCreating={isCreatingTag}
                />
              </div>
            </S.RowGroup>
          )}
        </S.ConditionalFieldsContainer>

        {!isDebt && form.type !== "transfer" && (
          <S.AssetSection>
            <S.DetailsTriggerButton
              type="button"
              onClick={handleToggleAssetPanel}
              onKeyDown={actions.createEnterHandler(handleToggleAssetPanel)}
            >
              <HiCube />
              {form.isAssetPanelOpen
                ? t(
                    "transactions:transactionForm.hide_asset_option",
                    "Прибрати актив",
                  )
                : t(
                    "transactions:transactionForm.add_asset_option",
                    "Додати актив",
                  )}
              {form.isAssetPanelOpen ? <HiChevronUp /> : <HiChevronDown />}
            </S.DetailsTriggerButton>

            {form.isAssetPanelOpen && (
              <S.AssetContentWrapper>
                <AssetSelector
                  transactionType={form.type}
                  assetId={form.assetId}
                  setAssetId={actions.setAssetId}
                  newAsset={form.newAsset}
                  setNewAsset={actions.setNewAsset}
                  transactionDate={getTransactionDate()}
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
                      placeholder={`Поточний: ${selectedAsset?.mileage || 0} км`}
                      value={form.mileage}
                      onChange={(e) => actions.setMileage(e.target.value)}
                    />

                    {form.mileage &&
                    Number(form.mileage) > (selectedAsset?.mileage || 0) ? (
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
                            оновить <b>загальний пробіг</b> та{" "}
                            <b>дату останнього ТО</b> в картці активу.
                          </span>
                        </div>
                      </S.AssetWarningBlock>
                    ) : (
                      form.mileage && (
                        <S.AssetHistoryHint>
                          ℹ️ Це історичний запис (менше поточного{" "}
                          {selectedAsset?.mileage} км)
                        </S.AssetHistoryHint>
                      )
                    )}
                  </S.AssetMileageContainer>
                )}
              </S.AssetContentWrapper>
            )}
          </S.AssetSection>
        )}

        {form.type === "expense" && (
          <S.ItemsTableContainer>
            {!state.showDetails ? (
              <S.DetailsTriggerButton
                type="button"
                onClick={() => actions.setShowDetails(true)}
              >
                <HiListBullet size={18} />
                <span>
                  {t("transactions:transactionForm.details_button_show")}
                </span>
              </S.DetailsTriggerButton>
            ) : (
              <ItemsTable
                items={form.items}
                actions={actions}
                onClose={() => actions.setShowDetails(false)}
                currencyCode={activeAccount?.currency || baseCurrency}
                categories={availableCategories}
              />
            )}
          </S.ItemsTableContainer>
        )}
      </S.FormScrollArea>

      <S.Footer>
        <S.FileUploadWrapper>
          <S.HiddenFileInput
            ref={refs.fileInputRef}
            type="file"
            id="receipt-upload"
            accept="image/*"
            multiple
            onChange={handlers.handleFileUpload}
            disabled={state.isUploading || state.isCompressing}
          />

          {state.isCompressing ? (
            <S.CompressingState>
              <Spinner size="1.5rem" />
              <S.CompressingText>
                {t("common:common.processing", "Обробка фото...")}
              </S.CompressingText>
            </S.CompressingState>
          ) : (
            <S.UploadButtonLabel htmlFor="receipt-upload">
              <Button
                size="small"
                variation={
                  state.allPreviewUrls.length > 0 ? "primary" : "secondary"
                }
                as="span"
                type="button"
              >
                <S.UploadButtonInner>
                  {state.allPreviewUrls.length > 0 ? (
                    <>
                      <HiPhoto />
                      {state.allPreviewUrls.length}
                    </>
                  ) : (
                    <>
                      <HiPaperClip />
                      {t(
                        "transactions:transactionForm.add_photo",
                        "Додати фото",
                      )}
                    </>
                  )}
                </S.UploadButtonInner>
              </Button>
            </S.UploadButtonLabel>
          )}
        </S.FileUploadWrapper>

        <S.FooterNoteWrapper>
          <S.StyledTextarea
            rows={1}
            placeholder={t(
              "transactions:transactionForm.placeholder_note_default",
            )}
            value={form.note}
            onChange={(e) => actions.setNote(e.target.value)}
          />
        </S.FooterNoteWrapper>

        <S.ButtonsGroup>
          <Button variation="secondary" type="button" onClick={onCloseModal}>
            {t("transactions:transactionForm.button_cancel")}
          </Button>
          <Button
            size="medium"
            disabled={
              state.isSubmitting ||
              state.isUploading ||
              state.isDeleting ||
              state.isCompressing
            }
            type="submit"
            title="Ctrl + Enter"
            onKeyDown={handleSaveKeyDown}
          >
            {state.isEditSession
              ? state.isSubmitting
                ? t("transactions:transactionForm.button_updating")
                : t("transactions:transactionForm.button_update")
              : state.isSubmitting
                ? t("transactions:transactionForm.button_saving")
                : t("transactions:transactionForm.button_save")}
          </Button>
        </S.ButtonsGroup>
      </S.Footer>
    </>
  );
};
