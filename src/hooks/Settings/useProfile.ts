import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

import {
  getMeApi,
  type UserProfile,
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

  const [draftProfile, setDraftProfile] = useState<{
    name: string;
    email: string;
  } | null>(null);
  const name = draftProfile?.name ?? user?.name ?? "";
  const email = draftProfile?.email ?? user?.email ?? "";

  const { mutate: updateProfile, isPending: isUpdatingProfile } = useMutation({
    mutationFn: updateProfileApi,
    onSuccess: (data) => {
      toast.success(t("settings:profilePage.alert_profile_success"));

      if (data?.name) {
        localStorage.setItem("user_name", data.name);
      }

      queryClient.setQueryData<UserProfile | undefined>(
        ["me"],
        (currentUser) => ({
          ...currentUser,
          ...data,
        }),
      );
    },
    onError: () => {
      toast.error(t("settings:profilePage.alert_profile_error"));
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
    },
    actions: {
      setName: (nextName: string) =>
        setDraftProfile((prev) => ({ name: nextName, email: prev?.email ?? email })),
      setEmail: (nextEmail: string) =>
        setDraftProfile((prev) => ({ name: prev?.name ?? name, email: nextEmail })),
      handleUpdateProfile,
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
    onError: (err: AxiosError<{ error?: string }>) => {
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
