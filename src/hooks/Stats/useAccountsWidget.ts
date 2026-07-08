import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { getAccountsApi, type Account } from "../../services/apiAccounts";
import api from "../../services/Axios";
import { useSettings } from "../../context/SettingsContext";
import type { User } from "../../types";
// 🔥 Додаємо скіни
import { BANK_SKINS } from "../../components/accounts/bankSkins";

type WidgetAccount = Account & {
  displayIcon?: string;
};

export const useAccountsWidget = () => {
  const { t } = useTranslation();
  const { currency, language } = useSettings();
  const navigate = useNavigate();

  const { data: user } = useQuery({
    queryKey: ["me"],
    queryFn: async () => (await api.get<User>("/users/me")).data,
    staleTime: Infinity,
  });

  const { data: accounts = [], isLoading } = useQuery({
    queryKey: ["accounts"],
    queryFn: getAccountsApi,
  });

  const myAccounts = useMemo(() => {
    if (!user || !accounts) return [];

    return accounts
      .filter((acc) => acc.user_id === user.id && !acc.is_archived)
      .sort((a, b) => b.balance - a.balance)
      .map<WidgetAccount>((acc) => {
        // 🔥 Визначаємо іконку/логотип для кожного рахунку
        if (acc.type !== "card") return acc;

        const skinKey =
          acc.bank_name && acc.card_type
            ? `${acc.bank_name}-${acc.card_type}`
            : acc.icon;

        const skin = BANK_SKINS[skinKey] || BANK_SKINS["default"];

        return {
          ...acc,
          // Передаємо miniLogoFile (icon_...) або фолбек на HiCreditCard
          displayIcon: skin.miniLogoFile || "HiCreditCard",
        };
      });
  }, [accounts, user]);

  const handleNavigateToAll = () => navigate("/accounts");
  const handleNavigateToDetails = (id: string) => navigate(`/accounts/${id}`);

  return {
    accounts: myAccounts,
    isLoading,
    currency,
    language,
    t,
    actions: {
      handleNavigateToAll,
      handleNavigateToDetails,
    },
  };
};
