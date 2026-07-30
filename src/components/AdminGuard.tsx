import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Navigate, Outlet } from "react-router-dom";
import { getAdminStatusApi } from "../services/apiAdminCatalog";

export default function AdminGuard() {
  const { isLoading, isError, error } = useQuery({
    queryKey: ["admin", "status"],
    queryFn: getAdminStatusApi,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) return null;

  if (isError && axios.isAxiosError(error) && error.response?.status === 403) {
    return <Navigate replace to="/not-found" />;
  }

  // Do not disguise a temporary connection or server failure as an authorization error.
  if (isError) return <Navigate replace to="/not-found" />;

  return <Outlet />;
}
