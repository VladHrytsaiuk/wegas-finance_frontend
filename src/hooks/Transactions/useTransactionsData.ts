import { useEffect, useMemo } from "react";
import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import {
  getTransactionsApi,
  deleteTransactionApi,
} from "../../services/apiTransactions";

// ✅ ПЕРЕВІРТЕ: Тут має бути export function
export function useTransactionsData(apiParams: any) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  // 1. Основний запит
  const {
    data: responseData,
    isLoading,
    isPlaceholderData,
  } = useQuery({
    queryKey: ["transactions", apiParams],
    queryFn: () => getTransactionsApi(apiParams),
    placeholderData: keepPreviousData,
  });

  // 2. Нормалізація даних
  const transactions = useMemo(() => {
    if (!responseData) return [];
    // Якщо бекенд повертає масив або об'єкт з data
    return Array.isArray(responseData) ? responseData : responseData.data || [];
  }, [responseData]);

  const totalCount = responseData?.count || 0;

  // 3. Prefetching (попереднє завантаження наступної сторінки)
  useEffect(() => {
    const page = apiParams.page || 1;
    const limit = apiParams.limit || 20;
    const pageCount = Math.ceil(totalCount / limit);

    if (!isPlaceholderData && page < pageCount && totalCount > 0) {
      const nextParams = { ...apiParams, page: page + 1 };
      queryClient.prefetchQuery({
        queryKey: ["transactions", nextParams],
        queryFn: () => getTransactionsApi(nextParams),
      });
    }
  }, [responseData, isPlaceholderData, apiParams, queryClient, totalCount]);

  // 4. Мутація видалення
  const { mutate: deleteTransaction, isPending: isDeleting } = useMutation({
    mutationFn: deleteTransactionApi,
    onSuccess: () => {
      toast.success(t("transactions:transactionsDataHook.alert_delete_success"));
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      queryClient.invalidateQueries({ queryKey: ["counterparties"] });
    },
    onError: () => toast.error(t("transactions:transactionsDataHook.alert_delete_error")),
  });

  return {
    transactions,
    totalCount,
    isLoading,
    isPlaceholderData,
    deleteTransaction,
    isDeleting,
  };
}
