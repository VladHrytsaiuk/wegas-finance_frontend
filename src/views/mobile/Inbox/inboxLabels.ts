// Статуси чека: повна назва на екрані чека і підказка-дія в списку «Чеків».

export const INBOX_STATUS: Record<string, string> = {
  new: "Нове",
  needs_account: "Очікує рахунку",
  needs_link: "Потрібно зв'язати",
  needs_review: "Потрібна перевірка",
  linked: "Зв'язано",
  unlinked: "Відкріплено",
};

/**
 * Назва чека: магазин, інакше «Чек №…», інакше нотатка. Нотатка з XML-чека
 * («receipt #231 | VISA | 4149…») як назва нечитабельна.
 */
export function receiptTitle(entry: {
  merchant?: string;
  note?: string;
  receipt_source?: { merchant?: string; receipt_number?: string } | null;
}) {
  const merchant = entry.merchant || entry.receipt_source?.merchant;
  if (merchant) return merchant;
  if (entry.receipt_source?.receipt_number) return `Чек №${entry.receipt_source.receipt_number}`;
  return entry.note || "Чек";
}

export const INBOX_ACTION: Record<string, string> = {
  new: "Новий",
  needs_account: "Оберіть рахунок",
  needs_link: "Звʼяжіть з операцією",
  needs_review: "Перевірте",
  unlinked: "Відкріплено — звʼяжіть знову",
};
