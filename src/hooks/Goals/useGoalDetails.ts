import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { differenceInCalendarDays } from "date-fns";
import { getUploadedFileUrl } from "../../utils/helpers";

import {
  getGoalApi,
  deleteGoalApi,
  updateGoalApi,
} from "../../services/apiGoals";

export function useGoalDetails() {
  const { id: goalId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // 1. Data Fetching
  const { data: goal, isLoading } = useQuery({
    queryKey: ["goal", goalId],
    queryFn: () => getGoalApi(goalId),
    enabled: !!goalId,
    staleTime: 1000 * 60 * 5,
  });

  // 2. Calculations (Derived State)
  const calculations = useMemo(() => {
    if (!goal) return null;

    const fullPhotoUrl = getUploadedFileUrl(goal?.photo_url) || "";

    const percentage =
      goal.target_amount > 0
        ? Math.min((goal.current_amount / goal.target_amount) * 100, 100)
        : 0;

    const remainingMoney = Math.max(
      0,
      goal.target_amount - goal.current_amount,
    );
    const isCompleted = goal.status === "reached" || remainingMoney === 0;
    const canPause = goal.status === "active" || goal.status === "paused";
    const isPaused = goal.status === "paused";

    // Date Logic
    let daysLeft = null;
    let daysLeftText = "";
    let deadlineStatus: "normal" | "warning" | "error" = "normal";

    if (goal.date_deadline) {
      const today = new Date();
      const deadline = new Date(goal.date_deadline);
      daysLeft = differenceInCalendarDays(deadline, today);

      if (daysLeft < 0) {
        daysLeftText = t("goals.deadline_passed", "Час вийшов");
        deadlineStatus = "error";
      } else if (daysLeft === 0) {
        daysLeftText = t("common.today", "Сьогодні");
        deadlineStatus = "warning";
      } else {
        daysLeftText = `${daysLeft} ${t("goalDetails.days_suffix", "дн.")}`;
        if (daysLeft < 7) deadlineStatus = "warning";
      }
    }

    return {
      percentage,
      remainingMoney,
      isCompleted,
      canPause,
      isPaused,
      daysLeft,
      daysLeftText,
      deadlineStatus,
      fullPhotoUrl,
    };
  }, [goal, t]);

  // 3. Mutations
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteGoalApi(id),
    onSuccess: () => {
      toast.success(t("goals.delete_success", "Ціль видалено"));
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      navigate("/goals");
    },
    onError: () => {
      toast.error(t("goals.delete_error", "Помилка видалення"));
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      updateGoalApi({ id, status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goal", goalId] });
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      toast.success(t("common.saved_success", "Статус оновлено"));
    },
    onError: () => {
      toast.error(t("common.error", "Сталася помилка"));
    },
  });

  // 4. Actions
  const handleBack = () => navigate("/goals");

  const handleDelete = () => {
    if (goalId) deleteMutation.mutate(goalId);
  };

  const handleToggleStatus = () => {
    if (!goal) return;
    const newStatus = goal.status === "paused" ? "active" : "paused";
    updateStatusMutation.mutate({ id: goal.id, status: newStatus });
  };

  const handleAccountClick = (id: string) => navigate(`/accounts/${id}`);

  return {
    state: {
      goal,
      stats: calculations,
      isLoading,
      isDeleting: deleteMutation.isPending,
      isToggling: updateStatusMutation.isPending,
      isEditModalOpen,
    },
    actions: {
      handleDelete,
      handleToggleStatus,
      setIsEditModalOpen,
      handleBack,
      handleAccountClick,
    },
    t,
  };
}
