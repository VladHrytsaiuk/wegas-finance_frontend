import api from "./Axios";

// Опис типу для StorageType (вкладений об'єкт)
export interface StorageType {
  id: string;
  name: string;
  slug: string;
  icon: string;
  is_system: boolean;
}

// 🔥 ПОВНИЙ ІНТЕРФЕЙС РАХУНКУ
export interface Account {
  // Base Entity
  id: string;
  created_at: number;
  updated_at: number;

  // Ownership & Context
  user_id: string; // Щоб знати, чий це рахунок
  family_id: string;

  // Core Info
  name: string;
  type: "card" | "cash" | "piggy_bank" | "crypto";
  currency: string;

  // Balances (в копійках)
  balance: number; // Поточний баланс (розрахований)
  initial_balance: number; // Стартовий баланс

  // Visuals
  color: string; // Для готівки або фону
  icon?: string; // Опціонально (якщо використовується для Cash)

  // --- CARD SPECIFIC ---
  card_number?: string; // "1234" (останні 4 цифри)
  payment_system?: string; // "visa", "mastercard"
  bank_name?: string; // "monobank", "privatbank" (для скінів)
  card_type?: string; // "black", "platinum" (для скінів)

  // --- SAVINGS / GOALS ---
  storage_type_id?: string | null;
  storage_type?: StorageType; // Preloaded об'єкт
  goal_id?: string | null;

  // System Flags
  is_synced?: boolean; // Чи синхронізовано з Моно
  is_archived?: boolean;
  is_group?: boolean;

  calculated_balance?: number; // Може бути undefined
  card_design?: string;
}

export type AccountPayload = Omit<
  Account,
  "id" | "created_at" | "updated_at" | "balance"
>;

export const getAccountsApi = async () => {
  const response = await api.get<Account[]>("/accounts");
  return response.data;
};

export const getAccountApi = async (id: string) => {
  const response = await api.get<Account>(`/accounts/${id}`);
  return response.data;
};

export const createAccountApi = async (data: AccountPayload) => {
  const response = await api.post<Account>("/accounts", data);
  return response.data;
};

export const updateAccountApi = async (
  data: Partial<AccountPayload> & { id: string },
) => {
  const { id, ...rest } = data;
  if (!id) throw new Error("ID рахунку обов'язковий для оновлення");

  const response = await api.put<Account>(`/accounts/${id}`, rest);
  return response.data;
};

export const deleteAccountApi = async (id: string) => {
  const response = await api.delete(`/accounts/${id}`);
  return response.data;
};

export const updateMobileAccountsOrderApi = async (accountIds: string[]) => {
  const response = await api.put<{ status: string }>("/accounts/mobile-order", {
    account_ids: accountIds,
  });
  return response.data;
};
