import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAdminStatsApi, toggleMaintenanceModeApi } from "../../services/apiAdminOverview";
import toast from "react-hot-toast";

export const useAdminOverview = () => {
  return useQuery({
    queryKey: ["admin", "overview"],
    queryFn: getAdminStatsApi,
    refetchInterval: 60000, // refresh every minute
  });
};

export const useAdminOverviewMutations = () => {
  const queryClient = useQueryClient();

  const toggleMaintenance = useMutation({
    mutationFn: toggleMaintenanceModeApi,
    onSuccess: (data) => {
      toast.success(
        data.maintenance_mode 
          ? "Maintenance mode ENABLED" 
          : "Maintenance mode DISABLED"
      );
      queryClient.invalidateQueries({ queryKey: ["admin", "overview"] });
    },
    onError: (err: Error) => {
      toast.error(err.response?.data?.error || "Failed to toggle maintenance mode");
    },
  });

  return { toggleMaintenance };
};
