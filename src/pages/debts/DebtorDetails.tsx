import { useState } from "react"; // 🔥 Додали useState
import {
  HiArrowLeft,
  HiPencil,
  HiArrowUpRight,
  HiArrowDownLeft,
  HiOutlineUser,
  HiPlus,
  HiCheckCircle,
} from "react-icons/hi2";

import { CenteredSpinner } from "../../components/ui/CenteredSpinner";
import { Button } from "../../components/ui/Button";
import { TransactionsTable } from "../../components/transactions/TransactionsTable";
import CreateTransactionModal from "../../components/transactions/CreateTransactionModal";
import Modal from "../../components/ui/Modal";
import CounterpartyForm from "../../components/counterparties/form";
import { ForgiveDebtWindow } from "../../components/debts/ForgiveDebtWindow";

import * as S from "./DebtorDetails.styles";
import { useDebtorDetails } from "../../hooks/Debts/useDebtorDetails";
import { usePageTitle } from "../../hooks/usePageTitle";
import { formatMoney } from "../../utils/helpers";
import { useIsMobile } from "../../hooks/useIsMobile";
import MobilePageHeader from "../../components/mobile/MobilePageHeader";
import { FAB } from "../../components/ui/FAB";
import type { CounterpartyBalance } from "../../types";

function DebtorDetails() {
  const {
    state: {
      counterparty,
      transactions,
      accounts,
      isLoading,
      isUpdating,
      isForgiving,
      isTxModalOpen,
      txType,
      hasDebt,
      hasPositive,
      hasNegative,
      profileColor,
    },
    actions: {
      updateCounterparty,
      forgiveDebt,
      deleteTransaction,
      refreshData,
      openTxModal,
      closeTxModal,
      navigateToTransaction,
    },
    t,
  } = useDebtorDetails();

  const isMobile = useIsMobile();
  usePageTitle(counterparty?.name);

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
      (b: CounterpartyBalance) => Math.abs(b.balance) > 0.01,
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

  if (isLoading)
    return (
      <CenteredSpinner
        isContainer
        message={t("common:ui.loading_details", "Завантаження деталей...")}
      />
    );
  if (!counterparty) return <div>{t("common:ui.status_not_found")}</div>;

  return (
    <S.PageWrapper>
      {isMobile ? (
        <MobilePageHeader title={counterparty.name} />
      ) : (
        <S.TopNav>
          <S.BackLink to="/debts">
            <HiArrowLeft /> {t("common:common.return")}
          </S.BackLink>
        </S.TopNav>
      )}

      <S.ProfileHeader style={{ padding: isMobile ? "20px 16px" : undefined }}>
        <S.ProfileInfo>
          <S.LargeAvatar $color={profileColor}>
            {counterparty.logo ? (
              <img
                src={`/brands/${counterparty.logo}`}
                alt={counterparty.name}
              />
            ) : (
              <HiOutlineUser />
            )}
          </S.LargeAvatar>
          <S.NameBlock>
            <h1>{counterparty.name}</h1>
            <span style={{ display: "flex", gap: "0.5rem", opacity: 0.8 }}>
              {hasPositive ? t("goals_debts:debtsPage.summary_owed_to_me") : ""}
              {hasPositive && hasNegative ? " • " : ""}
              {hasNegative ? t("goals_debts:debtsPage.summary_i_owe") : ""}
              {!hasPositive && !hasNegative
                ? t("goals_debts:debtsPage.empty_title")
                : ""}
            </span>
          </S.NameBlock>
        </S.ProfileInfo>

        <S.Actions>
          <Modal>
            <Modal.Open opens="edit-cp">
              <Button variation="secondary" icon={<HiPencil />}>
                {t("legacy:treeActions.edit")}
              </Button>
            </Modal.Open>

            {hasDebt && (
              <Modal.Open opens="forgive-debt">
                <Button variation="secondary" icon={<HiCheckCircle />}>
                  {t("transactions:transactions.forgiven")}
                </Button>
              </Modal.Open>
            )}

            <Modal.Window name="edit-cp" padding="2rem 2.5rem">
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
          </Modal>
        </S.Actions>
      </S.ProfileHeader>

      {/* BALANCES */}
      {counterparty.balances && counterparty.balances.length > 0 && (
        <S.BalancesGrid>
          {counterparty.balances.map((b: CounterpartyBalance) => {
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
                      <HiArrowUpRight />{" "}
                      {t("goals_debts:debtsPage.summary_owed_to_me")}
                    </>
                  ) : (
                    <>
                      <HiArrowDownLeft />{" "}
                      {t("goals_debts:debtsPage.summary_i_owe")}
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
                        {t("goals_debts:debtsPage.btn_repay_to_me")}
                      </Button>
                      <Button
                        size="small"
                        variation="secondary"
                        $fullWidth
                        onClick={() => handleOpenTx("loan_give")}
                      >
                        {t("goals_debts:debtsPage.btn_lend")}
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
                        {t("goals_debts:debtsPage.btn_repay_my_debt")}
                      </Button>
                      <Button
                        size="small"
                        variation="secondary"
                        $fullWidth
                        onClick={() => handleOpenTx("debt_take")}
                      >
                        {t("goals_debts:debtsPage.btn_borrow")}
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
      <S.HistoryContainer
        style={{ padding: isMobile ? "0 16px 80px 16px" : undefined }}
      >
        <S.SectionHeader>
          <S.SectionTitle>
            {t("accounts:accountDetailsPage.history_section_title")}
          </S.SectionTitle>
          {!isMobile && (
            <Button
              size="small"
              variation="secondary"
              onClick={() => handleOpenTx("loan_give")}
              icon={<HiPlus />}
            >
              {t("transactions:transactionsPage.button_add")}
            </Button>
          )}
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
          onSuccess={() => refreshData()}
          initialData={{
            type: txType,
            counterparty_id: counterparty.id, // 🔥 ВИПРАВЛЕНО: тут був selectedCpId
            amount: initialAmount, // 🔥 Передаємо суму
            note: initialNote, // 🔥 Передаємо примітку
          }}
        />
      )}

      {isMobile && (
        <FAB
          actions={[
            {
              icon: <HiArrowUpRight />,
              label: t("goals_debts:debtsPage.btn_lend"),
              onClick: () => handleOpenTx("loan_give"),
            },
            {
              icon: <HiArrowDownLeft />,
              label: t("goals_debts:debtsPage.btn_repay_to_me"),
              onClick: () => {
                const balance = counterparty.balances.find(
                  (b: CounterpartyBalance) => b.balance > 0,
                )?.balance;
                handleOpenTx(
                  "loan_repay",
                  balance,
                  counterparty.balances.find(
                    (b: CounterpartyBalance) => b.balance > 0,
                  )?.currency,
                );
              },
            },
          ]}
        />
      )}
    </S.PageWrapper>
  );
}

export default DebtorDetails;
