import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { getMeApi } from "../services/apiUsers";
import CenteredSpinner from "./ui/CenteredSpinner";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isUnlocked } = useAuth();
  const token = localStorage.getItem("token");
  const userEmail = localStorage.getItem("user_email");
  const hasPinHint = localStorage.getItem("has_pin") === "true";

  // 1. Стукаємо на сервер: "Хто я?"
  const {
    isLoading,
    isError,
    data: user,
    status
  } = useQuery({
    queryKey: ["me", token],
    queryFn: getMeApi,
    retry: false, 
    enabled: !!token, 
  });

  const isAuthenticated = !!token && !isError && !!user;
  const needsPin = !!user?.has_passkeys || !!user?.has_pin || hasPinHint;
  const isLocked = needsPin && !isUnlocked;

  // Debugging logs
  useEffect(() => {
    console.log("ProtectedRoute State:", {
      isLoading,
      status,
      isAuthenticated,
      isLocked,
      token: !!token,
      userEmail,
      hasPinHint,
      pathname: window.location.pathname
    });
  }, [isLoading, status, isAuthenticated, isLocked, token, userEmail, hasPinHint]);

  useEffect(
    function () {
      if (!isLoading) {
        if (!isAuthenticated) {
          // НЕМАЄ АВТОРИЗАЦІЇ
          if (userEmail && hasPinHint) {
            console.log("Redirecting to PinLogin (Unauthenticated but has PIN hint)");
            if (!window.location.pathname.startsWith("/pin-login")) {
              navigate("/pin-login", { replace: true });
            }
          } else {
            console.log("Redirecting to Login (Unauthenticated, no PIN hint)");
            // Видаляємо тільки токен, щоб не зациклити, якщо проблема в ньому
            localStorage.removeItem("token");
            if (!window.location.pathname.startsWith("/login")) {
              navigate("/login", { replace: true });
            }
          }
        } else if (isLocked) {
          // АВТОРИЗОВАНИЙ, АЛЕ ЗАБЛОКОВАНО
          console.log("Redirecting to PinLogin (Authenticated but Locked)");
          if (!window.location.pathname.startsWith("/pin-login")) {
            navigate("/pin-login", { replace: true });
          }
        }
      }
    },
    [isLoading, isAuthenticated, isLocked, userEmail, hasPinHint, navigate],
  );

  // Якщо ми в процесі завантаження і у нас Є токен, показуємо спінер.
  // Але якщо ми знаємо, що вже треба редіректити (isAuthenticated false і ми не вантажимось), 
  // то повертаємо null, щоб не блокувати перехід.
  if (isLoading && !!token) {
    return (
      <CenteredSpinner
        fullHeight
        message={t("common:ui.verifying_auth", "Перевірка авторизації...")}
      />
    );
  }

  // Якщо ми авторизовані ТА не заблоковані
  if (isAuthenticated && !isLocked) {
    return children;
  }

  // Фолбек: якщо ми не авторизовані, useEffect зробить свою справу.
  // Повертаємо null, щоб не було білого екрану зі спінером, який нікуди не веде.
  return null;
}

export default ProtectedRoute;
