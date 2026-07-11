import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { getMeApi } from "../services/apiUsers";
import { useBootstrap } from "../context/BootstrapContext";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const { setStage } = useBootstrap();

  const token = localStorage.getItem("token");

  const {
    isLoading,
    isError,
    error,
    data: user,
    isFetching,
  } = useQuery({
    queryKey: ["me"],
    queryFn: getMeApi,
    retry: 1,
    enabled: !!token,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Only treat as unauthenticated if we have a definitive 401/403 from the server.
  // Network errors or 5xx server issues should not clear the token and force logout.
  const isAuthError =
    isError &&
    axios.isAxiosError(error) &&
    (error.response?.status === 401 || error.response?.status === 403);

  const isAuthenticated = !!token && !isAuthError;
  // ТИМЧАСОВО: вимикаємо блокування, бо на віртуалці воно глючить і вимагає пін, якого немає
  const isLocked = false; // needsPin && !isUnlocked;

  // Sync database security settings with localStorage hints
  useEffect(() => {
    if (user) {
      const dbHasPin = !!user.has_pin;
      const dbHasPasskeys = !!user.has_passkeys;

      if (localStorage.getItem("has_pin") !== String(dbHasPin)) {
        localStorage.setItem("has_pin", String(dbHasPin));
      }
      if (localStorage.getItem("has_passkeys") !== String(dbHasPasskeys)) {
        localStorage.setItem("has_passkeys", String(dbHasPasskeys));
      }
    }
  }, [user]);

  useEffect(
    function () {
      if (isLoading || isFetching) return;

      if (!isAuthenticated) {
        if (!window.location.pathname.startsWith("/login")) {
          localStorage.removeItem("token");
          navigate("/login", { replace: true });
        }
      }
    },
    [isLoading, isFetching, isAuthenticated, navigate],
  );

  useEffect(() => {
    if (!token) {
      setStage("bootstrap");
      return;
    }

    if (isLoading || (isFetching && !user)) {
      setStage("auth");
      return;
    }

    if (isAuthenticated) {
      setStage("hidden");
      return;
    }

    setStage("bootstrap");
  }, [isLoading, isFetching, user, token, isAuthenticated, setStage]);

  if ((isLoading || (isFetching && !user)) && !!token) {
    return null;
  }

  if (isAuthenticated && !isLocked) {
    return children;
  }

  return null;
}

export default ProtectedRoute;
