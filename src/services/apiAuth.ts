import api from "./Axios";

export interface LoginPayload {
  email: string;
  password?: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password?: string;
  invite_code?: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role_id: string;
  };
}

export const loginApi = async ({
  email,
  password,
}: LoginPayload): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>(`/login`, { email, password });
  return response.data;
};

// 👇 Додали invite_code
export const registerApi = async ({
  name,
  email,
  password,
  invite_code,
}: RegisterPayload): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>(`/users`, {
    name,
    email,
    password,
    invite_code, // <--- Важливо
    role_id: "", // Можна прибрати, якщо бекенд сам ставить дефолтну роль
  });
  return response.data;
};
