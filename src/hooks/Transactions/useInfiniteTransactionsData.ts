import { useMemo } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import {
  getTransactionsApi,
  type TransactionFilters,
} from "../../services/apiTransactions";
import type { Transaction } from "../../types";

type TransactionsResponse =
  | Transaction[]
  | {
      data?: Transaction[];
      count?: number;
    };

const PAGE_SIZE = 20;

export function useInfiniteTransactionsData(baseParams: TransactionFilters) {
  const query = useInfiniteQuery({
    queryKey: ["transactions-infinite", baseParams],
    initialPageParam: 1,
    queryFn: async ({ pageParam }) =>
      (getTransactionsApi({
        ...baseParams,
        page: pageParam,
        limit: baseParams.limit || PAGE_SIZE,
      }) as Promise<TransactionsResponse>),
    getNextPageParam: (lastPage, allPages) => {
      const normalizedLastPage = Array.isArray(lastPage)
        ? { data: lastPage, count: lastPage.length }
        : lastPage;

      const loadedCount = allPages.reduce((sum, page) => {
        const pageData = Array.isArray(page) ? page : page.data || [];
        return sum + pageData.length;
      }, 0);

      const totalCount = normalizedLastPage.count || 0;
      if (loadedCount >= totalCount) return undefined;

      return allPages.length + 1;
    },
  });

  const transactions = useMemo(
    () =>
      (query.data?.pages || []).flatMap((page) =>
        Array.isArray(page) ? page : page.data || [],
      ),
    [query.data],
  );

  const totalCount = useMemo(() => {
    const firstPage = query.data?.pages?.[0];
    if (!firstPage) return 0;
    return Array.isArray(firstPage) ? firstPage.length : firstPage.count || 0;
  }, [query.data]);

  return {
    transactions,
    totalCount,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isFetchingNextPage: query.isFetchingNextPage,
    hasNextPage: query.hasNextPage,
    fetchNextPage: query.fetchNextPage,
    refetch: query.refetch,
  };
}
