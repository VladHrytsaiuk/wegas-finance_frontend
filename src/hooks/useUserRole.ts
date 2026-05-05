import { useQuery } from "@tanstack/react-query";
import { getMeApi } from "../services/apiUsers";

export function useUserRole() {
  const { data: user, isLoading } = useQuery({
    queryKey: ["me"],
    queryFn: getMeApi,
    staleTime: Infinity, // Роль змінюється рідко, кешуємо надовго
  });

  const role = user?.role_id || "child"; // За замовчуванням найменші права

  return {
    role,
    isLoading,
    isCEO: role === "admin",
    isShareholder: role === "member",
    isStartupper: role === "child",

    // Допоміжні перевірки (Permissions)
    canManageTeam: role === "admin",
    canManageStructure: role === "admin" || role === "member", // Рахунки, Категорії
    canManageTags: true, // Всі можуть
  };
}
