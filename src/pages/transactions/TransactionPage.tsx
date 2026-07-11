import { Link, useNavigate } from "react-router-dom";
import { HiArrowLeft, HiPencil, HiTrash } from "react-icons/hi2";

// Components
import TransactionDetails from "../../components/transactions/TransactionDetails";
import { Button } from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import ConfirmDelete from "../../components/ui/ConfirmDelete";
import { useIsMobile } from "../../hooks/useIsMobile";
import MobilePageHeader from "../../components/mobile/MobilePageHeader";
import { FAB } from "../../components/ui/FAB";
import { TransactionDetailsSkeleton } from "../../components/ui/Skeleton/LoadingSkeletons";

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

  const navigate = useNavigate();
  const isMobile = useIsMobile();
  usePageTitle(t("legacy:transactionPage.header_title", "Деталі операції"));

  if (isLoading) {
    return (
      <S.PageContainer style={{ paddingBottom: isMobile ? "80px" : undefined }}>
        <TransactionDetailsSkeleton />
      </S.PageContainer>
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

  const isBankTx = !!transaction.external_id;
  const photoCount = Array.isArray(transaction.photos)
    ? transaction.photos.length
    : transaction.receipt_img
      ? 1
      : 0;
  const itemCount = Array.isArray(transaction.items) ? transaction.items.length : 0;
  const pageTitle = t(
    "legacy:transactionPage.header_title",
    "Деталі операції",
  );

  return (
    <Modal>
      {isMobile && (
        <MobilePageHeader
          title={pageTitle}
          rightAction={
            <Modal.Open opens={isBankTx ? "" : "delete-transaction"}>
              <S.MobileActionButton
                disabled={isBankTx}
                title={
                  isBankTx
                    ? t("transactions:transactions.bank_tx_delete_restricted")
                    : t("common:common.delete")
                }
              >
                <HiTrash size={20} />
              </S.MobileActionButton>
            </Modal.Open>
          }
        />
      )}

      <S.PageContainer style={{ paddingBottom: isMobile ? "80px" : undefined }}>
        {isMobile ? (
          <S.MobileHeaderSpacer>
            <S.MobileMeta>
              {photoCount > 0 && (
                <S.HeaderMetaChip>
                  {t("transactions:transactionDetails.photos_count", {
                    defaultValue: "{{count}} фото",
                    count: photoCount,
                  })}
                </S.HeaderMetaChip>
              )}
              {itemCount > 0 && (
                <S.HeaderMetaChip>
                  {t("transactions:transactionDetails.items_count", {
                    defaultValue: "{{count}} позицій",
                    count: itemCount,
                  })}
                </S.HeaderMetaChip>
              )}
            </S.MobileMeta>
          </S.MobileHeaderSpacer>
        ) : (
          <S.Header>
            <S.HeaderMain>
              <S.BackButton onClick={handleBack}>
                <HiArrowLeft />
                {t("legacy:transactionPage.back_to_list")}
              </S.BackButton>
              <S.HeaderTitle>{pageTitle}</S.HeaderTitle>
              <S.HeaderMeta>
                {photoCount > 0 && (
                  <S.HeaderMetaChip>
                    {t("transactions:transactionDetails.photos_count", {
                      defaultValue: "{{count}} фото",
                      count: photoCount,
                    })}
                  </S.HeaderMetaChip>
                )}
                {itemCount > 0 && (
                  <S.HeaderMetaChip>
                    {t("transactions:transactionDetails.items_count", {
                      defaultValue: "{{count}} позицій",
                      count: itemCount,
                    })}
                  </S.HeaderMetaChip>
                )}
              </S.HeaderMeta>
            </S.HeaderMain>

            <S.ButtonGroup>
              <Button
                as={isBankTx ? "button" : Link}
                to={isBankTx ? undefined : "edit"}
                state={{ background: location }}
                size="small"
                variation="secondary"
                disabled={isBankTx}
                title={isBankTx ? t("transactions:transactions.bank_tx_edit_restricted") : undefined}
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

              <Modal.Open opens={isBankTx ? "" : "delete-transaction"}>
                <Button
                  size="small"
                  variation="danger"
                  disabled={isBankTx}
                  title={isBankTx ? t("transactions:transactions.bank_tx_delete_restricted") : undefined}
                  style={{ width: "auto", display: "flex", alignItems: "center" }}
                >
                  <HiTrash style={{ marginRight: "6px" }} />
                  {t("common:common.delete")}
                </Button>
              </Modal.Open>
            </S.ButtonGroup>
          </S.Header>
        )}

        <Modal.Window name="delete-transaction">
          <ConfirmDelete
            resourceName={t("common:common.transaction")}
            onConfirm={() => deleteTx(transactionId!)}
            disabled={isDeleting}
          />
        </Modal.Window>

        <S.Card style={{ padding: isMobile ? "20px 16px" : undefined }}>
          <TransactionDetails
            transaction={transaction}
            categories={categories}
            accounts={accounts}
            counterparties={counterparties}
          />
        </S.Card>
      </S.PageContainer>

      {isMobile && !isBankTx && (
        <FAB 
          onClick={() => navigate("edit", { state: { background: location } })} 
          icon={<HiPencil />} 
        />
      )}
    </Modal>
  );
}

export default TransactionPage;
