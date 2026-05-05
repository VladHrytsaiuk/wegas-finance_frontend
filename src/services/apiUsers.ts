import api from "./Axios";

// --- ОСОБИСТИЙ ПРОФІЛЬ ---

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
  role_id?: string;
  family_id?: string;
  base_currency?: string;
}

// Отримати дані про себе (хто залогінився)
export const getMeApi = async () => {
  const response = await api.get("/users/me");
  return response.data;
};
export const getFamilyMembers = async (): Promise<UserProfile[]> => {
  const { data } = await api.get("/users");
  return data;
};

// Оновити свій профіль (ім'я, email)
export const updateProfileApi = async (data: {
  name: string;
  email: string;
}) => {
  const response = await api.put("/users/me", data);
  return response.data;
};

// Змінити свій пароль
export const changePasswordApi = async (data: {
  old_password: string;
  new_password: string;
}) => {
  const response = await api.put("/users/password", data);
  return response.data;
};

// --- УПРАВЛІННЯ КОМАНДОЮ (СІМ'ЄЮ) ---

// Отримати список всіх членів сім'ї
export const getUsersApi = async () => {
  const response = await api.get("/users");
  return response.data;
};

// Додати нового члена в МОЮ сім'ю
// ВАЖЛИВО: Маршрут змінено на /family/users
export const addUserApi = async (data: any) => {
  // data: { name, email, password, role_id }
  const response = await api.post("/family/users", data);
  return response.data;
};

// Оновити дані іншого користувача (для Адміна/CEO)
export const updateUserApi = async ({
  id,
  ...data
}: {
  id: string;
  [key: string]: any;
}) => {
  const response = await api.put(`/users/${id}`, data);
  return response.data;
};

// Видалити користувача з сім'ї
export const deleteUserApi = async (id: string) => {
  const response = await api.delete(`/users/${id}`);
  return response.data;
};
