// src/types/index.ts

// === Base Types ===
export interface BaseEntity {
  id: string;
  created_at: number; // timestamp
  updated_at: number; // timestamp
  deleted_at?: number | null;
}

// === Enums (Based on logic) ===
export type TransactionType =
  | "expense"
  | "income"
  | "transfer"
  | "loan_give"
  | "loan_repay"
  | "debt_take"
  | "debt_repay";
export type AccountType = "cash" | "card" | "crypto" | "debt";
export type Currency = "UAH" | "USD" | "EUR";
export type CounterpartyType = "shop" | "person" | "other";
export type CategoryType = "expense" | "income";

export interface StorageType extends BaseEntity {
  family_id?: string | null;
  name: string;
  slug: string;
  icon: string;
  is_system: boolean;
}

// === Models ===

export interface User extends BaseEntity {
  role_id: string;
  family_id: string;
  name: string;
  email: string;
  avatar_url: string;
}

export interface Account extends BaseEntity {
  user_id: string;
  family_id: string;
  parent_id: string;
  is_group: boolean;

  card_number: string;
  name: string;
  type: AccountType;
  currency: Currency;
  initial_balance: number;

  calculated_balance: number;

  color: string;
  icon: string;
  is_archived: boolean;

  goal_id?: string | null;
  storage_type_id?: string | null;
  storage_type?: StorageType;
}

export interface Goal extends BaseEntity {
  family_id: string;
  user_id: string;
  name: string;
  description: string;
  target_amount: number;
  current_amount: number;
  currency: Currency;

  date_start: number;
  date_deadline?: number | null;

  color: string;
  icon: string;
  status: "active" | "paused" | "reached" | "failed";

  photo_url?: string;
  external_link?: string;

  visibility: "public" | "private";
  hidden_from?: string;

  accounts?: Account[];
}

export interface Category extends BaseEntity {
  parent_id: string;
  family_id: string;
  name: string;
  icon: string;
  color: string;
  type: CategoryType;
}

export interface CounterpartyCategory extends BaseEntity {
  family_id: string;
  name: string;
  type: CounterpartyType;
  icon: string;
  color: string;
}
export interface CounterpartyBalance {
  counterparty_id: string;
  currency: string;
  balance: number;
}

export interface Counterparty extends BaseEntity {
  family_id: string;
  parent_id: string;
  is_group: boolean;
  name: string;
  type: CounterpartyType;

  category_id?: string | null;
  category?: CounterpartyCategory;

  logo?: string;
  icon: string;

  balances: CounterpartyBalance[];
}
export interface Tag extends BaseEntity {
  family_id: string;
  name: string;
  color: string;
}

export interface TransactionItem extends BaseEntity {
  transaction_id: string;
  name: string;
  quantity: number;
  price_per_unit: number;
  total_amount: number;
}

export interface Transaction extends BaseEntity {
  amount: number;
  date: number;
  note: string;
  type: TransactionType;

  currency: string;
  account_id: string;
  family_id: string;
  category_id: string;
  user_id: string;
  counterparty_id: string;

  transfer_related_id?: string | null;
  is_forgiveness?: boolean;

  asset_id?: string | null;
  mileage?: number;

  asset?: Asset;

  account?: Account;
  category?: Category;
  counterparty?: Counterparty;
  items?: TransactionItem[];
  tags?: Tag[];
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  page_size: number;
}

export interface CreateAssetOnFlyInput {
  name: string;
  type: string;
  serial_number: string;
  warranty_end: number;
  note: string;
}

// 🔥 НОВА МОДЕЛЬ ДОКУМЕНТА
export interface AssetDocument extends BaseEntity {
  asset_id: string;
  name: string;
  path: string;
  file_type: string;
  size: number;
}

export interface Asset {
  id: string;
  name: string;
  type: string;

  // Базові
  price: number;
  currency: string;
  current_price: number;
  purchase_date: number;
  warranty_end?: number;
  serial_number?: string;
  note?: string;

  // Фото
  photo?: string;
  photos?: { id: string; path: string }[];

  // 🔥 ДОКУМЕНТИ
  documents?: AssetDocument[];

  // --- 🚗 Auto ---
  vin_code?: string;
  mileage?: number;
  initial_mileage?: number;
  insurance_expiry?: number;
  last_service_date?: number;

  // --- 🏠 Real Estate ---
  address?: string;
  area?: number;
  cadastral_num?: string;
}

export interface UtilityMeter extends BaseEntity {
  family_id: string;

  asset_id?: string | null;
  asset?: Asset;

  counterparty_id?: string | null;
  counterparty?: Counterparty;

  name: string;
  personal_account: string;
  type: string;
  unit: string;

  tariff: number;
  currency: string;

  last_reading_date?: number;
  last_reading_value?: number;
  new_asset?: CreateAssetOnFlyInput | null;
}

export interface UtilityReading extends BaseEntity {
  meter_id: string;
  date: number;
  value: number;

  diff: number;
  tariff_at_date: number;
  calculated_cost: number;

  is_paid: boolean;

  transaction_id?: string;
  payment_transaction_id?: string;
}

export interface UtilityGlobalStat {
  month: string;
  data: Record<string, number>;
}

export interface UtilityMeterStat {
  month: string;
  total_consumption: number;
  total_cost: number;
  avg_tariff: number;
}

export interface BankConnection extends BaseEntity {
  user_id: string;
  family_id: string;
  provider: "monobank";
  is_active: boolean;
  last_sync_at?: number;
}

export interface MonobankAccountInfo {
  id: string;
  sendId: string;
  currencyCode: number;
  cashbackType: string;
  balance: number;
  type: string;
  maskedPan: string[];
  iban: string;
}

export interface SyncProgress {
  status: "idle" | "loading" | "syncing" | "success" | "error";
  current_count: number;
  total_months: number;
  message?: string;
}

export interface WishlistItem {
  id: string;
  user_id: string;
  group_id?: string | null;

  name: string;
  url?: string;
  price?: number;
  currency?: string;

  priority: number;
  status: "planning" | "bought";
  visibility: "public" | "private";

  photo_url?: string;

  reserved_by?: string | null;

  created_at?: string;
}

export interface WishlistGroup {
  id: string;
  user_id: string;
  name: string;
  color: string;
  icon: string;
  visibility: string;
  hidden_from?: string;
}
