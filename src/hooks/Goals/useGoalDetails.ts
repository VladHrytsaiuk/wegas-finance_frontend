import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { addDays, differenceInCalendarDays } from "date-fns";
import { getUploadedFileUrl } from "../../utils/helpers";

import {
  getGoalApi,
  deleteGoalApi,
  updateGoalApi,
} from "../../services/apiGoals";

export function useGoalDetails() {
  const { id: goalId } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
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
        daysLeftText = t("goals_debts:goals.deadline_passed", "Час вийшов");
        deadlineStatus = "error";
      } else if (daysLeft === 0) {
        daysLeftText = t("common:common.today", "Сьогодні");
        deadlineStatus = "warning";
      } else {
        daysLeftText = `${daysLeft} ${t("goals_debts:goalDetails.days_suffix", "дн.")}`;
        if (daysLeft < 7) deadlineStatus = "warning";
      }
    }

    // Прогноз: середній темп накопичення від дати старту цілі.
    const today = new Date();
    const daysElapsed = Math.max(
      1,
      differenceInCalendarDays(today, new Date(goal.date_start || goal.created_at)),
    );
    const dailyRate = goal.current_amount / daysElapsed;

    let forecastDate: Date | null = null;
    if (!isCompleted && dailyRate > 0) {
      forecastDate = addDays(today, Math.ceil(remainingMoney / dailyRate));
    }

    let forecastStatus: "reached" | "on_track" | "behind" | "no_data";
    if (isCompleted) {
      forecastStatus = "reached";
    } else if (!forecastDate) {
      forecastStatus = "no_data";
    } else if (goal.date_deadline && forecastDate > new Date(goal.date_deadline)) {
      forecastStatus = "behind";
    } else {
      forecastStatus = "on_track";
    }

    const avgDailyIncomeNeeded =
      daysLeft !== null && daysLeft > 0
        ? Math.ceil(remainingMoney / daysLeft)
        : remainingMoney;

    return {
      percent: Math.round(percentage),
      daysRemaining: daysLeft,
      avgDailyIncomeNeeded,
      forecastDate,
      forecastStatus,
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
      toast.success(t("goals_debts:goals.delete_success", "Ціль видалено"));
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      navigate("/goals");
    },
    onError: () => {
      toast.error(t("goals_debts:goals.delete_error", "Помилка видалення"));
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      updateGoalApi({ id, status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goal", goalId] });
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      toast.success(t("common:common.saved_success", "Статус оновлено"));
    },
    onError: () => {
      toast.error(t("common:common.error", "Сталася помилка"));
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

  const handleOpenEdit = () => setIsEditModalOpen(true);

  // Модалка редагування оновлює лише список цілей, тож деталі оновлюємо тут.
  const handleCloseEdit = () => {
    setIsEditModalOpen(false);
    queryClient.invalidateQueries({ queryKey: ["goal", goalId] });
  };

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
      handleOpenEdit,
      handleCloseEdit,
      handleBack,
      handleAccountClick,
    },
    t,
    i18n,
  };
}
