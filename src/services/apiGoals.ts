import api from "./Axios";
import type { Account, Goal } from "../types";

export type GoalWithDoneStatus = Goal & {
  status: Goal["status"] | "done";
  accounts?: Account[];
};

export type GoalPayload = Pick<
  GoalWithDoneStatus,
  | "name"
  | "description"
  | "target_amount"
  | "current_amount"
  | "currency"
  | "date_start"
  | "date_deadline"
  | "color"
  | "icon"
  | "photo_url"
  | "external_link"
  | "status"
  | "visibility"
  | "hidden_from"
>;

// === CRUD ===

export const getGoalsApi = async () => {
  const response = await api.get<GoalWithDoneStatus[]>("/goals");
  return response.data;
};

export const getGoalApi = async (id: string) => {
  const response = await api.get<GoalWithDoneStatus>(`/goals/${id}`);
  return response.data;
};

export const createGoalApi = async (data: GoalPayload) => {
  const response = await api.post<GoalWithDoneStatus>("/goals", data);
  return response.data;
};

export const updateGoalApi = async (
  data: Partial<GoalPayload> & { id: string },
) => {
  const { id, ...rest } = data;
  if (!id) throw new Error("ID цілі обов'язковий для оновлення");

  const response = await api.put<GoalWithDoneStatus>(`/goals/${id}`, rest);
  return response.data;
};

export const deleteGoalApi = async (id: string) => {
  const response = await api.delete(`/goals/${id}`);
  return response.data;
};

// === ФОТО (НОВЕ) ===

/**
 * Завантажує файл фото для конкретної цілі.
 * Використовує Multipart/Form-Data для передачі бінарного файлу.
 */
export const uploadGoalPhotoApi = async (goalId: string, file: File) => {
  const formData = new FormData();

  // Перевіряємо, чи є у файлу розширення. Якщо немає — додаємо .jpg
  const fileName = file.name.includes(".") ? file.name : `${file.name}.jpg`;

  // Третій параметр в append — це ім'я файлу, яке побачить Go
  formData.append("file", file, fileName);

  const response = await api.post(`/goals/${goalId}/photo`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

// === SPECIFIC ACTIONS (Лінковка рахунків) ===

export const linkAccountToGoalApi = async (
  goalId: string,
  accountId: string,
) => {
  const response = await api.post(`/goals/${goalId}/link-account`, {
    account_id: accountId,
  });
  return response.data;
};

export const unlinkAccountFromGoalApi = async (
  goalId: string,
  accountId: string,
) => {
  // На бекенді ми зазвичай передаємо accountID у тілі або через параметри.
  // Узгоджено з твоїм попереднім кодом:
  const response = await api.post(`/goals/${goalId}/unlink-account`, {
    account_id: accountId,
  });
  return response.data;
};
