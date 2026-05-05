import api from "./Axios";

export interface DashboardStats {
  total_balance: number;
  monthly_income: number;
  monthly_expense: number;
}

export const getDashboardStatsApi = async () => {
  const response = await api.get<DashboardStats>("/dashboard/stats");
  return response.data;
};
