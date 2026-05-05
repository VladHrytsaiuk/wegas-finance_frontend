export interface ExistingTransactionDB {
  id: string;
  amount: number;
  date: number;
  note: string;
  type: string;
  // 🔥 ВИПРАВЛЕНО: маленькі літери, бо JSON з бекенду приходить як "category"
  category?: { name: string };
  counterparty?: { name: string };
}

export interface ImportPreviewTransaction {
  date: number;
  amount: number;
  description: string;
  counterparty_name: string;
  type: "income" | "expense" | "transfer";
  predicted_category: string;
  is_duplicate: boolean;
  is_potential_duplicate?: boolean;
  match_reason?: string;
  existing_transaction?: ExistingTransactionDB;
}

export interface ExtendedTransaction extends ImportPreviewTransaction {
  category_id?: string;
  counterparty_id?: string;
}
