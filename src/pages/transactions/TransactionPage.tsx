import { Link, useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import {
  HiArrowLeft,
  HiMinusCircle,
  HiOutlineArrowTopRightOnSquare,
  HiPencil,
  HiTrash,
} from "react-icons/hi2";

// Components
import TransactionDetails from "../../components/transactions/TransactionDetails";
import { Button } from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import ConfirmDelete from "../../components/ui/ConfirmDelete";
import { useIsMobile } from "../../hooks/useIsMobile";
import MobilePageHeader from "../../components/mobile/MobilePageHeader";
import { FAB } from "../../components/ui/FAB";
import { TransactionDetailsSkeleton } from "../../components/ui/Skeleton/LoadingSkeletons";
import {
  getLinkedReceiptSourcesApi,
  unlinkReceiptSourceApi,
} from "../../services/apiTransactions";
import { formatMoney } from "../../utils/helpers";
import toast from "react-hot-toast";

// Hook & Styles
import { useTransactionPage } from "../../hooks/Transactions/useTransactionPage";
import { usePageTitle } from "../../hooks/usePageTitle";
import * as S from "./TransactionPage.styles";

function TransactionPage() {
  const { i18n } = useTranslation();
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
  const queryClient = useQueryClient();
  usePageTitle(t("legacy:transactionPage.header_title", "Деталі операції"));

  const { data: linkedReceiptSources = [] } = useQuery({
    queryKey: ["transaction", transactionId, "receipt-sources"],
    queryFn: () => getLinkedReceiptSourcesApi(transactionId!),
    enabled: Boolean(transactionId && transaction),
  });

  const unlinkReceiptMutation = useMutation({
    mutationFn: (receiptSourceId: string) =>
      unlinkReceiptSourceApi(transactionId!, receiptSourceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transaction", transactionId] });
      queryClient.invalidateQueries({
        queryKey: ["transaction", transactionId, "receipt-sources"],
      });
      queryClient.invalidateQueries({ queryKey: ["inbox"] });
      queryClient.invalidateQueries({ queryKey: ["inbox", "pending-count"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      toast.success("Чек відкріплено та повернуто до Inbox");
    },
    onError: () => toast.error("Не вдалося відкріпити чек"),
  });

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
  const receiptURL = linkedReceiptSources.find(
    (source) => source.source_type === "url" && source.source_url,
  )?.source_url;
  const receiptDiscount = linkedReceiptSources.find(
    (source) => (source.discount_total || 0) > 0,
  );
  const hasItemizedReceiptDiscount = (transaction.items || []).some(
    (item) => item.name === "Знижка за чеком",
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

      <S.PageContainer style={{ paddingBottom: isMobile ? "120px" : undefined }}>
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

        {receiptURL || (receiptDiscount && !hasItemizedReceiptDiscount) || linkedReceiptSources.length > 0 ? (
          <S.ReceiptMetaRow>
            {receiptURL ? (
              <S.ReceiptSourceCard>
                <HiOutlineArrowTopRightOnSquare size={19} />
                <S.ReceiptSourceContent>
                  <span>Електронний чек</span>
                  <a href={receiptURL} target="_blank" rel="noreferrer" title={receiptURL}>
                    {receiptURL}
                  </a>
                </S.ReceiptSourceContent>
              </S.ReceiptSourceCard>
            ) : null}
            {receiptDiscount && !hasItemizedReceiptDiscount ? (
              <S.ReceiptDiscountChip>
                <HiMinusCircle size={17} />
                Знижка в чеку: -
                {formatMoney(
                  receiptDiscount.discount_total || 0,
                  receiptDiscount.currency || transaction.currency || "UAH",
                  i18n.language,
                )}
                <small>вже врахована в цінах</small>
              </S.ReceiptDiscountChip>
            ) : null}
            {linkedReceiptSources.length > 0 ? (
              <Modal.Open opens="unlink-receipt-source">
                <Button variation="secondary" size="small">
                  Відкріпити чек
                </Button>
              </Modal.Open>
            ) : null}
          </S.ReceiptMetaRow>
        ) : null}

        {linkedReceiptSources[0] ? (
          <Modal.Window name="unlink-receipt-source">
            <ConfirmDelete
              resourceName="цей чек"
              onConfirm={() => unlinkReceiptMutation.mutate(linkedReceiptSources[0].id)}
              disabled={unlinkReceiptMutation.isPending}
            />
          </Modal.Window>
        ) : null}
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
