import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import {
  HiLinkSlash,
  HiCheck,
  HiArrowPath,
  HiFingerPrint,
  HiKey,
  HiTrash,
} from "react-icons/hi2";
import axios from "axios";

import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import Modal from "../../components/ui/Modal";
import { CenteredSpinner } from "../../components/ui/CenteredSpinner";

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
  const { user, isRemovingPin, isRemovingPasskeys } = state;
  const isMobile = useIsMobile();
  const { name, email, isLoading, isUpdating } = state;

  const { statusData, startPolling, stopPolling } = useSync();
  const isSyncing = statusData.is_running;
  const prevIsSyncing = useRef(isSyncing);

  const [isMonoConnected, setIsMonoConnected] = useState(false);
  const [isCheckingMono, setIsCheckingMono] = useState(true);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [isForceSyncing, setIsForceSyncing] = useState(false);

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

  if (isLoading) return <CenteredSpinner />;

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

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', alignItems: 'center', marginTop: '1.5rem' }}>
            {/* Показ статусів на комп'ютері поруч з кнопками */}
            {!isMobile && (
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {user?.has_pin && (
                  <S.StatusBadge $active={true} title={t("settings:profilePage.pin_desc")}>
                    PIN
                  </S.StatusBadge>
                )}
                {user?.has_passkeys && (
                  <S.StatusBadge $active={true} title={t("settings:profilePage.passkey_desc")}>
                    Passkey
                  </S.StatusBadge>
                )}
              </div>
            )}
            
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
        </S.IntegrationsSection>

        {/* Секція керування безпекою (ПІН/Passkeys) */}
        <S.SecuritySection>
          {!isMobile && (
            <S.SectionTitle style={{ fontSize: "1.2rem", fontWeight: 700 }}>
              {t("settings:profilePage.title_security", "Безпека")}
            </S.SectionTitle>
          )}

          {/* ПІН-код */}
          <S.SecurityCard>
            <S.IntegrationLeft>
              <S.IconWrapper style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--color-grey-50)' }}>
                <HiKey size={24} color="var(--color-grey-600)" />
              </S.IconWrapper>
              <S.TextInfo>
                <S.BankTitleRow>
                  <S.BankTitle>{t("settings:profilePage.label_pin_code", "ПІН-код")}</S.BankTitle>
                  {isMobile && (
                    <S.StatusBadge $active={!!user?.has_pin}>
                      {user?.has_pin ? t("common:status_active", "Активно") : t("common:status_inactive", "Не налаштовано")}
                    </S.StatusBadge>
                  )}
                </S.BankTitleRow>
                <S.BankDescription>
                  {t("settings:profilePage.pin_desc", "Швидкий вхід за 4-значним кодом")}
                </S.BankDescription>
              </S.TextInfo>
            </S.IntegrationLeft>
            <S.ActionsRight>
              {user?.has_pin ? (
                <Button
                  $variation="danger"
                  size="sm"
                  onClick={() => {
                    if (window.confirm(t("settings:profilePage.confirm_remove_pin", "Ви впевнені, що хочете вимкнути ПІН-код?"))) {
                      actions.removePin();
                    }
                  }}
                  disabled={isRemovingPin}
                >
                  <HiTrash size={16} style={{ marginRight: isMobile ? '0' : '4px' }} />
                  {!isMobile && t("common:btn_disable", "Вимкнути")}
                </Button>
              ) : (
                <S.StatusBadge $active={false}>
                  {t("common:status_inactive", "Не налаштовано")}
                </S.StatusBadge>
              )}
            </S.ActionsRight>
          </S.SecurityCard>

          {/* Passkeys (Біометрія) */}
          <S.SecurityCard>
            <S.IntegrationLeft>
              <S.IconWrapper style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--color-grey-50)' }}>
                <HiFingerPrint size={24} color="var(--color-grey-600)" />
              </S.IconWrapper>
              <S.TextInfo>
                <S.BankTitleRow>
                  <S.BankTitle>{t("settings:profilePage.label_biometrics", "Біометрія (Passkeys)")}</S.BankTitle>
                  {isMobile && (
                    <S.StatusBadge $active={!!user?.has_passkeys}>
                      {user?.has_passkeys ? t("common:status_active", "Активно") : t("common:status_inactive", "Не налаштовано")}
                    </S.StatusBadge>
                  )}
                </S.BankTitleRow>
                <S.BankDescription>
                  {t("settings:profilePage.passkey_desc", "Вхід за допомогою FaceID / TouchID")}
                </S.BankDescription>
              </S.TextInfo>
            </S.IntegrationLeft>
            <S.ActionsRight>
              {user?.has_passkeys ? (
                <Button
                  $variation="danger"
                  size="sm"
                  onClick={() => {
                    if (window.confirm(t("settings:profilePage.confirm_remove_passkeys", "Ви впевнені, що хочете вимкнути біометричний вхід? Усі зареєстровані Passkeys будуть видалені."))) {
                      actions.removePasskeys();
                    }
                  }}
                  disabled={isRemovingPasskeys}
                >
                  <HiTrash size={16} style={{ marginRight: isMobile ? '0' : '4px' }} />
                  {!isMobile && t("common:btn_disable", "Вимкнути")}
                </Button>
              ) : (
                <S.StatusBadge $active={false}>
                  {t("common:status_inactive", "Не налаштовано")}
                </S.StatusBadge>
              )}
            </S.ActionsRight>
          </S.SecurityCard>
        </S.SecuritySection>
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
