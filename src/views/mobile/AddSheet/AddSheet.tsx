import { useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format, subDays } from "date-fns";
import toast from "react-hot-toast";
import axios from "axios";
import styled from "styled-components";
import { HiOutlineCamera, HiOutlineReceiptPercent } from "react-icons/hi2";

import { useSettings } from "../../../context/SettingsContext";
import { getAccountsApi } from "../../../services/apiAccounts";
import { getCategoriesApi } from "../../../services/apiCategories";
import {
  createCounterpartyApi,
  getCounterpartiesApi,
} from "../../../services/apiCounterparties";
import {
  createTransactionApi,
  getTransactionsApi,
  updateTransactionApi,
  type CreateTxData,
} from "../../../services/apiTransactions";
import { getAssets } from "../../../services/apiAssets";
import { getUsersApi } from "../../../services/apiUsers";
import { getTagsApi } from "../../../services/apiTags";
import { useUserRole } from "../../../hooks/useUserRole";
import { createInboxPhotoApi } from "../../../services/apiInbox";
import { compressImage } from "../../../utils/compressor";
import { CURRENCY_SYMBOLS } from "../../../utils/currency";
import { formatMoney } from "../../../utils/helpers";
import type { Category, Transaction } from "../../../types";
import {
  Sheet,
  PrimaryButton,
  SheetTextButton,
} from "../../../mobile/ui/Sheet";
import { Group, Row, Meta } from "../../../mobile/ui/Group";
import { Segmented } from "../../../mobile/ui/Segmented";
import { categoryLabel } from "../../../mobile/categoryLabel";
import { CategoryPicker, AccountPicker } from "./Pickers";
import { CounterpartyPicker, type NewCounterparty } from "./CounterpartyPicker";
import { ItemsSheet } from "./ItemsSheet";
import { TagPicker } from "./TagPicker";
import { AssetPicker, type NewAssetDraft } from "./AssetPicker";
import { PhotosSheet } from "./PhotosSheet";
import {
  emptyInitial,
  initialFromTransaction,
  type DebtType,
  type Kind,
} from "./editState";
import type { TransactionFull } from "../Transaction/transactionFull";
import {
  dominantCategory,
  itemsTotal,
  knownItemsFrom,
  minorToInput,
  toApiItems,
  type DraftItem,
} from "./items";

type Picker =
  | null
  | "category"
  | "account"
  | "target"
  | "person"
  | "merchant"
  | "items"
  | "tags"
  | "asset"
  | "photos";

const LAST_ACCOUNT_KEY = "m-last-account";

const DEBT_TYPES: { value: DebtType; label: string }[] = [
  { value: "loan_give", label: "Я позичив" },
  { value: "loan_repay", label: "Мені повернули" },
  { value: "debt_take", label: "Я взяв у борг" },
  { value: "debt_repay", label: "Я повернув" },
];

const QuickActions = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
`;

const QuickAction = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 44px;
  border: none;
  border-radius: 12px;
  background: var(--m-surface);
  color: var(--m-accent);
  font: inherit;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;

  &:disabled {
    opacity: 0.5;
  }
`;

const AmountField = styled.label`
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 6px;
`;

const AmountInput = styled.input<{ $size: number }>`
  width: 100%;
  max-width: 260px;
  border: none;
  background: none;
  outline: none;
  text-align: right;
  font: inherit;
  font-size: ${(p) => p.$size}px;
  line-height: 1.15;
  font-weight: 600;
  letter-spacing: -0.03em;
  font-variant-numeric: tabular-nums;
  color: var(--m-label);

  &::placeholder {
    color: var(--m-label-3);
  }
`;

const CurrencyMark = styled.span`
  min-width: 80px;
  font-size: 30px;
  font-weight: 600;
  color: var(--m-label-2);
`;

// Чипи одним рядком з горизонтальною прокруткою — не з'їдають висоту.
const ChipRow = styled.div`
  display: flex;
  gap: 8px;
  margin: 0 -16px;
  padding: 0 16px;
  overflow-x: auto;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const Chip = styled.button<{ $active: boolean }>`
  flex-shrink: 0;
  height: 36px;
  padding: 0 14px;
  border: none;
  border-radius: 18px;
  font: inherit;
  font-size: 15px;
  font-weight: 500;
  white-space: nowrap;
  cursor: pointer;
  color: ${(p) => (p.$active ? "var(--m-on-accent)" : "var(--m-label)")};
  background: ${(p) => (p.$active ? "var(--m-accent)" : "var(--m-surface)")};
`;

const FieldInput = styled.input`
  flex: 1;
  width: 100%;
  min-width: 0;
  border: none;
  background: none;
  outline: none;
  font: inherit;
  font-size: 17px;
  color: var(--m-label);
  text-align: right;

  &::placeholder {
    color: var(--m-label-3);
  }
`;

const DateInput = styled(FieldInput)`
  color: var(--m-label-2);
`;

const DateTime = styled.span`
  display: flex;
  gap: 8px;
  justify-content: flex-end;

  input[type="time"] {
    flex: 0 0 auto;
    width: auto;
  }
`;

// Підсумок «Більше» обрізається, щоб не витісняти заголовок рядка.
const SummaryMeta = styled(Meta)`
  max-width: 220px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const MismatchHint = styled.p`
  margin: -12px 0 0;
  text-align: center;
  font-size: 13px;
  color: var(--m-label-2);

  button {
    padding: 0;
    border: none;
    background: none;
    font: inherit;
    color: var(--m-accent);
    cursor: pointer;
  }
`;

const Hint = styled.p`
  margin: -8px 4px 0;
  font-size: 13px;
  color: var(--m-label-2);
`;

// Сума з будь-яким роздільником → копійки.
function toMinor(value: string) {
  const number = Number.parseFloat(value.replace(/\s/g, "").replace(",", "."));
  return Number.isFinite(number) && number > 0 ? Math.round(number * 100) : 0;
}

function errorMessage(error: unknown) {
  if (axios.isAxiosError(error))
    return error.response?.data?.error || error.message;
  return "Не вдалося зберегти";
}

const onlyAmount = (value: string) => value.replace(/[^\d.,\s]/g, "");

interface AddSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOpenReceiptImport: () => void;
  /** Наявна операція — панель працює як редагування. */
  transaction?: TransactionFull;
}

export function AddSheet({
  open,
  onOpenChange,
  onOpenReceiptImport,
  transaction,
}: AddSheetProps) {
  const isEdit = !!transaction;
  const [init] = useState(() =>
    transaction ? initialFromTransaction(transaction) : emptyInitial(),
  );
  const queryClient = useQueryClient();
  const { language } = useSettings();
  const photoInput = useRef<HTMLInputElement>(null);
  const morePhotosInput = useRef<HTMLInputElement>(null);
  const { user: me } = useUserRole();

  const [kind, setKind] = useState<Kind>(init.kind);
  const [debtType, setDebtType] = useState<DebtType>(init.debtType);
  const [amount, setAmount] = useState(init.amount);
  const [targetAmount, setTargetAmount] = useState("");
  const [pickedCategoryId, setCategoryId] = useState(init.categoryId);
  const [pickedAccountId, setAccountId] = useState(init.accountId);
  const [targetAccountId, setTargetAccountId] = useState(init.targetAccountId);
  const [counterpartyId, setCounterpartyId] = useState(init.counterpartyId);
  // Де купили / від кого дохід — окремо від «Хто» в боргу.
  const [merchantId, setMerchantId] = useState(init.merchantId);
  const [date, setDate] = useState(init.date);
  const [time, setTime] = useState(init.time);
  const [tagIds, setTagIds] = useState<string[]>(init.tagIds);
  const [assetId, setAssetId] = useState(init.assetId);
  const [newAsset, setNewAsset] = useState<NewAssetDraft | null>(null);
  const [mileage, setMileage] = useState(init.mileage);
  // Фото, прикріплені до операції (вже стиснені).
  const [photos, setPhotos] = useState<File[]>([]);
  const [note, setNote] = useState(init.note);
  const [picker, setPicker] = useState<Picker>(null);
  // «Більше»: дата й час, теги, актив, фото — як «Додатково» у старій мобільній формі.
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [items, setItems] = useState<DraftItem[]>(init.items);
  const [discount, setDiscount] = useState(init.discount);
  // Новий ключ скидає внутрішній стан редактора товарів після збереження.
  const [formKey, setFormKey] = useState(0);

  const { data: allAccounts = [] } = useQuery({
    queryKey: ["accounts"],
    queryFn: getAccountsApi,
    enabled: open,
  });
  const { data: allCategories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategoriesApi,
    enabled: open,
  });
  const { data: users = [] } = useQuery({
    queryKey: ["users"],
    queryFn: getUsersApi,
    enabled: open,
  });
  const { data: tags = [] } = useQuery({
    queryKey: ["tags"],
    queryFn: getTagsApi,
    enabled: open,
  });
  const { data: assets = [] } = useQuery({
    queryKey: ["assets"],
    queryFn: getAssets,
    enabled: open && (kind === "expense" || kind === "income"),
  });
  const { data: counterparties = [] } = useQuery({
    queryKey: ["counterparties"],
    queryFn: getCounterpartiesApi,
    enabled: open && kind !== "transfer",
  });

  // Як у старій формі: синхронізовані рахунки теж можна обрати (витрата з фото
  // на такому рахунку йде в «Чеки» чекати банківську операцію), але
  // за замовчуванням підставляється звичайний рахунок.
  const accounts = useMemo(
    () => allAccounts.filter((a) => !a.is_group && !a.is_archived),
    [allAccounts],
  );
  const manualAccounts = useMemo(
    () => accounts.filter((a) => !a.is_synced),
    [accounts],
  );
  const categories = useMemo(
    () =>
      (allCategories as Category[]).filter(
        (c) => c.type === (kind === "income" ? "income" : "expense"),
      ),
    [allCategories, kind],
  );
  const activeCounterparties = useMemo(
    () => counterparties.filter((c) => !c.is_group && !c.is_archived),
    [counterparties],
  );

  // Найчастіші категорії з останніх операцій — вибір в один дотик.
  const chipsType = kind === "income" ? "income" : "expense";
  const { data: recentOfType = [] } = useQuery({
    queryKey: ["transactions", "chips", chipsType],
    queryFn: async () => {
      const res = await getTransactionsApi({ type: chipsType, limit: 200 });
      // Фільтр «expense» бекенду включає перекази й борги — лишаємо лише сам тип.
      return (
        (Array.isArray(res) ? res : res.data || []) as Transaction[]
      ).filter((tx) => tx.type === chipsType);
    },
    enabled: open && (kind === "expense" || kind === "income"),
    staleTime: 5 * 60 * 1000,
  });
  const chips = useMemo(() => {
    const counts = new Map<string, number>();
    for (const tx of recentOfType) {
      if (tx.category_id)
        counts.set(tx.category_id, (counts.get(tx.category_id) || 0) + 1);
    }
    const frequent = [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([id]) => categories.find((c) => c.id === id))
      .filter((c): c is Category => !!c);
    const fallback = categories.filter(
      (c) => c.parent_id && !frequent.includes(c),
    );
    return [...frequent, ...fallback].slice(0, 8);
  }, [recentOfType, categories]);

  // «Часті» у виборі контрагента: для витрати/доходу — з останніх операцій,
  // для боргу — люди з відкритим боргом.
  const merchantUsage = useMemo(() => {
    const counts = new Map<string, number>();
    for (const tx of recentOfType) {
      if (tx.counterparty_id)
        counts.set(
          tx.counterparty_id,
          (counts.get(tx.counterparty_id) || 0) + 1,
        );
    }
    return counts;
  }, [recentOfType]);
  const debtUsage = useMemo(
    () =>
      new Map(
        counterparties
          .filter((c) => c.balances?.some((b) => b.balance !== 0))
          .map((c) => [c.id, 1]),
      ),
    [counterparties],
  );
  // Остання категорія для кожного магазину — підставляється, коли його обрали.
  const merchantCategory = useMemo(() => {
    const last = new Map<string, string>();
    for (const tx of recentOfType) {
      if (
        tx.counterparty_id &&
        tx.category_id &&
        !last.has(tx.counterparty_id)
      ) {
        last.set(tx.counterparty_id, tx.category_id);
      }
    }
    return last;
  }, [recentOfType]);

  const knownItems = useMemo(
    () => (kind === "expense" ? knownItemsFrom(recentOfType) : []),
    [kind, recentOfType],
  );

  // Поки нічого не обрано: останній використаний рахунок і найчастіша категорія.
  const lastAccountId = useMemo(() => {
    try {
      return localStorage.getItem(LAST_ACCOUNT_KEY);
    } catch {
      return null;
    }
  }, []);
  const accountId = accounts.some((a) => a.id === pickedAccountId)
    ? pickedAccountId
    : (manualAccounts.find((a) => a.id === lastAccountId)?.id ??
      manualAccounts[0]?.id ??
      accounts[0]?.id ??
      "");
  // Категорія операції: обрана вручну, інакше та, на яку припадає більше товарів,
  // інакше звична для обраного магазину, інакше найчастіша.
  const categoryId =
    [
      pickedCategoryId,
      dominantCategory(items),
      merchantCategory.get(merchantId) ?? "",
    ].find((id) => categories.some((c) => c.id === id)) ??
    chips[0]?.id ??
    "";

  const account = accounts.find((a) => a.id === accountId);
  const target = accounts.find((a) => a.id === targetAccountId);
  const category = categories.find((c) => c.id === categoryId);
  const person = activeCounterparties.find((p) => p.id === counterpartyId);
  const merchant = activeCounterparties.find((m) => m.id === merchantId);
  // Редагування: для операції з банку не міняються тип, сума, рахунок і дата
  // (як у старій формі); у переказу рахунки не змінюються — бекенд цього не вміє.
  const txAccount = transaction
    ? allAccounts.find((a) => a.id === transaction.account_id)
    : undefined;
  const locked = isEdit && !!txAccount?.is_synced;
  const transferEdit = isEdit && kind === "transfer";
  // Операція, що прийшла з банку: бекенд зберігає лише категорію й контрагента,
  // решту полів не показуємо як редаговані, щоб зміни не губились мовчки.
  const bankOnly = locked && !!transaction?.external_id;
  const needsTargetAmount =
    !isEdit &&
    kind === "transfer" &&
    !!account &&
    !!target &&
    account.currency !== target.currency;

  const reset = () => {
    setKind("expense");
    setAmount("");
    setTargetAmount("");
    setTargetAccountId("");
    setCounterpartyId("");
    setMerchantId("");
    setNote("");
    setDate(format(new Date(), "yyyy-MM-dd"));
    setTime(format(new Date(), "HH:mm"));
    setTagIds([]);
    setAssetId("");
    setNewAsset(null);
    setMileage("");
    setPhotos([]);
    setItems([]);
    setDiscount(0);
    setFormKey((k) => k + 1);
  };

  const close = () => {
    onOpenChange(false);
    reset();
  };

  // «Скасувати» стирає чернетку; свайп униз лише ховає панель — введений чек
  // не пропаде від випадкового жесту.
  const cancel = () => {
    if (isEdit) {
      onOpenChange(false);
      return;
    }
    if (
      (items.length > 0 || photos.length > 0) &&
      !window.confirm(
        "Скасувати операцію? Введені товари й фото буде втрачено.",
      )
    )
      return;
    close();
  };

  const invalidate = (keys: string[]) => {
    for (const key of keys) queryClient.invalidateQueries({ queryKey: [key] });
  };

  const mutation = useMutation({
    mutationFn: async ({
      data,
      toInbox,
    }: {
      data: CreateTxData | FormData;
      toInbox: boolean;
    }) =>
      isEdit
        ? updateTransactionApi({
            ...(data as CreateTxData),
            id: transaction!.id,
          })
        : toInbox
          ? createInboxPhotoApi(data as FormData)
          : createTransactionApi(data),
    onSuccess: (_, { toInbox }) => {
      invalidate([
        "transactions",
        "transactions-infinite",
        "accounts",
        "account",
        "stats",
        "goals",
        "goal",
        "counterparties",
        "assets",
        "inbox",
      ]);
      if (toInbox) {
        toast.success("Чек додано в «Чеки»: чекаємо банківську операцію");
        try {
          localStorage.setItem(LAST_ACCOUNT_KEY, accountId);
        } catch {
          // не критично
        }
        close();
        return;
      }
      try {
        localStorage.setItem(LAST_ACCOUNT_KEY, accountId);
      } catch {
        // Без збереженого рахунку просто почнемо з першого.
      }
      if (isEdit) {
        queryClient.invalidateQueries({
          queryKey: ["transaction", transaction!.id],
        });
        toast.success("Зміни збережено");
        onOpenChange(false);
        return;
      }
      toast.success("Операцію додано");
      close();
    },
    onError: (error) => toast.error(errorMessage(error)),
  });

  const createPerson = useMutation({
    mutationFn: (data: NewCounterparty) => createCounterpartyApi(data),
    onSuccess: (created) => {
      invalidate(["counterparties"]);
      if (kind === "debt") setCounterpartyId(created.id);
      else setMerchantId(created.id);
      setPicker(null);
    },
    onError: (error) => toast.error(errorMessage(error)),
  });

  // Фото чека одразу йде в чергу Операції → Чеки; рахунок і суму вкажуть там.
  const photoUpload = useMutation({
    mutationFn: async (photo: File) => {
      const data = new FormData();
      data.append("json", JSON.stringify({}));
      data.append("file", await compressImage(photo));
      return createInboxPhotoApi(data);
    },
    onSuccess: () => {
      invalidate(["inbox"]);
      toast.success("Фото додано в Операції → Чеки");
      close();
    },
    onError: (error) => toast.error(errorMessage(error)),
  });

  const minor = toMinor(amount);
  const ready = (() => {
    if (minor <= 0 || !accountId) return false;
    if (kind === "transfer")
      return (
        !!targetAccountId &&
        targetAccountId !== accountId &&
        (!needsTargetAmount || toMinor(targetAmount) > 0)
      );
    if (kind === "debt") return !!counterpartyId;
    return !!categoryId;
  })();

  const withItems = kind === "expense" && items.length > 0;

  // Сума операції йде за товарами; її ще можна виправити вручну.
  const changeItems = (next: DraftItem[], nextDiscount: number) => {
    setItems(next);
    setDiscount(nextDiscount);
    const total = itemsTotal(next, nextDiscount);
    if (next.length > 0 && total > 0 && !locked) setAmount(minorToInput(total));
  };

  const withAsset = kind === "expense" || kind === "income";
  const selectedAsset = withAsset
    ? assets.find((a) => a.id === assetId)
    : undefined;
  const isCar = selectedAsset?.type === "car";
  const sendNewAsset = kind === "expense" && newAsset ? newAsset : null;
  // Як у старій формі: витрата з фото на синхронізованому рахунку — у «Чеки».
  const toInbox =
    !isEdit && kind === "expense" && !!account?.is_synced && photos.length > 0;

  const save = () => {
    if (isEdit && transaction) {
      mutation.mutate({
        data: {
          // Половину переказу бекенд визначає сам; рахунок — той самий.
          type:
            kind === "transfer"
              ? "transfer"
              : kind === "debt"
                ? debtType
                : kind,
          account_id: kind === "transfer" ? transaction.account_id : accountId,
          category_id:
            kind === "expense" || kind === "income" ? categoryId : undefined,
          counterparty_id:
            kind === "debt"
              ? counterpartyId
              : kind !== "transfer" && merchantId
                ? merchantId
                : undefined,
          amount: minor,
          date: new Date(`${date}T${time || "12:00"}:00`).getTime(),
          note: note.trim(),
          items: withItems
            ? toApiItems(items, discount, categoryId, init.discountName)
            : [],
          tag_ids: tagIds,
          asset_id: withAsset && assetId ? assetId : null,
          mileage: isCar && mileage ? Number(mileage) : undefined,
          // Стара форма тут скидала прапорець, і прощений борг знову рухав баланс.
          is_forgiveness: transaction.is_forgiveness,
        },
        toInbox: false,
      });
      return;
    }
    if (toInbox && photos.length > 1) {
      toast.error("Для «Чеків» поки можна додати лише одне фото чека.");
      return;
    }
    const timestamp = new Date(`${date}T${time || "12:00"}:00`).getTime();
    const payload: CreateTxData = {
      type: kind === "debt" ? debtType : kind,
      account_id: accountId,
      target_account_id: kind === "transfer" ? targetAccountId : undefined,
      target_amount: needsTargetAmount ? toMinor(targetAmount) : undefined,
      category_id:
        kind === "expense" || kind === "income" ? categoryId : undefined,
      counterparty_id:
        kind === "debt"
          ? counterpartyId
          : kind !== "transfer" && merchantId
            ? merchantId
            : undefined,
      amount: minor,
      date: timestamp,
      note: note.trim(),
      items: withItems ? toApiItems(items, discount, categoryId) : undefined,
      tag_ids: tagIds.length ? tagIds : undefined,
      asset_id: withAsset && assetId ? assetId : undefined,
      mileage: isCar && mileage ? Number(mileage) : undefined,
    };

    if (toInbox) {
      const data = new FormData();
      data.append(
        "json",
        JSON.stringify({
          selected_account_id: accountId,
          total: payload.amount,
          occurred_at: payload.date,
          note: payload.note,
          counterparty_id: payload.counterparty_id,
          category_id: payload.category_id,
          items: payload.items,
        }),
      );
      data.append("file", photos[0]);
      mutation.mutate({ data, toInbox: true });
      return;
    }

    const files = [...(sendNewAsset?.files ?? []), ...photos];
    const json = {
      ...payload,
      new_asset: sendNewAsset
        ? {
            name: sendNewAsset.name,
            type: sendNewAsset.type,
            warranty_end: sendNewAsset.warranty_end ?? 0,
            mileage: sendNewAsset.mileage ?? 0,
            serial_number: "",
            note: "",
          }
        : undefined,
    };
    if (!files.length) {
      mutation.mutate({ data: json, toInbox: false });
      return;
    }
    const data = new FormData();
    data.append("json", JSON.stringify(json));
    files.forEach((file) => data.append("files", file));
    mutation.mutate({ data, toInbox: false });
  };

  // «Фото чека» без введених даних — одразу в «Чеки» (як «лише фото» у старій
  // формі); якщо операцію вже почали заповнювати — фото прикріплюється до неї.
  const startedFilling = minor > 0 || items.length > 0;
  const attachPhotos = async (files: File[]) => {
    if (!files.length) return;
    try {
      const compressed = await Promise.all(
        files.map((file) => compressImage(file)),
      );
      setPhotos((prev) => [...prev, ...compressed]);
      toast.success("Фото додано до операції");
    } catch {
      toast.error("Не вдалося обробити фото");
    }
  };
  const onPhoto = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    event.target.value = "";
    if (!files.length) return;
    if (startedFilling || photos.length > 0) void attachPhotos(files);
    else photoUpload.mutate(files[0]);
  };

  // Кнопка пояснює, чого бракує, замість мовчки бути неактивною.
  const saveLabel = (() => {
    if (mutation.isPending) return "Збереження…";
    if (isEdit && ready) return "Зберегти зміни";
    if (toInbox && ready) return "Зберегти в «Чеки»";
    if (!accountId) return "Немає рахунку";
    if (minor <= 0) return "Введіть суму";
    if (kind === "transfer" && !targetAccountId) return "Оберіть, куди";
    if (needsTargetAmount && toMinor(targetAmount) <= 0)
      return "Введіть отриману суму";
    if (kind === "debt" && !counterpartyId) return "Оберіть людину";
    if ((kind === "expense" || kind === "income") && !categoryId)
      return "Оберіть категорію";
    return "Зберегти";
  })();

  const itemsSum = itemsTotal(items, discount);
  const itemsMismatch = withItems && itemsSum > 0 && minor !== itemsSum;

  const detailsSummary = (() => {
    const today = format(new Date(), "yyyy-MM-dd");
    const yesterday = format(subDays(new Date(), 1), "yyyy-MM-dd");
    const day =
      date === today
        ? "Сьогодні"
        : date === yesterday
          ? "Вчора"
          : format(new Date(`${date}T12:00:00`), "dd.MM");
    const parts = [`${day}, ${time}`];
    if (tagIds.length) parts.push(`теги: ${tagIds.length}`);
    if (sendNewAsset) parts.push(sendNewAsset.name);
    else if (selectedAsset) parts.push(selectedAsset.name);
    if (photos.length) parts.push(`фото: ${photos.length}`);
    return parts.join(" · ");
  })();

  const symbol = account
    ? CURRENCY_SYMBOLS[account.currency] || account.currency
    : "₴";
  const accountLabel = kind === "transfer" ? "Звідки" : "Рахунок";

  return (
    <>
      <Sheet
        open={open}
        onOpenChange={onOpenChange}
        onCancel={cancel}
        title={isEdit ? "Редагування" : "Нова операція"}
        footer={
          <PrimaryButton
            type="button"
            disabled={!ready || mutation.isPending}
            onClick={save}
          >
            {saveLabel}
          </PrimaryButton>
        }
      >
        <input
          ref={photoInput}
          type="file"
          accept="image/*"
          hidden
          onChange={onPhoto}
        />
        <input
          ref={morePhotosInput}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(e) => {
            const files = Array.from(e.target.files || []);
            e.target.value = "";
            void attachPhotos(files);
          }}
        />
        {!isEdit && (
          <QuickActions>
            <QuickAction
              type="button"
              disabled={photoUpload.isPending}
              onClick={() => photoInput.current?.click()}
            >
              <HiOutlineCamera size={20} aria-hidden="true" />
              {photoUpload.isPending ? "Завантаження…" : "Фото чека"}
            </QuickAction>
            <QuickAction
              type="button"
              onClick={() => {
                close();
                onOpenReceiptImport();
              }}
            >
              <HiOutlineReceiptPercent size={20} aria-hidden="true" />
              Е-чек
            </QuickAction>
          </QuickActions>
        )}

        {/* Переказ не можна перетворити на іншу операцію і навпаки (бекенд). */}
        {!locked && !transferEdit && (
          <Segmented
            label="Тип операції"
            value={kind}
            onChange={setKind}
            options={[
              { value: "expense", label: "Витрата" },
              { value: "income", label: "Дохід" },
              ...(isEdit
                ? []
                : [{ value: "transfer" as const, label: "Переказ" }]),
              { value: "debt", label: "Борг" },
            ]}
          />
        )}

        <AmountField>
          <AmountInput
            $size={amount.length > 9 ? 38 : 48}
            type="text"
            inputMode="decimal"
            aria-label="Сума"
            placeholder="0"
            disabled={locked}
            value={amount}
            onChange={(e) => setAmount(onlyAmount(e.target.value))}
          />
          <CurrencyMark>{symbol}</CurrencyMark>
        </AmountField>

        {itemsMismatch && (
          <MismatchHint>
            Товари на{" "}
            {formatMoney(itemsSum, account?.currency || "UAH", language)} — сума
            інша.{" "}
            <button
              type="button"
              onClick={() => setAmount(minorToInput(itemsSum))}
            >
              Взяти суму товарів
            </button>
          </MismatchHint>
        )}

        {(kind === "expense" || kind === "income") && chips.length > 0 && (
          <ChipRow role="group" aria-label="Часті категорії">
            {chips.map((c) => (
              <Chip
                key={c.id}
                type="button"
                $active={c.id === categoryId}
                aria-pressed={c.id === categoryId}
                onClick={() => setCategoryId(c.id)}
              >
                {categoryLabel(categories, c.id)}
              </Chip>
            ))}
          </ChipRow>
        )}

        {kind === "debt" && (
          <ChipRow role="group" aria-label="Що сталося">
            {DEBT_TYPES.map((d) => (
              <Chip
                key={d.value}
                type="button"
                $active={d.value === debtType}
                aria-pressed={d.value === debtType}
                onClick={() => setDebtType(d.value)}
              >
                {d.label}
              </Chip>
            ))}
          </ChipRow>
        )}

        <Group>
          {(kind === "expense" || kind === "income") && (
            <Row
              onClick={() => setPicker("category")}
              title="Категорія"
              trailing={
                <Meta>
                  {categoryLabel(categories, category?.id) ?? "Оберіть"}
                </Meta>
              }
              chevron
            />
          )}
          {(kind === "expense" || kind === "income") && (
            <Row
              onClick={() => setPicker("merchant")}
              title={kind === "expense" ? "Де" : "Від кого"}
              trailing={<Meta>{merchant?.name ?? "Необовʼязково"}</Meta>}
              chevron
            />
          )}
          {kind === "debt" && (
            <Row
              onClick={() => setPicker("person")}
              title="Хто"
              trailing={<Meta>{person?.name ?? "Оберіть"}</Meta>}
              chevron
            />
          )}
          <Row
            onClick={
              locked || transferEdit ? undefined : () => setPicker("account")
            }
            title={accountLabel}
            trailing={<Meta>{account?.name ?? "Оберіть"}</Meta>}
            chevron={!locked && !transferEdit}
          />
          {kind === "transfer" && (
            <Row
              onClick={transferEdit ? undefined : () => setPicker("target")}
              title="Куди"
              trailing={<Meta>{target?.name ?? "Оберіть"}</Meta>}
              chevron={!transferEdit}
            />
          )}
          {needsTargetAmount && (
            <Row
              title={`Отримано, ${CURRENCY_SYMBOLS[target!.currency] || target!.currency}`}
              trailing={
                <FieldInput
                  type="text"
                  inputMode="decimal"
                  aria-label="Отримана сума"
                  placeholder="0"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(onlyAmount(e.target.value))}
                />
              }
            />
          )}
        </Group>

        {/* Деталі — окремою групою, щоб головне читалось одним поглядом. */}
        {!bankOnly && (
          <Group>
            {kind === "expense" && (
              <Row
                onClick={() => setPicker("items")}
                title="Товари"
                trailing={
                  <Meta>
                    {items.length > 0
                      ? `${items.length} · ${formatMoney(itemsTotal(items, discount), account?.currency || "UAH", language)}`
                      : "Ввести чек"}
                  </Meta>
                }
                chevron
              />
            )}
            <Row
              title="Нотатка"
              trailing={
                <FieldInput
                  type="text"
                  aria-label="Нотатка"
                  placeholder="Необовʼязково"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              }
            />
            <Row
              onClick={() => setDetailsOpen(true)}
              title="Більше"
              trailing={<SummaryMeta>{detailsSummary}</SummaryMeta>}
              chevron
            />
          </Group>
        )}

        {bankOnly ? (
          <Hint>
            Операція з банку: тут можна змінити категорію й «Де». Сума, дата,
            нотатка й решта приходять з банку.
          </Hint>
        ) : (
          locked && (
            <Hint>
              Рахунок синхронізується з банком: суму, рахунок, дату й тип
              змінити не можна.
            </Hint>
          )
        )}
        {transferEdit && (
          <Hint>
            Рахунки переказу не змінюються — щоб змінити, видаліть переказ і
            створіть заново.
          </Hint>
        )}
        {toInbox && (
          <Hint>
            Рахунок синхронізується з банком: чек з фото чекатиме в «Чеках» на
            банківську операцію і прив'яжеться до неї.
          </Hint>
        )}
        {accounts.length === 0 && (
          <Hint>Немає рахунків. Додайте рахунок у розділі «Рахунки».</Hint>
        )}
      </Sheet>

      <Sheet
        nested
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        title="Більше"
        hideCancel
        trailing={
          <SheetTextButton
            type="button"
            $bold
            onClick={() => setDetailsOpen(false)}
          >
            Готово
          </SheetTextButton>
        }
      >
        <Group>
          <Row
            title="Дата"
            trailing={
              <DateTime>
                <DateInput
                  type="date"
                  aria-label="Дата"
                  disabled={locked}
                  value={date}
                  max={format(new Date(), "yyyy-MM-dd")}
                  onChange={(e) => e.target.value && setDate(e.target.value)}
                />
                <DateInput
                  type="time"
                  aria-label="Час"
                  disabled={locked}
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                />
              </DateTime>
            }
          />
          <Row
            onClick={() => setPicker("tags")}
            title="Теги"
            trailing={
              <Meta>
                {tagIds.length
                  ? tags
                      .filter((t) => tagIds.includes(t.id))
                      .map((t) => t.name)
                      .join(", ") || `${tagIds.length}`
                  : "Немає"}
              </Meta>
            }
            chevron
          />
          {withAsset && (
            <Row
              onClick={() => setPicker("asset")}
              title="Актив"
              trailing={
                <Meta>
                  {sendNewAsset
                    ? `Новий: ${sendNewAsset.name}`
                    : (selectedAsset?.name ?? "Немає")}
                </Meta>
              }
              chevron
            />
          )}
          {isCar && (
            <Row
              title="Пробіг, км"
              trailing={
                <FieldInput
                  type="text"
                  inputMode="numeric"
                  aria-label="Пробіг"
                  placeholder={`Поточний ${selectedAsset?.mileage ?? 0}`}
                  value={mileage}
                  onChange={(e) =>
                    setMileage(e.target.value.replace(/\D/g, ""))
                  }
                />
              }
            />
          )}
          {!isEdit && photos.length > 0 && (
            <Row
              onClick={() => setPicker("photos")}
              title="Фото"
              trailing={<Meta>{photos.length}</Meta>}
              chevron
            />
          )}
        </Group>
        {isCar && mileage && (
          <Hint>
            {Number(mileage) > (selectedAsset?.mileage ?? 0)
              ? "Новий пробіг оновить загальний пробіг і дату останнього ТО в картці авто."
              : `Історичний запис: менше поточного пробігу (${selectedAsset?.mileage ?? 0} км).`}
          </Hint>
        )}
        <TagPicker
          open={picker === "tags"}
          onOpenChange={(next) => !next && setPicker(null)}
          value={tagIds}
          onChange={setTagIds}
        />
        <AssetPicker
          open={picker === "asset"}
          onOpenChange={(next) => !next && setPicker(null)}
          assetId={assetId}
          newAsset={newAsset}
          canCreate={!isEdit && kind === "expense"}
          operationDate={new Date(`${date}T12:00:00`).getTime()}
          onChange={(id, created) => {
            setAssetId(id);
            setNewAsset(created);
            setMileage("");
          }}
        />
        <PhotosSheet
          open={picker === "photos"}
          onOpenChange={(next) => !next && setPicker(null)}
          photos={photos}
          onRemove={(index) => {
            const next = photos.filter((_, i) => i !== index);
            setPhotos(next);
            if (!next.length) setPicker(null);
          }}
          onAdd={() => morePhotosInput.current?.click()}
        />
      </Sheet>

      <CategoryPicker
        open={picker === "category"}
        onOpenChange={(next) => !next && setPicker(null)}
        categories={categories}
        value={categoryId}
        onSelect={setCategoryId}
      />
      <AccountPicker
        open={picker === "account" || picker === "target"}
        onOpenChange={(next) => !next && setPicker(null)}
        title={picker === "target" ? "Куди" : accountLabel}
        accounts={
          picker === "target"
            ? accounts.filter((a) => a.id !== accountId)
            : accounts
        }
        users={users}
        currentUserId={me?.id}
        value={picker === "target" ? targetAccountId : accountId}
        onSelect={picker === "target" ? setTargetAccountId : setAccountId}
        language={language}
      />
      <ItemsSheet
        key={formKey}
        open={picker === "items"}
        onOpenChange={(next) => !next && setPicker(null)}
        items={items}
        discount={discount}
        onChange={changeItems}
        known={knownItems}
        categories={categories}
        mainCategoryId={categoryId}
        currency={account?.currency || "UAH"}
        language={language}
      />
      <CounterpartyPicker
        open={picker === "person" || picker === "merchant"}
        onOpenChange={(next) => !next && setPicker(null)}
        title={
          picker === "merchant"
            ? kind === "expense"
              ? "Де"
              : "Від кого"
            : "Хто"
        }
        counterparties={activeCounterparties}
        usage={picker === "merchant" ? merchantUsage : debtUsage}
        typeOrder={
          kind === "debt"
            ? ["person", "other", "shop"]
            : kind === "income"
              ? ["other", "person", "shop"]
              : ["shop", "other", "person"]
        }
        value={picker === "merchant" ? merchantId : counterpartyId}
        onSelect={picker === "merchant" ? setMerchantId : setCounterpartyId}
        onClear={picker === "merchant" ? () => setMerchantId("") : undefined}
        onCreate={(data) => createPerson.mutate(data)}
        isCreating={createPerson.isPending}
      />
    </>
  );
}
