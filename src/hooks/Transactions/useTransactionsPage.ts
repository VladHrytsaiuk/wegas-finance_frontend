import React, { useEffect, useMemo, useCallback } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { useHeader } from "../../context/HeaderContext";
import { useTransactionFilters } from "./useTransactionFilters";
import { useTransactionsData } from "./useTransactionsData";

export const useTransactionsPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { setPageTitle, resetPageTitle } = useHeader();

  // 1. Отримуємо поточну сторінку з URL
  const currentPageFromUrl = Number(searchParams.get("page")) || 1;

  // Setup Title
  useEffect(() => {
    setPageTitle(
      t("transactions:transactionsPage.title"),
      t("transactions:transactionsPage.subtitle"),
    );
    return () => resetPageTitle();
  }, [setPageTitle, resetPageTitle, t]);

  // Filters Logic
  const filterLogic = useTransactionFilters();
  const {
    searchQuery,
    dateRange,
    filterValues,
    apiParams: originalApiParams,
  } = filterLogic;

  // 2. Формуємо параметри для API (сторінка з URL)
  const apiParams = useMemo(
    () => ({
      ...originalApiParams,
      page: currentPageFromUrl,
    }),
    [originalApiParams, currentPageFromUrl],
  );

  // Data Fetching
  const {
    transactions,
    totalCount,
    isLoading, // Це true тільки при першому завантаженні сторінки
    isFetching, // 🔥 ДОДАНО: Це true при кожному фоновому оновленні (пошук, фільтри)
    isPlaceholderData,
    deleteTransaction,
    isDeleting,
  } = useTransactionsData(apiParams);

  // 3. Функція зміни сторінки (URL + Scroll)
  const handlePageChange = useCallback(
    (newPage: number) => {
      searchParams.set("page", newPage.toString());
      setSearchParams(searchParams);
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [searchParams, setSearchParams],
  );

  // Handlers
  const handleRowClick = useCallback(
    (id: string) => navigate(`/transactions/${id}`),
    [navigate],
  );

  const hasActiveFilters = useMemo(() => {
    return (
      !!searchQuery ||
      !!dateRange.from ||
      Object.values(filterValues).some((v) =>
        Array.isArray(v) ? v.length > 0 : !!v,
      )
    );
  }, [searchQuery, dateRange, filterValues]);

  return {
    t,
    location,

    // Data
    transactions,
    totalCount,
    isLoading,
    isFetching, // 🔥 ПОВЕРТАЄМО НАГОРУ
    isPlaceholderData,
    isDeleting,

    // Logic objects
    ...filterLogic,

    // Overrides
    page: currentPageFromUrl,
    setPage: handlePageChange,

    // Computed
    hasActiveFilters,

    // Actions
    deleteTransaction,
    handleRowClick,
  };
};
