import { useState, useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useCounterpartyData } from "../Counterparties/useCounterpartyData"; // Перевір шлях
import { useDebtFilters } from "./useDebtFilters"; // Перевір шлях
import { useHeader } from "../../context/HeaderContext"; // Перевір шлях
import type { Counterparty } from "../../types";

export type DebtTotals = Record<string, number>;

export const useDebtsPage = () => {
  const { t } = useTranslation();
  const { setPageTitle, resetPageTitle } = useHeader();
  const { counterparties, isLoading } = useCounterpartyData();

  // Modal State
  const [selectedCP, setSelectedCP] = useState<Counterparty | null>(null);

  // Типи транзакцій:
  // loan_give (Дати в борг), loan_repay (Мені повернули)
  // debt_take (Взяти в борг), debt_repay (Я повернув)
  const [txType, setTxType] = useState<string>("loan_give");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 1. Available Currencies (for filter dropdown)
  const availableCurrencies = useMemo(() => {
    if (!counterparties) return [];
    const currencies = new Set<string>();
    counterparties.forEach((cp) => {
      cp.balances?.forEach((b: any) => {
        if (Math.abs(b.balance) > 0.01) currencies.add(b.currency);
      });
    });
    return Array.from(currencies);
  }, [counterparties]);

  // 2. Filters Hook
  const {
    searchQuery,
    sortValue,
    filterValues,
    filtersConfig,
    sortOptions,
    handleSearchChange,
    handleSortChange,
    handleFilterChange,
    handleClearAll,
  } = useDebtFilters(availableCurrencies);

  // 3. Page Title (Updated keys)
  useEffect(() => {
    setPageTitle(
      t("goals_debts:debtsPage.title"), // "Борги та Позики"
      t("goals_debts:debtsPage.subtitle") // "Облік боргів..."
    );
    return () => resetPageTitle();
  }, [setPageTitle, resetPageTitle, t]);

  // 4. Main Filtering & Sorting Logic
  const { positive, negative, totalsOwedToMe, totalsIOwe, netBalances } =
    useMemo(() => {
      if (!counterparties)
        return {
          positive: [],
          negative: [],
          totalsOwedToMe: {},
          totalsIOwe: {},
          netBalances: {},
        };

      // Filter
      const filtered = counterparties.filter((cp) => {
        // Search
        const matchesSearch = cp.name
          .toLowerCase()
          .includes(searchQuery.toLowerCase());

        // Has Debt?
        const hasDebt =
          cp.balances && cp.balances.some((b) => Math.abs(b.balance) > 0.01);

        // Currency Filter
        let matchesCurrency = true;
        if (filterValues.currency && filterValues.currency.length > 0) {
          matchesCurrency = cp.balances.some(
            (b) =>
              filterValues.currency.includes(b.currency) &&
              Math.abs(b.balance) > 0.01
          );
        }

        return matchesSearch && hasDebt && matchesCurrency;
      });

      const pos: Counterparty[] = [];
      const neg: Counterparty[] = [];
      const sumPos: DebtTotals = {};
      const sumNeg: DebtTotals = {};
      const netSum: DebtTotals = {};

      filtered.forEach((cp) => {
        const hasPos = cp.balances.some((b) => b.balance > 0.01); // Threshold fix
        const hasNeg = cp.balances.some((b) => b.balance < -0.01);

        // Type Filter (Debtor vs Creditor)
        const showDebtors =
          filterValues.type.length === 0 ||
          filterValues.type.includes("debtor");
        const showCreditors =
          filterValues.type.length === 0 ||
          filterValues.type.includes("creditor");

        if (hasPos && showDebtors) pos.push(cp);
        if (hasNeg && showCreditors) neg.push(cp);

        // Calculate Totals
        cp.balances.forEach((b) => {
          // Skip if currency filtered out
          if (
            filterValues.currency.length > 0 &&
            !filterValues.currency.includes(b.currency)
          )
            return;

          if (b.balance > 0) {
            sumPos[b.currency] = (sumPos[b.currency] || 0) + b.balance;
          } else if (b.balance < 0) {
            sumNeg[b.currency] =
              (sumNeg[b.currency] || 0) + Math.abs(b.balance);
          }
          netSum[b.currency] = (netSum[b.currency] || 0) + b.balance;
        });
      });

      // Sort
      const sortFn = (a: Counterparty, b: Counterparty) => {
        if (sortValue === "name-asc") return a.name.localeCompare(b.name);
        if (sortValue === "name-desc") return b.name.localeCompare(a.name);
        // Add amount sorting logic here if needed later
        return 0;
      };

      pos.sort(sortFn);
      neg.sort(sortFn);

      return {
        positive: pos,
        negative: neg,
        totalsOwedToMe: sumPos,
        totalsIOwe: sumNeg,
        netBalances: netSum,
      };
    }, [counterparties, searchQuery, sortValue, filterValues]);

  // Handlers
  const handleAction = (cp: Counterparty, action: "give" | "repay") => {
    setSelectedCP(cp);

    // Визначаємо контекст: чи це боржник (позитивний баланс) чи кредитор (негативний)
    // Це важливо, бо кнопка "give" (дати/взяти ще) має різний сенс
    const isDebtor = cp.balances.some((b) => b.balance > 0);
    const isCreditor = cp.balances.some((b) => b.balance < 0);

    // Пріоритет: якщо він в списку positive (боржники), то ми працюємо з позикою (loan)
    // Якщо він тільки в negative (кредитори), то з боргом (debt)
    // Якщо і там і там (рідкісний кейс), дефолтимо до loan, або можна передавати контекст з UI
    let isLendingContext = true;

    if (isCreditor && !isDebtor) {
      isLendingContext = false;
    }

    if (isLendingContext) {
      // Контекст: Мені винні (Debtors)
      // action 'give' -> Я даю ще (Lend money) -> loan_give
      // action 'repay' -> Мені повертають (Repay to me) -> loan_repay
      setTxType(action === "give" ? "loan_give" : "loan_repay");
    } else {
      // Контекст: Я винен (Creditors)
      // action 'give' -> Я беру ще (Borrow money) -> debt_take
      // action 'repay' -> Я повертаю (Repay my debt) -> debt_repay
      setTxType(action === "give" ? "debt_take" : "debt_repay");
    }

    setIsModalOpen(true);
  };

  const handleCreateNew = () => {
    setSelectedCP(null);
    setTxType("loan_give"); // Default to lending
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCP(null);
  };

  return {
    state: {
      isLoading,
      searchQuery,
      filterValues,
      positive,
      negative,
      totalsOwedToMe,
      totalsIOwe,
      netBalances,
      selectedCP,
      txType,
      isModalOpen,
    },
    config: {
      filtersConfig,
      sortOptions,
      sortValue,
    },
    handlers: {
      handleSearchChange,
      handleSortChange,
      handleFilterChange,
      handleClearAll,
      handleAction,
      handleCreateNew,
      handleCloseModal,
    },
    t,
  };
};
