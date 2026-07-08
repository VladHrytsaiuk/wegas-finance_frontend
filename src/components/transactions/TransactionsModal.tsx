import { useTranslation } from "react-i18next";
import { useTransactionsModal } from "../../hooks/Transactions/useTransactionsModal";
import type { TransactionFilters } from "../../services/apiTransactions";
import type { Transaction } from "../../types";

// UI Components
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

      <S.ScrollArea>
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
              ? Object.entries(dataToRender as GroupedTransactions).map(
                  ([dateLabel, txs]) => (
                    <S.DateGroup key={dateLabel}>
                      <S.DateLabel>{dateLabel}</S.DateLabel>
                      <div>{renderList(txs)}</div>
                    </S.DateGroup>
                  ),
                )
              : renderList(dataToRender as Transaction[])}
          </>
        )}
      </S.ScrollArea>
    </S.ModalContent>
  );
}
