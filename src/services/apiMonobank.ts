import axios from "./Axios";

export interface MonoAccount {
  id: string;
  currencyCode: number;
  balance: number;
  type: string;
  maskedPan: string[];
  iban: string;
  cashbackType?: string;
  creditLimit?: number;
}

export interface BackendMapping {
  id: string;
  external_id: string;
  internal_account_id: string;
  name: string;
  is_enabled: boolean;
  sync_from: number;
  raw_data?: string;
  card_number?: string;
}

export const monobankApi = {
  connect: async (token: string) => {
    const { data } = await axios.post<{ accounts: MonoAccount[] }>(
      "/monobank/connect",
      { token },
    );
    return data;
  },

  // 1. Легкий запит (тільки база)
  getSettings: async () => {
    const { data } = await axios.get<{
      accounts: MonoAccount[];
      mappings: BackendMapping[];
    }>("/monobank/settings");
    return data;
  },

  // 2. Важкий запит (йде в API Monobank) - Тільки по кнопці!
  refresh: async () => {
    const { data } = await axios.post<{
      accounts: MonoAccount[];
      mappings: BackendMapping[];
    }>("/monobank/refresh");
    return data;
  },

  disconnect: async () => {
    const { data } = await axios.post("/monobank/disconnect");
    return data;
  },

  forceSync: async (accountId?: string) => {
    const url = accountId
      ? `/monobank/sync?account_id=${accountId}`
      : "/monobank/sync";

    const { data } = await axios.post(url);
    return data;
  },

  confirmSync: async (
    accounts: {
      external_id: string;
      internal_account_id: string;
      name: string;
      is_enabled: boolean;
      currency: string;
      sync_from: number;
      raw_data: string;
      card_number: string;
    }[],
  ) => {
    const payload = {
      accounts: accounts.map((acc) => ({
        external_id: acc.external_id,
        internal_account_id: acc.internal_account_id,
        name: acc.name,
        is_enabled: acc.is_enabled,
        currency: acc.currency,
        sync_from: acc.sync_from,
        raw_data: acc.raw_data,
        card_number: acc.card_number,
      })),
    };

    const { data } = await axios.post("/monobank/sync-confirm", payload);
    return data;
  },
};
