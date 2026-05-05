import { useLayoutEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { HiArrowDownTray, HiPlus } from "react-icons/hi2";

// UI Components
import Modal from "../../components/ui/Modal";
import Spinner from "../../components/ui/Spinner";
import { Button } from "../../components/ui/Button";
import { TransactionsTable } from "../../components/transactions/TransactionsTable";
import { Pagination } from "../../components/ui/Pagination";
import { TableToolbar } from "../../components/shared/TableToolbar/TableToolbar";
import ExportModal from "../settings/ExportPage";

// Hook & Styles
import { useTransactionsPage } from "../../hooks/Transactions/useTransactionsPage";
import * as S from "./Transactions.styles";

function Transactions() {
  const topRef = useRef<HTMLDivElement>(null);

  const {
    t,
    location,

    // Data
    transactions,
    totalCount,
    isLoading,
    isFetching, // 🔥 ОТРИМУЄМО СТАТУС ФОНОВОГО ЗАВАНТАЖЕННЯ
    isPlaceholderData,
    categories,
    accounts,
    isDeleting,

    // Filters
    page,
    setPage,
    pageSize,
    searchQuery,
    handleSearchChange,
    sortValue,
    handleSortChange,
    filterValues,
    handleFilterChange,
    handleClearAll,
    dateRange,
    handleDateRangeChange,
    filtersConfig,
    sortOptions,
    hasActiveFilters,

    // Handlers
    handleRowClick,
    deleteTransaction,
  } = useTransactionsPage();

  // Scroll logic
  useLayoutEffect(() => {
    if (!isLoading) {
      window.scrollTo(0, 0);
      topRef.current?.scrollIntoView({ behavior: "auto", block: "start" });
    }
  }, [page, isLoading]);

  // Перше завантаження - повний спінер
  if (isLoading) {
    return (
      <S.LoadingContainer>
        <Spinner />
      </S.LoadingContainer>
    );
  }

  return (
    <S.PageContainer>
      <div
        ref={topRef}
        style={{ height: "1px", width: "100%", scrollMarginTop: "120px" }}
      />

      <Modal>
        <TableToolbar
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          searchPlaceholder={t("transactionsPage.search_placeholder")}
          searchPosition="top"
          filtersConfig={filtersConfig}
          filterValues={filterValues}
          onFilterChange={handleFilterChange}
          sortOptions={sortOptions}
          sortValue={sortValue}
          onSortChange={handleSortChange}
          onClearAll={handleClearAll}
          dateRange={dateRange}
          onDateRangeChange={handleDateRangeChange}
        >
          <S.ActionButtons>
            <Modal.Open opens="export-all">
              <Button
                variation="secondary"
                size="medium"
                icon={<HiArrowDownTray />}
              >
                {t("exportPage.title")}
              </Button>
            </Modal.Open>

            <Button
              as={Link}
              to="new"
              state={{ background: location }}
              size="medium"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                textDecoration: "none",
                whiteSpace: "nowrap",
              }}
            >
              <HiPlus style={{ width: "20px", height: "20px" }} />
              <span>{t("transactionsPage.button_add")}</span>
            </Button>
          </S.ActionButtons>
        </TableToolbar>

        {/* ОСНОВНИЙ КОНТЕНТ */}
        {transactions.length === 0 && !isFetching ? (
          <S.EmptyStateContainer>
            <S.EmptyStateIcon>🔍</S.EmptyStateIcon>
            <div>{t("transactionsPage.empty_title")}</div>
            {hasActiveFilters && (
              <S.ClearFilterButton onClick={handleClearAll}>
                {t("transactionsPage.empty_button_clear")}
              </S.ClearFilterButton>
            )}
          </S.EmptyStateContainer>
        ) : (
          /* 🔥 ОБГОРТКА ДЛЯ ВІДОБРАЖЕННЯ ПОШУКУ */
          <div
            style={{ position: "relative", minHeight: "200px", minWidth: 0 }}
          >
            {/* Шар завантаження поверх таблиці при пошуку/фільтрації */}
            {isFetching && (
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  backgroundColor: "rgba(255, 255, 255, 0.6)", // Напівпрозорий фон
                  zIndex: 10,
                  display: "flex",
                  justifyContent: "center",
                  paddingTop: "50px",
                  backdropFilter: "blur(1px)", // Легке розмиття (опціонально)
                }}
              >
                <Spinner />
              </div>
            )}

            {/* Контент з прозорістю під час пошуку */}
            <div
              style={{
                opacity: isFetching ? 0.4 : 1,
                transition: "opacity 0.2s",
              }}
            >
              <Pagination
                currentPage={page}
                totalCount={totalCount}
                pageSize={pageSize}
                onPageChange={setPage}
                isLoading={isPlaceholderData || isFetching}
                isTop={true}
              />

              <TransactionsTable
                transactions={transactions}
                categories={categories}
                accounts={accounts}
                onDelete={deleteTransaction}
                onClick={handleRowClick}
                isDeleting={isDeleting}
                sortValue={sortValue}
              />

              <Pagination
                currentPage={page}
                totalCount={totalCount}
                pageSize={pageSize}
                onPageChange={setPage}
                isLoading={isPlaceholderData || isFetching}
                isTop={false}
              />
            </div>
          </div>
        )}

        <Modal.Window name="export-all">
          <ExportModal />
        </Modal.Window>
      </Modal>
    </S.PageContainer>
  );
}

export default Transactions;
