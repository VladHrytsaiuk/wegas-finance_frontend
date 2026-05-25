import api from "./Axios";

// Тип для Цілi (узгоджено з бекендом)
export interface Goal {
  id: string;
  name: string;
  description?: string;
  target_amount: number;
  current_amount: number;
  currency: string;
  date_start: number;
  date_deadline?: number;
  color: string;
  icon: string;
  photo_url?: string; // Тепер тут буде шлях до файлу на сервері
  external_link?: string;
  status: "active" | "paused" | "reached" | "failed" | "done";
  accounts?: any[];
}

// === CRUD ===

export const getGoalsApi = async () => {
  const response = await api.get("/goals");
  return response.data;
};

export const getGoalApi = async (id: string) => {
  const response = await api.get(`/goals/${id}`);
  return response.data;
};

export const createGoalApi = async (data: any) => {
  const response = await api.post("/goals", data);
  return response.data;
};

export const updateGoalApi = async (data: any) => {
  const { id, ...rest } = data;
  if (!id) throw new Error("ID цілі обов'язковий для оновлення");

  const response = await api.put(`/goals/${id}`, rest);
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
