import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useHeader } from "../../context/HeaderContext";
import { useAuth } from "../../context/AuthContext";

export const useSettingsLayout = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { lock } = useAuth();
  const { setPageTitle, resetPageTitle } = useHeader();

  // Встановлюємо заголовок "Налаштування"
  useEffect(() => {
    setPageTitle(t("settings:settingsLayout.header"), "");
    return () => resetPageTitle();
  }, [t, setPageTitle, resetPageTitle]);

  const handleLogout = () => {
    // Очищення сховища
    localStorage.removeItem("token");
    localStorage.removeItem("user_name");
    localStorage.removeItem("user_id");
    localStorage.removeItem("user_email"); // Додали це, щоб наступного разу питало email/pass

    // Блокуємо сесію
    lock();

    // Повне очищення кешу React Query
    queryClient.removeQueries();
    queryClient.clear();

    navigate("/login");
  };

  return {
    actions: {
      handleLogout,
    },
    t,
  };
};
