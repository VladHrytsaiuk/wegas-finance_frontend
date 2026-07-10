import { useState } from "react";
import { AxiosError } from "axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import {
  createGoalApi,
  updateGoalApi,
  linkAccountToGoalApi,
  uploadGoalPhotoApi,
} from "../../services/apiGoals";
import { createAccountApi } from "../../services/apiAccounts";
import { getStorageTypesApi } from "../../services/apiStorageTypes";
import type { Goal, StorageType } from "../../types";

interface ErrorResponse {
  error?: string;
}

export interface GoalFormData {
  name: string;
  target_amount: number;
  currency: string;
  date_deadline: string;
  color: string;
  icon: string;

  // Фото
  remove_photo?: boolean;
  photo_url?: string;
  photo_file?: File | null;

  external_link?: string;
  description?: string;

  // 🔥 Приватність
  visibility: "public" | "private";
  hidden_from?: string;

  // Рахунки
  link_mode: "none" | "new" | "existing";
  existing_account_id?: string;
  new_account_name?: string;
}

export const useCreateGoal = (
  onClose: () => void,
  editingGoal?: Goal | null,
) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  const { data: storageTypes = [] } = useQuery({
    queryKey: ["storageTypes"],
    queryFn: getStorageTypesApi,
    staleTime: Infinity,
  });

  const mutation = useMutation({
    mutationFn: async (data: GoalFormData) => {
      setIsLoading(true);
      try {
        // --- 1. Payload ---
        const goalPayload = {
          name: data.name,
          target_amount: Math.round(Number(data.target_amount) * 100),
          currency: data.currency,
          date_deadline: data.date_deadline
            ? new Date(data.date_deadline).getTime()
            : null,
          color: data.color,
          icon: data.icon,
          date_start: editingGoal ? editingGoal.date_start : Date.now(),
          external_link: data.external_link || "",
          description: data.description || "",
          remove_photo: data.remove_photo,

          // 🔥 Відправляємо нові поля
          visibility: data.visibility,
          hidden_from: data.hidden_from || "",
        };

        let goalId = editingGoal?.id;

        if (editingGoal) {
          await updateGoalApi({
            id: editingGoal.id,
            ...goalPayload,
          });
        } else {
          const responseGoal = await createGoalApi(goalPayload);
          goalId = responseGoal.id;
        }

        if (!goalId) throw new Error("Failed to get Goal ID");

        // --- 2. Фото (Тільки якщо є новий файл) ---
        if (data.photo_file) {
          await uploadGoalPhotoApi(goalId, data.photo_file);
        }

        // --- 3. Рахунки (Тільки при створенні) ---
        if (!editingGoal && data.link_mode !== "none") {
          if (data.link_mode === "existing" && data.existing_account_id) {
            await linkAccountToGoalApi(goalId, data.existing_account_id);
          } else if (data.link_mode === "new") {
            const piggyType = storageTypes.find(
              (st: StorageType) => st.slug === "piggy_bank",
            );
            const storageTypeId = piggyType
              ? piggyType.id
              : storageTypes[0]?.id || null;

            const newAccount = await createAccountApi({
              name: data.new_account_name || data.name,
              type: "piggy_bank",
              storage_type_id: storageTypeId,
              currency: data.currency,
              initial_balance: 0,
              color: data.color,
              goal_id: goalId,
            });

            if (!newAccount.goal_id) {
              await linkAccountToGoalApi(goalId, newAccount.id);
            }
          }
        }

        return goalId;
      } finally {
        setIsLoading(false);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      toast.success(
        editingGoal ? t("goals_debts:goals.update_success") : t("goals_debts:goals.create_success"),
      );
      onClose();
    },
    onError: (err: AxiosError<ErrorResponse>) => {
      console.error(err);
      const msg = err.response?.data?.error || t("common:common.error_occurred");
      toast.error(msg);
    },
  });

  return {
    submit: mutation.mutate,
    isLoading,
  };
};
