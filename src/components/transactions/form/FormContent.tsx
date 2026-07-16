import React, { useMemo, useEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  HiArrowsUpDown,
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
import { getShortcutLabel } from "../../../utils/platform";

// Context & Services
import { useSettings } from "../../../context/SettingsContext";
import { getAccountsApi } from "../../../services/apiAccounts";
import { getCategoriesApi } from "../../../services/apiCategories";
import { getCounterpartiesApi } from "../../../services/apiCounterparties";
import { getTagsApi, createTagApi } from "../../../services/apiTags";
import { getAssets } from "../../../services/apiAssets";
import { getUsersApi } from "../../../services/apiUsers";
import type { CreateAssetOnFlyInput } from "../../../services/apiTransactions";
import type { TransactionItem } from "../../../types";

// UI Components
import { Button } from "../../ui/Button";
import Spinner from "../../ui/Spinner";
import { CenteredSpinner } from "../../ui/CenteredSpinner";
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
import { useIsMobile } from "../../../hooks/useIsMobile";

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
  state: FormContentState;
  actions: FormContentActions;
  handlers: FormContentHandlers;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onCloseModal?: () => void;
  modalRef: React.RefObject<HTMLDivElement>;
}

type TransactionFormState = {
  type: string;
  accountId: string;
  targetAccountId: string;
  categoryId: string;
  counterpartyId: string;
  date: string;
  note: string;
  amountStr: string;
  items: TransactionItem[];
  tagIds: string[];
  assetId: string;
  newAsset: CreateAssetOnFlyInput | null;
  isAssetPanelOpen: boolean;
  mileage: string;
};

type FormContentState = {
  form: TransactionFormState;
  localAmount: string;
  localTargetAmount: string;
  timeStr: string;
  errors: Record<string, string | undefined>;
  showDetails: boolean;
  isSubmitting: boolean;
  isUploading: boolean;
  isCompressing: boolean;
  isDeleting: boolean;
  allPreviewUrls: string[];
  previewIndex: number;
  isEditSession: boolean;
  isViewerOpen: boolean;
  isClearModalOpen: boolean;
  isDirty: boolean;
};

type FormContentActions = {
  setType: (value: string) => void;
  setAccountId: (value: string) => void;
  setTargetAccountId: (value: string) => void;
  setCategoryId: (value: string) => void;
  setCounterpartyId: (value: string) => void;
  setDate: (value: string) => void;
  setTagIds: (value: string[]) => void;
  setAssetId: (value: string) => void;
  setNewAsset: (value: CreateAssetOnFlyInput | null) => void;
  setMileage: (value: string) => void;
  setLocalAmount: (value: string) => void;
  setLocalTargetAmount: (value: string) => void;
  setTimeStr: (value: string) => void;
  setShowDetails: (value: boolean) => void;
  setPreviewIndex: React.Dispatch<React.SetStateAction<number>>;
  setIsViewerOpen: (value: boolean) => void;
  clearError: (field: string) => void;
  toggleAssetPanel: () => void;
  createEnterHandler: (
    action: () => void,
  ) => (e: React.KeyboardEvent) => void;
};

type FormContentHandlers = {
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

export const FormContent: React.FC<FormContentProps> = ({
  state,
  actions,
  handlers,
  fileInputRef,
  onCloseModal,
  modalRef,
}) => {
  const { t } = useTranslation();
  const { currency: baseCurrency } = useSettings();
  const queryClient = useQueryClient();
  const { form } = state;
  const isMobile = useIsMobile();

  const [showAssetUnlinkModal, setShowAssetUnlinkModal] = useState(false);
  const [isMobileAdditionalOpen, setIsMobileAdditionalOpen] = useState(false);

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
    (a) => String(a.id) === String(form.accountId),
  );
  const targetAccount = accounts.find(
    (a) => String(a.id) === String(form.targetAccountId),
  );

  const selectedAsset = assets.find(
    (a) => String(a.id) === String(form.assetId),
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
    () => categories.filter((c) => c.type === form.type),
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

  const handleToggleMobileAdditional = () => {
    setIsMobileAdditionalOpen((prev) => !prev);
  };

  const handleSwapTransferAccounts = useCallback(() => {
    if (!form.accountId || !form.targetAccountId || isTransferLocked) return;

    const previousSourceAccountId = form.accountId;
    const previousSourceAmount = state.localAmount;
    const previousTargetAmount = state.localTargetAmount;

    actions.setAccountId(form.targetAccountId);
    actions.setTargetAccountId(previousSourceAccountId);
    actions.setLocalAmount(previousTargetAmount || previousSourceAmount);
    actions.setLocalTargetAmount(previousSourceAmount);
    actions.clearError("accountId");
    actions.clearError("targetAccountId");
    actions.clearError("amount");
    actions.clearError("targetAmount");
  }, [
    actions,
    form.accountId,
    form.targetAccountId,
    isTransferLocked,
    state.localAmount,
    state.localTargetAmount,
  ]);

  const getTransactionDate = useCallback(() => {
    return form.date ? new Date(form.date).getTime() : Date.now();
  }, [form.date]);

  const additionalSummary = useMemo(() => {
    const bits: string[] = [];

    bits.push(
      `${t("transactions:transactionForm.label_date")} ${format(
        new Date(getTransactionDate()),
        "dd.MM",
      )}`,
    );

    if (state.timeStr) bits.push(state.timeStr);
    if (form.counterpartyId && !isDebt) {
      bits.push(t("transactions:transactionForm.label_counterparty"));
    }
    if (form.tagIds.length > 0) {
      bits.push(
        `${t("transactions:transactionForm.label_tags")}: ${form.tagIds.length}`,
      );
    }
    if (form.items.length > 0) {
      bits.push(
        `${t("transactions:itemsTable.title_details")}: ${form.items.length}`,
      );
    }
    if (form.assetId || form.newAsset || form.isAssetPanelOpen) {
      bits.push(t("transactions:transactionForm.add_asset_option", "Актив"));
    }

    return bits.join(" • ");
  }, [
    form.assetId,
    form.counterpartyId,
    form.isAssetPanelOpen,
    form.items.length,
    form.newAsset,
    form.tagIds.length,
    getTransactionDate,
    isDebt,
    state.timeStr,
    t,
  ]);

  const hasAdditionalSummary = additionalSummary.trim().length > 0;

  if (loadAcc || loadCat || loadCp || loadTags || loadUsers)
    return <CenteredSpinner isContainer />;

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

        {isMobile ? (
          <>
            <S.InputWrapper>
              <S.Label>
                <S.AmountLabelInner>
                  <span>
                    {isMultiCurrency
                      ? t("transactions:transactionForm.label_sent_amount")
                      : t("transactions:transactionForm.label_amount")}
                  </span>
                  <S.RequiredStar> *</S.RequiredStar>
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
                <S.RequiredStar> *</S.RequiredStar>
              </S.Label>
              <div
                style={isLocked ? { pointerEvents: "none", opacity: 0.8 } : {}}
              >
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
          </>
        ) : (
          <>
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
                  <S.RequiredStar> *</S.RequiredStar>
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
                    <S.RequiredStar> *</S.RequiredStar>
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
                  <S.RequiredStar> *</S.RequiredStar>
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
          </>
        )}

        <S.ConditionalFieldsContainer>
          {form.type === "transfer" ? (
            <>
              <S.TransferSwapRow>
                <S.TransferSwapButton
                  type="button"
                  onClick={handleSwapTransferAccounts}
                  disabled={
                    isTransferLocked || !form.accountId || !form.targetAccountId
                  }
                  aria-label={t(
                    "transactions:transactionForm.swap_accounts",
                    "Поміняти рахунки місцями",
                  )}
                  title={t(
                    "transactions:transactionForm.swap_accounts",
                    "Поміняти рахунки місцями",
                  )}
                >
                  <HiArrowsUpDown />
                </S.TransferSwapButton>
              </S.TransferSwapRow>
              <S.RowGroup $columns={isMultiCurrency ? "6fr 4fr" : "1fr"}>
                <div>
                  <S.Label>
                    <LabelWithLock
                      label={t("transactions:transactionForm.label_to_account")}
                      isLocked={isTransferLocked}
                    />
                    <S.RequiredStar> *</S.RequiredStar>
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
                        (a) => String(a.id) !== String(form.accountId),
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
                        <S.RequiredStar> *</S.RequiredStar>
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
            <S.RowGroup
              $columns={
                isMobile
                  ? "1fr"
                  : isDebt
                    ? "2fr 1fr"
                    : "1fr 1fr 1fr"
              }
            >
              {!isDebt && (
                <div>
                  <S.Label>
                    {t("transactions:transactionForm.label_category")}
                    <S.RequiredStar> *</S.RequiredStar>
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
              {isMobile && form.type !== "transfer" && (
                <div>
                  <S.Label>
                    {t("transactions:transactionForm.label_counterparty")}
                    {isDebt ? (
                      <S.RequiredStar> *</S.RequiredStar>
                    ) : (
                      <S.OptionalHint>необов'язково</S.OptionalHint>
                    )}
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
              )}
              {(isDebt || !isMobile) && (
                <div>
                  <S.Label>
                    {t("transactions:transactionForm.label_counterparty")}
                    {isDebt ? (
                      <S.RequiredStar> *</S.RequiredStar>
                    ) : (
                      <S.OptionalHint>необов'язково</S.OptionalHint>
                    )}
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
              )}
              {!isMobile && (
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
              )}
            </S.RowGroup>
          )}
        </S.ConditionalFieldsContainer>

        {isMobile && (
          <div>
            <S.Label>
              {t("transactions:transactionForm.label_comment")}
              <S.OptionalHint>необов'язково</S.OptionalHint>
            </S.Label>
            <S.StyledTextarea
              rows={2}
              placeholder={t(
                form.type === "transfer"
                  ? "transactions:transactionForm.placeholder_note_transfer"
                  : "transactions:transactionForm.placeholder_note_default",
              )}
              value={form.note}
              onChange={(e) => actions.setNote(e.target.value)}
            />
          </div>
        )}

        {isMobile && (
          <>
            <S.MobileDisclosureToggle
              $open={isMobileAdditionalOpen}
              role="button"
              tabIndex={0}
              aria-expanded={isMobileAdditionalOpen}
              onClick={handleToggleMobileAdditional}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleToggleMobileAdditional();
                }
              }}
            >
              <S.MobileDisclosureTitleWrap>
                <S.MobileDisclosureTitle>
                  Додатково
                </S.MobileDisclosureTitle>
                {hasAdditionalSummary && (
                  <S.MobileDisclosureSubtitle>
                    {additionalSummary}
                  </S.MobileDisclosureSubtitle>
                )}
              </S.MobileDisclosureTitleWrap>
              {isMobileAdditionalOpen ? <HiChevronUp /> : <HiChevronDown />}
            </S.MobileDisclosureToggle>

            {isMobileAdditionalOpen && (
              <S.MobileDisclosureContent>
                <S.MobileDateTimeRow>
                  <div>
                    <S.Label>
                      <LabelWithLock
                        label={t("transactions:transactionForm.label_date")}
                        isLocked={isLocked}
                      />
                    </S.Label>
                    <div
                      style={isLocked ? { pointerEvents: "none", opacity: 0.7 } : {}}
                    >
                      <DateRangePicker
                        mode="single"
                        date={form.date ? new Date(form.date).getTime() : null}
                        onDateChange={(ts) => {
                          actions.setDate(format(new Date(ts), "yyyy-MM-dd"));
                          actions.clearError("date");
                        }}
                      />
                    </div>
                    {state.errors.date && (
                      <S.ErrorText>{state.errors.date}</S.ErrorText>
                    )}
                  </div>
                  <div>
                    <S.Label>
                      <LabelWithLock
                        label={t("transactions:transactionForm.label_time")}
                        isLocked={isLocked}
                      />
                    </S.Label>
                    <div
                      style={isLocked ? { pointerEvents: "none", opacity: 0.7 } : {}}
                    >
                      <TimePicker
                        value={state.timeStr}
                        onChange={actions.setTimeStr}
                      />
                    </div>
                  </div>
                </S.MobileDateTimeRow>
                {form.type !== "transfer" && (
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
                )}

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
              </S.MobileDisclosureContent>
            )}
          </>
        )}

        {!isMobile && !isDebt && form.type !== "transfer" && (
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

        {!isMobile && form.type === "expense" && (
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
            ref={fileInputRef}
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
              <S.UploadIconButton
                as="span"
                $hasFiles={state.allPreviewUrls.length > 0}
                aria-label={t(
                  "transactions:transactionForm.add_photo",
                  "Додати фото",
                )}
              >
                {state.allPreviewUrls.length > 0 ? <HiPhoto /> : <HiPaperClip />}
                {state.allPreviewUrls.length > 0 && (
                  <S.UploadBadge>{state.allPreviewUrls.length}</S.UploadBadge>
                )}
              </S.UploadIconButton>
            </S.UploadButtonLabel>
          )}
        </S.FileUploadWrapper>

        <S.FooterNoteWrapper $hiddenOnMobile={isMobile}>
          <S.StyledTextarea
            rows={1}
            placeholder={t(
              form.type === "transfer"
                ? "transactions:transactionForm.placeholder_note_transfer"
                : "transactions:transactionForm.placeholder_note_default",
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
            title={getShortcutLabel("Enter")}
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
