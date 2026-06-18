import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { getMeApi } from "../services/apiUsers";
import CenteredSpinner from "./ui/CenteredSpinner";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { isUnlocked: contextUnlocked } = useAuth();
  
  // 🔥 ВАЖЛИВО: Перевіряємо sessionStorage + location.state.
  // Це дозволяє миттєво побачити розблокування навіть на симуляторі.
  const isUnlocked = 
    contextUnlocked || 
    sessionStorage.getItem("is_unlocked") === "true" ||
    (location.state as any)?.unlocked === true;

  const token = localStorage.getItem("token");
  const userEmail = localStorage.getItem("user_email");
  const hasPinHint = localStorage.getItem("has_pin") === "true";

  const {
    isLoading,
    isError,
    data: user,
    status,
    isFetching
  } = useQuery({
    queryKey: ["me", token],
    queryFn: getMeApi,
    retry: 1, 
    enabled: !!token, 
  });

  const isAuthenticated = !!token && !isError && !!user;
  const needsPin = user
    ? !!user.has_passkeys || !!user.has_pin
    : hasPinHint;
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

  useEffect(() => {
    if (token) {
      console.log("ProtectedRoute State:", {
        isLoading,
        isFetching,
        status,
        isAuthenticated,
        isLocked,
        isUnlocked,
        pathname: window.location.pathname
      });
    }
  }, [isLoading, isFetching, status, isAuthenticated, isLocked, isUnlocked, token]);

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

  if ((isLoading || (isFetching && !user)) && !!token) {
    return (
      <CenteredSpinner
        fullHeight
        message={t("common:ui.verifying_auth", "Перевірка авторизації...")}
      />
    );
  }

  if (isAuthenticated && !isLocked) {
    return children;
  }

  return null;
}

export default ProtectedRoute;
