import { useState, useEffect, useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";

import { usePasskeys } from "../usePasskeys";
import api from "../../services/Axios";
import { useAuth } from "../../context/AuthContext";

// Логіка входу за PIN і (якщо підказка has_passkeys) біометрією — спільна для
// старої та мобільної сторінки. Нічого не змінено проти колишньої PinLogin.
export function usePinLogin() {
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

      const response = await api.post("/login/pin", { email, pin: finalPin });
      
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

  const loginWithBiometrics = async () => {
    const success = await loginWithPasskey();
    if (success) {
      unlock();
      navigate("/dashboard", { replace: true, state: { unlocked: true } });
    }
  };

  return {
    t,
    pin,
    setPin,
    loading,
    error,
    passkeyLoading,
    canUseBiometrics: isSupported && hasPasskeys,
    loginWithBiometrics,
    goToPassword: () => navigate("/login"),
  };
}
