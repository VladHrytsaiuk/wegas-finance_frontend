import api from "./Axios";

// Додаємо export type для безпеки
export interface ShoppingItem {
  id: string;
  list_id: string;
  name: string;
  is_bought: boolean;
}

export interface ShoppingList {
  id: string;
  // 🔥 ДОДАЄМО ПРОПУЩЕНІ ПОЛЯ
  user_id: string;
  family_id: string;
  created_at: number;
  updated_at: number;

  title: string;
  color: string;
  visibility: string;
  hidden_from: string;
  items: ShoppingItem[];
}

// --- СПИСКИ ---
export const getShoppingListsApi = async (): Promise<ShoppingList[]> => {
  const response = await api.get("/shopping-lists");
  const data = response.data || [];

  // Мапимо дані, щоб гарантувати структуру
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return data.map((list: any) => ({
    ...list,
    items: list.items || [],
  }));
};

export const createShoppingListApi = async (data: Partial<ShoppingList>) => {
  const response = await api.post("/shopping-lists", data);
  return response.data;
};

export const updateShoppingListApi = async (data: Partial<ShoppingList>) => {
  const { id, ...rest } = data;
  const response = await api.put(`/shopping-lists/${id}`, rest);
  return response.data;
};

export const deleteShoppingListApi = async (id: string) => {
  const response = await api.delete(`/shopping-lists/${id}`);
  return response.data;
};

export const clearCompletedInListApi = async (listId: string) => {
  const response = await api.delete(`/shopping-lists/${listId}/completed`);
  return response.data;
};

// --- ЕЛЕМЕНТИ ---
export const addShoppingItemApi = async ({
  listId,
  name,
}: {
  listId: string;
  name: string;
}) => {
  const response = await api.post(`/shopping-lists/${listId}/items`, { name });
  return response.data;
};

export const toggleShoppingItemApi = async ({
  id,
  is_bought,
}: {
  id: string;
  is_bought: boolean;
}) => {
  const response = await api.put(`/shopping-items/${id}`, { is_bought });
  return response.data;
};

export const deleteShoppingItemApi = async (id: string) => {
  const response = await api.delete(`/shopping-items/${id}`);
  return response.data;
};
