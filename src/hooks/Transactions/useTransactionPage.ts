import { useEffect } from "react"; // ✅ Додано
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { format, isValid } from "date-fns"; // ✅ Додано
import { uk, enUS } from "date-fns/locale"; // ✅ Додано

import { useHeader } from "../../context/HeaderContext"; // ✅ Додано

import {
  getTransactionApi,
  deleteTransactionApi,
} from "../../services/apiTransactions";
import { getCategoriesApi } from "../../services/apiCategories";
import { getAccountsApi } from "../../services/apiAccounts";
import { getCounterpartiesApi } from "../../services/apiCounterparties";

export const useTransactionPage = () => {
  const { t, i18n } = useTranslation();
  const { transactionId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

  // ✅ Підключаємо керування хедером
  const { setPageTitle, resetPageTitle } = useHeader();

  // --- 1. DATA FETCHING ---
  const {
    data: transaction,
    isLoading: loadTx,
    isError,
  } = useQuery({
    queryKey: ["transaction", transactionId],
    queryFn: () => getTransactionApi(transactionId!),
    enabled: !!transactionId,
  });

  const { data: categories = [], isLoading: loadCat } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategoriesApi,
  });

  const { data: accounts = [], isLoading: loadAcc } = useQuery({
    queryKey: ["accounts"],
    queryFn: getAccountsApi,
  });

  const { data: counterparties = [], isLoading: loadCp } = useQuery({
    queryKey: ["counterparties"],
    queryFn: getCounterpartiesApi,
  });

  // --- 2. HEADER EFFECT ---
  // ✅ Змінюємо заголовок сторінки, коли приходять дані
  useEffect(() => {
    if (transaction) {
      // Визначаємо локаль для дати (укр або англ)
      const dateLocale = i18n.language === "uk" ? uk : enUS;
      const transactionDate = new Date(transaction.date);
      const dateStr = isValid(transactionDate)
        ? format(transactionDate, "d MMMM yyyy", {
            locale: dateLocale,
          })
        : t("common:common.not_specified", "Не вказано");

      setPageTitle(
        t("legacy:transactionPage.header_title"), // "Деталі транзакції"
        t("legacy:transactionPage.header_subtitle", { date: dateStr }) // "Операція від..."
      );
    }

    // Скидаємо заголовок при виході
    return () => resetPageTitle();
  }, [transaction, t, i18n.language, setPageTitle, resetPageTitle]);

  // --- 3. ACTIONS ---
  const { mutate: deleteTx, isPending: isDeleting } = useMutation({
    mutationFn: deleteTransactionApi,
    onSuccess: () => {
      toast.success(t("legacy:transactionPage.delete_success"));
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      // Повертаємось на список або попередню сторінку
      navigate("/transactions");
    },
    onError: (err: AxiosError<{ error?: string }>) =>
      toast.error(err.response?.data?.error || err.message),
  });

  const handleBack = () => navigate(-1);

  // Aggregated loading state
  const isLoading = loadTx || loadCat || loadAcc || loadCp;

  return {
    // Data
    transactionId,
    transaction,
    categories,
    accounts,
    counterparties,

    // Status
    isLoading,
    isError,
    isDeleting,

    // Actions
    deleteTx,
    handleBack,

    // Utils
    t,
    location,
  };
};
