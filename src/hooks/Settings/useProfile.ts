import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

import {
  getMeApi,
  updateProfileApi,
  changePasswordApi,
} from "../../services/apiUsers";
import { useModal } from "../../components/ui/Modal";

// --- Hook for Main Profile Form ---
export const useProfileForm = () => {
  const { t } = useTranslation();
  // 2. Ініціалізуємо клієнт
  const queryClient = useQueryClient();

  const { data: user, isLoading } = useQuery({
    queryKey: ["me"],
    queryFn: getMeApi,
  });

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
    }
  }, [user]);

  const { mutate: updateProfile, isPending: isUpdatingProfile } = useMutation({
    mutationFn: updateProfileApi,
    onSuccess: (data) => {
      toast.success(t("settings:profilePage.alert_profile_success"));

      if (data?.name) {
        localStorage.setItem("user_name", data.name);
      }

      // 3. 🔥 ВАЖЛИВО: Оновлюємо кеш, щоб отримати свіжі дані з сервера
      queryClient.invalidateQueries({ queryKey: ["me"] });
    },
    onError: () => {
      toast.error(t("settings:profilePage.alert_profile_error"));
    },
  });

  const { mutate: removePin, isPending: isRemovingPin } = useMutation({
    mutationFn: async () => {
      const { removePinApi } = await import("../../services/apiUsers");
      return removePinApi();
    },
    onSuccess: () => {
      toast.success("ПІН-код успішно вимкнено");
      queryClient.invalidateQueries({ queryKey: ["me"] });
      localStorage.removeItem("has_pin");
    },
    onError: () => {
      toast.error("Не вдалося вимкнути ПІН-код");
    },
  });

  const { mutate: removePasskeys, isPending: isRemovingPasskeys } = useMutation({
    mutationFn: async () => {
      const { removePasskeysApi } = await import("../../services/apiUsers");
      return removePasskeysApi();
    },
    onSuccess: () => {
      toast.success("Біометрію успішно вимкнено");
      queryClient.invalidateQueries({ queryKey: ["me"] });
    },
    onError: () => {
      toast.error("Не вдалося вимкнути біометрію");
    },
  });

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;
    updateProfile({ name, email });
  };

  return {
    state: {
      name,
      email,
      isLoading,
      isUpdating: isUpdatingProfile,
      user,
      isRemovingPin,
      isRemovingPasskeys,
    },
    actions: {
      setName,
      setEmail,
      handleUpdateProfile,
      removePin,
      removePasskeys,
    },
    t,
  };
};

// --- Hook for Change Password Modal ---
export const useChangePasswordForm = () => {
  const { t } = useTranslation();
  const { close } = useModal();

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const { mutate: changePass, isPending } = useMutation({
    mutationFn: changePasswordApi,
    onSuccess: () => {
      toast.success(t("settings:profilePage.pass_alert_success"));
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      close();
    },
    onError: (err: any) => {
      const defaultMsg = t("settings:profilePage.pass_alert_error");
      const msg = err.response?.data?.error || defaultMsg;
      toast.error(msg);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error(t("settings:profilePage.pass_error_mismatch"));
      return;
    }
    if (newPassword.length < 4) {
      toast.error(t("settings:profilePage.pass_error_short"));
      return;
    }

    changePass({ old_password: oldPassword, new_password: newPassword });
  };

  return {
    state: {
      oldPassword,
      newPassword,
      confirmPassword,
      isPending,
    },
    actions: {
      setOldPassword,
      setNewPassword,
      setConfirmPassword,
      handleSubmit,
      closeModal: close,
    },
    t,
  };
};
