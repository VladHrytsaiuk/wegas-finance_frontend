import { useState } from "react";
import styled, { keyframes, css } from "styled-components";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import {
  HiArrowDownTray,
  HiArrowUpTray,
  HiArrowsRightLeft,
  HiDocumentArrowUp,
  HiLockClosed,
  HiArrowPath,
} from "react-icons/hi2";

import Modal from "../ui/Modal";
import ImportModal from "../import/ImportModal";
import CreateTransactionModal from "../transactions/CreateTransactionModal";

import { useAccountActions } from "../../hooks/Accounts/useAccountActions";
import { monobankApi } from "../../services/apiMonobank";
import { useSync } from "../../context/SyncContext";

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

export const ActionButtons = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

export const ActionBtn = styled.button<{
  $variant: "income" | "expense" | "transfer" | "sync";
  disabled?: boolean;
}>`
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-sm);
  color: var(--color-text-main);
  padding: 0.8rem 1rem;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 0.8rem;
  cursor: ${(props) => (props.disabled ? "not-allowed" : "pointer")};
  transition: all 0.2s;
  font-weight: 600;
  font-size: 0.9rem;
  width: 100%;
  opacity: ${(props) => (props.disabled ? 0.6 : 1)};
  position: relative;
  overflow: hidden; /* 🔥 Захист від розпирання */

  span {
    flex: 1;
    text-align: left;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis; /* 🔥 Довгий текст скорочується */
  }

  ${(props) =>
    !props.disabled &&
    `
    &:hover {
      background: ${props.$variant === "income" || props.$variant === "sync" ? "var(--color-brand-50)" : props.$variant === "expense" ? "var(--color-red-100)" : "var(--color-blue-50)"};
      border-color: ${props.$variant === "income" || props.$variant === "sync" ? "var(--color-brand-500)" : props.$variant === "expense" ? "var(--color-red-700)" : "var(--color-blue-500)"};
      transform: translateX(4px);
    }
  `}
`;

const SyncBtn = styled(ActionBtn)`
  background: var(--color-brand-50);
  border-color: var(--color-brand-200);
  color: var(--color-brand-700);

  svg {
    flex-shrink: 0;
    ${(props) =>
      props.disabled &&
      css`
        animation: ${spin} 1s linear infinite;
      `}
  }
`;

const ImportBtn = styled(ActionBtn)`
  &:hover {
    background: var(--color-purple-50, #f5f3ff);
    border-color: var(--color-purple-500, #8b5cf6);
  }
`;

const LockIcon = styled(HiLockClosed)`
  margin-left: auto;
  color: var(--color-text-tertiary);
  flex-shrink: 0;
`;

export function AccountActions({ account, onAction }: any) {
  const { t } = useTranslation();
  const { state, actions } = useAccountActions(account);
  const { statusData, startPolling, stopPolling } = useSync();
  const [isLocalSyncing, setIsLocalSyncing] = useState(false);

  const isLocked = account.is_synced;
  const isGlobalSyncing = statusData.is_running;
  const isSyncingAnywhere = isLocalSyncing || isGlobalSyncing;

  const handleSyncClick = async () => {
    if (isSyncingAnywhere) return;
    setIsLocalSyncing(true);
    try {
      startPolling();
      await monobankApi.forceSync(account.id);
    } catch (err: any) {
      toast.error(
        err.response?.data?.error ||
          t("accounts:accountDetailsPage.sync_error", "Помилка"),
      );
      stopPolling();
    } finally {
      setIsLocalSyncing(false);
    }
  };

  const handleClick = (type: "income" | "expense" | "transfer") => {
    if (isLocked) return;
    if (onAction) onAction(type);
    else actions.handleOpenTransaction(type);
  };

  return (
    <>
      <ActionButtons>
        {isLocked && (
          <SyncBtn
            $variant="sync"
            onClick={handleSyncClick}
            disabled={isSyncingAnywhere}
          >
            <HiArrowPath size={20} />
            <span>
              {isSyncingAnywhere
                ? t("accounts:accountDetailsPage.action_syncing")
                : t("accounts:accountDetailsPage.action_sync_button")}
            </span>
          </SyncBtn>
        )}

        <ActionBtn
          $variant="income"
          onClick={() => handleClick("income")}
          disabled={isLocked}
          title={
            isLocked ? t("accounts:accountDetailsPage.sync_locked_hint") : ""
          }
        >
          <HiArrowDownTray
            size={18}
            style={{ flexShrink: 0 }}
            color={isLocked ? "gray" : "var(--color-brand-600)"}
          />
          <span>{t("accounts:accountDetailsPage.action_income_button")}</span>
          {isLocked && <LockIcon />}
        </ActionBtn>

        <ActionBtn
          $variant="expense"
          onClick={() => handleClick("expense")}
          disabled={isLocked}
        >
          <HiArrowUpTray
            size={18}
            style={{ flexShrink: 0 }}
            color={isLocked ? "gray" : "var(--color-red-700)"}
          />
          <span>{t("accounts:accountDetailsPage.action_expense_button")}</span>
          {isLocked && <LockIcon />}
        </ActionBtn>

        <ActionBtn
          $variant="transfer"
          onClick={() => handleClick("transfer")}
          disabled={isLocked}
        >
          <HiArrowsRightLeft
            size={18}
            style={{ flexShrink: 0 }}
            color={isLocked ? "gray" : "var(--color-blue-600)"}
          />
          <span>{t("accounts:accountDetailsPage.action_transfer_button")}</span>
          {isLocked && <LockIcon />}
        </ActionBtn>

        {!isLocked && state.isImportSupported && (
          <Modal>
            <Modal.Open opens="import-modal">
              <ImportBtn $variant="transfer">
                <HiDocumentArrowUp
                  size={18}
                  style={{ flexShrink: 0 }}
                  color="var(--color-purple-600)"
                />
                <span>{t("accounts:accountDetailsPage.action_import_button")}</span>
              </ImportBtn>
            </Modal.Open>
            <Modal.Window name="import-modal" padding="0">
              <ImportModal account={account} />
            </Modal.Window>
          </Modal>
        )}
      </ActionButtons>

      {!isLocked && state.isTxModalOpen && (
        <CreateTransactionModal
          key={`${state.txType}-${account.id}`}
          isOpen={state.isTxModalOpen}
          onClose={actions.handleCloseTransaction}
          initialData={{ type: state.txType, account_id: account.id }}
        />
      )}
    </>
  );
}
