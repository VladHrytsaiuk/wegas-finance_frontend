import { useState, useMemo } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

// API
import { uploadBankStatementApi } from "../../services/apiImport";
import { batchCreateTransactionsApi } from "../../services/apiTransactions";
import { getCategoriesApi } from "../../services/apiCategories";
import { getCounterpartiesApi } from "../../services/apiCounterparties";

// Types
import type {
  ExtendedTransaction,
  ExistingTransactionDB,
} from "../../components/import/ImportTypes";
import type { Account } from "../../services/apiAccounts";
import type { Category, Counterparty } from "../../types";

interface UseImportModalProps {
  account: Account;
  onClose?: () => void;
}

interface ImportErrorResponse {
  error?: string;
}

export const useImportModal = ({ account, onClose }: UseImportModalProps) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  // --- 1. Визначаємо тип банку МИТТЄВО (Synchronous) ---
  const detectedBankType = useMemo(() => {
    const bank = account.bank_name?.toLowerCase() || "";
    const icon = account.icon?.toLowerCase() || "";
    const name = account.name.toLowerCase();

    // Перевірка Монобанку
    if (
      bank.includes("mono") ||
      icon.includes("mono") ||
      name.includes("mono")
    ) {
      return "monobank";
    }

    // Перевірка Привату
    if (
      bank.includes("privat") ||
      icon.includes("privat") ||
      name.includes("privat")
    ) {
      return "privatbank";
    }

    // Якщо не визначили — повертаємо null (даємо вибір користувачу)
    return null;
  }, [account]);

  // State
  const [step, setStep] = useState<"upload" | "preview">("upload");

  // Ініціалізуємо state одразу правильним банком або дефолтним (privatbank)
  const [bankType, setBankType] = useState<"privatbank" | "monobank">(
    detectedBankType === "monobank" ? "monobank" : "privatbank",
  );

  const [isLoading, setIsLoading] = useState(false);
  const [transactions, setTransactions] = useState<ExtendedTransaction[]>([]);
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(
    new Set(),
  );

  // Modal States
  const [editingTx, setEditingTx] = useState<{
    index: number;
    data: ExtendedTransaction;
  } | null>(null);

  const [duplicatePreview, setDuplicatePreview] = useState<{
    newTx: ExtendedTransaction;
    existingTx: ExistingTransactionDB;
  } | null>(null);

  // --- Data Fetching ---
  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategoriesApi,
  });

  const { data: counterparties = [] } = useQuery({
    queryKey: ["counterparties"],
    queryFn: getCounterpartiesApi,
  });

  // (Видалили зайвий запит getAccountsApi — він більше не потрібен)

  // --- Computed ---

  const invalidTransactionsCount = useMemo(() => {
    return transactions.filter(
      (tx, idx) => selectedIndices.has(idx) && !tx.category_id,
    ).length;
  }, [transactions, selectedIndices]);

  const hasInvalidTransactions = invalidTransactionsCount > 0;

  // --- Actions ---

  const processFile = async (file: File) => {
    setIsLoading(true);
    try {
      // Використовуємо account.id
      const data = await uploadBankStatementApi(account.id, bankType, file);

      const processed = data.transactions.map((tx): ExtendedTransaction => {
        const foundCategory = categories.find(
          (c: Category) => c.id === tx.predicted_category,
        );
        const foundCounterparty = counterparties.find(
          (cp: Counterparty) =>
            cp.name.toLowerCase() === tx.counterparty_name?.toLowerCase(),
        );
        return {
          ...tx,
          category_id: foundCategory ? foundCategory.id : "",
          counterparty_id: foundCounterparty ? foundCounterparty.id : "",
        };
      });

      setTransactions(processed);

      const initialSelected = new Set<number>();
      processed.forEach((tx, idx) => {
        if (!tx.is_duplicate && !tx.is_potential_duplicate)
          initialSelected.add(idx);
      });
      setSelectedIndices(initialSelected);

      setStep("preview");
    } catch (err: unknown) {
      const errorMessage = axios.isAxiosError<ImportErrorResponse>(err)
        ? err.response?.data?.error
        : undefined;
      toast.error(
        errorMessage ||
          t("export_import:importModal.error_upload", "Помилка завантаження файлу"),
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle = (idx: number) => {
    if (transactions[idx].is_duplicate) return;
    const newSet = new Set(selectedIndices);
    if (newSet.has(idx)) newSet.delete(idx);
    else newSet.add(idx);
    setSelectedIndices(newSet);
  };

  const handleToggleAll = () => {
    const availableIndices = transactions
      .map((tx, i) => (tx.is_duplicate ? -1 : i))
      .filter((i) => i !== -1);
    const allSelected = availableIndices.every((i) => selectedIndices.has(i));
    setSelectedIndices(allSelected ? new Set() : new Set(availableIndices));
  };

  const handleFillEmptyCategories = () => {
    let fallbackCat = categories.find(
      (c: Category) => c.name.toLowerCase() === "інше",
    );
    if (!fallbackCat && categories.length > 0) fallbackCat = categories[0];
    if (!fallbackCat) {
      toast.error(
        t("export_import:importModal.error_no_categories", "Не знайдено жодної категорії"),
      );
      return;
    }

    const updatedTransactions = transactions.map((tx) => {
      if (tx.category_id || tx.is_duplicate) return tx;
      return { ...tx, category_id: fallbackCat.id };
    });

    setTransactions(updatedTransactions);

    const newSelected = new Set(selectedIndices);
    updatedTransactions.forEach((tx, idx) => {
      if (tx.category_id && !tx.is_duplicate) newSelected.add(idx);
    });
    setSelectedIndices(newSelected);

    toast.success(t("export_import:importModal.success_fill", { name: fallbackCat.name }));
  };

  const handleSaveEdit = (updated: Partial<ExtendedTransaction>) => {
    if (!editingTx) return;
    const newTxs = [...transactions];
    newTxs[editingTx.index] = { ...newTxs[editingTx.index], ...updated };
    setTransactions(newTxs);
    setEditingTx(null);
    if (!transactions[editingTx.index].is_duplicate)
      setSelectedIndices((prev) => new Set(prev).add(editingTx.index));
  };

  const { mutate: importBatch, isPending: isSaving } = useMutation({
    mutationFn: async () => {
      const payload = transactions
        .filter((_, i) => selectedIndices.has(i))
        .map((tx) => ({
          account_id: account.id, // Використовуємо account.id
          amount: Math.abs(tx.amount),
          date: tx.date,
          note: tx.description || tx.counterparty_name,
          counterparty_name: tx.counterparty_name,
          counterparty_id: tx.counterparty_id || "",
          category_id: tx.category_id || "",
          type: tx.type,
        }));
      return batchCreateTransactionsApi(payload);
    },
    onSuccess: (data) => {
      toast.success(
        t("export_import:importModal.success_import", {
          count: data?.count || selectedIndices.size,
        }),
      );
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      onClose?.();
    },
    onError: (err: unknown) => {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      toast.error(t("export_import:importModal.error_save") + ": " + errorMessage);
    },
  });

  return {
    state: {
      step,
      bankType,
      isLoading,
      transactions,
      selectedIndices,
      editingTx,
      duplicatePreview,
      // Тепер lockedBankType це те саме, що й detectedBankType
      lockedBankType: detectedBankType,
      invalidTransactionsCount,
      hasInvalidTransactions,
      isSaving,
    },
    data: {
      categories,
      counterparties,
    },
    actions: {
      setStep,
      setBankType,
      setEditingTx,
      setDuplicatePreview,
      processFile,
      handleToggle,
      handleToggleAll,
      handleFillEmptyCategories,
      handleSaveEdit,
      importBatch,
    },
    t,
  };
};
