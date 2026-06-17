import styled from "styled-components";
import { useTranslation } from "react-i18next";
import { usePageTitle } from "../../../hooks/usePageTitle";
import { useTransactionsPage } from "../../../hooks/Transactions/useTransactionsPage";
import { TransactionItem } from "../../../components/transactions/TransactionItem";
import { CenteredSpinner } from "../../../components/ui/CenteredSpinner";
import { HiArrowLeft, HiPlus, HiArrowDownTray } from "react-icons/hi2";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useEffect } from "react";
import { FAB } from "../../../components/ui/FAB";
import Modal, { useModal } from "../../../components/ui/Modal";
import ExportModal from "../../../pages/settings/ExportPage";

const StyledHistory = styled.div`
  display: flex;
  flex-direction: column;
  background-color: var(--color-bg-page);
  min-height: 100vh;
  padding-bottom: 80px;
`;

const List = styled.div`
  display: flex;
  flex-direction: column;
  background-color: var(--color-bg-surface);
`;

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
  const [searchParams] = useSearchParams();
  const { open } = useModal();
  const accountId = searchParams.get("account");

  const {
    transactions,
    isLoading,
    categories,
    accounts,
    handleRowClick,
    handleFilterChange,
    handleClearAll,
    location
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
      <MobilePageHeader 
        title={t("dashboard:mobile.recent_operations")} 
        rightAction={
          <Button 
            variation="secondary" 
            size="small" 
            onClick={() => open("export-all")}
            style={{ border: 'none', boxShadow: 'none', background: 'transparent', padding: '8px' }}
          >
            <HiArrowDownTray size={24} style={{ color: 'var(--color-brand-600)' }} />
          </Button>
        }
      />

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

      <FAB 
        onClick={() => navigate("/transactions/new", { state: { background: location } })}
      />

      <Modal.Window name="export-all">
        <ExportModal />
      </Modal.Window>
    </StyledHistory>
  );
}

export default MobileTransactionHistory;
