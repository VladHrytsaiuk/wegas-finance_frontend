import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAdminUsersApi,
  toggleAdminUserBlockApi,
  forceAdminUserLogoutApi,
  setAdminUserRoleApi,
  getAdminAuditLogsApi,
  getAdminSettingsApi,
  setAdminMaintenanceModeApi
} from "../../services/apiAdminUsers";

export function useAdminUsers(limit: number, offset: number, search: string) {
  return useQuery({
    queryKey: ["admin", "users", limit, offset, search],
    queryFn: () => getAdminUsersApi(limit, offset, search),
  });
}

export function useAdminUsersMutations() {
  const queryClient = useQueryClient();

  const toggleBlock = useMutation({
    mutationFn: toggleAdminUserBlockApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "audit"] });
    },
  });

  const forceLogout = useMutation({
    mutationFn: forceAdminUserLogoutApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "audit"] });
    },
  });

  const setRole = useMutation({
    mutationFn: ({ id, is_platform_admin }: { id: string; is_platform_admin: boolean }) => setAdminUserRoleApi(id, is_platform_admin),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "audit"] });
    },
  });

  return { toggleBlock, forceLogout, setRole };
}

export function useAdminAuditLogs(limit: number, offset: number) {
  return useQuery({
    queryKey: ["admin", "audit", limit, offset],
    queryFn: () => getAdminAuditLogsApi(limit, offset),
  });
}

export function useAdminSettings() {
  return useQuery({
    queryKey: ["admin", "settings"],
    queryFn: getAdminSettingsApi,
  });
}

export function useAdminSettingsMutations() {
  const queryClient = useQueryClient();

  const setMaintenanceMode = useMutation({
    mutationFn: setAdminMaintenanceModeApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "settings"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "audit"] });
    },
  });

  return { setMaintenanceMode };
}
