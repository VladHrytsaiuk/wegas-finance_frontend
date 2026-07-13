import { useMemo } from "react";
import { AxiosError } from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { isSameMonth } from "date-fns";
import { useTranslation } from "react-i18next";

import {
  getAccountApi,
  updateAccountApi,
  deleteAccountApi,
} from "../../services/apiAccounts";
import { getTransactionsApi } from "../../services/apiTransactions";
import { getUsersApi } from "../../services/apiUsers";
import { getCategoriesApi } from "../../services/apiCategories";
// 🔥 Додали імпорт сервісу цілей
import { getGoalApi } from "../../services/apiGoals";
import type { UserProfile } from "../../services/apiUsers";
import type { Transaction } from "../../types";

import { BANK_SKINS } from "../../components/accounts/bankSkins";

interface ErrorResponse {
  error?: string;
}

export function useAccountDetails() {
  const { t } = useTranslation();
  const { accountId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // --- 1. DATA FETCHING ---

  // 1.1 Отримуємо сам рахунок
  const {
    data: account,
    isLoading: accLoading,
    isError,
  } = useQuery({
    queryKey: ["account", accountId],
    queryFn: () => getAccountApi(accountId!),
    enabled: !!accountId,
  });

  // 🔥 1.2 Отримуємо прив'язану ціль (якщо є goal_id)
  const { data: linkedGoal } = useQuery({
    queryKey: ["goal", account?.goal_id],
    queryFn: () => getGoalApi(account.goal_id),
    enabled: !!account?.goal_id, // Запит йде тільки якщо є ID цілі
  });

  const { data: users = [] } = useQuery({
    queryKey: ["users"],
    queryFn: getUsersApi,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategoriesApi,
  });

  const { data: recentRes, isLoading: txLoading } = useQuery({
    queryKey: ["transactions", accountId, "recent"],
    queryFn: () => getTransactionsApi({ account_id: accountId, limit: 6 }),
    enabled: !!accountId,
  });

  const { data: statsRes } = useQuery({
    queryKey: ["transactions", accountId, "stats"],
    queryFn: () => getTransactionsApi({ account_id: accountId, limit: 1000 }),
    enabled: !!accountId,
  });

  const recentTransactions = Array.isArray(recentRes)
    ? recentRes
    : recentRes?.data || [];

  // --- 2. PREPARE DISPLAY DATA ---
  const displayAccount = useMemo(() => {
    if (!account) return null;
    const owner = users?.find((u: UserProfile) => u.id === account.user_id);
    return {
      ...account,
      calculated_balance: account.calculated_balance ?? account.balance ?? 0,
      user_name: account.user?.name || owner?.name || t("common:common.owner"),
      owner_name: owner?.name,
    };
  }, [account, users, t]);

  // --- 3. SKIN LOGIC (Оновлена) ---
  const skin = useMemo(() => {
    if (!account) return BANK_SKINS["default"];

    // А. Логіка для карток (залишається без змін)
    if (account.type === "card") {
      const bank = account.bank_name;
      const design = account.card_type || account.card_design;

      if (bank && design) {
        const key = `${bank}-${design}`;
        if (BANK_SKINS[key]) return BANK_SKINS[key];
      }
      if (account.icon && BANK_SKINS[account.icon]) {
        return BANK_SKINS[account.icon];
      }
      if (bank === "monobank") return BANK_SKINS["monobank-black"];
      if (bank === "privat") return BANK_SKINS["privat-universal"];
      if (bank === "pumb") return BANK_SKINS["pumb-black"];
      if (bank === "oschad") return BANK_SKINS["oschad-classic"];
      if (bank === "sense") return BANK_SKINS["sense-black"];
      if (bank === "ukrsib") return BANK_SKINS["ukrsib-new"];
      if (bank === "raiffeisen") return BANK_SKINS["raif-yellow"];

      return BANK_SKINS["default"];
    }

    // Б. Логіка для Готівки та Скарбничок
    // Визначаємо тип іконки (slug) та назву (label)
    let iconType = "cash";
    let label = t("accounts:accountsTable.type_cash");

    if (account.type === "piggy_bank" || account.type === "savings") {
      iconType = account.storage_type?.slug || "archive"; // envelope, safe, jar...
      label = account.storage_type?.name || t("accounts:accountsTable.type_savings");
    }

    return {
      id: "cash-custom",
      bg: account.color || "#10b981",
      color: "#ffffff",
      bankId: "cash",
      logoFile: "",
      // 🔥 Передаємо ці дані в AccountCard для відображення
      iconType: iconType,
      label: label,
    };
  }, [account, t]);

  // --- 4. STATS CALCULATION ---
  const monthlyStats = useMemo(() => {
    const allTxForStats = Array.isArray(statsRes)
      ? statsRes
      : statsRes?.data || [];
    const now = new Date();
    let income = 0;
    let expense = 0;
    let totalTurnover = 0;

    allTxForStats.forEach((tx: Transaction) => {
      const txDate = new Date(tx.date);
      const amount = Number(tx.amount);

      if (isSameMonth(txDate, now)) {
        if (
          ["income", "transfer_in", "loan_repay", "debt_take"].includes(tx.type)
        ) {
          income += amount;
        } else if (
          ["expense", "transfer_out", "loan_give", "debt_repay"].includes(
            tx.type,
          )
        ) {
          expense += amount;
        }
      }
      totalTurnover += amount;
    });

    return { income, expense, totalTurnover };
  }, [statsRes]);

  // --- 5. MUTATIONS ---
  const { mutate: deleteAccount, isPending: isDeleting } = useMutation({
    mutationFn: (id: string) => deleteAccountApi(id),
    onSuccess: () => {
      toast.success(t("common:common.success_delete"));
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      navigate("/");
    },
    onError: (err: AxiosError<ErrorResponse>) => {
      toast.error(err.message || t("common:common.error_delete"));
    },
  });

  const { mutate: updateAccount, isPending: isUpdating } = useMutation({
    mutationFn: updateAccountApi,
    onSuccess: () => {
      toast.success(t("accounts:accountDetailsHook.alert_update_success"));
      queryClient.invalidateQueries({ queryKey: ["account", accountId] });
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
    },
    onError: () => toast.error(t("accounts:accountDetailsHook.alert_update_error")),
  });

  return {
    accountId,
    account: displayAccount,
    rawAccount: account,
    linkedGoal, // 🔥 Повертаємо ціль
    users,
    categories,
    recentTransactions,
    monthlyStats,
    skin,
    isLoading: accLoading,
    isError,
    txLoading,

    updateAccount,
    deleteAccount,
    isUpdating,
    isDeleting,
    navigate,
  };
}
