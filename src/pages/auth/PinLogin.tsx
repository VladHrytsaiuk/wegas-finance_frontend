import { useState, useEffect, useCallback, useRef } from "react";
import styled from "styled-components";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { HiFingerPrint } from "react-icons/hi2";
import { useNavigate } from "react-router-dom";

import { ModernPinInput } from "../../components/auth/ModernPinInput";
import { AuthLayout } from "../../components/auth/AuthLayout";
import { usePasskeys } from "../../hooks/usePasskeys";
import api from "../../services/Axios";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";

const ErrorMessage = styled.p`
  color: var(--color-red-600);
  font-size: 0.85rem;
  margin-top: 1rem;
  min-height: 1.2rem;
  text-align: center;
`;

const PasskeyButton = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  background: none;
  border: none;
  color: var(--color-brand-600);
  cursor: pointer;
  margin-top: 2.5rem;
  transition: all 0.2s;
  padding: 1rem;
  border-radius: 12px;

  &:hover {
    background-color: var(--color-brand-50);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  span {
    font-size: 0.9rem;
    font-weight: 500;
  }
`;

const PinLogin = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { unlock } = useAuth();
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { loginWithPasskey, isSupported, loading: passkeyLoading } = usePasskeys();
  const passkeyTriggered = useRef(false);

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
      console.log("Token saved to localStorage");
      
      if (user) {
        if (user.name) localStorage.setItem("user_name", user.name);
        if (user.id) localStorage.setItem("user_id", user.id);
        if (user.email) localStorage.setItem("user_email", user.email);
        localStorage.setItem("has_pin", "true");
      }

      unlock(); 
      console.log("AuthContext unlocked, navigating to dashboard...");
      toast.success(t("auth:auth.login_alert_success", { name: user?.name || "" }));
      navigate("/dashboard", { replace: true });
    } catch (err: unknown) {
      console.error("PIN login ERROR detail:", err);
      if (axios.isAxiosError(err)) {
        console.error("Axios Error Response:", err.response?.data);
        setError(err.response?.data?.message || t("auth:auth.login_alert_error"));
        if (err.response?.status === 429) {
          toast.error("Too many attempts. Please try again later.");
        }
      } else {
        setError(t("auth:auth.login_alert_error"));
      }
      
      // Анімація помилки і очищення
      setTimeout(() => {
        setPin("");
        setError("");
      }, 1000);
    } finally {
      setLoading(false);
    }
  }, [t, navigate, unlock]);

  useEffect(() => {
    if (pin.length === 4) {
      handlePinSubmit(pin);
    }
  }, [pin, handlePinSubmit]);

  // Спроба авто-входу через біометрію при завантаженні
  useEffect(() => {
    const triggerPasskey = async () => {
      if (isSupported && !passkeyTriggered.current) {
        passkeyTriggered.current = true;
        const success = await loginWithPasskey();
        if (success) {
          unlock(); // 🔥 РОЗБЛОКОВУЄМО СЕСІЮ
          navigate("/dashboard", { replace: true });
        }
      }
    };
    triggerPasskey();
  }, [isSupported, loginWithPasskey, unlock, navigate]);

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

        {isSupported && (
          <PasskeyButton 
            type="button" 
            onClick={async () => {
              const success = await loginWithPasskey();
              if (success) {
                unlock();
                navigate("/dashboard", { replace: true });
              }
            }} 
            disabled={loading || passkeyLoading}
          >
            <HiFingerPrint size={48} />
            <span>{t("auth:auth.login_with_biometrics", "Увійти за допомогою біометрії")}</span>
          </PasskeyButton>
        )}

        <button 
          type="button" 
          onClick={() => navigate("/login")}
          style={{ 
            marginTop: '2rem', 
            background: 'none', 
            border: 'none', 
            color: 'var(--color-grey-500)',
            textDecoration: 'underline',
            cursor: 'pointer'
          }}
        >
          {t("auth:auth.use_password_instead", "Використати пароль")}
        </button>
      </div>
    </AuthLayout>
  );
};

export default PinLogin;
