import api from "./Axios";

// Оновлений інтерфейс фільтрів
export interface TransactionFilters {
  page?: number;
  limit?: number;
  account_id?: string | string[];
  type?: string;
  category_id?: string[];
  counterparty_id?: string[];
  date_from?: number; // 🔥 Строго number (timestamp)
  date_to?: number; // 🔥 Строго number (timestamp)
  min_amount?: number;
  max_amount?: number;
  search?: string;
  sort?: string;
  asset_id?: string;
}

// 🔥 ДОДАНО: Тип для створення активу при покупці
export interface CreateAssetOnFlyInput {
  name: string;
  type: string;
  serial_number: string;
  warranty_end: number;
  note: string;

  // 🔥 ДОДАНО: Початковий пробіг для нового авто
  mileage?: number;
  warrantyFiles?: File[]; // Якщо ви передаєте файли, це поле теж може бути тут
}

export interface CreateTxItem {
  name?: string;
  quantity?: number;
  price_per_unit?: number;
  total_amount?: number;
  comment?: string;
  categoryId?: string;
  category_id?: string | null;
}

export interface CreateTxData {
  account_id: string;
  target_account_id?: string;
  category_id?: string;
  counterparty_id?: string;
  amount: number;
  date: number;
  note?: string;
  type: string;
  items?: CreateTxItem[];
  tag_ids?: string[];

  target_amount?: number;
  is_forgiveness?: boolean;

  // 🔥 ДОДАНО: поля для активів
  asset_id?: string | null; // Якщо вибрали існуючий
  mileage?: number;
  new_asset?: CreateAssetOnFlyInput | null; // Якщо створюємо новий
}

export type UpdateTxData = CreateTxData & { id: string };

export const getTransactionsApi = async (filters: TransactionFilters = {}) => {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    // Пропускаємо пусті значення
    if (value === undefined || value === null || value === "") return;

    if (Array.isArray(value)) {
      // ✅ Масиви: додаємо key=val1&key=val2 (те, що треба для Gin)
      value.forEach((item) => {
        params.append(key, item);
      });
    } else {
      // ✅ Одиночні значення (в т.ч. числа дат)
      params.append(key, value.toString());
    }
  });

  const response = await api.get(`/transactions?${params.toString()}`);
  return response.data;
};

export const createTransactionApi = async (data: CreateTxData | FormData) => {
  // Тут TypeScript тепер дозволить передати asset_id або new_asset
  const response = await api.post("/transactions", data);
  return response.data;
};

export const updateTransactionApi = async (data: UpdateTxData) => {
  const { id, ...rest } = data;
  if (!id) throw new Error("ID транзакції обов'язковий");
  const response = await api.put(`/transactions/${id}`, rest);
  return response.data;
};

// ... (решта функцій deleteTransactionApi, uploadReceiptApi тощо без змін)
export const deleteTransactionApi = async (id: string) => {
  const response = await api.delete(`/transactions/${id}`);
  return response.data;
};

export const getTransactionApi = async (id: string) => {
  const response = await api.get(`/transactions/${id}`);
  return response.data;
};

export const uploadReceiptApi = async ({
  id,
  file,
}: {
  id: string;
  file: File;
}) => {
  const formData = new FormData();
  formData.append("file", file);
  const response = await api.post(`/transactions/${id}/receipt`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const deleteReceiptApi = async (id: string | number) => {
  const response = await api.delete(`/transactions/${id}/receipt`);
  return response.data;
};

export const batchCreateTransactionsApi = async (data: CreateTxData[]) => {
  const response = await api.post("/transactions/batch", data);
  return response.data;
};

export const deleteTransactionPhotoApi = async (photoId: string) => {
  const response = await api.delete(`/transactions/photos/${photoId}`);
  return response.data;
};

// src/services/apiTransactions.ts

interface PredictResponse {
  category_id: string | null;
}

export const predictCategoryApi = async (
  itemName: string,
): Promise<string | null> => {
  // Не шлемо запит, якщо слово дуже коротке
  if (!itemName || itemName.trim().length < 3) return null;

  try {
    const { data } = await api.get<PredictResponse>("/transactions/predict", {
      params: { name: itemName.trim() },
    });
    return data.category_id;
  } catch (error) {
    console.error("Prediction failed:", error);
    return null;
  }
};
