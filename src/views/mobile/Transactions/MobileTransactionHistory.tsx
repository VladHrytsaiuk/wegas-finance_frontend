import React, {
  lazy,
  Suspense,
  useEffect,
  useMemo,
  useCallback,
  useRef,
  useState,
} from "react";
import styled from "styled-components";
import { useTranslation } from "react-i18next";
import { isSameDay, startOfDay } from "date-fns";
import { usePageTitle } from "../../../hooks/usePageTitle";
import { useTransactionsTable } from "../../../hooks/Transactions/useTransactionsTable";
import { useSettings } from "../../../context/SettingsContext";
import { TransactionItem } from "../../../components/transactions/TransactionItem";
import {
  ExportPageSkeleton,
  MobileTransactionsSkeleton,
} from "../../../components/ui/Skeleton/LoadingSkeletons";
import {
  HiArrowUp,
  HiArrowDownTray,
  HiCalendarDays,
  HiOutlineArrowPath,
  HiXMark,
} from "react-icons/hi2";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { FAB } from "../../../components/ui/FAB";
import Modal, { useModal } from "../../../components/ui/Modal";
import { Button } from "../../../components/ui/Button";
import MobilePageHeader from "../../../components/mobile/MobilePageHeader";
import { DateRangePicker } from "../../../components/ui/DateRangePicker";
import { useTransactionFilters } from "../../../hooks/Transactions/useTransactionFilters";
import { useInfiniteTransactionsData } from "../../../hooks/Transactions/useInfiniteTransactionsData";

const ExportModal = lazy(() => import("../../../pages/settings/ExportPage"));

const StyledHistory = styled.div`
  display: flex;
  flex-direction: column;
  background-color: var(--color-bg-page);
  min-height: 100vh;
  padding-bottom: 88px;
`;

const List = styled.div`
  display: flex;
  flex-direction: column;
  background-color: var(--color-bg-surface);
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const IconActionButton = styled.button<{ $active?: boolean }>`
  width: 44px;
  height: 44px;
  border-radius: 14px;
  background: ${(p) =>
    p.$active ? "var(--color-brand-50)" : "var(--color-bg-page)"};
  border: 1px solid
    ${(p) => (p.$active ? "var(--color-brand-200)" : "var(--color-border)")};
  color: ${(p) =>
    p.$active ? "var(--color-brand-700)" : "var(--color-text-main)"};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.2s ease;

  &:active {
    transform: scale(0.96);
  }
`;

const DateSeparatorButton = styled.button`
  display: flex;
  justify-content: flex-start;
  padding: 10px 16px 8px;
  border: none;
  background:
    linear-gradient(
      180deg,
      var(--color-bg-page) 0%,
      color-mix(in srgb, var(--color-bg-page), transparent 10%) 100%
    );
  cursor: pointer;

  span {
    display: inline-flex;
    align-items: center;
    min-height: 28px;
    padding: 0 12px;
    border-radius: 999px;
    background: var(--color-bg-surface);
    border: 1px solid var(--color-border);
    font-size: 12px;
    font-weight: 700;
    color: var(--color-text-secondary);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.04);
  }
`;

const LoadingPanel = styled.div`
  padding: 16px;
  display: flex;
  justify-content: center;
`;

const LoadingCard = styled.div`
  width: 100%;
  padding: 16px;
  border-radius: 18px;
  border: 1px solid var(--color-border);
  background: var(--color-bg-surface);
  color: var(--color-text-secondary);
  font-size: 13px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;

  svg {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
`;

const Sentinel = styled.div`
  height: 1px;
`;

const PickerOverlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 1200;
  background: rgba(15, 23, 42, 0.38);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: 16px;
`;

const PickerSheet = styled.div`
  width: min(100%, 720px);
  max-height: min(85vh, 760px);
  overflow: auto;
  border-radius: 24px;
  border: 1px solid var(--color-border);
  background: var(--color-bg-surface);
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.22);
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

const PickerHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;

  h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 800;
    color: var(--color-text-main);
  }
`;

const PickerActions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const PickerDismiss = styled.button`
  width: 38px;
  height: 38px;
  border-radius: 12px;
  border: 1px solid var(--color-border);
  background: var(--color-bg-page);
  color: var(--color-text-main);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
`;

const ScrollTopButton = styled.button`
  position: fixed;
  right: 4.85rem;
  bottom: calc(142px + env(safe-area-inset-bottom));
  width: 46px;
  height: 46px;
  border-radius: 14px;
  border: 1px solid var(--color-border);
  background: color-mix(in srgb, var(--color-bg-surface), white 8%);
  color: var(--color-text-main);
  box-shadow: var(--shadow-lg);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 1002;
  transition:
    background-color 0.2s ease,
    color 0.2s ease,
    border-color 0.2s ease,
    transform 0.2s ease,
    box-shadow 0.2s ease;

  &:hover {
    color: var(--color-brand-700);
    border-color: var(--color-brand-200);
    background: var(--color-brand-50);
    box-shadow: 0 14px 30px rgba(16, 185, 129, 0.18);
    transform: translateY(-2px);
  }

  &:active {
    transform: scale(0.96);
  }

  @media (max-width: 420px) {
    right: 1.25rem;
    bottom: calc(142px + env(safe-area-inset-bottom));
  }
`;

const findScrollParent = (element: HTMLElement | null): HTMLElement | null => {
  let current = element?.parentElement ?? null;

  while (current) {
    const style = window.getComputedStyle(current);
    const overflowY = style.overflowY;
    const isScrollable =
      (overflowY === "auto" || overflowY === "scroll") &&
      current.scrollHeight > current.clientHeight;

    if (isScrollable) return current;
    current = current.parentElement;
  }

  return null;
};

function MobileTransactionHistory() {
  return (
    <Modal>
      <MobileTransactionHistoryContent />
    </Modal>
  );
}

function MobileTransactionHistoryContent() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { open } = useModal();
  const accountId = searchParams.get("account");
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [pendingJumpDate, setPendingJumpDate] = useState<number | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const scrollContainerRef = useRef<HTMLElement | null>(null);
  const groupRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const {
    searchQuery,
    sortValue,
    categories,
    accounts,
    filterValues,
    handleFilterChange,
    handleClearAll,
  } = useTransactionFilters();

  useEffect(() => {
    if (accountId) {
      handleFilterChange("account", [accountId]);
      return;
    }

    handleClearAll();
  }, [accountId, handleClearAll, handleFilterChange]);

  const apiParams = useMemo(
    () => ({
      page: undefined,
      limit: 20,
      search: searchQuery || undefined,
      sort: sortValue,
      type: filterValues.type.length ? filterValues.type[0] : undefined,
      account_id: filterValues.account.length ? filterValues.account : undefined,
      category_id: filterValues.category.length
        ? filterValues.category
        : undefined,
      counterparty_id: filterValues.counterparty.length
        ? filterValues.counterparty
        : undefined,
      min_amount: filterValues.amount.min
        ? Number(filterValues.amount.min) * 100
        : undefined,
      max_amount: filterValues.amount.max
        ? Number(filterValues.amount.max) * 100
        : undefined,
    }),
    [filterValues, searchQuery, sortValue],
  );

  const {
    transactions,
    totalCount,
    isLoading,
    isFetching,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteTransactionsData(apiParams);

  const { language } = useSettings();
  const selectedAccount = accountId
    ? accounts.find((account) => String(account.id) === String(accountId))
    : null;

  const { dataToRender, shouldGroup, translateDateLabel } = useTransactionsTable({
    transactions,
    sortValue,
    language,
  });

  const groupedEntries = useMemo(() => {
    if (!shouldGroup) return [];

    return (Object.entries(dataToRender) as Array<[string, typeof transactions]>)
      .map(([label, txs]) => ({
        label,
        txs,
        dayTs: startOfDay(new Date(Number(txs[0]?.date))).getTime(),
      }))
      .filter((entry) => entry.txs.length > 0 && Number.isFinite(entry.dayTs));
  }, [dataToRender, shouldGroup, transactions]);

  const oldestLoadedTimestamp = useMemo(() => {
    if (transactions.length === 0) return null;
    return transactions.reduce(
      (oldest, tx) => Math.min(oldest, Number(tx.date)),
      Number(transactions[0].date),
    );
  }, [transactions]);

  const scrollToGroup = useCallback((dayTs: number) => {
    window.setTimeout(() => {
      const element = groupRefs.current[String(dayTs)];
      if (!element) return;

      const headerOffset = 104;
      const scrollParent = findScrollParent(element);

      if (scrollParent) {
        const parentRect = scrollParent.getBoundingClientRect();
        const elementRect = element.getBoundingClientRect();
        const top =
          scrollParent.scrollTop +
          (elementRect.top - parentRect.top) -
          headerOffset;

        scrollParent.scrollTo({
          top: Math.max(top, 0),
          behavior: "smooth",
        });
        return;
      }

      const top =
        element.getBoundingClientRect().top + window.scrollY - headerOffset;

      window.scrollTo({
        top: Math.max(top, 0),
        behavior: "smooth",
      });
    }, 60);
  }, []);

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
    if (!node || !hasNextPage || isFetchingNextPage) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          fetchNextPage();
        }
      },
      { rootMargin: "320px 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage, transactions.length]);

  useEffect(() => {
    const sampleNode =
      loadMoreRef.current ||
      groupRefs.current[Object.keys(groupRefs.current)[0] || ""] ||
      null;
    const scrollContainer =
      findScrollParent(sampleNode) ||
      document.querySelector("main");

    if (!(scrollContainer instanceof HTMLElement)) return;
    scrollContainerRef.current = scrollContainer;

    const handleScroll = () => {
      setShowScrollTop(scrollContainer.scrollTop > 480);
    };

    handleScroll();
    scrollContainer.addEventListener("scroll", handleScroll, { passive: true });
    return () => scrollContainer.removeEventListener("scroll", handleScroll);
  }, [transactions.length, groupedEntries.length]);

  usePageTitle(accountId ? "Усі транзакції" : "Транзакції");

  if (isLoading) return <MobileTransactionsSkeleton />;

  return (
    <StyledHistory>
      <MobilePageHeader
        title={accountId ? "Усі транзакції" : t("navigation:general.transactions", "Транзакції")}
        rightAction={
          <HeaderActions>
            <IconActionButton
              onClick={() => setIsDatePickerOpen(true)}
              aria-label={t("legacy:filters.select_period_title")}
            >
              <HiCalendarDays size={20} />
            </IconActionButton>

            <IconActionButton
              onClick={() => open("export-all")}
              aria-label={t("export_import:exportPage.title")}
            >
              <HiArrowDownTray size={20} />
            </IconActionButton>
          </HeaderActions>
        }
      />

      <List>
        {shouldGroup
          ? groupedEntries.map(({ label, txs, dayTs }) => (
              <React.Fragment key={`${label}-${dayTs}`}>
                <DateSeparatorButton
                  ref={(node) => {
                    groupRefs.current[String(dayTs)] = node;
                  }}
                  onClick={() => setIsDatePickerOpen(true)}
                >
                  <span>{translateDateLabel(label)}</span>
                </DateSeparatorButton>
                {txs.map((tx) => (
                  <TransactionItem
                    key={tx.id}
                    transaction={tx}
                    categories={categories}
                    accounts={accounts}
                    currency={tx.currency}
                    language={language}
                    onClick={() => navigate(`/transactions/${tx.id}`)}
                    hideAccountColumn={true}
                    hideCategory={true}
                  />
                ))}
              </React.Fragment>
            ))
          : (dataToRender as any[]).map((tx) => (
              <TransactionItem
                key={tx.id}
                transaction={tx}
                categories={categories}
                accounts={accounts}
                currency={tx.currency}
                language={language}
                onClick={() => navigate(`/transactions/${tx.id}`)}
                hideAccountColumn={true}
                hideCategory={true}
              />
            ))}
      </List>

      {(isFetchingNextPage || (isFetching && transactions.length > 0)) && (
        <LoadingPanel>
          <LoadingCard>
            <HiOutlineArrowPath size={18} />
            <span>
              {hasNextPage
                ? "Довантажуємо старіші транзакції..."
                : "Оновлюємо список..."}
            </span>
          </LoadingCard>
        </LoadingPanel>
      )}

      {hasNextPage && <Sentinel ref={loadMoreRef} />}

      {showScrollTop && (
        <ScrollTopButton
          onClick={() =>
            scrollContainerRef.current?.scrollTo({ top: 0, behavior: "smooth" })
          }
          aria-label={t("common:common.back_to_top", "Вгору")}
        >
          <HiArrowUp size={20} />
        </ScrollTopButton>
      )}

      <FAB
        onClick={() => navigate("/transactions/new", { state: { background: location } })}
      />

      {isDatePickerOpen && (
        <PickerOverlay onClick={() => setIsDatePickerOpen(false)}>
          <PickerSheet onClick={(e) => e.stopPropagation()}>
            <PickerHeader>
              <h3>Перейти до дати</h3>
              <PickerActions>
                {pendingJumpDate !== null && (
                  <Button
                    variation="secondary"
                    size="small"
                    onClick={() => {
                      setPendingJumpDate(null);
                      setIsDatePickerOpen(false);
                    }}
                  >
                    {t("common:common.clear_filters", "Очистити")}
                  </Button>
                )}
                <PickerDismiss onClick={() => setIsDatePickerOpen(false)}>
                  <HiXMark size={18} />
                </PickerDismiss>
              </PickerActions>
            </PickerHeader>

            <DateRangePicker
              mode="single"
              date={null}
              onDateChange={(timestamp) => {
                setPendingJumpDate(timestamp);
                setIsDatePickerOpen(false);
              }}
              staticPicker
              numberOfMonths={1}
              hideFooter
            />
          </PickerSheet>
        </PickerOverlay>
      )}

      <Modal.Window name="export-all">
        <Suspense fallback={<ExportPageSkeleton />}>
          <ExportModal />
        </Suspense>
      </Modal.Window>
    </StyledHistory>
  );
}

export default MobileTransactionHistory;
