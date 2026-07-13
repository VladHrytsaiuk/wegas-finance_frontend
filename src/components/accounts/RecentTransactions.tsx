import { useMemo } from "react";
import { useSettings } from "../../context/SettingsContext";
import { TransactionItem } from "../transactions/TransactionItem";
import styled from "styled-components";
import { HiOutlineBanknotes } from "react-icons/hi2";
import { useTranslation } from "react-i18next";
import { sortTransactions } from "../../utils/helpers";
import { useNavigate } from "react-router-dom";
import type { Account, Category } from "../../types";
import type { TransactionListItem } from "../../hooks/Transactions/useTransactionItem";

interface RecentTransactionsProps {
  transactions?: TransactionListItem[];
  categories: Category[];
  accounts?: Account[];
  loading?: boolean;
}

export const RecentTransactions = ({
  transactions,
  categories,
  accounts,
  loading,
}: RecentTransactionsProps) => {
  const { t } = useTranslation();
  const { currency, language } = useSettings();
  const navigate = useNavigate();

  const sortedTransactions = useMemo(() => {
    if (!transactions) return [];
    return sortTransactions(transactions);
  }, [transactions]);

  if (loading) return <div>{t("dashboard:recentTransactions.status_loading")}</div>;
  if (!sortedTransactions.length)
    return (
      <Empty>
        <HiOutlineBanknotes size={32} />
        <span>{t("dashboard:recentTransactions.status_empty")}</span>
      </Empty>
    );

  return (
    <ListWrapper>
      {sortedTransactions.map((tx) => (
        <TransactionItem
          key={tx.id}
          transaction={tx}
          categories={categories}
          accounts={accounts || []}
          currency={currency}
          language={language}
          hideAccountColumn={true}
          isWidget={true}
          onClick={() => navigate(`/transactions/${tx.id}`)}
        />
      ))}
    </ListWrapper>
  );
};

const ListWrapper = styled.div`
  display: flex;
  flex-direction: column;
  margin: 0 -1.5rem -1.5rem -1.5rem;
  /* 🔥 Зрізаємо все, що виходить за межі, щоб не зламати border-radius батька */
  border-bottom-left-radius: 16px;
  border-bottom-right-radius: 16px;
  overflow: hidden;

  @media (max-width: 991px) {
    margin: 0 -1rem -1rem -1rem;
    border-bottom-left-radius: 20px;
    border-bottom-right-radius: 20px;
  }
`;

const Empty = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  color: var(--color-text-secondary);
  svg {
    opacity: 0.5;
    margin-bottom: 0.5rem;
  }
`;
