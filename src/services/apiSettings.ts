// 👇 Імпортуємо твій налаштований інстанс (зміни шлях "./api", якщо файл називається інакше)
// Оскільки вони зазвичай лежать в одній папці services, то шлях буде "./api"
import api from "./Axios";

export interface AppSettings {
  base_currency: string;
  language: string;
  theme: string;
}

const ENDPOINT = "/settings";

export const settingsService = {
  getSettings: async (): Promise<AppSettings> => {
    // Твій api сам додасть Header Authorization
    const response = await api.get<AppSettings>(ENDPOINT);
    return response.data;
  },

  saveSettings: async (settings: AppSettings): Promise<AppSettings> => {
    // Твій api сам додасть Header Authorization
    const response = await api.post<AppSettings>(ENDPOINT, settings);
    return response.data;
  },
};
