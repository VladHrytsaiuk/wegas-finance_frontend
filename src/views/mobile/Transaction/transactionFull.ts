import type { Asset, Tag, Transaction } from "../../../types";

/** Поля, які бекенд віддає для однієї операції, але яких немає в типі Transaction. */
export type TransactionFull = Transaction & {
  external_id?: string;
  receipt_img?: string;
  photos?: { id: string; path: string }[];
  related_transaction?: { account_id?: string; amount: number } | null;
  user?: { id: string; name: string; avatar_url?: string } | null;
  tags?: Tag[];
  asset?: Asset | null;
};
