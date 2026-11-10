import { useEffect } from "react";
import { HiOutlineBackspace, HiOutlineFingerPrint } from "react-icons/hi2";
import styled, { css, keyframes } from "styled-components";

import { usePinLogin } from "../../../hooks/Auth/usePinLogin";
import { usePageTitle } from "../../../hooks/usePageTitle";
import { AuthLinkButton, AuthShell } from "./AuthShell";

// Вхід за PIN: чотири крапки й цифрова клавіатура, як екран пароля iOS. Лише
// дизайн сторінки /pin-login: у потік входу її не підключаємо (рішення Vlad),
// а біометрія з'являється, тільки якщо вже є підказка has_passkeys.

const shake = keyframes`
  0%, 100% { transform: translateX(0); }
  20%, 60% { transform: translateX(-8px); }
  40%, 80% { transform: translateX(8px); }
`;

const Dots = styled.div<{ $error: boolean }>`
  display: flex;
  justify-content: center;
  gap: 18px;
  ${(p) =>
    p.$error &&
    css`
      animation: ${shake} 0.4s ease;
    `}
`;

const Dot = styled.span<{ $filled: boolean; $error: boolean }>`
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 1.5px solid ${(p) => (p.$error ? "#ff3b30" : "var(--m-label-2)")};
  background: ${(p) => (p.$filled ? (p.$error ? "#ff3b30" : "var(--m-label)") : "transparent")};
  transition: background 0.12s ease;
`;

const Pad = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 76px);
  justify-content: center;
  gap: 14px 22px;
`;

const Key = styled.button`
  width: 76px;
  height: 76px;
  border: none;
  border-radius: 50%;
  background: var(--m-surface);
  color: var(--m-label);
  font: inherit;
  font-size: 30px;
  font-weight: 400;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;

  &:active {
    background: var(--m-fill);
  }

  &:disabled {
    opacity: 0.5;
  }
`;

const GhostKey = styled(Key)`
  background: transparent;
  color: var(--m-label-2);

  &:active {
    background: transparent;
    color: var(--m-label);
  }
`;

const Message = styled.p`
  margin: 0;
  min-height: 20px;
  text-align: center;
  font-size: 14px;
  color: #ff3b30;
`;

const DIGITS = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];

export default function MobilePinLogin() {
  const {
    t,
    pin,
    setPin,
    loading,
    error,
    passkeyLoading,
    canUseBiometrics,
    loginWithBiometrics,
    goToPassword,
  } = usePinLogin();
  usePageTitle(t("auth:auth.pin_login_title", "Вхід за ПІН-кодом"));
  const disabled = loading || passkeyLoading;

  const press = (digit: string) => {
    if (!disabled && pin.length < 4) setPin(pin + digit);
  };
  const erase = () => {
    if (!disabled) setPin(pin.slice(0, -1));
  };

  // З фізичною клавіатурою (iPad, комп'ютер) цифри теж працюють.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (/^\d$/.test(event.key) && !disabled && pin.length < 4)
        setPin(pin + event.key);
      else if (event.key === "Backspace" && !disabled) setPin(pin.slice(0, -1));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [pin, disabled, setPin]);

  return (
    <AuthShell
      title={t("auth:auth.pin_login_title", "Вхід за ПІН-кодом")}
      subtitle={t(
        "auth:auth.pin_login_subtitle",
        "Введіть 4-значний код для швидкого входу",
      )}
      footer={
        <AuthLinkButton type="button" onClick={goToPassword}>
          {t("auth:auth.use_password_instead", "Використати пароль")}
        </AuthLinkButton>
      }
    >
      <Dots $error={!!error} role="img" aria-label={`${pin.length} / 4`}>
        {[0, 1, 2, 3].map((i) => (
          <Dot key={i} $filled={i < pin.length} $error={!!error} />
        ))}
      </Dots>
      <Message role="alert">{error}</Message>

      <Pad>
        {DIGITS.map((digit) => (
          <Key
            key={digit}
            type="button"
            disabled={disabled}
            onClick={() => press(digit)}
          >
            {digit}
          </Key>
        ))}
        {canUseBiometrics ? (
          <GhostKey
            type="button"
            aria-label={t(
              "auth:auth.login_with_biometrics",
              "Увійти за допомогою біометрії",
            )}
            disabled={disabled}
            onClick={loginWithBiometrics}
          >
            <HiOutlineFingerPrint size={30} />
          </GhostKey>
        ) : (
          <span />
        )}
        <Key type="button" disabled={disabled} onClick={() => press("0")}>
          0
        </Key>
        <GhostKey
          type="button"
          aria-label={t("auth:auth.pin_delete")}
          disabled={disabled || pin.length === 0}
          onClick={erase}
        >
          <HiOutlineBackspace size={28} />
        </GhostKey>
      </Pad>
    </AuthShell>
  );
}
