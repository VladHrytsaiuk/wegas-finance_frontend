import React, { memo } from "react";
import { HiArrowsUpDown, HiLockClosed } from "react-icons/hi2";
import { useTranslation } from "react-i18next";

import { AccountSelect } from "../../accounts/form/AccountSelect";
import { AmountInput } from "../../ui/AmountInput";
import * as S from "./styles";

interface AccountLike {
  id: string | number;
  currency?: string;
}

interface UserLike {
  id: string | number;
}

interface TransferSectionProps {
  accounts: AccountLike[];
  users: UserLike[];
  sourceAccountId: string;
  targetAccountId: string;
  sourceCurrency?: string;
  targetCurrency?: string;
  isTransferLocked: boolean;
  isMultiCurrency: boolean;
  localTargetAmount: string;
  targetAmountError?: string;
  targetAccountError?: string;
  exchangeRate: string | null;
  onSwap: () => void;
  onTargetAccountChange: (value: string) => void;
  onTargetAmountChange: (value: string) => void;
}

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

function TransferSectionComponent({
  accounts,
  users,
  sourceAccountId,
  targetAccountId,
  sourceCurrency,
  targetCurrency,
  isTransferLocked,
  isMultiCurrency,
  localTargetAmount,
  targetAmountError,
  targetAccountError,
  exchangeRate,
  onSwap,
  onTargetAccountChange,
  onTargetAmountChange,
}: TransferSectionProps) {
  const { t } = useTranslation();

  return (
    <>
      <S.TransferSwapRow>
        <S.TransferSwapButton
          type="button"
          onClick={onSwap}
          disabled={isTransferLocked || !sourceAccountId || !targetAccountId}
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
              isTransferLocked ? { pointerEvents: "none", opacity: 0.8 } : {}
            }
          >
            <AccountSelect
              accounts={accounts.filter(
                (a) => String(a.id) !== String(sourceAccountId),
              )}
              users={users}
              value={targetAccountId}
              onChange={onTargetAccountChange}
              placeholder={t(
                "transactions:transactionForm.placeholder_select_account",
              )}
              hasError={!!targetAccountError}
            />
          </div>
          {targetAccountError && <S.ErrorText>{targetAccountError}</S.ErrorText>}
        </div>

        {isMultiCurrency && (
          <S.InputWrapper>
            <S.Label>
              <S.AmountLabelInner>
                <span>
                  {t("transactions:transactionForm.label_received_amount")}
                </span>
                <S.RequiredStar> *</S.RequiredStar>
                {isTransferLocked && <HiLockClosed />}
                {targetCurrency && (
                  <S.CurrencyHint>({targetCurrency})</S.CurrencyHint>
                )}
              </S.AmountLabelInner>
            </S.Label>
            <AmountInput
              value={localTargetAmount}
              onChange={onTargetAmountChange}
              disabled={isTransferLocked}
              hasError={!!targetAmountError}
              placeholder="0.00"
            />
            {targetAmountError && <S.ErrorText>{targetAmountError}</S.ErrorText>}
            {exchangeRate && (
              <S.ExchangeRateHint>
                1 {sourceCurrency} ≈ {exchangeRate} {targetCurrency}
              </S.ExchangeRateHint>
            )}
          </S.InputWrapper>
        )}
      </S.RowGroup>
    </>
  );
}

export const TransferSection = memo(
  TransferSectionComponent,
  (prev, next) =>
    prev.accounts === next.accounts &&
    prev.users === next.users &&
    prev.sourceAccountId === next.sourceAccountId &&
    prev.targetAccountId === next.targetAccountId &&
    prev.sourceCurrency === next.sourceCurrency &&
    prev.targetCurrency === next.targetCurrency &&
    prev.isTransferLocked === next.isTransferLocked &&
    prev.isMultiCurrency === next.isMultiCurrency &&
    prev.localTargetAmount === next.localTargetAmount &&
    prev.targetAmountError === next.targetAmountError &&
    prev.targetAccountError === next.targetAccountError &&
    prev.exchangeRate === next.exchangeRate &&
    prev.onSwap === next.onSwap &&
    prev.onTargetAccountChange === next.onTargetAccountChange &&
    prev.onTargetAmountChange === next.onTargetAmountChange,
);

TransferSection.displayName = "TransferSection";
