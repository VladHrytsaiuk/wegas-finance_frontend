import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
// import styled from "styled-components";
import { getMeApi } from "../services/apiUsers";
import FullPageSpinner from "./ui/FullPageSpinner";

// const FullPage = styled.div`
//   height: 100vh;
//   background-color: var(--color-bg-page);
//   display: flex;
//   align-items: center;
//   justify-content: center;
//   color: var(--color-text-secondary);
// `;

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // 1. Стукаємо на сервер: "Хто я?"
  const {
    isLoading,
    isError,
    data: user,
  } = useQuery({
    queryKey: ["me"],
    queryFn: getMeApi,
    retry: false, // Не пробувати ще раз, якщо помилка (401/404)
    enabled: !!token, // Робити запит тільки якщо є токен
  });

  // 2. Якщо токена немає АБО сервер повернув помилку -> не авторизований
  const isAuthenticated = !!token && !isError && !!user;

  useEffect(
    function () {
      // Якщо завантаження завершилось і ми не авторизовані - на вихід
      if (!token || (!isLoading && !isAuthenticated)) {
        localStorage.removeItem("token");
        localStorage.removeItem("user_name");
        navigate("/login", { replace: true });
      }
    },
    [isLoading, isAuthenticated, token, navigate],
  );

  // Поки йде перевірка - показуємо спінер
  if (isLoading) return <FullPageSpinner />;

  // Якщо авторизовані - показуємо контент
  if (isAuthenticated) return children;

  // Фолбек (щоб не блимало перед редіректом)
  return <FullPageSpinner />;
}

export default ProtectedRoute;
