import { useState } from "react"; // 🔥 Додали useState
import {
  HiArrowLeft,
  HiPencil,
  HiTrash,
  HiArrowUpRight,
  HiArrowDownLeft,
  HiOutlineUser,
  HiPlus,
  HiCheckCircle,
} from "react-icons/hi2";

import Spinner from "../../components/ui/Spinner";
import { Button } from "../../components/ui/Button";
import { TransactionsTable } from "../../components/transactions/TransactionsTable";
import CreateTransactionModal from "../../components/transactions/CreateTransactionModal";
import Modal from "../../components/ui/Modal";
import ConfirmDelete from "../../components/ui/ConfirmDelete";
import CounterpartyForm from "../../components/counterparties/form";
import { ForgiveDebtWindow } from "../../components/debts/ForgiveDebtWindow";

import * as S from "./DebtorDetails.styles";
import { useDebtorDetails } from "../../hooks/Debts/useDebtorDetails";
import { formatMoney } from "../../utils/helpers";

function DebtorDetails() {
  const {
    state: {
      counterparty,
      transactions,
      accounts,
      isLoading,
      isDeleting,
      isUpdating,
      isForgiving,
      isTxModalOpen,
      txType,
      hasDebt,
      hasPositive,
      hasNegative,
      profileColor,
      id,
    },
    actions: {
      deleteCounterparty,
      updateCounterparty,
      forgiveDebt,
      deleteTransaction,
      openTxModal,
      closeTxModal,
      navigateToTransaction,
    },
    t,
  } = useDebtorDetails();

  // 🔥 1. Локальний стейт для суми та примітки
  const [initialAmount, setInitialAmount] = useState<number | undefined>(
    undefined,
  );
  const [initialNote, setInitialNote] = useState<string | undefined>(undefined);

  // 🔥 2. Обгортка для відкриття модалки з даними
  const handleOpenTx = (type: string, balance?: number, currency?: string) => {
    if (balance && currency) {
      setInitialAmount(Math.abs(balance));
      // Можна одразу додати красиву примітку
      setInitialNote(
        `Погашення балансу: ${formatMoney(Math.abs(balance), currency)}`,
      );
    } else {
      setInitialAmount(undefined);
      setInitialNote(undefined);
    }
    openTxModal(type);
  };

  const handleCloseTx = () => {
    setInitialAmount(undefined);
    setInitialNote(undefined);
    closeTxModal();
  };

  const handleForgiveSubmit = ({
    accountId,
    onSuccessClose,
  }: {
    accountId: string;
    onSuccessClose: () => void;
  }) => {
    const debtBalance = counterparty?.balances?.find(
      (b: any) => Math.abs(b.balance) > 0.01,
    );

    if (!debtBalance) {
      onSuccessClose();
      return;
    }

    const type = debtBalance.balance > 0 ? "loan_repay" : "debt_repay";

    forgiveDebt(
      accountId,
      Math.abs(debtBalance.balance),
      debtBalance.currency,
      type,
    ).then((success) => {
      if (success) {
        onSuccessClose();
      }
    });
  };

  if (isLoading) return <Spinner />;
  if (!counterparty) return <div>{t("ui.status_not_found")}</div>;

  return (
    <S.PageWrapper>
      <S.TopNav>
        <S.BackLink to="/debts">
          <HiArrowLeft /> {t("common.return")}
        </S.BackLink>
      </S.TopNav>

      <S.ProfileHeader>
        <S.ProfileInfo>
          <S.LargeAvatar $color={profileColor}>
            {counterparty.logo ? (
              <img src={counterparty.logo} alt={counterparty.name} />
            ) : (
              <HiOutlineUser />
            )}
          </S.LargeAvatar>
          <S.NameBlock>
            <h1>{counterparty.name}</h1>
            <span style={{ display: "flex", gap: "0.5rem", opacity: 0.8 }}>
              {hasPositive ? t("debtsPage.summary_owed_to_me") : ""}
              {hasPositive && hasNegative ? " • " : ""}
              {hasNegative ? t("debtsPage.summary_i_owe") : ""}
              {!hasPositive && !hasNegative ? t("debtsPage.empty_title") : ""}
            </span>
          </S.NameBlock>
        </S.ProfileInfo>

        <S.Actions>
          <Modal>
            <Modal.Open opens="edit-cp">
              <Button variation="secondary" icon={<HiPencil />}>
                {t("treeActions.edit")}
              </Button>
            </Modal.Open>

            {hasDebt && (
              <Modal.Open opens="forgive-debt">
                <Button variation="secondary" icon={<HiCheckCircle />}>
                  {t("transactions.forgiven")}
                </Button>
              </Modal.Open>
            )}

            <Modal.Open opens="delete-cp">
              <Button variation="danger" icon={<HiTrash />}>
                {t("common.delete")}
              </Button>
            </Modal.Open>

            <Modal.Window name="edit-cp">
              <CounterpartyForm
                defaultValues={counterparty}
                onSubmit={updateCounterparty}
                isLoading={isUpdating}
              />
            </Modal.Window>

            <Modal.Window name="forgive-debt">
              <ForgiveDebtWindow
                accounts={accounts}
                isLoading={isForgiving}
                onConfirm={handleForgiveSubmit}
              />
            </Modal.Window>

            <Modal.Window name="delete-cp">
              {hasDebt ? (
                <S.DeleteWarningContainer>
                  <S.WarningIcon>🚫</S.WarningIcon>
                  <h3>{t("common.delete")}</h3>
                  <p style={{ color: "var(--color-text-secondary)" }}>
                    Ви не можете видалити боржника з активним балансом. Спочатку
                    спишіть борг або погасіть його.
                  </p>
                </S.DeleteWarningContainer>
              ) : (
                <ConfirmDelete
                  resourceName={counterparty.name}
                  onConfirm={() => deleteCounterparty(id as string)}
                  disabled={isDeleting}
                />
              )}
            </Modal.Window>
          </Modal>
        </S.Actions>
      </S.ProfileHeader>

      {/* BALANCES */}
      {counterparty.balances && counterparty.balances.length > 0 && (
        <S.BalancesGrid>
          {counterparty.balances.map((b: any) => {
            if (Math.abs(b.balance) < 0.01) return null;
            const isPositive = b.balance > 0;
            return (
              <S.BalanceCard
                key={b.currency}
                $type={isPositive ? "positive" : "negative"}
              >
                <S.BalanceLabel>
                  {isPositive ? (
                    <>
                      <HiArrowUpRight /> {t("debtsPage.summary_owed_to_me")}
                    </>
                  ) : (
                    <>
                      <HiArrowDownLeft /> {t("debtsPage.summary_i_owe")}
                    </>
                  )}
                </S.BalanceLabel>
                <S.BalanceAmount
                  $color={
                    isPositive
                      ? "var(--color-green-600)"
                      : "var(--color-red-600)"
                  }
                >
                  {formatMoney(Math.abs(b.balance), b.currency)}
                </S.BalanceAmount>
                <S.BalanceActions>
                  {isPositive ? (
                    <>
                      {/* 🔥 3. Використовуємо handleOpenTx */}
                      <Button
                        size="small"
                        variation="primary"
                        $fullWidth
                        onClick={() =>
                          handleOpenTx("loan_repay", b.balance, b.currency)
                        }
                      >
                        {t("debtsPage.btn_repay_to_me")}
                      </Button>
                      <Button
                        size="small"
                        variation="secondary"
                        $fullWidth
                        onClick={() => handleOpenTx("loan_give")}
                      >
                        {t("debtsPage.btn_lend")}
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        size="small"
                        variation="primary"
                        $fullWidth
                        onClick={() =>
                          handleOpenTx("debt_repay", b.balance, b.currency)
                        }
                      >
                        {t("debtsPage.btn_repay_my_debt")}
                      </Button>
                      <Button
                        size="small"
                        variation="secondary"
                        $fullWidth
                        onClick={() => handleOpenTx("debt_take")}
                      >
                        {t("debtsPage.btn_borrow")}
                      </Button>
                    </>
                  )}
                </S.BalanceActions>
              </S.BalanceCard>
            );
          })}
        </S.BalancesGrid>
      )}

      {/* HISTORY */}
      <S.HistoryContainer>
        <S.SectionHeader>
          <S.SectionTitle>
            {t("accountDetailsPage.history_section_title")}
          </S.SectionTitle>
          <Button
            size="small"
            variation="secondary"
            onClick={() => handleOpenTx("loan_give")}
            icon={<HiPlus />}
          >
            {t("transactionsPage.button_add")}
          </Button>
        </S.SectionHeader>

        <div style={{ marginTop: "1rem" }}>
          <TransactionsTable
            transactions={transactions}
            categories={[]}
            accounts={accounts}
            onDelete={deleteTransaction}
            onClick={navigateToTransaction}
            sortValue="date-desc"
          />
        </div>
      </S.HistoryContainer>

      {/* 🔥 4. Виправлена модалка */}
      {isTxModalOpen && (
        <CreateTransactionModal
          key={initialAmount ? `modal-amt-${initialAmount}` : "modal-empty"} // Force update
          isOpen={isTxModalOpen}
          onClose={handleCloseTx}
          initialData={{
            type: txType,
            counterparty_id: counterparty.id, // 🔥 ВИПРАВЛЕНО: тут був selectedCpId
            amount: initialAmount, // 🔥 Передаємо суму
            note: initialNote, // 🔥 Передаємо примітку
          }}
        />
      )}
    </S.PageWrapper>
  );
}

export default DebtorDetails;
