import { Link } from "react-router-dom";
import { HiArrowLeft, HiPencil, HiTrash } from "react-icons/hi2";

// Components
import TransactionDetails from "../../components/transactions/TransactionDetails";
import Spinner from "../../components/ui/Spinner";
import { Button } from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import ConfirmDelete from "../../components/ui/ConfirmDelete";

// Hook & Styles
import { useTransactionPage } from "../../hooks/Transactions/useTransactionPage";
import { usePageTitle } from "../../hooks/usePageTitle";
import * as S from "./TransactionPage.styles";

function TransactionPage() {
  const {
    // Data
    transactionId,
    transaction,
    categories,
    accounts,
    counterparties,

    // Status
    isLoading,
    isError,
    isDeleting,

    // Actions
    deleteTx,
    handleBack,

    // Utils
    t,
    location,
  } = useTransactionPage();

  usePageTitle(t("navigation:general.transactions", "Транзакція"));

  if (isLoading) {
    return (
      <S.LoadingContainer>
        <Spinner />
      </S.LoadingContainer>
    );
  }

  if (isError || !transaction) {
    return (
      <S.PageContainer>
        <S.BackButton onClick={handleBack}>
          <HiArrowLeft />
          {t("legacy:transactionPage.back_button")}
        </S.BackButton>
        <S.NotFoundContainer>
          <h3>{t("legacy:transactionPage.not_found_title")}</h3>
          <p>{t("legacy:transactionPage.not_found_message")}</p>
        </S.NotFoundContainer>
      </S.PageContainer>
    );
  }

  return (
    <Modal>
      <S.PageContainer>
        <S.Header>
          <S.BackButton onClick={handleBack}>
            <HiArrowLeft />
            {t("legacy:transactionPage.back_to_list")}
          </S.BackButton>

          <S.ButtonGroup>
            <Button
              as={Link}
              to="edit"
              state={{ background: location }}
              size="small"
              variation="secondary"
              style={{
                width: "auto",
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
              }}
            >
              <HiPencil style={{ marginRight: "6px" }} />
              {t("legacy:transactionPage.edit_button")}
            </Button>

            <Modal.Open opens="delete-transaction">
              <Button
                size="small"
                variation="danger"
                style={{ width: "auto", display: "flex", alignItems: "center" }}
              >
                <HiTrash style={{ marginRight: "6px" }} />
                {t("common:common.delete")}
              </Button>
            </Modal.Open>
          </S.ButtonGroup>

          <Modal.Window name="delete-transaction">
            <ConfirmDelete
              resourceName={t("common:common.transaction")}
              onConfirm={() => deleteTx(transactionId!)}
              disabled={isDeleting}
            />
          </Modal.Window>
        </S.Header>

        <S.Card>
          <TransactionDetails
            transaction={transaction}
            categories={categories}
            accounts={accounts}
            counterparties={counterparties}
          />
        </S.Card>
      </S.PageContainer>
    </Modal>
  );
}

export default TransactionPage;
