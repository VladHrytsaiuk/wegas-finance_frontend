import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useSettings } from "../../context/SettingsContext";
import {
  deleteReceiptApi,
  deleteTransactionPhotoApi,
} from "../../services/apiTransactions";
import { BANK_SKINS } from "../../components/accounts/bankSkins";
import { getUploadedFileUrl } from "../../utils/helpers";

// --- Types ---
interface TransactionDetailsProps {
  transaction: any;
  categories: any[];
  accounts: any[];
  counterparties: any[];
}

// --- Config Helper ---
const getTxConfig = (type: string, t: any) => {
  const normalized = (type || "").toLowerCase().trim();
  const map: Record<string, any> = {
    expense: {
      label: t("transactionDetails.type_expense"),
      color: "var(--color-red-600)",
      sign: "- ",
    },
    income: {
      label: t("transactionDetails.type_income"),
      color: "var(--color-green-600)",
      sign: "+ ",
    },
    transfer: {
      label: t("transactionDetails.type_transfer"),
      color: "var(--color-transfer-out)",
      sign: "- ",
    },
    transfer_out: {
      label: t("transactionDetails.type_transfer"),
      color: "var(--color-transfer-out)",
      sign: "- ",
    },
    transfer_in: {
      label: t("transactionDetails.type_transfer"),
      color: "var(--color-transfer-in)",
      sign: "+ ",
    },
    loan_give: {
      label: t("transactions.loan_give"),
      color: "var(--color-yellow-600)",
      sign: "- ",
    },
    debt_take: {
      label: t("transactions.debt_take"),
      color: "var(--color-yellow-600)",
      sign: "+ ",
    },
    loan_repay: {
      label: t("transactions.loan_repay"),
      color: "var(--color-yellow-600)",
      sign: "+ ",
    },
    debt_repay: {
      label: t("transactions.debt_repay"),
      color: "var(--color-yellow-600)",
      sign: "- ",
    },
  };
  return (
    map[normalized] || {
      label: t("transactionsModal.default_tx_name"),
      color: "var(--color-text-secondary)",
      sign: "",
    }
  );
};

export const useTransactionDetails = ({
  transaction,
  categories,
  accounts,
  counterparties = [],
}: TransactionDetailsProps) => {
  const { t, i18n } = useTranslation();
  const { language, currency: baseCurrency } = useSettings();
  const queryClient = useQueryClient();
  const [photoIndex, setPhotoIndex] = useState(0);

  // --- Derived Data ---
  const rawType = (transaction.type || "").toLowerCase().trim();
  const config = getTxConfig(rawType, t);

  // 🔥 2. ОНОВЛЕНИЙ БЛОК ВИЗНАЧЕННЯ РАХУНКУ
  const account = useMemo(() => {
    const acc =
      transaction.account ||
      accounts.find((a: any) => a.id === transaction.account_id);
    if (!acc) return null;

    if (acc.type === "card") {
      // Визначаємо ключ скіна (так само як в таблиці рахунків)
      const skinKey =
        acc.bank_name && acc.card_type
          ? `${acc.bank_name}-${acc.card_type}`
          : acc.icon;

      const skin = BANK_SKINS[skinKey] || BANK_SKINS["default"];

      return {
        ...acc,
        displayIcon: skin.miniLogoFile || "HiCreditCard",
      };
    }

    // Для готівки або заощаджень
    return {
      ...acc,
      displayIcon: acc.type === "cash" ? "HiBanknotes" : "HiArchiveBox",
    };
  }, [transaction, accounts]);

  const category =
    transaction.category ||
    categories.find((c: any) => c.id === transaction.category_id);

  // В useTransactionDetails.ts знайдіть блок визначення counterparty
  const counterparty = useMemo(() => {
    const cp =
      transaction.counterparty ||
      counterparties.find(
        (c) => String(c.id) === String(transaction.counterparty_id),
      );

    // 🔥 Якщо ID контрагента порожній (як у вашому JSON),
    // або це "фейковий" об'єкт без імені — повертаємо null
    if (!transaction.counterparty_id || (cp && !cp.name)) return null;

    return cp;
  }, [transaction, counterparties]);

  // Додамо прапорець, чи є у нас взагалі контрагент
  const hasCounterparty = !!counterparty;

  const isTransfer = rawType.includes("transfer");
  const isDebt = [
    "loan_give",
    "debt_take",
    "loan_repay",
    "debt_repay",
  ].includes(rawType);

  // --- Multi-currency Logic ---
  const myCurrency = account?.currency || baseCurrency;
  let partnerCurrency = myCurrency;
  let amountMain = Math.abs(transaction.amount);
  let amountSecondary = 0;
  let partnerAccountName = "";

  if (isTransfer) {
    const partnerId =
      transaction.target_account_id ||
      transaction.related_transaction?.account_id;
    const partnerAcc = accounts.find((a: any) => a.id === partnerId);

    partnerCurrency = partnerAcc?.currency || myCurrency;
    partnerAccountName = partnerAcc?.name;

    if (transaction.related_transaction) {
      amountSecondary = Math.abs(transaction.related_transaction.amount);
    }
  }

  const isMultiCurrency = isTransfer && myCurrency !== partnerCurrency;
  const exchangeRate =
    isMultiCurrency && amountMain && amountSecondary
      ? (amountSecondary / amountMain).toFixed(4)
      : null;

  // --- Images Logic ---
  const allReceiptUrls = useMemo(() => {
    const urls: string[] = [];
    if (transaction.photos?.length) {
      transaction.photos.forEach((p: any) => {
        const url = getUploadedFileUrl(p.path); // Використовуємо нашу функцію
        if (url) urls.push(url);
      });
    } else if (transaction.receipt_img) {
      const url = getUploadedFileUrl(transaction.receipt_img); // Використовуємо нашу функцію
      if (url) urls.push(url);
    }
    return urls;
  }, [transaction]);

  const hasImages = allReceiptUrls.length > 0;

  // --- Mutations ---
  const { mutateAsync: deleteAll, isPending: isDeletingAll } = useMutation({
    mutationFn: deleteReceiptApi,
    onError: () => toast.error(t("transactionsDataHook.alert_delete_error")),
  });

  const { mutateAsync: deleteSingle, isPending: isDeletingSingle } =
    useMutation({
      mutationFn: deleteTransactionPhotoApi,
      onError: () => toast.error(t("transactionsDataHook.alert_delete_error")),
    });

  const handleDeleteCurrent = async () => {
    try {
      if (transaction.photos?.[photoIndex]) {
        await deleteSingle(transaction.photos[photoIndex].id);
      } else {
        await deleteAll(transaction.id);
      }
      toast.success(t("transactionPage.delete_success"));
      queryClient.invalidateQueries({
        queryKey: ["transaction", transaction.id],
      });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteAll = async () => {
    try {
      await deleteAll(transaction.id);
      toast.success(t("transactionPage.delete_success"));
      queryClient.invalidateQueries({
        queryKey: ["transaction", transaction.id],
      });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    } catch (error) {
      console.error(error);
    }
  };

  return {
    state: {
      account,
      category,
      counterparty,
      hasCounterparty,
      config,
      rawType,
      isTransfer,
      isDebt,
      isMultiCurrency,
      myCurrency,
      partnerCurrency,
      amountMain,
      amountSecondary,
      partnerAccountName,
      exchangeRate,
      allReceiptUrls,
      hasImages,
      photoIndex,
      isDeleting: isDeletingAll || isDeletingSingle,

      language,
      locale: i18n.language,
    },
    actions: {
      setPhotoIndex,
      handleDeleteCurrent,
      handleDeleteAll,
    },
  };
};
