import { useState, useEffect, useRef, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  HiKey,
  HiLinkSlash,
  HiCheckCircle,
  HiArrowPath,
  HiFingerPrint,
  HiLockClosed,
} from "react-icons/hi2";
import api from "../../services/Axios";
import { getMeApi } from "../../services/apiUsers";
import axios from "axios";
import { useTranslation } from "react-i18next";

import { ModernPinInput } from "../../components/auth/ModernPinInput";

// --- PIN CODE FORM (REDESIGNED) ---

function SetPinForm({ onCloseModal }: { onCloseModal?: () => void }) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1); // 1: Enter, 2: Confirm
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (step === 1 && pin.length === 4) {
      const timer = setTimeout(() => {
        setStep(2);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [pin, step]);

  const handleSubmit = useCallback(async () => {
    setLoading(true);
    try {
      await api.post("/users/pin", { pin });
      localStorage.setItem("has_pin", "true");
      toast.success(t("settings:profilePage.pin_success", "ПІН-код успішно встановлено!"));
      
      // 🔥 Рефетчимо дані користувача, щоб статус оновився
      await queryClient.invalidateQueries({ queryKey: ["me"] });
      
      onCloseModal?.();
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        toast.error(err.response?.data?.message || "Failed to set PIN code");
      }
    } finally {
      setLoading(false);
    }
  }, [pin, t, onCloseModal, queryClient]);

  useEffect(() => {
    if (step === 2 && confirmPin.length === 4) {
      if (pin === confirmPin) {
        handleSubmit();
      } else {
        setError(true);
        toast.error(t("settings:profilePage.pin_mismatch", "ПІН-коди не збігаються"));
        setTimeout(() => {
          setConfirmPin("");
          setError(false);
        }, 1000);
      }
    }
  }, [confirmPin, pin, step, handleSubmit, t]);

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0.5rem 0' }}>
      <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
        <p style={{ fontSize: '1rem', fontWeight: 600, margin: '0 0 0.25rem 0', color: 'var(--color-text-main)' }}>
          {step === 1 
            ? t("settings:profilePage.label_enter_pin", "Встановіть ПІН-код") 
            : t("settings:profilePage.label_confirm_pin", "Підтвердьте ПІН-код")}
        </p>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.8rem', margin: 0 }}>
          {step === 1 
            ? t("settings:profilePage.desc_enter_pin", "Введіть 4 цифри")
            : t("settings:profilePage.desc_confirm_pin", "Введіть код ще раз для збереження")}
        </p>
      </div>

      <ModernPinInput 
        pin={step === 1 ? pin : confirmPin} 
        onPinChange={step === 1 ? setPin : setConfirmPin} 
        disabled={loading}
        error={error}
      />

      <div style={{ marginTop: '1.5rem', width: '100%', display: 'flex', justifyContent: 'center' }}>
        <button 
          type="button"
          style={{ 
            padding: '8px 24px', 
            fontSize: '0.85rem', 
            borderRadius: '8px', 
            border: 'none',
            background: 'transparent',
            color: 'var(--color-text-secondary)',
            textDecoration: 'underline',
            cursor: 'pointer'
          }} 
          onClick={onCloseModal}
          disabled={loading}
        >
          {t("settings:profilePage.pass_button_cancel", "Скасувати")}
        </button>
      </div>
    </div>
  );
}

import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import Modal from "../../components/ui/Modal";
import { CenteredSpinner } from "../../components/ui/CenteredSpinner";

import {
  useProfileForm,
  useChangePasswordForm,
} from "../../hooks/Settings/useProfile";
import { useIsMobile } from "../../hooks/useIsMobile";
import { usePasskeys } from "../../hooks/usePasskeys";
import MobilePageHeader from "../../components/mobile/MobilePageHeader";
import * as S from "./Profile.styles";

import MonobankModal from "../../components/sync/MonobankModal";
import { ConfirmDisconnectModal } from "../../components/sync/ConfirmDisconnectModal";
import { monobankApi } from "../../services/apiMonobank";
import { useSync } from "../../context/SyncContext";

// --- HELPER COMPONENT ---
// ... (DisconnectModalAdapter remains the same)
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

// --- CHANGE PASSWORD FORM ---
function ChangePasswordForm({ onCloseModal }: { onCloseModal?: () => void }) {
  const { state, actions, t } = useChangePasswordForm();
  const { oldPassword, newPassword, confirmPassword, isPending } = state;

  return (
    <S.PasswordForm onSubmit={actions.handleSubmit}>
      <div>
        <S.Label>{t("settings:profilePage.pass_label_old")}</S.Label>
        <Input
          type="password"
          autoComplete="current-password"
          value={oldPassword}
          onChange={(e) => actions.setOldPassword(e.target.value)}
          placeholder="••••••"
        />
      </div>

      <S.PasswordGrid>
        <div>
          <S.Label>{t("settings:profilePage.pass_label_new")}</S.Label>
          <Input
            type="password"
            autoComplete="new-password"
            value={newPassword}
            onChange={(e) => actions.setNewPassword(e.target.value)}
          />
        </div>
        <div>
          <S.Label>{t("settings:profilePage.pass_label_confirm")}</S.Label>
          <Input
            type="password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => actions.setConfirmPassword(e.target.value)}
          />
        </div>
      </S.PasswordGrid>

      <S.ModalActions>
        <S.CancelButton type="button" onClick={onCloseModal}>
          {t("settings:profilePage.pass_button_cancel")}
        </S.CancelButton>

        <Button type="submit" style={{ width: "auto" }} disabled={isPending}>
          {isPending
            ? t("settings:profilePage.pass_button_saving")
            : t("settings:profilePage.pass_button_save")}
        </Button>
      </S.ModalActions>
    </S.PasswordForm>
  );
}

// --- MAIN PROFILE COMPONENT ---

function Profile() {
  const { state, actions, t } = useProfileForm();
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();
  const { name, email, isLoading, isUpdating } = state;
  const { registerPasskey, loading: passkeyLoading, isSupported } = usePasskeys();

  const { statusData, startPolling, stopPolling } = useSync();
  const isSyncing = statusData.is_running;
  const prevIsSyncing = useRef(isSyncing);

  const [isMonoConnected, setIsMonoConnected] = useState(false);
  const [isCheckingMono, setIsCheckingMono] = useState(true);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [isForceSyncing, setIsForceSyncing] = useState(false);

  // Отримуємо дані користувача для перевірки PIN/Passkey
  const { data: userDetails } = useQuery({
    queryKey: ["me"],
    queryFn: getMeApi,
  });

  const hasPassword = !!userDetails?.has_password;
  const hasPin = !!userDetails?.has_pin;
  const hasPasskeys = !!userDetails?.has_passkeys;

  const handleRegisterPasskey = async () => {
    await registerPasskey();
    queryClient.invalidateQueries({ queryKey: ["me"] });
  };

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

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              type="submit"
              style={{ width: isMobile ? "100%" : "auto" }}
              disabled={isUpdating}
            >
              {t("settings:profilePage.button_update_profile")}
            </Button>
          </div>
        </S.Form>

        {/* --- SECURITY SECTION --- */}
        <S.SecuritySection>
          <S.SectionTitle>{t("settings:profilePage.title_security", "Безпека")}</S.SectionTitle>
          <S.SecurityList>
            
            {/* Password Item */}
            <S.SecurityItem>
              <S.SecurityInfo>
                <div style={{ position: 'relative' }}>
                  <HiKey size={24} color={hasPassword ? "var(--color-grey-400)" : "var(--color-grey-300)"} />
                  {hasPassword && (
                    <HiCheckCircle 
                      size={14} 
                      color="var(--color-green-500)" 
                      style={{ position: 'absolute', bottom: -2, right: -4, background: 'var(--color-bg-main)', borderRadius: '50%' }} 
                    />
                  )}
                </div>
                <S.SecurityText>
                  <S.SecurityLabel>
                    {t("settings:profilePage.label_password", "Пароль")}
                    <S.StatusTag $active={hasPassword}>
                      {hasPassword ? t("settings:profilePage.status_active", "Активно") : t("settings:profilePage.status_not_set", "Не встановлено")}
                    </S.StatusTag>
                  </S.SecurityLabel>
                  <S.SecurityDesc>{t("settings:profilePage.desc_password", "Використовується для входу в акаунт")}</S.SecurityDesc>
                </S.SecurityText>
              </S.SecurityInfo>
              <Modal.Open opens="change-password">
                <S.SecondaryButton type="button">
                  {t("settings:profilePage.button_change_password")}
                </S.SecondaryButton>
              </Modal.Open>
            </S.SecurityItem>

            {/* PIN Code Item */}
            <S.SecurityItem>
              <S.SecurityInfo>
                <div style={{ position: 'relative' }}>
                  <HiLockClosed size={24} color={hasPin ? "var(--color-grey-400)" : "var(--color-grey-300)"} />
                  {hasPin && (
                    <HiCheckCircle 
                      size={14} 
                      color="var(--color-green-500)" 
                      style={{ position: 'absolute', bottom: -2, right: -4, background: 'var(--color-bg-main)', borderRadius: '50%' }} 
                    />
                  )}
                </div>
                <S.SecurityText>
                  <S.SecurityLabel>
                    {t("settings:profilePage.label_pin", "ПІН-код")}
                    <S.StatusTag $active={hasPin}>
                      {hasPin ? t("settings:profilePage.status_active", "Активно") : t("settings:profilePage.status_not_set", "Не встановлено")}
                    </S.StatusTag>
                  </S.SecurityLabel>
                  <S.SecurityDesc>{t("settings:profilePage.desc_pin", "Для швидкого доступу на мобільних пристроях")}</S.SecurityDesc>
                </S.SecurityText>
              </S.SecurityInfo>
              <Modal.Open opens="set-pin">
                <S.SecondaryButton type="button">
                  {hasPin ? t("settings:profilePage.button_change_pin", "Змінити ПІН") : t("settings:profilePage.button_set_pin", "Налаштувати")}
                </S.SecondaryButton>
              </Modal.Open>
            </S.SecurityItem>

            {/* Passkey Item */}
            <S.SecurityItem $disabled={!hasPin || !isSupported}>
              <S.SecurityInfo>
                <div style={{ position: 'relative' }}>
                  <HiFingerPrint size={24} color={hasPasskeys ? "var(--color-grey-400)" : "var(--color-grey-300)"} />
                  {hasPasskeys && (
                    <HiCheckCircle 
                      size={14} 
                      color="var(--color-green-500)" 
                      style={{ position: 'absolute', bottom: -2, right: -4, background: 'var(--color-bg-main)', borderRadius: '50%' }} 
                    />
                  )}
                </div>
                <S.SecurityText>
                  <S.SecurityLabel>
                    {t("settings:profilePage.label_passkey", "Біометрія (Passkey)")}
                    <S.StatusTag $active={hasPasskeys}>
                      {hasPasskeys ? t("settings:profilePage.status_active", "Активно") : t("settings:profilePage.status_not_set", "Не встановлено")}
                    </S.StatusTag>
                  </S.SecurityLabel>
                  <S.SecurityDesc>
                    {!isSupported 
                      ? t("settings:profilePage.desc_passkey_unsupported", "Не підтримується цим браузером")
                      : !hasPin 
                        ? t("settings:profilePage.desc_passkey_no_pin", "Спочатку встановіть ПІН-код")
                        : t("settings:profilePage.desc_passkey", "Вхід через FaceID / TouchID")}
                  </S.SecurityDesc>
                </S.SecurityText>
              </S.SecurityInfo>
              {isSupported && hasPin && (
                <S.SecondaryButton
                  type="button"
                  onClick={handleRegisterPasskey}
                  disabled={passkeyLoading}
                >
                  {passkeyLoading ? t("settings:profilePage.loading", "...") : (hasPasskeys ? t("settings:profilePage.button_update_passkey", "Оновити") : t("settings:profilePage.button_set_passkey", "Налаштувати"))}
                </S.SecondaryButton>
              )}
            </S.SecurityItem>

          </S.SecurityList>
        </S.SecuritySection>

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
                          <HiCheckCircle /> {t("settings:integrations.status_connected")}
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
      </div>

      {/* --- MODALS --- */}
      <Modal.Window name="change-password">
        <S.PasswordFormContainer>
          <S.ModalTitle>{t("settings:profilePage.title_change_password")}</S.ModalTitle>
          <ChangePasswordForm />
        </S.PasswordFormContainer>
      </Modal.Window>

      <Modal.Window name="monobank-settings">
        <MonobankModal />
      </Modal.Window>

      <Modal.Window name="confirm-disconnect">
        <DisconnectModalAdapter
          onConfirm={handleGlobalDisconnect}
          isPending={isDisconnecting}
        />
      </Modal.Window>

      <Modal.Window name="set-pin">
        <S.PasswordFormContainer>
          <S.ModalTitle>{t("settings:profilePage.title_set_pin", "Налаштування ПІН-коду")}</S.ModalTitle>
          <SetPinForm /> 
        </S.PasswordFormContainer>
      </Modal.Window>
    </Modal>
  );
}

export default Profile;
