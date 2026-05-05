import React from "react";
import { useTranslation } from "react-i18next";
import { HiLockClosed } from "react-icons/hi2";
import { BaseSelect } from "../../ui/Select/BaseSelect";
import { useAccountSelect } from "../../../hooks/Accounts/useAccountSelect";
import * as S from "./AccountSelect.styles";
import { SmartIcon } from "../../../utils/IconMap";
import { BANK_SKINS } from "../bankSkins";

interface AccountSelectProps {
  accounts: any[];
  value: string;
  onChange: (id: string) => void;
  hasError?: boolean;
  placeholder?: string;
}

export const AccountSelect: React.FC<AccountSelectProps> = ({
  accounts,
  value,
  onChange,
  hasError,
  placeholder,
}) => {
  const { t } = useTranslation();
  const { state, actions } = useAccountSelect({ accounts, value, onChange });
  const { selectedAccount, groupedAccounts, search } = state;

  // Функція для рендеру однієї опції
  const renderOption = (acc: any, isSynced: boolean) => {
    // Визначаємо іконку через скіни
    const skinKey =
      acc.bank_name && acc.card_type
        ? `${acc.bank_name}-${acc.card_type}`
        : acc.icon;
    const skin = BANK_SKINS[skinKey] || BANK_SKINS["default"];
    const isBankLogo = skin.miniLogoFile?.startsWith("icon_");

    return (
      <S.OptionItem
        key={acc.id}
        $isActive={String(acc.id) === String(value)}
        disabled={isSynced}
        onClick={() => !isSynced && actions.handleSelect(acc.id)}
      >
        <S.IconWrapper $color={acc.color || "#ccc"} $hasImage={isBankLogo}>
          <SmartIcon
            logo={isBankLogo ? skin.miniLogoFile : undefined}
            iconName={
              !isBankLogo
                ? acc.type === "card"
                  ? "HiCreditCard"
                  : skin.miniLogoFile
                : undefined
            }
            size={isBankLogo ? 36 : 20}
            color={acc.color}
          />
        </S.IconWrapper>

        <S.TriggerContainer>
          <S.AccountName
            style={{ display: "flex", alignItems: "center", gap: "6px" }}
          >
            {acc.name}
            {isSynced && (
              <HiLockClosed size={12} color="var(--color-text-tertiary)" />
            )}
          </S.AccountName>
          <S.AccountBalance>
            {(acc.balance / 100).toFixed(2)} {acc.currency}
          </S.AccountBalance>
        </S.TriggerContainer>
      </S.OptionItem>
    );
  };

  const triggerLabel = selectedAccount ? (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        width: "100%",
      }}
    >
      {/* Іконка для вибраного рахунку */}
      {(() => {
        const skinKey =
          selectedAccount.bank_name && selectedAccount.card_type
            ? `${selectedAccount.bank_name}-${selectedAccount.card_type}`
            : selectedAccount.icon;

        const skin = BANK_SKINS[skinKey] || BANK_SKINS["default"];
        const isBankLogo = skin.miniLogoFile?.startsWith("icon_");

        return (
          <S.IconWrapper
            $color={selectedAccount.color || "#ccc"}
            $hasImage={isBankLogo}
            style={{ width: "28px", height: "28px", borderRadius: "6px" }} // Трохи менша для тригера
          >
            <SmartIcon
              logo={isBankLogo ? skin.miniLogoFile : undefined}
              iconName={
                !isBankLogo
                  ? selectedAccount.type === "card"
                    ? "HiCreditCard"
                    : skin.miniLogoFile
                  : undefined
              }
              size={isBankLogo ? 28 : 16}
              color={selectedAccount.color}
            />
          </S.IconWrapper>
        );
      })()}

      <S.TriggerContainer>
        <S.AccountName>{selectedAccount.name}</S.AccountName>
        <S.AccountBalance>
          {(selectedAccount.balance / 100).toFixed(2)}{" "}
          {selectedAccount.currency}
        </S.AccountBalance>
      </S.TriggerContainer>
    </div>
  ) : null;

  return (
    <BaseSelect
      triggerLabel={triggerLabel}
      placeholder={
        placeholder || t("transactions:transactionForm.placeholder_select_account")
      }
      onClear={value ? actions.handleClear : undefined}
      searchValue={search}
      onSearchChange={actions.setSearch}
      hasError={hasError}
    >
      {/* 1. Звичайні рахунки (активні) */}
      {groupedAccounts.regular.length > 0 && (
        <>
          <S.GroupLabel>Звичайні рахунки</S.GroupLabel>
          {groupedAccounts.regular.map((acc) => renderOption(acc, false))}
        </>
      )}

      {/* 2. Синхронізовані рахунки (заблоковані) */}
      {groupedAccounts.synced.length > 0 && (
        <>
          <S.GroupLabel style={{ marginTop: "8px" }}>
            Синхронізуються (Monobank)
          </S.GroupLabel>
          {groupedAccounts.synced.map((acc) => renderOption(acc, true))}
        </>
      )}

      {accounts.length === 0 && (
        <S.EmptyState>{t("categories:categoryForm.search_not_found")}</S.EmptyState>
      )}
    </BaseSelect>
  );
};
