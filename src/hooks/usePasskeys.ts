import { create, get } from "@github/webauthn-json";
import api from "../services/Axios";
import { useState, useCallback } from "react";
import toast from "react-hot-toast";
import axios from "axios";

export const usePasskeys = () => {
  const [loading, setLoading] = useState(false);

  const isSupported = typeof window !== "undefined" && !!window.PublicKeyCredential;

  const registerPasskey = async () => {
    if (!isSupported) {
      toast.error("WebAuthn is not supported in this browser");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("/webauthn/register/options");
      const { options, session_id } = response.data;
      
      // options вже містить поле publicKey, тому передаємо його прямо в create
      const credential = await create(options);
      
      await api.post("/webauthn/register/verify", {
        session_id,
        response: credential
      });

      localStorage.setItem("has_passkeys", "true");
      toast.success("Passkey registered successfully!");
    } catch (err: unknown) {
      console.error("Passkey registration failed:", err);
      if (err instanceof Error && err.name !== "NotAllowedError") {
        if (axios.isAxiosError(err)) {
          toast.error(err.response?.data?.message || err.response?.data?.error || "Passkey registration failed");
        } else {
          toast.error("Passkey registration failed");
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const loginWithPasskey = useCallback(async (email?: string) => {
    if (!isSupported) return;

    // Якщо email не передано, пробуємо взяти його з localStorage (якщо користувач вже логінився раніше)
    const storedEmail = email || localStorage.getItem("user_email");
    if (!storedEmail) return;

    setLoading(true);
    try {
      const response = await api.post("/webauthn/login/options", { email: storedEmail });
      const { options, session_id } = response.data;

      // options вже містить поле publicKey, тому передаємо його прямо в get
      const assertion = await get(options);
      
      const verifyResponse = await api.post("/webauthn/login/verify", {
        session_id,
        response: assertion
      });
      const { access_token, user } = verifyResponse.data;

      localStorage.setItem("token", access_token);
      if (user?.name) {
        localStorage.setItem("user_name", user.name);
      }
      if (user?.email) {
        localStorage.setItem("user_email", user.email);
      }
      if (user?.has_pin) {
        localStorage.setItem("has_pin", "true");
      }

      toast.success("Authenticated with biometrics");
      return true;
    } catch (err: unknown) {
      console.error("Passkey login failed:", err);
      // Не показуємо помилку, якщо це авто-запуск і користувач просто скасував
      if (err instanceof Error && err.name !== "NotAllowedError") {
        // toast.error("Biometrics authentication failed");
      }
      return false;
    } finally {
      setLoading(false);
    }
  }, [isSupported]);

  return {
    registerPasskey,
    loginWithPasskey,
    loading,
    isSupported,
  };
};
