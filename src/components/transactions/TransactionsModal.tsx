import { useTranslation } from "react-i18next";
import { useTransactionsModal } from "../../hooks/Transactions/useTransactionsModal";

// UI Components
import Spinner from "../ui/Spinner";
import { TableToolbar } from "../shared/TableToolbar/TableToolbar";
import { TransactionItem } from "./TransactionItem";
import * as S from "./TransactionsModal.styles";

interface TransactionsModalProps {
  accountId?: string;
  initialFilters?: Record<string, any>;
  title?: string;
  onClose?: () => void;
}

export default function TransactionsModal(props: TransactionsModalProps) {
  const { t } = useTranslation();
  const { state, actions } = useTransactionsModal(props);

  const {
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
    modalTitle,
    categories,
    baseCurrency,
    language,
  } = state;

  const renderList = (txList: any[]) =>
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
          searchPlaceholder={t("transactionsModal.search_placeholder")}
          filtersConfig={filtersConfig}
          filterValues={filters}
          onFilterChange={actions.handleFilterChange}
          sortOptions={sortOptions}
          sortValue={sortValue}
          onSortChange={actions.setSortValue}
          onClearAll={actions.clearAll}
        />
      </S.ToolbarWrapper>

      <S.ScrollArea>
        {isLoading ? (
          <S.SpinnerContainer>
            <Spinner />
          </S.SpinnerContainer>
        ) : transactions.length === 0 ? (
          <S.EmptyState>{t("transactionsModal.status_empty")}</S.EmptyState>
        ) : (
          <>
            {isFetching && !isLoading && (
              <S.LoadingIndicator>
                {t("transactionsModal.status_loading")}
              </S.LoadingIndicator>
            )}

            {shouldGroup
              ? Object.entries(dataToRender as Record<string, any[]>).map(
                  ([dateLabel, txs]) => (
                    <S.DateGroup key={dateLabel}>
                      <S.DateLabel>{dateLabel}</S.DateLabel>
                      <div>{renderList(txs)}</div>
                    </S.DateGroup>
                  ),
                )
              : renderList(dataToRender as any[])}
          </>
        )}
      </S.ScrollArea>
    </S.ModalContent>
  );
}
