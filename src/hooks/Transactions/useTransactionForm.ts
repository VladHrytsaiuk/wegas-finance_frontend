import { useState, useCallback, useMemo } from "react";

import type { CreateAssetOnFlyInput } from "../../services/apiTransactions";
import type {
  Tag,
  Transaction,
  TransactionType,
  TransactionItem,
} from "../../types/index";

const INITIAL_ITEM: TransactionItem = {
  name: "",
  quantity: 1,
  price_per_unit: 0,
  total_amount: 0,
};

const isDebtType = (type: string) =>
  ["loan_give", "loan_repay", "debt_take", "debt_repay"].includes(type);

// Утиліта для безпечного порівняння (перетворює null/undefined на пустий рядок)
const safeStr = (val: unknown) =>
  val === null || val === undefined ? "" : String(val);

type EditableTransactionItem = Partial<TransactionItem> & {
  comment?: string;
  category_id?: string | null;
  categoryId?: string;
};

type EditableTransaction = Partial<Transaction> & {
  target_account_id?: string | null;
  asset_id?: string | null;
  mileage?: number | null;
  tags?: Array<Partial<Tag>>;
  items?: EditableTransactionItem[];
};

interface UseTransactionFormProps {
  transactionToEdit?: EditableTransaction;
  initialType?: string;
  initialAccountId?: string;
  initialCounterpartyId?: string;
  initialAmount?: number;
  initialNote?: string;
}

export const useTransactionForm = (props?: UseTransactionFormProps) => {
  const {
    transactionToEdit,
    initialType = "expense",
    initialAccountId = "",
    initialCounterpartyId = "",
    initialAmount,
    initialNote = "",
  } = props || {};

  // --- МИТТЄВА ІНІЦІАЛІЗАЦІЯ СТЕЙТІВ ---
  const [type, setType] = useState<TransactionType>(() =>
    transactionToEdit
      ? transactionToEdit.type
      : (initialType as TransactionType),
  );

  const [accountId, setAccountId] = useState(() =>
    transactionToEdit
      ? safeStr(transactionToEdit.account_id)
      : initialAccountId,
  );

  const [targetAccountId, setTargetAccountId] = useState(() =>
    transactionToEdit ? safeStr(transactionToEdit.target_account_id) : "",
  );

  const [categoryId, setCategoryId] = useState(() =>
    transactionToEdit ? safeStr(transactionToEdit.category_id) : "",
  );

  const [counterpartyId, setCounterpartyId] = useState(() =>
    transactionToEdit
      ? safeStr(transactionToEdit.counterparty_id)
      : initialCounterpartyId,
  );

  const [date, setDate] = useState<string>(() => {
    if (transactionToEdit && transactionToEdit.date) {
      const d = new Date(transactionToEdit.date);
      if (!isNaN(d.getTime())) return d.toISOString().split("T")[0];
    }
    return new Date().toISOString().split("T")[0];
  });

  const [note, setNote] = useState(() =>
    transactionToEdit ? safeStr(transactionToEdit.note) : initialNote,
  );

  const [amountStr, setAmountStr] = useState(() =>
    transactionToEdit
      ? String(Math.abs(transactionToEdit.amount) / 100)
      : initialAmount
        ? String(initialAmount)
        : "",
  );

  const [tagIds, setTagIds] = useState<string[]>(() =>
    transactionToEdit?.tags
      ? transactionToEdit.tags.map((tag) => safeStr(tag.id))
      : [],
  );

  const [items, setItems] = useState<TransactionItem[]>(() => {
    if (transactionToEdit?.items?.length > 0) {
      return transactionToEdit.items.map((item) => ({
        name: safeStr(item.name),
        quantity: Number(item.quantity) || 1,
        price_per_unit: Number(item.price_per_unit) || 0,
        total_amount: Number(item.total_amount) || 0,
        comment: safeStr(item.comment),
        categoryId: safeStr(item.category_id),
      }));
    }
    return [];
  });

  // --- ASSET СТЕЙТИ ---
  const [assetId, setAssetId] = useState<string>(() =>
    transactionToEdit ? safeStr(transactionToEdit.asset_id) : "",
  );

  const [isAssetPanelOpen, setIsAssetPanelOpen] = useState(
    () => !!transactionToEdit?.asset_id,
  );

  const [mileage, setMileage] = useState<string>(() =>
    transactionToEdit?.mileage != null
      ? safeStr(transactionToEdit.mileage)
      : "",
  );

  const [newAsset, setNewAsset] = useState<CreateAssetOnFlyInput | null>(null);

  // --- HANDLE TYPE CHANGE ---
  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    if (newType !== "transfer") setTargetAccountId("");
    if (newType === "transfer" || isDebtType(newType)) setCategoryId("");

    setItems([]);
    setAssetId("");
    setNewAsset(null);
    setMileage("");
    setIsAssetPanelOpen(false);

    if (!transactionToEdit) setCounterpartyId("");
  };

  // --- 🔥 IS DIRTY CALCULATION З ДЕБАГЕРОМ ---
  const isDirty = useMemo(() => {
    if (transactionToEdit) {
      // --- РЕЖИМ РЕДАГУВАННЯ ---
      const initType = transactionToEdit.type;
      const initAcc = safeStr(transactionToEdit.account_id);
      const initTargetAcc = safeStr(transactionToEdit.target_account_id);
      const initCat = safeStr(transactionToEdit.category_id);
      const initCp = safeStr(transactionToEdit.counterparty_id);

      const initDateObj = new Date(transactionToEdit.date);
      const initDate = isNaN(initDateObj.getTime())
        ? ""
        : initDateObj.toISOString().split("T")[0];

      const initNote = safeStr(transactionToEdit.note);
      const initMileage = safeStr(transactionToEdit.mileage);
      const initAssetId = safeStr(transactionToEdit.asset_id);
      const initAmtFloat = transactionToEdit.amount
        ? Math.abs(transactionToEdit.amount) / 100
        : 0;

      const initTags = transactionToEdit.tags
        ? transactionToEdit.tags.map((tag) => safeStr(tag.id)).sort()
        : [];

      const initItems = (transactionToEdit.items || []).map((item) => ({
        name: safeStr(item.name),
        quantity: Number(item.quantity) || 1,
        price_per_unit: Number(item.price_per_unit) || 0,
        total_amount: Number(item.total_amount) || 0,
        comment: safeStr(item.comment),
        categoryId: safeStr(item.category_id),
      }));

      const curType = type;
      const curAcc = safeStr(accountId);
      const curTargetAcc = safeStr(targetAccountId);
      const curCat = safeStr(categoryId);
      const curCp = safeStr(counterpartyId);
      const curDate = safeStr(date);
      const curNote = safeStr(note);
      const curMileage = safeStr(mileage);
      const curAssetId = safeStr(assetId);
      const currentAmtFloat = parseFloat(amountStr) || 0;
      const isNewAssetDirty = !!newAsset;

      const curTags = [...tagIds].map((id) => safeStr(id)).sort();

      const curItems = items.map((item) => ({
        name: safeStr(item.name),
        quantity: Number(item.quantity) || 1,
        price_per_unit: Number(item.price_per_unit) || 0,
        total_amount: Number(item.total_amount) || 0,
        comment: safeStr(item.comment),
        categoryId: safeStr(item.categoryId),
      }));

      const diffs = {
        type: curType !== initType,
        account: curAcc !== initAcc,
        targetAccount: curTargetAcc !== initTargetAcc,
        category: curCat !== initCat,
        counterparty: curCp !== initCp,
        date: curDate !== initDate,
        amount: currentAmtFloat !== initAmtFloat,
        note: curNote !== initNote,
        mileage: curMileage !== initMileage,
        asset: curAssetId !== initAssetId,
        tags: JSON.stringify(curTags) !== JSON.stringify(initTags),
        items: JSON.stringify(curItems) !== JSON.stringify(initItems),
        newAsset: isNewAssetDirty,
      };

      const hasChanges = Object.values(diffs).some(Boolean);

      if (hasChanges) {
        console.group(
          "🕵️‍♂️ ДЕБАГ (РЕДАГУВАННЯ): Форма вважає себе брудною. Причини:",
        );
        Object.entries(diffs).forEach(([key, isChanged]) => {
          if (isChanged) console.log(`❌ Поле [${key}] відрізняється.`);
        });
        console.groupEnd();
      }

      return hasChanges;
    }

    // --- РЕЖИМ СТВОРЕННЯ (НОВА ТРАНЗАКЦІЯ) ---
    const curNote = safeStr(note);
    const initNote = safeStr(initialNote);

    const currentAmtFloat = parseFloat(amountStr) || 0;
    const initialAmtFloat = initialAmount ? Math.abs(initialAmount) / 100 : 0;

    // Ми навмисно ІГНОРУЄМО account, category, counterparty та type при створенні,
    // бо вони часто підставляються автоматично (наприклад, останній використаний рахунок).
    const diffs = {
      amount: currentAmtFloat !== initialAmtFloat && currentAmtFloat > 0, // Тільки якщо ввели суму > 0
      note: curNote !== initNote && curNote.trim() !== "", // Якщо написали замітку
      mileage: safeStr(mileage) !== "", // Якщо ввели пробіг
      assetId: safeStr(assetId) !== "", // Якщо обрали актив
      tags: tagIds.length > 0, // Якщо обрали теги
      items: items.length > 0, // Якщо додали чек/товари
      newAsset: !!newAsset, // Якщо почали створювати новий актив
    };

    const hasChanges = Object.values(diffs).some(Boolean);

    // if (hasChanges) {
    //   console.group(
    //     "🕵️‍♂️ ДЕБАГ (СТВОРЕННЯ): Форма вважає себе брудною. Причини:",
    //   );
    //   Object.entries(diffs).forEach(([key, isChanged]) => {
    //     if (isChanged) {
    //       console.log(`❌ Поле [${key}] містить введені дані.`);
    //     }
    //   });
    //   console.groupEnd();
    // }

    return hasChanges;
  }, [
    transactionToEdit,
    type,
    accountId,
    targetAccountId,
    categoryId,
    counterpartyId,
    date,
    note,
    amountStr,
    items,
    tagIds,
    assetId,
    newAsset,
    mileage,
    initialAmount,
    initialNote,
  ]);

  const toggleAssetPanel = () => {
    setIsAssetPanelOpen((prev) => {
      const willBeOpen = !prev;
      if (!willBeOpen) {
        setAssetId("");
        setNewAsset(null);
        setMileage("");
      }
      return willBeOpen;
    });
  };

  const createEnterHandler = useCallback((action: () => void) => {
    return (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        e.stopPropagation();
        action();
      }
    };
  }, []);

  const recalculateTotal = (currentItems: TransactionItem[]) => {
    if (currentItems.length > 0) {
      const totalCents = currentItems.reduce(
        (sum, item) => sum + (item.total_amount || 0),
        0,
      );
      setAmountStr((Math.abs(totalCents) / 100).toFixed(2));
    }
  };

  const setItemsList = (newItems: TransactionItem[]) => setItems(newItems);
  const addItem = () => setItems([...items, { ...INITIAL_ITEM }]);

  const removeItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
    recalculateTotal(newItems);
  };

  const updateItem = (
    index: number,
    field: keyof TransactionItem,
    value: string | number,
  ) => {
    const newItems = [...items];
    const item = { ...newItems[index], [field]: value };
    if (field === "quantity" || field === "price_per_unit") {
      const q = field === "quantity" ? Number(value) : Number(item.quantity);
      const p =
        field === "price_per_unit"
          ? Number(value)
          : Number(item.price_per_unit);
      item.total_amount = q * p;
    }
    newItems[index] = item;
    setItems(newItems);
    recalculateTotal(newItems);
  };

  const resetItems = () => setItems([]);

  const resetForm = () => {
    setAmountStr("");
    setNote("");
    setItems([]);
    setTagIds([]);
    setAssetId("");
    setNewAsset(null);
    setMileage("");
    setIsAssetPanelOpen(false);
  };

  const getPayload = (): null => {
    return null;
  };

  return {
    form: {
      type,
      accountId,
      targetAccountId,
      categoryId,
      counterpartyId,
      date,
      note,
      amountStr,
      items,
      tagIds,
      assetId,
      newAsset,
      isAssetPanelOpen,
      isDirty,
      mileage,
    },
    actions: {
      setType: handleTypeChange,
      setAccountId,
      setTargetAccountId,
      setCategoryId,
      setCounterpartyId,
      setDate,
      setNote,
      setAmountStr,
      setTagIds,
      setItems: setItemsList,
      addItem,
      updateItem,
      removeItem,
      resetItems,
      getPayload,
      resetForm,
      setAssetId,
      setNewAsset,
      toggleAssetPanel,
      createEnterHandler,
      setMileage,
      setIsAssetPanelOpen,
    },
  };
};
