import { useState, useMemo } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import {
  getTransactionsApi,
  type TransactionFilters,
} from "../../services/apiTransactions";
import { getCategoriesApi } from "../../services/apiCategories";
import { groupTransactionsByDate } from "../../utils/helpers";
import { useDebounce } from "../useDebounce";
import { useSettings } from "../../context/SettingsContext";
import { type FilterConfig } from "../../components/shared/TableToolbar/types";

const mockGetCounterparties = async () => [];

interface UseTransactionsModalProps {
  accountId?: string;
  initialFilters?: Record<string, any>;
  title?: string;
  onClose?: () => void;
}

export const useTransactionsModal = ({
  accountId,
  initialFilters = {},
  title,
  onClose,
}: UseTransactionsModalProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { language, currency: baseCurrency } = useSettings();

  // Ініціалізуємо фільтри ОДИН раз (це вирішує баг зі скиданням)
  const [filters, setFilters] = useState({
    type: [] as string[],
    amountRange: { min: "", max: "" },
    categories: [] as string[],
    counterparties: [] as string[],
    ...initialFilters,
  });

  const [sortValue, setSortValue] = useState("date-desc");
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 500);

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategoriesApi,
    staleTime: 5 * 60 * 1000,
  });

  const { data: counterparties = [] } = useQuery({
    queryKey: ["counterparties"],
    queryFn: mockGetCounterparties,
    staleTime: 5 * 60 * 1000,
  });

  const filtersConfig = useMemo(() => {
    const config: FilterConfig[] = [];
    const isTypeFixed = initialFilters.type && initialFilters.type.length > 0;

    if (!isTypeFixed) {
      config.push({
        key: "type",
        label: t("transactions:transactionsModal.filter_type"),
        type: "toggle",
        options: [
          {
            value: "expense",
            label: t("transactions:transactionsModal.filter_option_expense"),
          },
          {
            value: "income",
            label: t("transactions:transactionsModal.filter_option_income"),
          },
          {
            value: "transfer",
            label: t("transactions:transactionsModal.filter_option_transfer"),
          },
        ],
      });
    }

    if (categories.length > 0) {
      config.push({
        key: "categories",
        label: t("transactions:transactionsModal.filter_category"),
        type: "multi-select",
        treeType: "categories",
        rawData: categories,
      });
    }

    if (counterparties.length > 0) {
      config.push({
        key: "counterparties",
        label: t("transactions:transactionsModal.filter_counterparty"),
        type: "multi-select",
        treeType: "counterparties",
        rawData: counterparties,
      });
    }
    return config;
  }, [categories, counterparties, t, initialFilters.type]);

  const sortOptions = [
    { value: "date-desc", label: t("transactions:transactionsModal.sort_date_desc") },
    { value: "date-asc", label: t("transactions:transactionsModal.sort_date_asc") },
    { value: "amount-desc", label: t("transactions:transactionsModal.sort_amount_desc") },
    { value: "amount-asc", label: t("transactions:transactionsModal.sort_amount_asc") },
  ];

  // --- API PARAMS ---
  const apiParams: TransactionFilters = useMemo(() => {
    // 🔥 МАГІЯ КАТЕГОРІЙ: Розгортаємо батьківські категорії в масив усіх їхніх дочірніх
    let expandedCategories = [...filters.categories];

    if (filters.categories.length > 0 && categories.length > 0) {
      const result = new Set<string>(filters.categories);

      const traverseTree = (nodes: any[], parentSelected: boolean) => {
        for (const node of nodes) {
          const isSelected = parentSelected || result.has(String(node.id));
          if (isSelected) result.add(String(node.id));
          if (node.children && node.children.length > 0) {
            traverseTree(node.children, isSelected);
          }
        }
      };

      traverseTree(categories, false);
      expandedCategories = Array.from(result);
    }

    return {
      account_id: accountId,
      type: filters.type.length > 0 ? filters.type[0] : undefined,
      category_id:
        expandedCategories.length > 0 ? expandedCategories : undefined,
      counterparty_id:
        filters.counterparties.length > 0 ? filters.counterparties : undefined,
      min_amount: filters.amountRange.min
        ? Math.round(Number(filters.amountRange.min) * 100)
        : undefined,
      max_amount: filters.amountRange.max
        ? Math.round(Number(filters.amountRange.max) * 100)
        : undefined,
      sort: sortValue.replace("-", "_"), // API зазвичай любить date_desc
      search: debouncedSearch,
      limit: 100,
    };
  }, [accountId, filters, sortValue, debouncedSearch, categories]);

  // --- TRANSACTIONS QUERY ---
  const {
    data: responseData,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ["transactions", apiParams],
    queryFn: () => getTransactionsApi(apiParams),
    placeholderData: keepPreviousData,
  });

  const transactions = useMemo(() => {
    if (!responseData) return [];
    if (Array.isArray(responseData)) return responseData;
    return responseData.data || [];
  }, [responseData]);

  // --- GROUPING LOGIC ---
  const shouldGroup = !sortValue.includes("amount");

  const dataToRender = useMemo(() => {
    if (shouldGroup) {
      // 🔥 ХАК для helpers.ts: робимо дати числами (timestamp), щоб "b.date - a.date" працювало
      let safeTransactions = transactions.map((tx: any) => ({
        ...tx,
        originalDate: tx.date, // зберігаємо строку для відображення
        date: new Date(tx.date || tx.created_at).getTime(), // підсовуємо число
      }));

      // Якщо треба date-asc, сортуємо перед групуванням, щоб дні йшли по порядку (старі зверху)
      if (sortValue === "date-asc") {
        safeTransactions.sort((a, b) => a.date - b.date);
      }

      // Викликаємо оригінальний (недоторканий) helpers.ts
      const grouped = groupTransactionsByDate(
        safeTransactions,
        language,
        sortValue,
      );

      // Оскільки helpers.ts завжди сортує date-desc, ми вручну перевертаємо групи для date-asc
      if (sortValue === "date-asc") {
        Object.keys(grouped).forEach((key) => {
          grouped[key].reverse();
        });
      }

      // Повертаємо оригінальні дати назад (щоб UI не зламався)
      Object.keys(grouped).forEach((key) => {
        grouped[key] = grouped[key].map((tx) => ({
          ...tx,
          date: tx.originalDate,
        }));
      });

      return grouped;
    } else {
      // Сортування по сумі працює ідеально тут
      return [...transactions].sort((a, b) => {
        if (sortValue === "amount-desc") return b.amount - a.amount;
        if (sortValue === "amount-asc") return a.amount - b.amount;
        const timeA = new Date(a.date || a.created_at).getTime();
        const timeB = new Date(b.date || b.created_at).getTime();
        return sortValue === "date-asc" ? timeA - timeB : timeB - timeA;
      });
    }
  }, [transactions, shouldGroup, language, sortValue]);

  // --- HANDLERS ---
  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearAll = () => {
    setFilters({
      type: [],
      amountRange: { min: "", max: "" },
      categories: [],
      counterparties: [],
      ...initialFilters,
    });
    setSearchQuery("");
    setSortValue("date-desc");
  };

  const handleTxClick = (id: string) => {
    navigate(`/transactions/${id}`);
    if (onClose) onClose();
  };

  const getTitle = () => {
    if (title) return title;
    const type = filters.type[0];
    if (type === "income") return t("transactions:transactionsModal.title_history_income");
    if (type === "expense") return t("transactions:transactionsModal.title_history_expense");
    return t("transactions:transactionsModal.title_history_default");
  };

  return {
    state: {
      transactions,
      dataToRender,
      isLoading,
      isFetching,
      shouldGroup,
      filtersConfig,
      sortOptions,
      sortValue,
      searchQuery,
      filters,
      modalTitle: getTitle(),
      categories,
      baseCurrency,
      language,
    },
    actions: {
      setSearchQuery,
      setSortValue,
      handleFilterChange,
      clearAll,
      handleTxClick,
    },
  };
};
