import api from "./Axios";

export interface AdminOverviewStats {
  total_users: number;
  total_families: number;
  total_transactions: number;
  total_inbox_entries: number;
  new_users_7_days: number;
  inbox_parse_errors: number;
  failed_monobank: number;
  maintenance_mode: boolean;
}

export const getAdminStatsApi = async () => {
  const response = await api.get<AdminOverviewStats>("/admin/overview/stats");
  return response.data;
};

export const toggleMaintenanceModeApi = async (enabled: boolean) => {
  const response = await api.post<{ maintenance_mode: boolean }>("/admin/maintenance", { enabled });
  return response.data;
};
