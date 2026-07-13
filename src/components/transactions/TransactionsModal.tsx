import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { isSameDay, startOfDay } from "date-fns";
import { HiArrowUp, HiOutlineArrowPath, HiXMark } from "react-icons/hi2";
import { useTranslation } from "react-i18next";
import { useTransactionsModal } from "../../hooks/Transactions/useTransactionsModal";
import type { TransactionFilters } from "../../services/apiTransactions";
import type { Transaction } from "../../types";

// UI Components
import { DateRangePicker } from "../ui/DateRangePicker";
import { CenteredSpinner } from "../ui/CenteredSpinner";
import { TableToolbar } from "../shared/TableToolbar/TableToolbar";
import { TransactionItem } from "./TransactionItem";
import * as S from "./TransactionsModal.styles";

type GroupedTransactions = Record<string, Transaction[]>;

interface TransactionsModalProps {
  accountId?: string;
  initialFilters?: Partial<TransactionFilters>;
  title?: string;
  onClose?: () => void;
}

export default function TransactionsModal(props: TransactionsModalProps) {
  const { t } = useTranslation();
  const { state, actions } = useTransactionsModal(props);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [pendingJumpDate, setPendingJumpDate] = useState<number | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const groupRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const {
    transactions,
    dataToRender,
    isLoading,
    isFetching,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    shouldGroup,
    filtersConfig,
    sortOptions,
    sortValue,
    searchQuery,
    filters,
    modalTitle,
    categories,
    baseCurrency,
    language,
  } = state;

  const groupedEntries = useMemo(() => {
    if (!shouldGroup) return [];

    return Object.entries(dataToRender as GroupedTransactions)
      .map(([label, txs]) => ({
        label,
        txs,
        dayTs: startOfDay(new Date(Number(txs[0]?.date))).getTime(),
      }))
      .filter((entry) => entry.txs.length > 0 && Number.isFinite(entry.dayTs));
  }, [dataToRender, shouldGroup]);

  const scrollToGroup = useCallback((dayTs: number) => {
    window.setTimeout(() => {
      const element = groupRefs.current[String(dayTs)];
      const scrollArea = scrollAreaRef.current;

      if (!element || !scrollArea) return;

      const top = element.offsetTop - 12;
      scrollArea.scrollTo({
        top: Math.max(top, 0),
        behavior: "smooth",
      });
    }, 60);
  }, []);

  const oldestLoadedTimestamp = useMemo(() => {
    if (transactions.length === 0) return null;
    return transactions.reduce(
      (oldest, tx) => Math.min(oldest, Number(tx.date)),
      Number(transactions[0].date),
    );
  }, [transactions]);

  const handleDatePick = useCallback(
    (timestamp: number | null) => {
      if (!timestamp) {
        setIsDatePickerOpen(false);
        return;
      }
      setPendingJumpDate(timestamp);
      setIsDatePickerOpen(false);
    },
    [],
  );

  useEffect(() => {
    if (!isDatePickerOpen) return;

    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsDatePickerOpen(false);
      }
    };

    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [isDatePickerOpen]);

  useEffect(() => {
    if (pendingJumpDate === null || groupedEntries.length === 0) return;

    const targetDate = new Date(pendingJumpDate);
    const exactMatch = groupedEntries.find((entry) =>
      entry.txs.some((tx) => isSameDay(new Date(tx.date), targetDate)),
    );

    if (exactMatch) {
      scrollToGroup(exactMatch.dayTs);
      setPendingJumpDate(null);
      return;
    }

    const targetDayTs = startOfDay(targetDate).getTime();
    const newerCandidates = groupedEntries
      .filter((entry) => entry.dayTs >= targetDayTs)
      .sort((a, b) => a.dayTs - b.dayTs);
    const olderCandidates = groupedEntries
      .filter((entry) => entry.dayTs < targetDayTs)
      .sort((a, b) => b.dayTs - a.dayTs);

    const nearestNewerMatch = newerCandidates[0];
    const nearestOlderMatch = olderCandidates[0];

    if (
      nearestNewerMatch &&
      oldestLoadedTimestamp !== null &&
      oldestLoadedTimestamp <= pendingJumpDate
    ) {
      scrollToGroup(nearestNewerMatch.dayTs);
      setPendingJumpDate(null);
      return;
    }

    if (nearestOlderMatch && oldestLoadedTimestamp !== null) {
      scrollToGroup(nearestOlderMatch.dayTs);
      setPendingJumpDate(null);
      return;
    }

    if (!hasNextPage) {
      if (groupedEntries.length > 0) {
        scrollToGroup(groupedEntries[groupedEntries.length - 1].dayTs);
      }
      setPendingJumpDate(null);
      return;
    }

    if (!isFetchingNextPage) {
      void fetchNextPage();
    }
  }, [
    fetchNextPage,
    groupedEntries,
    hasNextPage,
    isFetchingNextPage,
    oldestLoadedTimestamp,
    pendingJumpDate,
    scrollToGroup,
  ]);

  useEffect(() => {
    const node = loadMoreRef.current;
    const root = scrollAreaRef.current;
    if (!node || !root || !hasNextPage || isFetchingNextPage) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          void fetchNextPage();
        }
      },
      { root, rootMargin: "320px 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage, transactions.length]);

  useEffect(() => {
    const node = scrollAreaRef.current;
    if (!node) return;

    const handleScroll = () => {
      setShowScrollTop(node.scrollTop > 480);
    };

    handleScroll();
    node.addEventListener("scroll", handleScroll, { passive: true });
    return () => node.removeEventListener("scroll", handleScroll);
  }, [transactions.length, isLoading]);

  const renderList = (txList: Transaction[]) =>
    txList.map((tx) => (
      <TransactionItem
        key={tx.id}
        transaction={tx}
        categories={categories}
        accounts={[]}
        currency={baseCurrency}
        language={language}
        onClick={() => actions.handleTxClick(String(tx.id))}
        hideAccountColumn={true}
      />
    ));

  return (
    <S.ModalContent>
      <S.Header>
        <h2>{modalTitle}</h2>
      </S.Header>

      {/* 🔥 Використовуємо адаптивну обгортку для тулбара */}
      <S.ToolbarWrapper>
        <TableToolbar
          searchQuery={searchQuery}
          onSearchChange={actions.setSearchQuery}
          searchPlaceholder={t("transactions:transactionsModal.search_placeholder")}
          filtersConfig={filtersConfig}
          filterValues={filters}
          onFilterChange={actions.handleFilterChange}
          sortOptions={sortOptions}
          sortValue={sortValue}
          onSortChange={actions.setSortValue}
          onClearAll={actions.clearAll}
        />
      </S.ToolbarWrapper>

      <S.ScrollArea ref={scrollAreaRef}>
        {isLoading ? (
          <CenteredSpinner isContainer />
        ) : transactions.length === 0 ? (
          <S.EmptyState>{t("transactions:transactionsModal.status_empty")}</S.EmptyState>
        ) : (
          <>
            {isFetching && !isLoading && (
              <S.LoadingIndicator>
                {t("transactions:transactionsModal.status_loading")}
              </S.LoadingIndicator>
            )}

            {shouldGroup
              ? groupedEntries.map(({ label, txs, dayTs }) => (
                    <S.DateGroup key={`${label}-${dayTs}`}>
                      <S.DateLabel
                        ref={(node) => {
                          groupRefs.current[String(dayTs)] = node;
                        }}
                        onClick={() => setIsDatePickerOpen(true)}
                      >
                        {label}
                      </S.DateLabel>
                      <div>{renderList(txs)}</div>
                    </S.DateGroup>
                  ))
              : renderList(dataToRender as Transaction[])}

            {hasNextPage && <S.Sentinel ref={loadMoreRef} />}

            {(isFetchingNextPage || (isFetching && transactions.length > 0)) && (
              <S.LoadingIndicator>
                <HiOutlineArrowPath
                  size={16}
                  style={{ marginRight: "0.45rem", verticalAlign: "text-bottom" }}
                />
                {hasNextPage
                  ? t(
                      "transactions:transactionsModal.status_loading_more",
                      "Довантажуємо старіші транзакції...",
                    )
                  : t(
                      "transactions:transactionsModal.status_refreshing",
                      "Оновлюємо список...",
                    )}
              </S.LoadingIndicator>
            )}
          </>
        )}
      </S.ScrollArea>

      {isDatePickerOpen && (
        <S.PickerOverlay onClick={() => setIsDatePickerOpen(false)}>
          <S.PickerSheet onClick={(e) => e.stopPropagation()}>
            <S.PickerHeader>
              <h3>{t("transactions:transactionsModal.jump_to_date", "Перейти до дати")}</h3>
              <S.PickerActions>
                <S.PickerDismiss onClick={() => setIsDatePickerOpen(false)}>
                  <HiXMark size={18} />
                </S.PickerDismiss>
              </S.PickerActions>
            </S.PickerHeader>

            <DateRangePicker
              mode="single"
              date={null}
              onDateChange={handleDatePick}
              staticPicker
              numberOfMonths={1}
              hideFooter
            />
          </S.PickerSheet>
        </S.PickerOverlay>
      )}

      {showScrollTop && (
        <S.ScrollTopButton
          onClick={() =>
            scrollAreaRef.current?.scrollTo({ top: 0, behavior: "smooth" })
          }
          aria-label={t("common:common.back_to_top", "Вгору")}
          title={t("common:common.back_to_top", "Вгору")}
        >
          <HiArrowUp size={20} />
        </S.ScrollTopButton>
      )}
    </S.ModalContent>
  );
}
