import React, { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  HiLockClosed,
  HiChevronDown,
  HiUser,
} from "react-icons/hi2";
import { BaseSelect } from "../../ui/Select/BaseSelect";
import { useAccountSelect } from "../../../hooks/Accounts/useAccountSelect";
import * as S from "./AccountSelect.styles";
import { SmartIcon } from "../../../utils/IconMap";
import { BANK_SKINS } from "../bankSkins";

interface AccountSelectProps {
  accounts: any[];
  users?: any[];
  value: string;
  onChange: (id: string) => void;
  hasError?: boolean;
  placeholder?: string;
}

export const AccountSelect: React.FC<AccountSelectProps> = ({
  accounts,
  users = [],
  value,
  onChange,
  hasError,
  placeholder,
}) => {
  const { t } = useTranslation();
  const { state, actions } = useAccountSelect({
    accounts,
    users,
    value,
    onChange,
  });
  const { selectedAccount, treeData, search } = state;

  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const toggleExpand = (id: string, e?: React.MouseEvent | React.KeyboardEvent) => {
    e?.stopPropagation();
    const newSet = new Set(expandedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setExpandedIds(newSet);
  };

  // Авто-експанд при пошуку
  const currentExpandedIds = useMemo(() => {
    if (!search) return expandedIds;
    const allIds = new Set<string>();
    treeData.forEach((owner: any) => {
      allIds.add(owner.id);
      owner.children.forEach((type: any) => allIds.add(type.id));
    });
    return allIds;
  }, [search, treeData, expandedIds]);

  const renderAccount = (acc: any) => {
    const isSynced = Boolean(acc.is_synced);
    const skinKey =
      acc.bank_name && acc.card_type
        ? `${acc.bank_name}-${acc.card_type}`
        : acc.icon;
    const skin = BANK_SKINS[skinKey] || BANK_SKINS["default"];
    const isBankLogo = skin.miniLogoFile?.startsWith("icon_") && acc.type === "card";

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        if (!isSynced) actions.handleSelect(acc.id);
      }
    };

    return (
      <S.OptionItem
        key={acc.id}
        $isActive={String(acc.id) === String(value)}
        $isSynced={isSynced}
        onClick={() => !isSynced && actions.handleSelect(acc.id)}
        onKeyDown={handleKeyDown}
        style={{ paddingLeft: "3rem" }} // Level 2 indentation (48px)
        tabIndex={0}
        role="button"
      >
        <S.IconWrapper $color={acc.color || "#ccc"} $hasImage={isBankLogo}>
          <SmartIcon
            logo={isBankLogo ? skin.miniLogoFile : undefined}
            iconName={acc.resolvedIcon} // Використовуємо вже розраховану іконку з хука
            size={isBankLogo ? 32 : 18}
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
      {(() => {
        const skinKey =
          selectedAccount.bank_name && selectedAccount.card_type
            ? `${selectedAccount.bank_name}-${selectedAccount.card_type}`
            : selectedAccount.icon;

        const skin = BANK_SKINS[skinKey] || BANK_SKINS["default"];
        const isBankLogo = skin.miniLogoFile?.startsWith("icon_") && selectedAccount.type === "card";

        // Хелпер для іконки тригера
        const getTriggerIcon = () => {
          if (selectedAccount.type === "piggy_bank" || selectedAccount.type === "savings") return "HiCircleStack";
          if (selectedAccount.type === "cash") return "HiBanknotes";
          if (isBankLogo) return undefined;
          return "HiCreditCard";
        };

        return (
          <S.IconWrapper
            $color={selectedAccount.color || "#ccc"}
            $hasImage={isBankLogo}
            style={{ width: "24px", height: "24px", borderRadius: "6px" }}
          >
            <SmartIcon
              logo={isBankLogo ? skin.miniLogoFile : undefined}
              iconName={getTriggerIcon()}
              size={isBankLogo ? 24 : 14}
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

  const handleOwnerKeyDown = (id: string, e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " " || e.key === "ArrowRight" || e.key === "ArrowLeft") {
      e.preventDefault();
      toggleExpand(id, e);
    }
  };

  const handleTypeKeyDown = (id: string, e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " " || e.key === "ArrowRight" || e.key === "ArrowLeft") {
      e.preventDefault();
      toggleExpand(id, e);
    }
  };

  return (
    <BaseSelect
      triggerLabel={triggerLabel}
      placeholder={
        placeholder ||
        t("transactions:transactionForm.placeholder_select_account")
      }
      onClear={value ? actions.handleClear : undefined}
      searchValue={search}
      onSearchChange={actions.setSearch}
      hasError={hasError}
    >
      <S.TreeContainer>
        {treeData.map((owner: any) => {
          const isOwnerExpanded = currentExpandedIds.has(owner.id);
          return (
            <div key={owner.id}>
              <S.OwnerRow
                onClick={(e) => toggleExpand(owner.id, e)}
                onKeyDown={(e) => handleOwnerKeyDown(owner.id, e)}
                $isExpanded={isOwnerExpanded}
                tabIndex={0}
                role="button"
                aria-expanded={isOwnerExpanded}
                aria-haspopup="true"
              >
                <S.ExpandIcon $isExpanded={isOwnerExpanded} as="span">
                  <HiChevronDown />
                </S.ExpandIcon>
                <HiUser size={14} color="var(--color-brand-600)" />
                <S.OwnerName>{owner.name}</S.OwnerName>
              </S.OwnerRow>

              {isOwnerExpanded && (
                <>
                  {owner.children.map((typeNode: any) => {
                    const isTypeExpanded = currentExpandedIds.has(typeNode.id);
                    return (
                      <div key={typeNode.id}>
                        <S.TypeRow
                          onClick={(e) => toggleExpand(typeNode.id, e)}
                          onKeyDown={(e) => handleTypeKeyDown(typeNode.id, e)}
                          $isExpanded={isTypeExpanded}
                          tabIndex={0}
                          role="button"
                          aria-expanded={isTypeExpanded}
                          aria-haspopup="true"
                        >
                          <S.ExpandIcon $isExpanded={isTypeExpanded} as="span">
                            <HiChevronDown />
                          </S.ExpandIcon>
                          <SmartIcon
                            iconName={typeNode.icon}
                            size={14}
                            color="var(--color-text-secondary)"
                          />
                          <S.TypeName>{typeNode.name}</S.TypeName>
                        </S.TypeRow>

                        {isTypeExpanded && (
                          <div style={{ marginTop: "1px", marginBottom: "2px" }}>
                            {typeNode.children.map((acc: any) =>
                              renderAccount(acc),
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </>
              )}
            </div>
          );
        })}

        {accounts.length === 0 && (
          <S.EmptyState>
            {t("categories:categoryForm.search_not_found")}
          </S.EmptyState>
        )}
      </S.TreeContainer>
    </BaseSelect>
  );
};
