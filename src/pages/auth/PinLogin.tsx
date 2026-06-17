import { useState, useEffect, useCallback, useRef } from "react";
import styled from "styled-components";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { HiFingerPrint } from "react-icons/hi2";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";

import { ModernPinInput } from "../../components/auth/ModernPinInput";
import { AuthLayout } from "../../components/auth/AuthLayout";
import { Button } from "../../components/ui/Button";
import { usePasskeys } from "../../hooks/usePasskeys";
import api from "../../services/Axios";
import { useAuth } from "../../context/AuthContext";

const ErrorMessage = styled.p`
  color: var(--color-red-600);
  font-size: 0.85rem;
  margin-top: 1rem;
  min-height: 1.2rem;
  text-align: center;
`;

const PinLogin = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { unlock } = useAuth();
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { loginWithPasskey, isSupported, loading: passkeyLoading } = usePasskeys();
  const passkeyTriggered = useRef(false);

  const hasPasskeys = localStorage.getItem("has_passkeys") === "true";

  const handlePinSubmit = useCallback(async (finalPin: string) => {
    setLoading(true);
    setError("");
    try {
      const email = localStorage.getItem("user_email");
      if (!email) {
        toast.error("User email not found. Please log in with password.");
        navigate("/login");
        return;
      }

      console.log("Submitting PIN for email:", email);
      const response = await api.post("/login/pin", { email, pin: finalPin });
      console.log("PIN login response received:", response.status);
      
      const { access_token, user, token } = response.data;
      const finalToken = access_token || token;

      if (!finalToken) {
        throw new Error("No token received from server");
      }

      localStorage.setItem("token", finalToken);
      
      if (user) {
        queryClient.setQueryData(["me", finalToken], user);
        
        if (user.name) localStorage.setItem("user_name", user.name);
        if (user.id) localStorage.setItem("user_id", user.id);
        if (user.email) localStorage.setItem("user_email", user.email);
        localStorage.setItem("has_pin", "true");
        localStorage.setItem("has_passkeys", String(!!user.has_passkeys));
      }

      unlock(); 
      
      toast.success(t("auth:auth.login_alert_success", { name: user?.name || "" }));
      navigate("/dashboard", { replace: true, state: { unlocked: true } });
    } catch (err: unknown) {
      console.error("PIN login ERROR detail:", err);
      setError(t("auth:auth.login_alert_error"));
      
      setTimeout(() => {
        setPin("");
        setError("");
      }, 1000);
    } finally {
      setLoading(false);
    }
  }, [t, navigate, unlock, queryClient]);

  useEffect(() => {
    if (pin.length === 4) {
      handlePinSubmit(pin);
    }
  }, [pin, handlePinSubmit]);

  useEffect(() => {
    const triggerPasskey = async () => {
      if (isSupported && hasPasskeys && !passkeyTriggered.current) {
        passkeyTriggered.current = true;
        const success = await loginWithPasskey();
        if (success) {
          unlock();
          navigate("/dashboard", { replace: true, state: { unlocked: true } });
        }
      }
    };
    triggerPasskey();
  }, [isSupported, hasPasskeys, loginWithPasskey, unlock, navigate]);

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

        {isSupported && hasPasskeys && (
          <Button 
            type="button" 
            variation="primary"
            size="large"
            onClick={async () => {
              const success = await loginWithPasskey();
              if (success) {
                unlock();
                navigate("/dashboard", { replace: true, state: { unlocked: true } });
              }
            }} 
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
          onClick={() => navigate("/login")}
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

export default PinLogin;
