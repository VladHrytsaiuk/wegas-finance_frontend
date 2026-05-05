import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "react-hot-toast";
import { differenceInCalendarDays } from "date-fns";

import {
  getGoalsApi,
  deleteGoalApi,
  updateGoalApi,
} from "../../services/apiGoals";
import type { Goal } from "../../types";

export const useGoalsPage = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [extendingGoal, setExtendingGoal] = useState<Goal | null>(null);

  // 1. Fetch
  const { data: goals = [], isLoading } = useQuery<Goal[]>({
    queryKey: ["goals"],
    queryFn: getGoalsApi,
  });

  // 2. Stats
  const goalsWithStats = goals.map((goal) => {
    const target = Number(goal.target_amount) || 0;
    const current = Number(goal.current_amount) || 0;
    const percentage =
      target > 0 ? Math.min(100, Math.max(0, (current / target) * 100)) : 0;

    let daysLeft: number | null = null;
    let isUrgent = false;
    let isOverdue = false;

    if (goal.date_deadline) {
      const deadlineDate = new Date(goal.date_deadline);
      const now = new Date();
      daysLeft = differenceInCalendarDays(deadlineDate, now);

      // Чисто візуальний прапорець для червоного кольору
      if (daysLeft < 0 && percentage < 100) {
        isOverdue = true;
      }

      if (daysLeft < 30 && percentage < 100 && daysLeft >= 0) isUrgent = true;
    }

    // ❌ ВИДАЛЕНО: computedStatus.
    // Тепер ми повністю довіряємо полю goal.status з бекенду.
    // Якщо крон ще не відпрацював, статус буде 'active', але isOverdue підсвітить його червоним.

    return {
      ...goal,
      // status: goal.status, <--- Він і так є в об'єкті goal
      current_amount: current,
      target_amount: target,
      percentage,
      daysLeft,
      isUrgent,
      isOverdue,
    };
  });

  // 🔥 Payload Preparation
  const preparePayload = (goal: any, changes: Partial<Goal>) => {
    // 1. Дата (конвертація в timestamp)
    let rawDate =
      changes.date_deadline !== undefined
        ? changes.date_deadline
        : goal.date_deadline;

    let timestamp: number | null = null;

    if (rawDate) {
      const d = new Date(rawDate);
      if (!isNaN(d.getTime())) {
        timestamp = d.getTime();
      }
    }

    // 2. Статус
    // Якщо ми явно не міняємо статус (changes.status), беремо старий (goal.status).
    // Якщо і старого немає (раптом), бекенд сам розбереться (ми додали там захист).
    const newStatus =
      changes.status !== undefined ? changes.status : goal.status;

    const payload = {
      id: goal.id,
      name: goal.name,
      target_amount: Number(goal.target_amount),
      current_amount: Number(goal.current_amount),
      currency: goal.currency,
      color: goal.color,
      notes: goal.notes || "",
      icon: goal.icon || "", // Не забувай про іконку, якщо є

      date_deadline: timestamp, // number | null
      status: newStatus,
    };

    console.log("🚀 Payload to send:", payload);
    return payload;
  };

  // 3. Mutations
  const deleteMutation = useMutation({
    mutationFn: deleteGoalApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      toast.success(t("goals.delete_success"));
    },
    onError: () => toast.error(t("goals.delete_error")),
  });

  const updateMutation = useMutation({
    mutationFn: (payload: any) => updateGoalApi(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["goals"] }),
    onError: () => toast.error(t("common.error_occurred")),
  });

  const updateDateMutation = useMutation({
    mutationFn: ({ id, date }: { id: string; date: string }) => {
      const currentGoal = goals.find((g) => g.id === id);
      if (!currentGoal) throw new Error("Goal not found");

      // Ми просто відправляємо нову дату.
      // Бекенд сам побачить: "О, нова дата в майбутньому? Тоді status = active".
      const payload = preparePayload(currentGoal, { date_deadline: date });
      return updateGoalApi(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      toast.success(t("goals.update_success"));
    },
    onError: (e) => {
      console.error(e);
      toast.error(t("common.error_occurred"));
    },
  });

  // Handlers
  const handleCreate = () => {
    setEditingGoal(null);
    setIsCreateModalOpen(true);
  };
  const handleEdit = (goal: Goal) => {
    setEditingGoal(goal);
    setIsCreateModalOpen(true);
  };
  const handleDelete = (id: string) => deleteMutation.mutate(id);
  const handleExtend = (goal: Goal | null) => setExtendingGoal(goal);
  const handleCloseModal = () => {
    setIsCreateModalOpen(false);
    setEditingGoal(null);
  };

  const handleToggleStatus = (goal: Goal) => {
    // Тут логіка паузи.
    // Якщо ціль була 'failed', а ми тиснемо кнопку (яка зараз виглядає як Play/Pause),
    // то ми, ймовірно, хочемо її активувати.
    let newStatus: "active" | "paused" = "active";

    if (goal.status === "active") {
      newStatus = "paused";
    } else if (goal.status === "paused") {
      newStatus = "active";
    } else if (goal.status === "failed") {
      // Якщо користувач хоче "поновити" провалену ціль без зміни дати
      newStatus = "active";
    }

    const payload = preparePayload(goal, { status: newStatus });
    updateMutation.mutate(payload);
  };

  const updateGoalDate = (id: string, date: string) => {
    updateDateMutation.mutate({ id, date });
  };

  return {
    state: {
      goals: goalsWithStats,
      isLoading,
      isCreateModalOpen,
      editingGoal,
      extendingGoal,
    },
    handlers: {
      handleCreate,
      handleEdit,
      handleDelete,
      handleToggleStatus,
      handleCloseModal,
      handleExtend,
      updateGoalDate,
    },
    t,
  };
};
