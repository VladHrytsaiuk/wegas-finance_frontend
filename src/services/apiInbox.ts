import api from "./Axios";

export interface InboxReceiptItem {
  id: string;
  name: string;
  quantity: number;
  price_per_unit: number;
  total_amount: number;
}

export interface InboxNamedEntityPreview {
  id: string;
  name: string;
}

export interface InboxReceiptSource {
  id: string;
  origin: string;
  source_type: string;
  source_url: string;
  file_path: string;
  file_paths: string;
  merchant: string;
  receipt_number: string;
  receipt_date: number | null;
  subtotal: number | null;
  discount_total: number | null;
  total: number | null;
  currency: string;
  payment_provider: string;
  payment_mask: string;
  items: InboxReceiptItem[];
  counterparty?: InboxNamedEntityPreview | null;
  category?: InboxNamedEntityPreview | null;
}

export interface InboxAccountPreview {
  id: string;
  name: string;
  currency: string;
}

export interface InboxAccountCandidate {
  account_id: string;
  account_name: string;
  bank_name: string;
  currency: string;
  matched_card_number: string;
  matched_digits: number;
  confidence: "exact" | "partial";
  score: number;
  recommended: boolean;
}

export interface InboxTransactionCandidate {
  transaction_id: string;
  amount: number;
  currency: string;
  date: number;
  note: string;
  counterparty_name: string;
  score: number;
  confidence: "high" | "medium" | "low";
  matched_by: string[];
}

export interface InboxTransactionPreview {
  id: string;
  amount: number;
  date: number;
  type: string;
  note?: string;
}

export interface InboxEntry {
  id: string;
  status: string;
  reason: string;
  review_required: boolean;
  source_type: string;
  merchant: string;
  total: number | null;
  currency: string;
  occurred_at: number | null;
  note: string;
  selected_account_id: string | null;
  matched_transaction_id: string | null;
  selected_account?: InboxAccountPreview | null;
  matched_transaction?: InboxTransactionPreview | null;
  receipt_source: InboxReceiptSource;
  created_at?: number;
}

export interface InboxListResponse {
  data: InboxEntry[];
  total: number;
}

export interface InboxFilters {
  status?: string[];
  limit?: number;
  offset?: number;
}

export const PENDING_INBOX_STATUSES = [
  "new",
  "needs_account",
  "needs_link",
  "needs_review",
] as const;

export const getInboxApi = async (
  filters: InboxFilters = {},
): Promise<InboxListResponse> => {
  const params = new URLSearchParams();

  if (filters.status?.length) {
    params.set("status", filters.status.join(","));
  }

  if (typeof filters.limit === "number" && filters.limit > 0) {
    params.set("limit", String(filters.limit));
  }

  if (typeof filters.offset === "number" && filters.offset > 0) {
    params.set("offset", String(filters.offset));
  }

  const query = params.toString();
  const response = await api.get<InboxListResponse>(
    `/inbox${query ? `?${query}` : ""}`,
  );

  return response.data;
};

export const getInboxEntryApi = async (id: string): Promise<InboxEntry> => {
  const response = await api.get<InboxEntry>(`/inbox/${id}`);
  return response.data;
};

export const getInboxAccountCandidatesApi = async (
  id: string,
): Promise<InboxAccountCandidate[]> => {
  const response = await api.get<InboxAccountCandidate[]>(
    `/inbox/${id}/account-candidates`,
  );
  return response.data;
};

export const getInboxTransactionCandidatesApi = async (
  id: string,
): Promise<InboxTransactionCandidate[]> => {
  const response = await api.get<InboxTransactionCandidate[]>(
    `/inbox/${id}/transaction-candidates`,
  );
  return response.data;
};

export const selectInboxAccountApi = async (
  id: string,
  accountId: string,
): Promise<InboxEntry> => {
  const response = await api.patch<InboxEntry>(`/inbox/${id}/account`, {
    account_id: accountId,
  });

  return response.data;
};

export const linkInboxTransactionApi = async (
  id: string,
  transactionId: string,
  options: { applyItems?: boolean; learnFromTransaction?: boolean } = {},
): Promise<InboxEntry> => {
  const response = await api.post<InboxEntry>(`/inbox/${id}/link`, {
    transaction_id: transactionId,
    apply_items: options.applyItems ?? true,
    ...(options.learnFromTransaction ? { learn_from_transaction: true } : {}),
  });

  return response.data;
};

export const createInboxPhotoApi = async (data: FormData): Promise<InboxEntry> => {
  const response = await api.post<InboxEntry>("/inbox/photo", data, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const ingestReceiptXmlApi = async (file: File): Promise<InboxEntry> => {
  const data = new FormData();
  data.append("file", file);
  const response = await api.post<InboxEntry>("/receipt-ingestion/xml", data);
  return response.data;
};

export const ingestReceiptUrlApi = async (url: string): Promise<InboxEntry> => {
  const response = await api.post<InboxEntry>("/receipt-ingestion/url", { url });
  return response.data;
};

export const getInboxPendingCountApi = async (): Promise<number> => {
  const response = await getInboxApi({
    status: [...PENDING_INBOX_STATUSES],
    limit: 1,
  });

  return response.total ?? 0;
};
