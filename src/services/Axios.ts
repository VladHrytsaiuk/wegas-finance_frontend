import axios from "axios";

// const API_URL = "http://127.0.0.1:8080/api";
const API_URL = import.meta.env.DEV ? "http://localhost:8080/api" : "/api";

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// 1. Додаємо токен до запитів
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 2. Слухаємо відповіді
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Додаємо перевірку: якщо ми на логіні АБО на реєстрації — нікуди не перекидаємо
      const isAuthPage =
        window.location.pathname === "/login" ||
        window.location.pathname === "/register";

      if (!isAuthPage) {
        localStorage.removeItem("token");
        localStorage.removeItem("user_name");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

export default api;
