import { useState, useEffect } from "react";
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

import { getAccountsApi } from "../../services/apiAccounts";

export function useDebtorDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const [counterparty, setCounterparty] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);

  const [isLoading, setIsLoading] = useState(true);

  const [isUpdating, setIsUpdating] = useState(false);
  const [isForgiving, setIsForgiving] = useState(false);

  // Стейт для модалки транзакцій
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [txType, setTxType] = useState<
    "loan_give" | "loan_repay" | "debt_take" | "debt_repay"
  >("loan_give");

  useEffect(() => {
    if (!id) return;
    fetchData();
  }, [id]);

  async function fetchData() {
    try {
      setIsLoading(true);

      // 1. Отримуємо дані контрагента
      const cpData = await getCounterpartyApi(id!);

      // 2. Отримуємо транзакції через фільтр (твоя існуюча функція)
      // В інтерфейсі ти вказав counterparty_id?: string[], тому передаємо масив
      const txResponse = await getTransactionsApi({
        counterparty_id: [id!],
        limit: 100, // Можна збільшити ліміт, щоб бачити всю історію
      });

      // Перевірка: якщо бекенд повертає об'єкт { data: [...] }, беремо .data
      // Якщо повертає просто масив [...], беремо його
      const txList = Array.isArray(txResponse)
        ? txResponse
        : txResponse.data || [];

      // 3. Отримуємо рахунки
      const accData = await getAccountsApi();

      setCounterparty(cpData);
      setTransactions(txList);
      setAccounts(accData);
    } catch (error) {
      console.error(error);
      toast.error(t("common:ui.error_loading"));
    } finally {
      setIsLoading(false);
    }
  }

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

  const handleUpdateCounterparty = async (data: any) => {
    setIsUpdating(true);
    try {
      const updated = await updateCounterpartyApi(id!, data);
      setCounterparty(updated);

      queryClient.invalidateQueries({ queryKey: ["counterparties"] });

      toast.success(t("counterparties:counterparties.update_success"));
      return true;
    } catch (error) {
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
    txType: string // loan_repay або debt_repay
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
  const hasPositive = counterparty?.balances?.some((b: any) => b.balance > 0);
  const hasNegative = counterparty?.balances?.some((b: any) => b.balance < 0);
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
      openTxModal: (type: any) => {
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
