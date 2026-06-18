import { useState, useCallback, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import {
  HiKey,
  HiLockClosed,
  HiFingerPrint,
  HiShieldCheck,
} from "react-icons/hi2";

import api from "../../services/Axios";
import { getMeApi, removePinApi, removePasskeysApi } from "../../services/apiUsers";
import { usePasskeys } from "../../hooks/usePasskeys";
import { useIsMobile } from "../../hooks/useIsMobile";
import { useModal } from "../../components/ui/Modal";
import Modal from "../../components/ui/Modal";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { ModernPinInput } from "../../components/auth/ModernPinInput";
import MobilePageHeader from "../../components/mobile/MobilePageHeader";
import { useChangePasswordForm } from "../../hooks/Settings/useProfile";

import * as S from "./Security.styles";

// --- PIN CODE FORM ---
function SetPinForm() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { close } = useModal();
  const [step, setStep] = useState(1);
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
      await queryClient.invalidateQueries({ queryKey: ["me"] });
      close();
    } catch (err: unknown) {
      toast.error("Failed to set PIN code");
    } finally {
      setLoading(false);
    }
  }, [pin, t, queryClient, close]);

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
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <p style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.25rem', color: 'var(--color-text-main)' }}>
          {step === 1 
            ? t("settings:profilePage.label_enter_pin", "Встановіть ПІН-код") 
            : t("settings:profilePage.label_confirm_pin", "Підтвердьте ПІН-код")}
        </p>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>
          {step === 1 
            ? t("settings:profilePage.desc_enter_pin", "Введіть 4 цифри для швидкого входу")
            : t("settings:profilePage.desc_confirm_pin", "Введіть код ще раз для збереження")}
        </p>
      </div>

      <ModernPinInput 
        pin={step === 1 ? pin : confirmPin} 
        onPinChange={step === 1 ? setPin : setConfirmPin} 
        disabled={loading}
        error={error}
      />

      <div style={{ marginTop: '2rem' }}>
        <Button variation="secondary" onClick={close} disabled={loading} style={{ border: 'none', textDecoration: 'underline', boxShadow: 'none' }}>
          {t("settings:profilePage.pass_button_cancel", "Скасувати")}
        </Button>
      </div>
    </div>
  );
}

// --- CHANGE PASSWORD FORM ---
function ChangePasswordForm() {
  const { state, actions, t } = useChangePasswordForm();
  const { close } = useModal();
  const { oldPassword, newPassword, confirmPassword, isPending } = state;

  return (
    <S.PasswordForm onSubmit={async (e) => {
      await actions.handleSubmit(e);
    }}>
      <div>
        <S.Label>{t("settings:profilePage.pass_label_old")}</S.Label>
        <Input
          type="password"
          autoComplete="current-password"
          value={oldPassword}
          onChange={(e) => actions.setOldPassword(e.target.value)}
          placeholder="••••••"
          required
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
            required
          />
        </div>
        <div>
          <S.Label>{t("settings:profilePage.pass_label_confirm")}</S.Label>
          <Input
            type="password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => actions.setConfirmPassword(e.target.value)}
            required
          />
        </div>
      </S.PasswordGrid>

      <S.ModalActions>
        <Button variation="secondary" size="small" onClick={close}>
          {t("settings:profilePage.pass_button_cancel")}
        </Button>

        <Button type="submit" size="small" disabled={isPending}>
          {isPending
            ? t("settings:profilePage.pass_button_saving")
            : t("settings:profilePage.pass_button_save")}
        </Button>
      </S.ModalActions>
    </S.PasswordForm>
  );
}

function SecurityContent() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();
  const { registerPasskey, loading: passkeyLoading, isSupported } = usePasskeys();
  const { open } = useModal();

  const { data: userDetails, isLoading } = useQuery({
    queryKey: ["me"],
    queryFn: getMeApi,
  });

  const { mutate: removePin, isPending: isRemovingPin } = useMutation({
    mutationFn: removePinApi,
    onSuccess: () => {
      toast.success(t("settings:profilePage.pin_removed_success", "ПІН-код успішно вимкнено"));
      queryClient.invalidateQueries({ queryKey: ["me"] });
      localStorage.setItem("has_pin", "false");
    },
    onError: () => toast.error("Не вдалося вимкнути ПІН-код"),
  });

  const { mutate: removePasskeys, isPending: isRemovingPasskeys } = useMutation({
    mutationFn: removePasskeysApi,
    onSuccess: () => {
      toast.success(t("settings:profilePage.passkeys_removed_success", "Біометрію успішно вимкнено"));
      queryClient.invalidateQueries({ queryKey: ["me"] });
      localStorage.setItem("has_passkeys", "false");
    },
    onError: () => toast.error("Не вдалося вимкнути біометрію"),
  });

  const hasPassword = !!userDetails?.has_password;
  const hasPin = !!userDetails?.has_pin;
  const hasPasskeys = !!userDetails?.has_passkeys;

  const handleTogglePin = () => {
    if (hasPin) {
      if (window.confirm(t("settings:profilePage.confirm_remove_pin", "Ви впевнені, що хочете вимкнути ПІН-код?"))) {
        removePin();
      }
    } else {
      open("set-pin");
    }
  };

  const handleTogglePasskey = async () => {
    if (hasPasskeys) {
      if (window.confirm(t("settings:profilePage.confirm_remove_passkeys", "Ви впевнені, що хочете видалити біометрію?"))) {
        removePasskeys();
      }
    } else {
      await registerPasskey();
      queryClient.invalidateQueries({ queryKey: ["me"] });
    }
  };

  if (isLoading) return null;

  return (
    <>
      {isMobile && <MobilePageHeader title={t("settings:settingsLayout.menu_security", "Безпека")} />}
      <S.Container style={{ padding: isMobile ? "16px" : "0" }}>
        {!isMobile && (
          <S.SectionTitle>
            <HiShieldCheck style={{ verticalAlign: 'middle', marginRight: '8px', color: 'var(--color-brand-600)' }} />
            {t("settings:profilePage.title_security", "Безпека")}
          </S.SectionTitle>
        )}

        <S.SecurityList>
          {/* Password */}
          <S.SecurityItem>
            <S.SecurityInfo>
              <S.IconBox $active={hasPassword}>
                <HiKey />
              </S.IconBox>
              <S.SecurityText>
                <S.SecurityLabel>{t("settings:profilePage.label_password", "Пароль")}</S.SecurityLabel>
                <S.SecurityDesc>{t("settings:profilePage.desc_password", "Вхід в акаунт")}</S.SecurityDesc>
              </S.SecurityText>
            </S.SecurityInfo>
            <Modal.Open opens="change-password">
              <S.ActionButton variation="secondary" size="small">
                {t("settings:profilePage.button_change_password")}
              </S.ActionButton>
            </Modal.Open>
          </S.SecurityItem>

          {/* PIN Code */}
          <S.SecurityItem $disabled={true}>
            <S.SecurityInfo>
              <S.IconBox $active={hasPin}>
                <HiLockClosed />
              </S.IconBox>
              <S.SecurityText>
                <S.SecurityLabel>{t("settings:profilePage.label_pin", "ПІН-код")}</S.SecurityLabel>
                <S.SecurityDesc>{t("settings:profilePage.desc_pin", "Швидкий доступ")}</S.SecurityDesc>
              </S.SecurityText>
            </S.SecurityInfo>
            <S.SecurityActions>
              <S.SwitchButton 
                $isActive={hasPin} 
                onClick={handleTogglePin} 
                disabled={true}
              />
            </S.SecurityActions>
          </S.SecurityItem>

          {/* Passkey */}
          <S.SecurityItem $disabled={true}>
            <S.SecurityInfo>
              <S.IconBox $active={hasPasskeys}>
                <HiFingerPrint />
              </S.IconBox>
              <S.SecurityText>
                <S.SecurityLabel>{t("settings:profilePage.label_passkey", "Біометрія")}</S.SecurityLabel>
                <S.SecurityDesc>
                  {!isSupported 
                    ? t("settings:profilePage.desc_passkey_unsupported", "Не підтримується")
                    : !hasPin 
                      ? t("settings:profilePage.desc_passkey_no_pin", "Потрібен ПІН")
                      : "FaceID / TouchID"}
                </S.SecurityDesc>
              </S.SecurityText>
            </S.SecurityInfo>
            <S.SecurityActions>
              <S.SwitchButton 
                $isActive={hasPasskeys} 
                onClick={handleTogglePasskey}
                disabled={true}
              />
            </S.SecurityActions>
          </S.SecurityItem>
        </S.SecurityList>
      </S.Container>

      <Modal.Window name="change-password">
        <S.ModalContainer>
          <S.ModalTitle>{t("settings:profilePage.title_change_password")}</S.ModalTitle>
          <ChangePasswordForm />
        </S.ModalContainer>
      </Modal.Window>

      <Modal.Window name="set-pin">
        <S.ModalContainer>
          <SetPinForm /> 
        </S.ModalContainer>
      </Modal.Window>
    </>
  );
}

function Security() {
  return (
    <Modal>
      <SecurityContent />
    </Modal>
  );
}

export default Security;
