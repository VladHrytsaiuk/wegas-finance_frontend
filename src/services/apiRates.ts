import api from "./Axios"; // Твій налаштований axios instance

export interface ExchangeRate {
  currency_code: string;
  rate: number;
}

// Функція для отримання списку курсів
export const getExchangeRatesApi = async (): Promise<ExchangeRate[]> => {
  // Звертаємось до бекенду на /currencies
  const response = await api.get<ExchangeRate[]>("/currencies");
  return response.data;
};
