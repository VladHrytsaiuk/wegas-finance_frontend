import { useMemo } from "react";
import { format, isValid } from "date-fns";
import { useTranslation } from "react-i18next";
import { formatMoney } from "../../utils/helpers";
import type { Account, Category, Counterparty, Transaction } from "../../types";

// 🔥 ОНОВЛЕНІ КОЛЬОРИ ТУТ
const TX_CONFIG: Record<string, { color: string; sign: string }> = {
  expense: { color: "var(--color-red-600)", sign: "- " },
  income: { color: "var(--color-green-600)", sign: "+ " },

  // Гроші ЙДУТЬ від тебе (Помаранчевий)
  loan_give: { color: "var(--color-yellow-600)", sign: "- " }, // Дав у борг
  debt_repay: { color: "var(--color-yellow-600)", sign: "- " }, // Повернув борг
  debt_out: { color: "var(--color-yellow-600)", sign: "- " }, // Legacy

  // Гроші ПРИХОДЯТЬ тобі (Жовтий)
  debt_take: { color: "var(--color-yellow-800)", sign: "+ " }, // Взяв у борг
  loan_repay: { color: "var(--color-yellow-800)", sign: "+ " }, // Мені повернули
  debt_in: { color: "var(--color-yellow-800)", sign: "+ " }, // Legacy

  transfer_out: { color: "var(--color-transfer-out)", sign: "- " },
  transfer_in: { color: "var(--color-transfer-in)", sign: "+ " },
  transfer: { color: "var(--color-transfer-out)", sign: "- " },

  // Комуналку можна залишити червоною, бо це чиста витрата
  utility_payment: { color: "var(--color-red-600)", sign: "- " },
};

const getTxConfig = (type: string) => {
  const normalized = (type || "").toLowerCase().trim();
  return (
    TX_CONFIG[normalized] || { color: "var(--color-text-secondary)", sign: "" }
  );
};

interface UseTransactionItemProps {
  transaction: TransactionListItem;
  categories: Category[];
  accounts: Account[];
  baseCurrency: string;
  language: string;
}

type AccountWithDeleted = Account & {
  deleted_at?: number;
};

type CounterpartyWithCategory = Counterparty & {
  category?: Category;
};

export type TransactionListItem = Partial<Transaction> & {
  id: string;
  type: string;
  amount: number;
  date: number;
  created_at?: number;
  currency?: string;
  account_id?: string;
  target_account_id?: string;
  note?: string;
  description?: string;
  is_forgiveness?: boolean;
  account?: AccountWithDeleted;
  category?: Category;
  counterparty?: CounterpartyWithCategory;
  utility_meter?: {
    name?: string;
  };
};

export const useTransactionItem = ({
  transaction: tx,
  categories,
  accounts,
  baseCurrency,
  language,
}: UseTransactionItemProps) => {
  const { t } = useTranslation();

  return useMemo(() => {
    // --- 0. ТИП ТРАНЗАКЦІЇ ---
    const rawType = (tx.type || "").toLowerCase().trim();
    const isDebtTake = rawType === "debt_take";
    const config = getTxConfig(rawType);

    // --- 1. ЛОГІКА РАХУНКУ ---
    const nestedAccount = tx.account;
    const activeAccount = accounts?.find(
      (a) => String(a.id) === String(tx.account_id),
    );

    let accountName = "";
    let isAccountDeleted = false;

    if (isDebtTake) {
      // 🔥 Якщо це нарахування боргу, рахунок не потрібен
      accountName = t("transactions:transactions.acc_status_debt", "Нарахування (Борг)");
      isAccountDeleted = false; // Вимикаємо червоний колір "Видалено"
    } else {
      const hasDeletedAt =
        !!nestedAccount?.deleted_at && nestedAccount.deleted_at > 0;
      const isMissing = !activeAccount;
      isAccountDeleted = hasDeletedAt || isMissing;
      accountName =
        activeAccount?.name ||
        nestedAccount?.name ||
        t("common:common.deleted_account");
    }

    const txCurrency =
      activeAccount?.currency ||
      nestedAccount?.currency ||
      tx.currency ||
      baseCurrency;

    // --- 2. Прапорці ---
    const isForgiveness = tx.is_forgiveness;
    const isTransfer = rawType.includes("transfer");
    // Перевіряємо, чи це комуналка
    const isUtility = rawType === "utility_payment";

    const isDebt = [
      "loan_give",
      "debt_take",
      "loan_repay",
      "debt_repay",
      "debt_in",
      "debt_out",
    ].includes(rawType);

    const isIncoming = config.sign === "+ ";

    // --- 3. Дефолти контенту ---
    let title = t("transactions:transactionsTable.default_category");
    let subtitle: string | null = null;
    let iconColor = "#6b7280";
    let iconName = "HiQuestionMarkCircle";
    let logoUrl: string | null = null;

    // --- 4. Визначення заголовків та іконок ---
    if (isForgiveness) {
      title = t("transactions:transactions.forgiven");
      iconName = "Handshake";
      iconColor = "#9ca3af";
      if (tx.counterparty?.name) subtitle = tx.counterparty.name;
    } else if (isTransfer) {
      const targetAccount = accounts?.find(
        (a) => String(a.id) === String(tx.target_account_id),
      );
      const isMultiCurrency =
        targetAccount && txCurrency !== targetAccount?.currency;

      if (isMultiCurrency) {
        title = t("transactions:transactions.currency_exchange");
        iconName = "HiArrowsRightLeft";
      } else {
        title = t("transactions:transactionsTable.transfer_main_text");
        iconName = isIncoming ? "HiArrowLeft" : "HiArrowRight";
      }
      iconColor = config.color;
    } else if (isUtility) {
      // 🔥 Комуналка
      title = tx.utility_meter?.name || tx.counterparty?.name || "Комуналка";
      iconName = "HiBanknotes"; // Можна замінити на HiBolt або HiHome
      iconColor = config.color;
      if (tx.description) subtitle = tx.description;
    } else if (isDebt) {
      // 🔥 БОРГИ: Налаштовуємо іконки та кольори
      title =
        tx.counterparty?.name ||
        (isIncoming ? t("transactions:transactions.debt_in") : t("transactions:transactions.debt_out"));

      // Підзаголовок: Тип операції
      subtitle = isDebtTake
        ? t("transactions:transactions.debt_take_label", "Взяв у борг")
        : isIncoming
          ? t("transactions:transactions.repay_in_label", "Повернення")
          : t("transactions:transactions.give_label", "Видача");

      // 🔥 Встановлюємо іконки "Вхід" / "Вихід"
      iconName = isIncoming ? "DebtIn" : "DebtOut";
      // 🔥 Колір береться з оновленого TX_CONFIG (Помаранчевий або Жовтий)
      iconColor = config.color;

      // Ми не передаємо logoUrl для боргів, щоб спрацювали наші іконки стрілок на кольоровому фоні
      logoUrl = null;
    } else {
      const category =
        tx.category ||
        categories?.find((c) => String(c.id) === String(tx.category_id));

      if (category) {
        title = category.name;
        iconName = category.icon;
        iconColor = category.color;
      }

      if (tx.counterparty?.name) {
        subtitle = title;
        title = tx.counterparty.name;
        logoUrl = tx.counterparty.logo;

        // 🔥 FALLBACK: Якщо у транзакції немає категорії, беремо її з контрагента
        if (!category) {
          const cpCat =
            tx.counterparty.category ||
            categories?.find(
              (c) => String(c.id) === String(tx.counterparty.category_id),
            );

          if (cpCat) {
            iconName = cpCat.icon;
            iconColor = cpCat.color;
            // Якщо ми підставили категорію з контрагента, покажемо її назву в підзаголовку
            subtitle = cpCat.name;
          } else {
            iconName = "HiBanknotes";
          }
        }
      }
    }

    // --- 5. Форматування ---
    const dateObj = new Date(tx.date);
    const timeFormatted = isValid(dateObj) ? format(dateObj, "HH:mm") : "--:--";
    const amountFormatted = `${config.sign}${formatMoney(
      Math.abs(tx.amount),
      txCurrency,
      language,
    )}`;

    return {
      title,
      subtitle,
      timeFormatted,
      amountFormatted,
      amountColor: isForgiveness ? "var(--color-text-tertiary)" : config.color,
      color: iconColor,
      iconName,
      logoUrl,
      isTransfer,
      isDebt,
      isForgiveness,
      accountName,
      isAccountDeleted,
      note: tx.description || tx.note || "",
    };
  }, [tx, categories, accounts, baseCurrency, language, t]);
};
