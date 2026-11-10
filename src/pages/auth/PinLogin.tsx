import styled from "styled-components";
import { usePinLogin } from "../../hooks/Auth/usePinLogin";
import { useIsMobile } from "../../hooks/useIsMobile";
import MobilePinLogin from "../../views/mobile/Auth/MobilePinLogin";
import { HiFingerPrint } from "react-icons/hi2";

import { ModernPinInput } from "../../components/auth/ModernPinInput";
import { AuthLayout } from "../../components/auth/AuthLayout";
import { Button } from "../../components/ui/Button";

const ErrorMessage = styled.p`
  color: var(--color-red-600);
  font-size: 0.85rem;
  margin-top: 1rem;
  min-height: 1.2rem;
  text-align: center;
`;

const DesktopPinLogin = () => {
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

  return (
    <AuthLayout
      title={t("auth:auth.pin_login_title", "Вхід за ПІН-кодом")}
      subtitle={t("auth:auth.pin_login_subtitle", "Введіть 4-значний код для швидкого входу")}
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <ModernPinInput 
          pin={pin} 
          onPinChange={setPin} 
          disabled={loading || passkeyLoading} 
          error={!!error}
        />
        
        <ErrorMessage>{error}</ErrorMessage>

        {canUseBiometrics && (
          <Button 
            type="button" 
            variation="primary"
            size="large"
            onClick={loginWithBiometrics} 
            disabled={loading || passkeyLoading}
            icon={<HiFingerPrint size={24} />}
            style={{ 
              marginTop: '2rem', 
              width: '100%',
              height: '56px',
              fontSize: '1rem',
              borderRadius: '16px'
            }}
          >
            {t("auth:auth.login_with_biometrics", "Увійти за допомогою біометрії")}
          </Button>
        )}

        <Button 
          type="button" 
          variation="secondary"
          size="large"
          onClick={goToPassword}
          style={{ 
            marginTop: '2.5rem', 
            width: '100%',
            height: '54px',
            fontSize: '1.1rem',
            borderRadius: '14px'
          }}
        >
          {t("auth:auth.use_password_instead", "Використати пароль")}
        </Button>
      </div>
    </AuthLayout>
  );
};

// На мобілці — новий екран у стилі iOS з тими самими можливостями.
function PinLogin() {
  const isMobile = useIsMobile();
  return isMobile ? <MobilePinLogin /> : <DesktopPinLogin />;
}

export default PinLogin;
