import type { Account } from "../types";
import type { TransactionListItem } from "../hooks/Transactions/useTransactionItem";

export type DisplayTransaction = TransactionListItem & { displaySubtitle?: string };

// Переказ зберігається двома половинами. У стрічці показуємо одну —
// вихідну — з підписом «Звідки → Куди»; вхідну ховаємо, якщо її пара поруч.
export function collapseTransfers(
  transactions: TransactionListItem[],
  accounts: Account[],
): DisplayTransaction[] {
  const byId = new Map(transactions.map((tx) => [tx.id, tx]));
  const accountName = (id?: string) => accounts.find((a) => a.id === id)?.name ?? "";

  return transactions.flatMap<DisplayTransaction>((tx) => {
    const pair = tx.transfer_related_id ? byId.get(tx.transfer_related_id) : undefined;
    // У типі Transaction немає transfer_in/out, хоча бекенд їх віддає.
    const type: string = tx.type;
    const pairType: string | undefined = pair?.type;
    if (type === "transfer_in" && pairType === "transfer_out") return [];
    if (type === "transfer_out" && pair) {
      const from = accountName(tx.account_id) || tx.account?.name || "";
      const to = accountName(pair.account_id) || pair.account?.name || "";
      return [{ ...tx, displaySubtitle: from && to ? `${from} → ${to}` : undefined }];
    }
    return [tx];
  });
}
