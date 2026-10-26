import { addDays, differenceInCalendarDays } from "date-fns";

import type { GoalWithDoneStatus } from "../../../services/apiGoals";

// Розрахунки цілі — ті самі, що в старих useGoalsPage / useGoalDetails.

export type GoalStatusFilter =
  "all" | "active" | "reached" | "paused" | "failed";
export type GoalSort =
  | "deadline-asc"
  | "deadline-desc"
  | "progress-desc"
  | "progress-asc"
  | "amount-desc"
  | "amount-asc"
  | "name-asc";

export const GOAL_SORTS: { value: GoalSort; label: string }[] = [
  { value: "deadline-asc", label: "Дедлайн: найближчі" },
  { value: "deadline-desc", label: "Дедлайн: найдальші" },
  { value: "progress-desc", label: "Прогрес: більший" },
  { value: "progress-asc", label: "Прогрес: менший" },
  { value: "amount-desc", label: "Сума: більша" },
  { value: "amount-asc", label: "Сума: менша" },
  { value: "name-asc", label: "За назвою" },
];

export interface GoalStats {
  percentage: number;
  remaining: number;
  isCompleted: boolean;
  isPaused: boolean;
  daysLeft: number | null;
  isOverdue: boolean;
  isUrgent: boolean;
  forecastDate: Date | null;
  forecastStatus: "reached" | "on_track" | "behind" | "no_data";
  dailyNeeded: number;
}

export function goalStats(
  goal: GoalWithDoneStatus,
  today = new Date(),
): GoalStats {
  const target = Number(goal.target_amount) || 0;
  const current = Number(goal.current_amount) || 0;
  const percentage =
    target > 0 ? Math.min(100, Math.max(0, (current / target) * 100)) : 0;
  const remaining = Math.max(0, target - current);
  const isCompleted =
    goal.status === "reached" ||
    (goal.status as string) === "done" ||
    (target > 0 && remaining === 0);

  const daysLeft = goal.date_deadline
    ? differenceInCalendarDays(new Date(goal.date_deadline), today)
    : null;
  const isOverdue = daysLeft !== null && daysLeft < 0 && !isCompleted;
  const isUrgent =
    daysLeft !== null && daysLeft >= 0 && daysLeft < 30 && !isCompleted;

  // Прогноз: середній темп накопичення від дати старту цілі.
  const daysElapsed = Math.max(
    1,
    differenceInCalendarDays(
      today,
      new Date(goal.date_start || goal.created_at),
    ),
  );
  const dailyRate = current / daysElapsed;
  const forecastDate =
    !isCompleted && dailyRate > 0
      ? addDays(today, Math.ceil(remaining / dailyRate))
      : null;
  const forecastStatus = isCompleted
    ? "reached"
    : !forecastDate
      ? "no_data"
      : goal.date_deadline && forecastDate > new Date(goal.date_deadline)
        ? "behind"
        : "on_track";
  const dailyNeeded =
    daysLeft !== null && daysLeft > 0
      ? Math.ceil(remaining / daysLeft)
      : remaining;

  return {
    percentage,
    remaining,
    isCompleted,
    isPaused: goal.status === "paused",
    daysLeft,
    isOverdue,
    isUrgent,
    forecastDate,
    forecastStatus,
    dailyNeeded,
  };
}

export function filterGoals(
  goals: GoalWithDoneStatus[],
  {
    query,
    status,
    currency,
    sort,
  }: {
    query: string;
    status: GoalStatusFilter;
    currency: string;
    sort: GoalSort;
  },
) {
  const q = query.trim().toLowerCase();
  const withStats = goals.map((goal) => ({ goal, stats: goalStats(goal) }));
  const result = withStats.filter(({ goal, stats }) => {
    if (q && !goal.name.toLowerCase().includes(q)) return false;
    if (currency && goal.currency !== currency) return false;
    if (status === "reached") return stats.isCompleted;
    if (status === "active")
      return goal.status === "active" && !stats.isCompleted;
    if (status !== "all") return goal.status === status;
    return true;
  });
  const byDeadline = (
    a: GoalWithDoneStatus,
    b: GoalWithDoneStatus,
    dir: 1 | -1,
  ) => {
    if (!a.date_deadline) return 1;
    if (!b.date_deadline) return -1;
    return dir * (a.date_deadline - b.date_deadline);
  };
  result.sort((a, b) => {
    switch (sort) {
      case "name-asc":
        return a.goal.name.localeCompare(b.goal.name);
      case "amount-desc":
        return b.goal.target_amount - a.goal.target_amount;
      case "amount-asc":
        return a.goal.target_amount - b.goal.target_amount;
      case "progress-desc":
        return b.stats.percentage - a.stats.percentage;
      case "progress-asc":
        return a.stats.percentage - b.stats.percentage;
      case "deadline-desc":
        return byDeadline(a.goal, b.goal, -1);
      default:
        return byDeadline(a.goal, b.goal, 1);
    }
  });
  return result;
}

/** Короткий статус дедлайну для картки. */
export function deadlineLabel(goal: GoalWithDoneStatus, stats: GoalStats) {
  if (stats.isCompleted) return "Ціль досягнута";
  if (stats.isPaused) return "На паузі";
  if (stats.isOverdue || goal.status === "failed") return "Дедлайн минув";
  if (stats.daysLeft === null) return "Без дедлайну";
  if (stats.daysLeft === 0) return "Сьогодні";
  return `${stats.daysLeft} дн.`;
}
