import axios from "axios";

const getApiUrl = () => {
  if (typeof window === "undefined") return "/api";
  
  const hostname = window.location.hostname;
  
  // Якщо ми на localhost, 127.0.0.1 або в локальній мережі (IP починається на 192.168. або 10.)
  if (
    hostname === "localhost" || 
    hostname === "127.0.0.1" || 
    hostname.startsWith("192.168.") || 
    hostname.startsWith("10.") ||
    hostname.endsWith(".local") // Для mDNS адрес типу MacBook-Pro.local
  ) {
    // Підставляємо той самий хост, але порт бекенда 8080
    return `http://${hostname}:8080/api`;
  }
  
  // Для продакшену (Vercel)
  return "/api";
};

const API_URL = getApiUrl();
console.log("🔗 API URL initialized as:", API_URL);

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

// 2. JWT Rotation logic
let isRefreshing = false;
interface FailedRequest {
  resolve: (token: string | null) => void;
  reject: (error: unknown) => void;
}
let failedQueue: FailedRequest[] = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// 3. Слухаємо відповіді
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Якщо помилка 401 і ми ще не пробували повторити цей запит
    if (error.response?.status === 401 && !originalRequest._retry) {
      const isAuthPage =
        window.location.pathname === "/login" ||
        window.location.pathname === "/register" ||
        window.location.pathname === "/pin-login";

      if (isAuthPage) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const response = await axios.post(
          `${API_URL}/refresh`,
          {},
          { withCredentials: true }
        );
        const { access_token } = response.data;

        localStorage.setItem("token", access_token);
        api.defaults.headers.common["Authorization"] = `Bearer ${access_token}`;
        originalRequest.headers.Authorization = `Bearer ${access_token}`;

        processQueue(null, access_token);
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        
        localStorage.removeItem("token");
        localStorage.removeItem("user_name");

        const userEmail = localStorage.getItem("user_email");
        if (userEmail) {
          window.location.href = "/pin-login";
        } else {
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default api;
