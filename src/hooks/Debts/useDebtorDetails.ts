import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";

// API Services
import {
  getCounterpartyApi,
  updateCounterpartyApi,
} from "../../services/apiCounterparties";

import {
  getTransactionsApi, // <-- ВИКОРИСТОВУЄМО ЦЮ (УНІВЕРСАЛЬНУ)
  deleteTransactionApi, // <-- ТВОЯ ФУНКЦІЯ ВИДАЛЕННЯ
  createTransactionApi, // <-- ТВОЯ ФУНКЦІЯ СТВОРЕННЯ
} from "../../services/apiTransactions";

import { getAccountsApi, type Account } from "../../services/apiAccounts";
import type { Counterparty, CounterpartyBalance, Transaction } from "../../types";

type TransactionsResponse =
  | Transaction[]
  | {
      data?: Transaction[];
    };

type DebtTransactionType =
  | "loan_give"
  | "loan_repay"
  | "debt_take"
  | "debt_repay";

export function useDebtorDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const [counterparty, setCounterparty] = useState<Counterparty | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);

  const [isLoading, setIsLoading] = useState(true);

  const [isUpdating, setIsUpdating] = useState(false);
  const [isForgiving, setIsForgiving] = useState(false);

  // Стейт для модалки транзакцій
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [txType, setTxType] = useState<DebtTransactionType>("loan_give");

  useEffect(() => {
    if (!id) return;
    fetchData();
  }, [id, fetchData]);

  const fetchData = useCallback(async () => {
    if (!id) return;

    try {
      setIsLoading(true);

      const [cpData, txResponse, accData] = await Promise.all([
        getCounterpartyApi(id),
        getTransactionsApi({
          counterparty_id: [id],
          limit: 100,
        }) as Promise<TransactionsResponse>,
        getAccountsApi(),
      ]);

      const txList = Array.isArray(txResponse)
        ? txResponse
        : txResponse.data || [];

      setCounterparty(cpData);
      setTransactions(txList);
      setAccounts(accData);
    } catch (error) {
      console.error(error);
      toast.error(t("common:ui.error_loading"));
    } finally {
      setIsLoading(false);
    }
  }, [id, t]);

  // --- ЛОГІКА ВИДАЛЕННЯ ТРАНЗАКЦІЇ ---
  const deleteTransaction = async (transactionId: string) => {
    try {
      // Викликаємо твою функцію deleteTransactionApi
      await deleteTransactionApi(transactionId);

      // Видаляємо локально зі списку
      setTransactions((prev) => prev.filter((tx) => tx.id !== transactionId));

      // Оновлюємо дані контрагента (щоб перерахувати борг у шапці)
      const updatedCp = await getCounterpartyApi(id!);
      setCounterparty(updatedCp);

      // Інвалідуємо кеш для всього застосунку
      queryClient.invalidateQueries({ queryKey: ["counterparties"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });

      toast.success(t("transactions:transactions.delete_success"));
    } catch (error) {
      console.error(error);
      toast.error(t("common:ui.error_action"));
    }
  };

  const handleUpdateCounterparty = async (data: Partial<Counterparty>) => {
    setIsUpdating(true);
    try {
      if (!id) return false;

      const updated = await updateCounterpartyApi({ id, ...data });
      setCounterparty(updated);

      queryClient.invalidateQueries({ queryKey: ["counterparties"] });

      toast.success(t("counterparties:counterparties.update_success"));
      return true;
    } catch {
      toast.error(t("common:ui.error_action"));
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  const handleForgiveDebt = async (
    accountId: string,
    amount: number,
    currency: string,
    txType: DebtTransactionType // loan_repay або debt_repay
  ) => {
    setIsForgiving(true);
    try {
      await createTransactionApi({
        account_id: accountId,
        counterparty_id: id,
        amount: amount,
        type: txType,
        date: Date.now(),
        note: "Списання боргу (Forgiveness)",
        is_forgiveness: true, // 👈 ОБОВ'ЯЗКОВО: Це зупинить зміну твого балансу
      });

      // Інвалідуємо кеш
      queryClient.invalidateQueries({ queryKey: ["counterparties"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });

      toast.success(t("goals_debts:debtsPage.forgive_success"));
      fetchData(); // Оновити дані сторінки
      return true;
    } catch (error) {
      console.error(error);
      toast.error(t("common:ui.error_action"));
      return false;
    } finally {
      setIsForgiving(false);
    }
  };

  // Helpers
  const hasPositive = counterparty?.balances?.some(
    (b: CounterpartyBalance) => b.balance > 0,
  );
  const hasNegative = counterparty?.balances?.some(
    (b: CounterpartyBalance) => b.balance < 0,
  );
  const hasDebt = hasPositive || hasNegative;

  return {
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
      profileColor: "var(--color-brand-600)",
      id,
    },
    actions: {
      updateCounterparty: handleUpdateCounterparty,
      forgiveDebt: handleForgiveDebt,
      deleteTransaction, // Експортуємо виправлену функцію
      refreshData: fetchData, // 🔥 Експортуємо функцію оновлення
      openTxModal: (type: DebtTransactionType) => {
        setTxType(type);
        setIsTxModalOpen(true);
      },
      closeTxModal: () => setIsTxModalOpen(false),
      navigateToTransaction: (txId: string) =>
        navigate(`/transactions/${txId}`),
    },
    t,
  };
}
