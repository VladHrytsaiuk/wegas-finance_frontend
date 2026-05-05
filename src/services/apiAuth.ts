import api from "./Axios";

export const loginApi = async ({ email, password }: any) => {
  const response = await api.post(`/login`, { email, password });
  return response.data;
};

// 👇 Додали invite_code
export const registerApi = async ({
  name,
  email,
  password,
  invite_code,
}: any) => {
  const response = await api.post(`/users`, {
    name,
    email,
    password,
    invite_code, // <--- Важливо
    role_id: "", // Можна прибрати, якщо бекенд сам ставить дефолтну роль
  });
  return response.data;
};
