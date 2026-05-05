import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useHeader } from "../../context/HeaderContext";

export const useSettingsLayout = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
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
