import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

import {
  getUsersApi,
  addUserApi,
  updateUserApi,
  deleteUserApi,
  type UserProfile, // Не забудь імпортувати тип, якщо він експортується
} from "../../services/apiUsers";
import { useUserRole } from "../useUserRole";

export const useUsers = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { canManageTeam } = useUserRole();

  // --- Queries ---
  const { data: usersData = [], isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: getUsersApi,
  });

  // Захист: гарантуємо, що users це завжди масив
  // (іноді бекенд може повернути об'єкт { data: [...] }, це фіксить проблему)
  const users = Array.isArray(usersData) ? usersData : [];

  // --- Mutations ---
  const { mutate: addUser, isPending: isAdding } = useMutation({
    mutationFn: addUserApi,
    onSuccess: () => {
      toast.success(t("usersPage.alert_add_success", "Користувача додано"));
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (err: any) =>
      toast.error(
        err.response?.data?.error ||
          t("usersPage.alert_add_error", "Помилка додавання"),
      ),
  });

  const { mutate: updateUser, isPending: isUpdating } = useMutation({
    mutationFn: updateUserApi,
    onSuccess: () => {
      toast.success(t("usersPage.alert_update_success", "Дані оновлено"));
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: () =>
      toast.error(t("usersPage.alert_update_error", "Помилка оновлення")),
  });

  const { mutate: removeUser, isPending: isDeleting } = useMutation({
    mutationFn: deleteUserApi,
    onSuccess: () => {
      toast.success(
        t("usersPage.alert_delete_success", "Користувача видалено"),
      );
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: () =>
      toast.error(t("usersPage.alert_delete_error", "Помилка видалення")),
  });

  // Обгортки для хендлерів
  const handleUpdate = (id: string, data: any) => {
    updateUser({ id, ...data });
  };

  const handleDelete = (id: string) => {
    removeUser(id);
  };

  return {
    // 🔥 1. Прямий доступ (для NoteOptions.tsx)
    users,
    isLoading,

    // 🧊 2. Структурований доступ (для Users.tsx / сторінки налаштувань)
    state: {
      users,
      isLoading,
      isAdding,
      isUpdating,
      isDeleting,
      canManageTeam,
    },
    actions: {
      addUser,
      handleUpdate,
      handleDelete,
    },
    t,
  };
};
