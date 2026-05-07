import api from "./Axios";

export interface DashboardStats {
  total_balance: number;
  monthly_income: number;
  monthly_expense: number;
  total_income: number;
  total_expense: number;
}

export interface TopStat {
  name: string;
  metadata: string;
  currency: string;
  total: number;
}

export interface TrendStat {
  date: string;
  total: number;
}

export interface Transaction {
  id: string;
  date: number;
  amount: number;
  type: "income" | "expense";
  category?: { name: string };
  counterparty?: { name: string };
  account: { currency: string; name: string }; // Додав name, бо ви його використовуєте
  note?: string; // Додав note
}

export interface StatsFilter {
  from: number;
  to: number;
  accountIds: string[];
  currency?: string;
}

// Допоміжний тип для параметрів recent, бо там currency може бути не потрібним
interface RecentParams {
  from?: number;
  to?: number;
}

export const statsService = {
  // 1. Головні цифри
  getDashboard: async (filter: StatsFilter): Promise<DashboardStats> => {
    const params = {
      from: filter.from,
      to: filter.to,
      currency: filter.currency,
      account_ids: filter.accountIds.join(","),
    };
    const response = await api.get<DashboardStats>("/dashboard/stats", {
      params,
    });
    return response.data;
  },

  // 2. Топ списки
  getTopStats: async (
    type: "income" | "expense",
    entity: "category" | "tag" | "counterparty",
    filter: StatsFilter,
  ): Promise<TopStat[]> => {
    const params = {
      type,
      entity,
      from: filter.from,
      to: filter.to,
      currency: filter.currency,
      account_ids: filter.accountIds.join(","),
    };
    const response = await api.get<TopStat[]>("/dashboard/top", { params });
    return response.data;
  },

  // 3. Тренд
  getTrend: async (
    type: "income" | "expense",
    filter: StatsFilter,
  ): Promise<TrendStat[]> => {
    const params = {
      type,
      from: filter.from,
      to: filter.to,
      currency: filter.currency,
      account_ids: filter.accountIds.join(","),
    };
    const response = await api.get<TrendStat[]>("/dashboard/trend", { params });
    return response.data;
  },

  // 4. Останні транзакції - ВИПРАВЛЕНО
  getRecent: async (
    accountIds: string[],
    filter?: RecentParams,
  ): Promise<Transaction[]> => {
    const params: Record<string, string | number> = {
      account_ids: accountIds.join(","),
    };

    // ВАЖЛИВО: Перевіряємо на undefined, щоб пропустити 0 (Весь час)
    if (filter?.from !== undefined) {
      params.from = filter.from;
    }
    if (filter?.to !== undefined) {
      params.to = filter.to;
    }

    const response = await api.get<Transaction[]>("/dashboard/recent", {
      params,
    });
    return response.data;
  },
};
