import { useEffect, useMemo, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "../useDebounce";
import { predictCategoryApi } from "../../services/apiTransactions";
import type { Category, TransactionItem } from "../../types";

type EditableTransactionItem = Partial<TransactionItem> & {
  name?: string;
  quantity?: number;
  price_per_unit?: number;
  comment?: string;
  categoryId?: string;
  category_id?: string | null;
  tempId?: string;
};

interface ItemRowActions {
  updateItem: (
    idx: number,
    field: "categoryId" | "name" | "quantity" | "price_per_unit" | "comment",
    value: string | number,
  ) => void;
  removeItem: (idx: number) => void;
}

interface UseItemRowProps {
  item: EditableTransactionItem;
  idx: number;
  actions: ItemRowActions;
  categories: Category[];
}

export const useItemRow = ({
  item,
  idx,
  actions,
  categories,
}: UseItemRowProps) => {
  const isAutoFilledRef = useRef(false);
  const debouncedName = useDebounce(item.name, 600);

  // 1. Fetch prediction
  const { data: predictedCategoryId } = useQuery({
    queryKey: ["predictCategory", debouncedName],
    queryFn: () => predictCategoryApi(debouncedName),
    enabled: !!debouncedName && debouncedName.length >= 3,
    staleTime: 1000 * 60 * 5, // Кешуємо на 5 хв
    retry: false,
  });

  // 2. Apply prediction
  useEffect(() => {
    if (predictedCategoryId) {
      const canUpdate = !item.categoryId || isAutoFilledRef.current;
      const isDifferent =
        String(item.categoryId) !== String(predictedCategoryId);

      if (canUpdate && isDifferent) {
        // Перевіряємо, чи існує така категорія у списку доступних
        const exists = categories.some(
          (c) => String(c.id) === String(predictedCategoryId)
        );

        if (exists) {
          actions.updateItem(idx, "categoryId", String(predictedCategoryId));
          isAutoFilledRef.current = true;
        }
      }
    }
  }, [predictedCategoryId, item.categoryId, idx, actions, categories]);

  // 3. Handlers
  const handleManualCategoryChange = (val: string) => {
    actions.updateItem(idx, "categoryId", val);
    isAutoFilledRef.current = false;
  };

  const handleUpdateName = (val: string) =>
    actions.updateItem(idx, "name", val);
  const handleUpdateQty = (val: number) =>
    actions.updateItem(idx, "quantity", val);
  const handleUpdatePrice = (val: number) =>
    actions.updateItem(idx, "price_per_unit", val);
  const handleUpdateComment = (val: string) =>
    actions.updateItem(idx, "comment", val);
  const handleRemove = () => actions.removeItem(idx);

  // --- Calculate total for display ---
  const totalDisplay = useMemo(() => {
    const rawTotal =
      ((Number(item.price_per_unit) || 0) * (Number(item.quantity) || 0)) / 100;

    // Use Intl.NumberFormat for thousand separators (spaces)
    return new Intl.NumberFormat("uk-UA", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(rawTotal);
  }, [item.price_per_unit, item.quantity]);

  return {
    handleManualCategoryChange,
    handleUpdateName,
    handleUpdateQty,
    handleUpdatePrice,
    handleUpdateComment,
    handleRemove,
    totalDisplay,
  };
};
