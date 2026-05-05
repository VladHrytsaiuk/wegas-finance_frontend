import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { AxiosError } from "axios"; // 👇 Для типізації помилок

import { registerApi } from "../../services/apiAuth";

export const useRegister = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [inviteCode, setInviteCode] = useState(""); // 👇 Новий стейт

  const { mutate, isPending } = useMutation({
    mutationFn: registerApi,
    onSuccess: () => {
      toast.success(t("auth.register_alert_success"));
      navigate("/login");
    },
    onError: (error: AxiosError<any>) => {
      // 👇 Обробка помилки інвайт-коду
      if (error.response?.status === 403) {
        toast.error(
          t("auth.error_invalid_invite_code", "Невірний код запрошення"),
        );
      } else {
        toast.error(
          error.response?.data?.error || t("auth.register_alert_error"),
        );
      }
    },
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || !inviteCode) return; // 👇 Перевірка
    mutate({ name, email, password, invite_code: inviteCode }); // 👇 Передача
  };

  return {
    state: {
      name,
      email,
      password,
      inviteCode, // 👇 Експорт
      isPending,
    },
    actions: {
      setName,
      setEmail,
      setPassword,
      setInviteCode, // 👇 Експорт
      handleSubmit,
    },
    t,
  };
};
