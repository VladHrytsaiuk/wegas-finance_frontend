import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  HiCheck,
  HiClock,
  HiLinkSlash,
  HiLockClosed,
  HiBanknotes,
} from "react-icons/hi2";

import { Button } from "../../ui/Button";
import { Input } from "../../ui/Input";
import { BaseSelect } from "../../ui/Select/BaseSelect";
import { ConfirmDisconnectModal } from "../ConfirmDisconnectModal";
import { DateRangePicker } from "../../ui/DateRangePicker";
import { useAccountsData } from "../../../hooks/Accounts/useAccountsData";
import { useSync } from "../../../context/SyncContext";
import * as S from "../MonobankModal.styles";

// Types
import type { MonoAccount } from "../../../services/apiMonobank";
import type { Account } from "../../../services/apiAccounts";
import type { AccountMapping, StepType } from "../../../hooks/Settings/useMonobank";

type StepSelectionState = {
  accounts: MonoAccount[];
  mapping: Record<string, AccountMapping>;
  hasExistingConnection: boolean;
};

type StepSelectionActions = {
  confirmSync: () => Promise<void>;
  handleDisconnect: () => Promise<void>;
  toggleAccount: (id: string, cardNumber?: string) => void;
  toggleCreateGoal: (id: string) => void;
  setInternalId: (id: string, internalId: string) => void;
  updateAccountName: (id: string, newName: string) => void;
  setAccountSyncDate: (id: string, date: string) => void;
  setStep: (step: StepType) => void;
};

interface StepSelectionProps {
  state: StepSelectionState;
  actions: StepSelectionActions;
  onClose: () => void;
}

export default function StepSelection({
  state,
  actions,
  onClose,
}: StepSelectionProps) {
  const { t } = useTranslation();
  const { accounts, mapping, hasExistingConnection } = state;
  const { accounts: existingAccounts } = useAccountsData();
  const { startPolling } = useSync();

  const [showDisconnectConfirm, setShowDisconnectConfirm] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  // --- Helpers (Local) ---
  const getCompatibleAccounts = (currencyCode: number) => {
    const currencyStr =
      currencyCode === 980 ? "UAH" : currencyCode === 840 ? "USD" : "EUR";
    return existingAccounts.filter((acc) => acc.currency === currencyStr);
  };

  const formatBalance = (account: Account) => {
    const val = account.calculated_balance ?? account.balance ?? 0;
    return (val / 100).toFixed(2);
  };

  const getLast4Digits = (maskedPan: string[] | undefined) => {
    if (!maskedPan || maskedPan.length === 0) return "";
    const pan = maskedPan[0];
    return pan.length >= 4 ? pan.slice(-4) : "";
  };

  const handleStartImport = async () => {
    try {
      startPolling();
      await actions.confirmSync();
    } catch {
      // Error handled in hook/toast
    }
  };

  return (
    <>
      {/* OVERLAY: Rendered outside ContentWrapper to cover full container */}
      {showDisconnectConfirm && (
        <S.DisconnectOverlay>
          <ConfirmDisconnectModal
            onClose={() => setShowDisconnectConfirm(false)}
            onConfirm={async () => {
              setIsDisconnecting(true);
              await actions.handleDisconnect();
              setIsDisconnecting(false);
              setShowDisconnectConfirm(false);
            }}
            isPending={isDisconnecting}
          />
        </S.DisconnectOverlay>
      )}

      <S.ContentWrapper>
        <S.HeaderRow>
          <S.Title>
            <img
              src="https://api.monobank.ua/favicon.ico"
              alt="Monobank"
              style={{ width: "28px", height: "28px", borderRadius: "50%" }}
            />
            {t("settings:integrations.mono_flow_title")}
          </S.Title>

          {hasExistingConnection && (
            <Button
              $variation="danger"
              size="sm"
              onClick={() => setShowDisconnectConfirm(true)}
              style={{ fontSize: "0.8rem", padding: "0.4rem 0.8rem" }}
            >
              <HiLinkSlash /> {t("settings:integrations.mono_flow_btn_disconnect")}
            </Button>
          )}
        </S.HeaderRow>

        <S.Description>{t("settings:integrations.mono_flow_step_selection_desc")}</S.Description>

        <S.ScrollableList>
          {accounts.map((acc: MonoAccount) => {
            const config = mapping[acc.id] || { isEnabled: false };
            const isSelected = config.isEnabled;
            const isLocked = !!config.internalId && isSelected;
            const isJar = acc.type === "jar";

            const availableFerpAccounts = getCompatibleAccounts(
              acc.currencyCode,
            );
            const linkedAccount = availableFerpAccounts.find(
              (a) => a.id === config.internalId,
            );

            const triggerLabel = linkedAccount
              ? `${linkedAccount.name} (${formatBalance(linkedAccount)})`
              : t("settings:integrations.mono_flow_step_selection_create_new");

            return (
              <S.AccountCard
                key={acc.id}
                $isSelected={isSelected}
                $isLocked={isLocked}
              >
                {/* Checkbox */}
                <S.CheckboxContainer
                  $disabled={isLocked}
                  title={isLocked ? t("settings:integrations.mono_flow_step_selection_already_synced") : ""}
                >
                  <S.HiddenCheckbox
                    checked={isSelected}
                    disabled={isLocked}
                    onChange={() => {
                      if (!isLocked) {
                        const last4 = getLast4Digits(acc.maskedPan);
                        actions.toggleAccount(acc.id, last4);
                      }
                    }}
                  />
                  <S.StyledCheckbox checked={isSelected} $disabled={isLocked}>
                    {isLocked ? (
                      <HiLockClosed size={14} />
                    ) : (
                      isSelected && <HiCheck size={18} strokeWidth={3} /> // ✅ Тепер галочка з'явиться ТІЛЬКИ якщо рахунок обрано
                    )}
                  </S.StyledCheckbox>
                </S.CheckboxContainer>

                {/* Content */}
                <div style={{ width: "100%" }}>
                  <S.CardHeader>
                    <span
                      style={{
                        fontWeight: 600,
                        fontSize: "1rem",
                        opacity: isLocked ? 0.7 : 1,
                      }}
                    >
                      {acc.maskedPan?.[0] || acc.iban}
                    </span>
                    <S.Badge>
                      {acc.currencyCode === 980
                        ? "UAH"
                        : acc.currencyCode === 840
                          ? "USD"
                          : "EUR"}
                    </S.Badge>
                    {isJar && <S.Badge className="jar">JAR</S.Badge>}
                    <span
                      style={{
                        fontSize: "0.9rem",
                        color: "var(--color-text-main)",
                        marginLeft: "auto",
                        fontWeight: 500,
                      }}
                    >
                      {(acc.balance / 100).toFixed(2)}
                    </span>
                  </S.CardHeader>

                  {isSelected && (
                    <>
                      {isJar && !config.internalId && !isLocked && (
                        <S.JarSettings>
                          <HiBanknotes
                            size={20}
                            color="var(--color-brand-600)"
                          />
                          <S.SmallCheckboxLabel>
                            <input
                              type="checkbox"
                              checked={config.createGoal || false}
                              onChange={() => actions.toggleCreateGoal(acc.id)}
                              style={{
                                accentColor: "var(--color-brand-600)",
                                width: "16px",
                                height: "16px",
                                marginRight: "8px",
                                cursor: "pointer",
                              }}
                            />
                            {t("settings:integrations.mono_flow_step_selection_create_goal")}
                          </S.SmallCheckboxLabel>
                        </S.JarSettings>
                      )}

                      <S.SettingsGrid>
                        {/* Linked Account Select */}
                        <div
                          style={
                            isLocked
                              ? { pointerEvents: "none", opacity: 0.6 }
                              : {}
                          }
                        >
                          <S.Label>{t("settings:integrations.mono_flow_step_selection_link_to")}</S.Label>
                          <BaseSelect triggerLabel={triggerLabel}>
                            <S.SelectOption
                              $isActive={!config.internalId}
                              onClick={() => actions.setInternalId(acc.id, "")}
                            >
                              <span>{t("settings:integrations.mono_flow_step_selection_create_new")}</span>
                            </S.SelectOption>
                            {availableFerpAccounts.length > 0 && (
                              <>
                                <S.GroupLabel>{t("settings:integrations.mono_flow_step_selection_existing_accounts")}</S.GroupLabel>
                                {availableFerpAccounts.map((fa) => (
                                  <S.SelectOption
                                    key={fa.id}
                                    $isActive={config.internalId === fa.id}
                                    onClick={() =>
                                      actions.setInternalId(acc.id, fa.id)
                                    }
                                  >
                                    <span>{fa.name}</span>
                                    <span
                                      style={{
                                        color: "var(--color-text-secondary)",
                                        fontSize: "0.85rem",
                                      }}
                                    >
                                      {formatBalance(fa)}
                                    </span>
                                  </S.SelectOption>
                                ))}
                              </>
                            )}
                          </BaseSelect>
                        </div>

                        {/* Name Input */}
                        <div
                          style={
                            isLocked
                              ? { pointerEvents: "none", opacity: 0.6 }
                              : {}
                          }
                        >
                          <S.Label>{t("settings:integrations.mono_flow_step_selection_name_in_ferp")}</S.Label>
                          <Input
                            value={config.name || ""}
                            onChange={(e) =>
                              actions.updateAccountName(acc.id, e.target.value)
                            }
                            disabled={!!config.internalId || isLocked}
                            style={{ opacity: config.internalId ? 0.6 : 1 }}
                          />
                        </div>

                        {/* Sync Date */}
                        <S.FullWidthRow
                          style={
                            isLocked
                              ? { pointerEvents: "none", opacity: 0.6 }
                              : {}
                          }
                        >
                          <S.Label>{t("settings:integrations.mono_flow_step_selection_import_from")}</S.Label>
                          <div
                            style={{
                              display: "flex",
                              gap: "1rem",
                              alignItems: "center",
                            }}
                          >
                            <div style={{ width: "240px" }}>
                              <DateRangePicker
                                mode="single"
                                // FERP DateRangePicker очікує пропс `dateFrom` як Date object
                                dateFrom={(() => {
                                  if (!config.syncFrom) return undefined; // або new Date()
                                  const [y, m, d] = config.syncFrom
                                    .split("-")
                                    .map(Number);
                                  return new Date(y, m - 1, d);
                                })()}
                                // FERP DateRangePicker очікує onChange, який повертає {from, to}
                                onChange={(range) => {
                                  // range.from - це вибрана дата
                                  if (range.from) {
                                    const d = range.from;
                                    const isoDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
                                    actions.setAccountSyncDate(acc.id, isoDate);
                                  }
                                }}
                              />
                            </div>
                            {!isLocked && (
                              <S.WarningText>
                                <HiClock />{t("settings:integrations.mono_flow_step_selection_time_estimate")}
                              </S.WarningText>
                            )}
                          </div>
                        </S.FullWidthRow>
                      </S.SettingsGrid>
                    </>
                  )}
                </div>
              </S.AccountCard>
            );
          })}
        </S.ScrollableList>

        <S.FooterRow>
          {hasExistingConnection ? (
            <Button type="button" $variation="secondary" onClick={onClose}>
              {t("settings:integrations.mono_flow_btn_cancel")}
            </Button>
          ) : (
            <Button
              type="button"
              $variation="secondary"
              onClick={() => actions.setStep("input")}
            >
              {t("settings:integrations.mono_flow_btn_back")}
            </Button>
          )}

          <Button
            type="button"
            onClick={handleStartImport}
            disabled={!Object.values(mapping).some((mappedAccount) => mappedAccount.isEnabled)}
          >
            {t("settings:integrations.mono_flow_btn_start_import")}
          </Button>
        </S.FooterRow>
      </S.ContentWrapper>
    </>
  );
}
