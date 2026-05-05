import { useState, useEffect } from "react";
import {
  HiKey,
  HiLinkSlash,
  HiCheckCircle,
  HiArrowPath,
} from "react-icons/hi2";
import toast from "react-hot-toast";

import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import Modal from "../../components/ui/Modal";
import Spinner from "../../components/ui/Spinner";

import {
  useProfileForm,
  useChangePasswordForm,
} from "../../hooks/Settings/useProfile";
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

// --- CHANGE PASSWORD FORM ---

function ChangePasswordForm() {
  const { state, actions, t } = useChangePasswordForm();
  const { oldPassword, newPassword, confirmPassword, isPending } = state;

  return (
    <S.PasswordForm onSubmit={actions.handleSubmit}>
      <div>
        <S.Label>{t("settings:profilePage.pass_label_old")}</S.Label>
        <Input
          type="password"
          // 🔥 Важливо для браузера: це поточний пароль
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
            // 🔥 Важливо: це новий пароль
            autoComplete="new-password"
            value={newPassword}
            onChange={(e) => actions.setNewPassword(e.target.value)}
          />
        </div>
        <div>
          <S.Label>{t("settings:profilePage.pass_label_confirm")}</S.Label>
          <Input
            type="password"
            // 🔥 Важливо: підтвердження нового пароля
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => actions.setConfirmPassword(e.target.value)}
          />
        </div>
      </S.PasswordGrid>

      <S.ModalActions>
        <S.CancelButton type="button" onClick={actions.closeModal}>
          {t("settings:profilePage.pass_button_cancel")}
        </S.CancelButton>

        {/* 🔥 КРИТИЧНО: Додано type="submit", інакше форма не відправиться */}
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
  const { name, email, isLoading, isUpdating } = state;

  const { statusData, startPolling, stopPolling } = useSync();
  const isSyncing = statusData.is_running;

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
      } catch (error: any) {
        if (error.response && error.response.status === 404) {
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
      toast.success("Monobank успішно відключено");
    } catch (error) {
      toast.error("Помилка відключення");
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
      toast.success("Оновлення даних запущено");
    } catch (error) {
      toast.error("Не вдалося запустити синхронізацію");
      if (typeof stopPolling === "function") stopPolling();
    } finally {
      setIsForceSyncing(false);
    }
  };

  // 4. Update status when sync finishes
  useEffect(() => {
    if (!isSyncing) {
      const checkStatus = async () => {
        try {
          await monobankApi.getSettings();
          setIsMonoConnected(true);
        } catch (err: any) {
          if (err.response?.status === 404) {
            setIsMonoConnected(false);
          }
        }
      };
      const timer = setTimeout(checkStatus, 1000);
      return () => clearTimeout(timer);
    }
  }, [isSyncing]);

  if (isLoading) {
    return (
      <S.SpinnerContainer>
        <Spinner />
      </S.SpinnerContainer>
    );
  }

  return (
    <Modal>
      <S.SectionTitle>{t("settings:profilePage.title_profile")}</S.SectionTitle>

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

        <S.ButtonGroup>
          <Modal.Open opens="change-password">
            <S.SecondaryButton type="button">
              <HiKey />
              {t("settings:profilePage.button_change_password")}
            </S.SecondaryButton>
          </Modal.Open>

          <Button
            type="submit" // 🔥 Додай це
            style={{ width: "auto" }}
            disabled={isUpdating}
          >
            {t("settings:profilePage.button_update_profile")}
          </Button>
        </S.ButtonGroup>
      </S.Form>

      <S.IntegrationsSection>
        <S.SectionTitle>Інтеграції</S.SectionTitle>

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
                        <HiArrowPath className="spin" /> Синхронізація...
                      </>
                    ) : isMonoConnected ? (
                      <>
                        <HiCheckCircle /> Підключено
                      </>
                    ) : (
                      "Не підключено"
                    )}
                  </S.ConnectionStatus>
                )}
              </S.BankTitleRow>
              <S.BankDescription>
                Автоматичний імпорт транзакцій та балансів
              </S.BankDescription>
            </S.TextInfo>
          </S.IntegrationLeft>

          <S.ActionsRight>
            {isMonoConnected && (
              <S.SyncButton
                $variation="secondary"
                $isSpinning={isForceSyncing || isSyncing}
                onClick={handleForceSync}
                title="Синхронізувати зараз"
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
                  title="Відключити синхронізацію"
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
                  ? "Синхронізація..."
                  : isMonoConnected
                    ? "Налаштувати"
                    : "Підключити"}
              </Button>
            </Modal.Open>
          </S.ActionsRight>
        </S.IntegrationCard>
      </S.IntegrationsSection>

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
    </Modal>
  );
}

export default Profile;
