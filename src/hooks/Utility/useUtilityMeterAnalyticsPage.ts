import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getMeterStats, getMeterById } from "../../services/apiUtility";

export const useMeterAnalytics = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: meter, isLoading: isLoadingMeter } = useQuery({
    queryKey: ["utilityMeter", id],
    queryFn: () => getMeterById(id!),
    enabled: !!id,
  });

  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ["utilityStatsMeter", id],
    queryFn: () => getMeterStats(id!),
    enabled: !!id,
  });

  const safeStats = Array.isArray(stats) ? stats : [];

  const handleBack = () => navigate(-1);

  return {
    meter,
    stats: safeStats,
    isLoading: isLoadingMeter || isLoadingStats,
    hasData: safeStats.length > 0,
    handleBack,
    meterId: id,
  };
};
