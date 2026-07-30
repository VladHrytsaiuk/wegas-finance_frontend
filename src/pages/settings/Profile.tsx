import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import {
  HiLinkSlash,
  HiCheck,
  HiArrowPath,
  HiPaperAirplane,
  HiArrowTopRightOnSquare,
  HiBolt,
} from "react-icons/hi2";
import axios from "axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import Modal from "../../components/ui/Modal";
import { SettingsListSkeleton } from "../../components/ui/Skeleton/LoadingSkeletons";

import {
  useProfileForm,
} from "../../hooks/Settings/useProfile";
import { useIsMobile } from "../../hooks/useIsMobile";
import MobilePageHeader from "../../components/mobile/MobilePageHeader";
import * as S from "./Profile.styles";

import MonobankModal from "../../components/sync/MonobankModal";
import { ConfirmDisconnectModal } from "../../components/sync/ConfirmDisconnectModal";
import { monobankApi } from "../../services/apiMonobank";
import { useSync } from "../../context/SyncContext";
import { telegramReceiptsApi } from "../../services/apiTelegramReceipts";

// --- HELPER COMPONENT ---
const DisconnectModalAdapter = ({
  onCloseModal,
  onConfirm,
  isPending,
}: {
  onCloseModal?: () => void;
  onConfirm: () => Promise<void>;
  isPending: boolean;
}) => {
  return (
    <ConfirmDisconnectModal
      onClose={onCloseModal!}
      onConfirm={async () => {
        await onConfirm();
        onCloseModal?.();
      }}
      isPending={isPending}
    />
  );
};

// --- MAIN PROFILE COMPONENT ---

function Profile() {
  const { state, actions, t } = useProfileForm();
  const isMobile = useIsMobile();
  const { name, email, isLoading, isUpdating } = state;
  const queryClient = useQueryClient();

  const { statusData, startPolling, stopPolling } = useSync();
  const isSyncing = statusData.is_running;
  const prevIsSyncing = useRef(isSyncing);

  const [isMonoConnected, setIsMonoConnected] = useState(false);
  const [isCheckingMono, setIsCheckingMono] = useState(true);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [isForceSyncing, setIsForceSyncing] = useState(false);
  const [isWaitingForTelegramStart, setIsWaitingForTelegramStart] = useState(false);

  const {
    data: telegramStatus,
    isLoading: isTelegramStatusLoading,
    refetch: refetchTelegramStatus,
  } = useQuery({
    queryKey: ["telegram-receipts-link-status"],
    queryFn: telegramReceiptsApi.getLinkStatus,
    refetchInterval: isWaitingForTelegramStart ? 2000 : false,
  });

  const { data: webhookStatus, isLoading: isWebhookStatusLoading } = useQuery({
    queryKey: ["telegram-receipts-webhook-status"],
    queryFn: telegramReceiptsApi.getWebhookStatus,
  });

  const { mutateAsync: createTelegramLink, isPending: isCreatingTelegramLink } =
    useMutation({
      mutationFn: telegramReceiptsApi.createLinkToken,
      onSuccess: async (data) => {
        setIsWaitingForTelegramStart(true);
        try {
          await navigator.clipboard.writeText(data.deep_link);
          toast.success(t("settings:integrations.telegram_link_ready"));
        } catch {
          toast.success(t("settings:integrations.telegram_link_opening"));
        }

        if (isMobile) {
          window.location.href = data.deep_link;
        } else {
          window.open(data.deep_link, "_blank", "noopener,noreferrer");
        }
      },
      onError: () => {
        setIsWaitingForTelegramStart(false);
        toast.error(t("settings:integrations.telegram_link_error"));
      },
    });

  const { mutateAsync: revokeTelegramLink, isPending: isRevokingTelegramLink } =
    useMutation({
      mutationFn: telegramReceiptsApi.revokeLink,
      onSuccess: async () => {
        setIsWaitingForTelegramStart(false);
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ["telegram-receipts-link-status"] }),
          queryClient.invalidateQueries({
            queryKey: ["telegram-receipts-webhook-status"],
          }),
        ]);
        toast.success(t("settings:integrations.telegram_disconnect_success"));
      },
      onError: () => {
        toast.error(t("settings:integrations.telegram_disconnect_error"));
      },
    });

  const { mutateAsync: syncTelegramWebhook, isPending: isSyncingTelegramWebhook } =
    useMutation({
      mutationFn: telegramReceiptsApi.syncWebhook,
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: ["telegram-receipts-webhook-status"],
        });
        toast.success(t("settings:integrations.telegram_webhook_sync_success"));
      },
      onError: () => {
        toast.error(t("settings:integrations.telegram_webhook_sync_error"));
      },
    });

  // 1. Check connection status
  useEffect(() => {
    const checkMono = async () => {
      try {
        await monobankApi.getSettings();
        setIsMonoConnected(true);
      } catch (error: unknown) {
        if (axios.isAxiosError(error) && error.response && error.response.status === 404) {
          setIsMonoConnected(false);
        } else {
          setIsMonoConnected(true);
        }
      } finally {
        setIsCheckingMono(false);
      }
    };
    checkMono();
  }, []);

  // 2. Handle Disconnect
  const handleGlobalDisconnect = async () => {
    setIsDisconnecting(true);
    try {
      await monobankApi.disconnect();
      setIsMonoConnected(false);
      toast.success(t("settings:integrations.toast_disconnect_success"));
    } catch (error) {
      toast.error(t("settings:integrations.toast_disconnect_error"));
      console.error(error);
    } finally {
      setIsDisconnecting(false);
    }
  };

  // 3. Handle Force Sync
  const handleForceSync = async () => {
    if (isSyncing || isForceSyncing) return;
    setIsForceSyncing(true);

    try {
      startPolling();
      await monobankApi.forceSync();
      toast.success(t("settings:integrations.toast_sync_started"));
    } catch {
      toast.error(t("settings:integrations.toast_sync_error"));
      if (typeof stopPolling === "function") stopPolling();
    } finally {
      setIsForceSyncing(false);
    }
  };

  // 4. Update status when sync finishes
  useEffect(() => {
    if (prevIsSyncing.current && !isSyncing) {
      const checkStatus = async () => {
        try {
          await monobankApi.getSettings();
          setIsMonoConnected(true);
        } catch (err: unknown) {
          if (axios.isAxiosError(err) && err.response?.status === 404) {
            setIsMonoConnected(false);
          }
        }
      };
      const timer = setTimeout(checkStatus, 1000);
      return () => clearTimeout(timer);
    }
    prevIsSyncing.current = isSyncing;
  }, [isSyncing]);

  useEffect(() => {
    if (telegramStatus?.is_linked && isWaitingForTelegramStart) {
      setIsWaitingForTelegramStart(false);
      toast.success(t("settings:integrations.telegram_connected_after_start"));
    }
  }, [isWaitingForTelegramStart, telegramStatus?.is_linked, t]);

  if (isLoading) return <SettingsListSkeleton />;

  const isTelegramLinked = telegramStatus?.is_linked ?? false;
  const isTelegramWebhookConfigured = webhookStatus?.configured ?? false;
  const isTelegramBusy =
    isCreatingTelegramLink ||
    isRevokingTelegramLink ||
    isSyncingTelegramWebhook ||
    isWaitingForTelegramStart;

  const handleTelegramConnect = async () => {
    if (!isTelegramWebhookConfigured) {
      try {
        await syncTelegramWebhook();
      } catch (e) {
        console.warn("Webhook sync failed, continuing to link generation (polling mode might be active)", e);
      }
    }

    await createTelegramLink();
    void refetchTelegramStatus();
  };

  const handleTelegramDisconnect = async () => {
    await revokeTelegramLink();
  };

  const handleTelegramWebhookSync = async () => {
    await syncTelegramWebhook();
  };

  return (
    <Modal>
      {isMobile && <MobilePageHeader title={t("settings:settingsLayout.menu_profile")} />}
      <div style={{ padding: isMobile ? "20px 16px" : undefined }}>
        {!isMobile && (
          <S.SectionTitle style={{ fontSize: "1.2rem", fontWeight: 700 }}>
            {t("settings:profilePage.title_profile")}
          </S.SectionTitle>
        )}

        <S.Form onSubmit={actions.handleUpdateProfile}>
          <S.FormGroup>
            <S.Label>{t("settings:profilePage.label_name")}</S.Label>
            <Input
              value={name}
              onChange={(e) => actions.setName(e.target.value)}
              disabled={isUpdating}
            />
          </S.FormGroup>
          <S.FormGroup>
            <S.Label>{t("settings:profilePage.label_email")}</S.Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => actions.setEmail(e.target.value)}
              disabled={isUpdating}
            />
          </S.FormGroup>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
            <Button
              type="submit"
              style={{ width: isMobile ? "100%" : "auto" }}
              disabled={isUpdating}
            >
              {t("settings:profilePage.button_update_profile")}
            </Button>
          </div>
        </S.Form>

        <S.IntegrationsSection>
          {!isMobile && (
            <S.SectionTitle style={{ fontSize: "1.2rem", fontWeight: 700 }}>
              {t("settings:integrations.title")}
            </S.SectionTitle>
          )}

          <S.IntegrationCard>
            <S.IntegrationLeft>
              <S.IconWrapper>
                <S.BankLogo src="/banks/icon_monobank.svg" alt="Monobank" />
              </S.IconWrapper>

              <S.TextInfo>
                <S.BankTitleRow>
                  <S.BankTitle>Monobank</S.BankTitle>
                  {!isCheckingMono && (
                    <S.ConnectionStatus
                      $connected={isMonoConnected}
                      $syncing={isSyncing}
                    >
                      {isSyncing ? (
                        <>
                          <HiArrowPath className="spin" /> {t("settings:integrations.status_syncing")}
                        </>
                      ) : isMonoConnected ? (
                        <>
                          <HiCheck size={14} /> {t("settings:integrations.status_connected")}
                        </>
                      ) : (
                        t("settings:integrations.status_not_connected")
                      )}
                    </S.ConnectionStatus>
                  )}
                </S.BankTitleRow>
                <S.BankDescription>
                  {t("settings:integrations.mono_desc")}
                </S.BankDescription>
              </S.TextInfo>
            </S.IntegrationLeft>

            <S.ActionsRight>
              {isMonoConnected && (
                <S.SyncButton
                  $variation="secondary"
                  $isSpinning={isForceSyncing || isSyncing}
                  onClick={handleForceSync}
                  title={t("settings:integrations.btn_sync_now")}
                  disabled={isSyncing || isForceSyncing}
                >
                  <HiArrowPath size={18} />
                </S.SyncButton>
              )}

              {isMonoConnected && (
                <Modal.Open opens="confirm-disconnect">
                  <S.IconButton
                    $variation="danger"
                    size="sm"
                    title={t("settings:integrations.btn_disconnect")}
                    disabled={isSyncing}
                  >
                    <HiLinkSlash size={18} />
                  </S.IconButton>
                </Modal.Open>
              )}

              <Modal.Open opens="monobank-settings">
                <Button
                  $variation="secondary"
                  style={{ width: "auto" }}
                  disabled={isSyncing}
                >
                  {isSyncing
                    ? t("settings:integrations.status_syncing")
                    : isMonoConnected
                      ? t("settings:integrations.btn_configure")
                      : t("settings:integrations.btn_connect")}
                </Button>
              </Modal.Open>
            </S.ActionsRight>
          </S.IntegrationCard>

          <S.TelegramCard style={{ marginTop: "0.9rem" }}>
            <S.IntegrationLeft>
              <S.IconWrapper>
                <HiPaperAirplane
                  size={22}
                  style={{
                    width: "100%",
                    height: "100%",
                    padding: 9,
                    color: "var(--color-brand-600)",
                  }}
                />
              </S.IconWrapper>

              <S.TelegramTextInfo>
                <S.BankTitleRow>
                  <S.BankTitle>Telegram Receipts</S.BankTitle>
                  {!isTelegramStatusLoading && !isWebhookStatusLoading && (
                    <S.ConnectionStatus
                      $connected={isTelegramLinked}
                      $syncing={isTelegramBusy}
                    >
                      {isTelegramBusy ? (
                        <>
                          <HiArrowPath className="spin" />
                          {isWaitingForTelegramStart
                            ? t("settings:integrations.telegram_waiting_start")
                            : t("settings:integrations.status_syncing")}
                        </>
                      ) : isTelegramLinked ? (
                        <>
                          <HiCheck size={14} />
                          {t("settings:integrations.status_connected")}
                        </>
                      ) : (
                        t("settings:integrations.status_not_connected")
                      )}
                    </S.ConnectionStatus>
                  )}
                </S.BankTitleRow>

                <S.BankDescription>
                  {t("settings:integrations.telegram_desc")}
                </S.BankDescription>

                <S.IntegrationMeta>
                  <S.MetaRow>
                    <S.MetaLabel>
                      {t("settings:integrations.telegram_bot_label")}
                    </S.MetaLabel>
                    <S.MetaValue>
                      {telegramStatus?.bot_username
                        ? `@${telegramStatus.bot_username}`
                        : t("settings:integrations.telegram_unknown")}
                    </S.MetaValue>
                  </S.MetaRow>

                  {isTelegramLinked && telegramStatus?.telegram_username && (
                    <S.MetaRow>
                      <S.MetaLabel>
                        {t("settings:integrations.telegram_account_label")}
                      </S.MetaLabel>
                      <S.MetaValue>@{telegramStatus.telegram_username}</S.MetaValue>
                    </S.MetaRow>
                  )}

                  {!isWebhookStatusLoading && !isTelegramLinked && (
                    <S.MetaRow>
                      <S.MetaLabel>
                        {t("settings:integrations.telegram_hint_label")}
                      </S.MetaLabel>
                      <S.MetaValue>
                        {isTelegramWebhookConfigured
                          ? t("settings:integrations.telegram_hint_start")
                          : t("settings:integrations.telegram_hint_connect")}
                      </S.MetaValue>
                    </S.MetaRow>
                  )}
                </S.IntegrationMeta>
              </S.TelegramTextInfo>
            </S.IntegrationLeft>

            <S.ActionsRight>
              <S.OpenBotButton
                style={{ width: isMobile ? "100%" : "auto" }}
                disabled={isTelegramBusy}
                onClick={
                  isTelegramLinked && telegramStatus?.bot_username
                    ? () => {
                        const url = `https://t.me/${telegramStatus.bot_username}`;
                        if (isMobile) {
                          window.location.href = url;
                        } else {
                          window.open(url, "_blank", "noopener,noreferrer");
                        }
                      }
                    : handleTelegramConnect
                }
              >
                <S.ActionLabel>
                  {isTelegramLinked ? (
                    <HiArrowTopRightOnSquare size={16} />
                  ) : (
                    <HiBolt size={16} />
                  )}
                  {isTelegramLinked
                    ? t("settings:integrations.telegram_open_bot")
                    : t("settings:integrations.telegram_connect")}
                </S.ActionLabel>
              </S.OpenBotButton>

              {(isTelegramLinked || !isTelegramWebhookConfigured) && (
                <S.SyncButton
                  variation="secondary"
                  $isSpinning={isSyncingTelegramWebhook}
                  onClick={handleTelegramWebhookSync}
                  title={t("settings:integrations.telegram_sync_webhook")}
                  disabled={isTelegramBusy}
                >
                  <HiArrowPath size={18} />
                </S.SyncButton>
              )}

              {isTelegramLinked ? (
                <S.IconButton
                  variation="danger"
                  size="sm"
                  title={t("settings:integrations.telegram_disconnect")}
                  disabled={isTelegramBusy}
                  onClick={handleTelegramDisconnect}
                >
                  <HiLinkSlash size={18} />
                </S.IconButton>
              ) : null}
            </S.ActionsRight>
          </S.TelegramCard>
        </S.IntegrationsSection>
      </div>

      {/* --- MODALS --- */}
      <Modal.Window name="monobank-settings">
        <MonobankModal />
      </Modal.Window>

      <Modal.Window name="confirm-disconnect">
        <DisconnectModalAdapter
          onConfirm={handleGlobalDisconnect}
          isPending={isDisconnecting}
        />
      </Modal.Window>
    </Modal>
  );
}

export default Profile;
