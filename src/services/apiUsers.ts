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
  has_password?: boolean;
  has_pin?: boolean;
  has_passkeys?: boolean;
}

// Отримати дані про себе (хто залогінився)
export const getMeApi = async (): Promise<UserProfile> => {
  const response = await api.get<UserProfile>("/users/me");
  return response.data;
};
export const getFamilyMembers = async (): Promise<UserProfile[]> => {
  const { data } = await api.get<UserProfile[]>("/users");
  return data;
};

// Оновити свій профіль (ім'я, email)
export const updateProfileApi = async (data: {
  name: string;
  email: string;
}): Promise<UserProfile> => {
  const response = await api.put<UserProfile>("/users/me", data);
  return response.data;
};

// Змінити свій пароль
export const changePasswordApi = async (data: {
  old_password: string;
  new_password: string;
}): Promise<{ message: string }> => {
  const response = await api.put<{ message: string }>("/users/password", data);
  return response.data;
};

// --- УПРАВЛІННЯ КОМАНДОЮ (СІМ'ЄЮ) ---

// Отримати список всіх членів сім'ї
export const getUsersApi = async (): Promise<UserProfile[]> => {
  const response = await api.get<UserProfile[]>("/users");
  return response.data;
};

export interface CreateUserData {
  name: string;
  email: string;
  password?: string;
  role_id: string;
}

// ... (other functions remain the same)

// Додати нового члена в МОЮ сім'ю
// ВАЖЛИВО: Маршрут змінено на /family/users
export const addUserApi = async (data: CreateUserData): Promise<UserProfile> => {
  // data: { name, email, password, role_id }
  const response = await api.post<UserProfile>("/family/users", data);
  return response.data;
};

// Оновити дані іншого користувача (для Адміна/CEO)
export const updateUserApi = async ({
  id,
  ...data
}: {
  id: string;
  name?: string;
  email?: string;
  role_id?: string;
}): Promise<UserProfile> => {
  const response = await api.put<UserProfile>(`/users/${id}`, data);
  return response.data;
};

// Видалити користувача з сім'ї
export const deleteUserApi = async (id: string): Promise<{ message: string }> => {
  const response = await api.delete<{ message: string }>(`/users/${id}`);
  return response.data;
};
