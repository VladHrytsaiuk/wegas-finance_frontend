import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

import { useTheme } from "../../context/ThemeContext";
import { loginApi } from "../../services/apiAuth";
import { settingsService } from "../../services/apiSettings";
import { useAuth } from "../../context/AuthContext";

interface UseLoginProps {
  setToken: (token: string) => void;
}

export const useLogin = ({ setToken }: UseLoginProps) => {
  const { t, i18n } = useTranslation();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const { unlock } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { mutate, isPending } = useMutation({
    mutationFn: loginApi,
    onSuccess: async (data) => {
      // 1. Зберігаємо дані
      localStorage.setItem("token", data.token);
      localStorage.setItem("user_name", data.user.name);
      localStorage.setItem("user_id", data.user.id);
      localStorage.setItem("user_email", data.user.email);
      localStorage.setItem("has_pin", String(!!data.user.has_pin)); // Зберігаємо хінт про ПІН

      // 2. Оновлюємо глобальний стейт авторизації
      setToken(data.token);

      // 3. Розблоковуємо сесію (ПІН не потрібен відразу після логіну)
      unlock();

      // 4. Синхронізація налаштувань (фоном)
      // Ми не чекаємо await тут, щоб не блокувати перехід на дешборд,
      // але catch ловить помилки, щоб не ламати UI
      settingsService
        .saveSettings({
          language: i18n.language,
          theme: theme,
          base_currency: data.user.base_currency || "UAH",
        })
        .catch((err) => {
          console.warn("Settings sync failed:", err);
          toast.error(t("common:errors.settings_sync_failed", "Не вдалося синхронізувати налаштування"));
        });

      toast.success(t("auth:auth.login_alert_success", { name: data.user.name }));
      navigate("/dashboard", { replace: true });
    },
    onError: (error: any) => {
      // Якщо бекенд повертає конкретну помилку текстом
      const msg = error.response?.data?.error || t("auth:auth.login_alert_error");
      toast.error(msg);
    },
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    mutate({ email, password });
  };

  return {
    state: {
      email,
      password,
      isPending,
    },
    actions: {
      setEmail,
      setPassword,
      handleSubmit,
    },
    t,
  };
};
