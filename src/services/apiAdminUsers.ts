import api from "./Axios";

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  is_active: boolean;
  is_platform_admin: boolean;
  session_version: number;
  created_at: number;
  family?: { name: string };
};

export type AuditLog = {
  id: string;
  admin_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  changes: unknown;
  ip_address: string;
  created_at: string;
  admin: { name: string; email: string };
};

export async function getAdminUsersApi(limit: number, offset: number, search: string): Promise<{ users: AdminUser[]; total: number }> {
  const { data } = await api.get("/admin/users", { params: { limit, offset, search } });
  return data;
}

export async function toggleAdminUserBlockApi(id: string): Promise<void> {
  await api.post(`/admin/users/${id}/block`);
}

export async function forceAdminUserLogoutApi(id: string): Promise<void> {
  await api.post(`/admin/users/${id}/logout`);
}

export async function setAdminUserRoleApi(id: string, is_platform_admin: boolean): Promise<void> {
  await api.post(`/admin/users/${id}/role`, { is_platform_admin });
}

export async function getAdminAuditLogsApi(limit: number, offset: number): Promise<{ logs: AuditLog[]; total: number }> {
  const { data } = await api.get("/admin/audit", { params: { limit, offset } });
  return data;
}

export async function getAdminSettingsApi(): Promise<Record<string, string>> {
  const { data } = await api.get("/admin/settings");
  return data;
}

export async function setAdminMaintenanceModeApi(enabled: boolean): Promise<void> {
  await api.post("/admin/maintenance", { enabled });
}
