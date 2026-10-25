import type { ReactNode } from "react";
import {
  HiArrowsRightLeft,
  HiArrowUpRight,
  HiArrowDownLeft,
  HiBanknotes,
} from "react-icons/hi2";
import { formatMoney } from "../../utils/helpers";
import { useSettings } from "../../context/SettingsContext";
import {
  useTransactionItem,
  type TransactionListItem,
} from "../../hooks/Transactions/useTransactionItem";
import type { Account, Category } from "../../types";
import { Row, Amount, Meta } from "./Group";
import { Tile } from "./Tile";

const INCOMING = new Set(["income", "transfer_in", "loan_repay", "debt_take", "debt_in"]);

// Службові імена іконок з useTransactionItem, яких немає в ICON_MAP.
const SPECIAL_ICONS: Record<string, ReactNode> = {
  HiArrowsRightLeft: <HiArrowsRightLeft size={20} />,
  HiArrowLeft: <HiArrowsRightLeft size={20} />,
  HiArrowRight: <HiArrowsRightLeft size={20} />,
  HiBanknotes: <HiBanknotes size={20} />,
  DebtOut: <HiArrowUpRight size={20} />,
  DebtIn: <HiArrowDownLeft size={20} />,
  Handshake: <HiArrowsRightLeft size={20} />,
};

interface TxRowProps {
  transaction: TransactionListItem;
  categories: Category[];
  accounts: Account[];
  /** Показати час під сумою (у стрічці операцій). */
  showTime?: boolean;
  /** Готовий підпис замість «категорія · рахунок» (напр. «Звідки → Куди»). */
  subtitle?: string;
}

// Рядок операції: витрати звичайним текстом, акцентом лише доходи.
export function TxRow({ transaction, categories, accounts, showTime, subtitle: subtitleOverride }: TxRowProps) {
  const { currency: baseCurrency, language } = useSettings();
  const view = useTransactionItem({
    transaction,
    categories,
    accounts,
    baseCurrency,
    language,
  });

  const type = (transaction.type || "").toLowerCase();
  const txCurrency =
    accounts.find((a) => a.id === transaction.account_id)?.currency ||
    transaction.account?.currency ||
    transaction.currency ||
    baseCurrency;
  const sign = view.isTransfer ? "" : INCOMING.has(type) ? "+" : "−";
  const amount = `${sign}${formatMoney(Math.abs(transaction.amount), txCurrency, language)}`;
  const tone = view.isForgiveness ? "muted" : type === "income" ? "income" : "default";

  const subtitle =
    subtitleOverride ?? [view.subtitle, view.accountName].filter(Boolean).join(" · ");

  return (
    <Row
      to={`/transactions/${transaction.id}`}
      leading={
        <Tile
          logo={view.isTransfer || view.isDebt ? null : view.logoUrl}
          iconName={view.iconName}
          icon={view.isTransfer ? SPECIAL_ICONS.HiArrowsRightLeft : SPECIAL_ICONS[view.iconName]}
          color={view.color}
          tint={view.isTransfer ? "gray" : "green"}
        />
      }
      title={view.title}
      subtitle={subtitle}
      trailing={
        <>
          <Amount $tone={tone}>{amount}</Amount>
          {showTime && <Meta>{view.timeFormatted}</Meta>}
        </>
      }
    />
  );
}
