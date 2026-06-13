import styled from "styled-components";
import { useTranslation } from "react-i18next";
import { usePageTitle } from "../../../hooks/usePageTitle";
import { useTransactionsPage } from "../../../hooks/Transactions/useTransactionsPage";
import { TransactionItem } from "../../../components/transactions/TransactionItem";
import { CenteredSpinner } from "../../../components/ui/CenteredSpinner";
import { HiArrowLeft } from "react-icons/hi2";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useEffect } from "react";

const StyledHistory = styled.div`
  display: flex;
  flex-direction: column;
  background-color: var(--color-bg-page);
  min-height: 100%;
`;

const Header = styled.header`
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  position: sticky;
  top: 0;
  background-color: var(--color-bg-page);
  z-index: 10;
  border-bottom: 1px solid var(--color-border);
`;

const BackButton = styled.button`
  background: none;
  border: none;
  color: var(--color-text-main);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 4px;
`;

const Title = styled.h1`
  font-size: 20px;
  font-weight: 700;
  color: var(--color-text-main);
`;

const List = styled.div`
  display: flex;
  flex-direction: column;
  background-color: var(--color-bg-surface);
`;

function MobileTransactionHistory() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const accountId = searchParams.get("account");

  const {
    transactions,
    isLoading,
    categories,
    accounts,
    handleRowClick,
    handleFilterChange,
    handleClearAll
  } = useTransactionsPage();

  usePageTitle("Історія операцій");

  // Apply account filter if present in URL
  useEffect(() => {
    if (accountId) {
      handleFilterChange("account", [accountId]);
    } else {
      handleClearAll();
    }
  }, [accountId, handleFilterChange, handleClearAll]);

  if (isLoading) return <CenteredSpinner fullHeight />;

  return (
    <StyledHistory>
      <Header>
        <BackButton onClick={() => navigate(-1)}>
          <HiArrowLeft size={24} />
        </BackButton>
        <Title>Історія операцій</Title>
      </Header>

      <List>
        {transactions.map((tx) => (
          <TransactionItem
            key={tx.id}
            transaction={tx}
            categories={categories}
            accounts={accounts}
            currency={tx.currency}
            language="uk"
            onClick={() => handleRowClick(tx.id)}
            hideAccountColumn={true}
          />
        ))}
      </List>
    </StyledHistory>
  );
}

export default MobileTransactionHistory;
