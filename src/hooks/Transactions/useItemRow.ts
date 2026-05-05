import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "../useDebounce";
import { predictCategoryApi } from "../../services/apiTransactions";

interface UseItemRowProps {
  item: any;
  idx: number;
  actions: any;
  categories: any[];
}

export const useItemRow = ({
  item,
  idx,
  actions,
  categories,
}: UseItemRowProps) => {
  const [isAutoFilled, setIsAutoFilled] = useState(false);
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
      const canUpdate = !item.categoryId || isAutoFilled;
      const isDifferent =
        String(item.categoryId) !== String(predictedCategoryId);

      if (canUpdate && isDifferent) {
        // Перевіряємо, чи існує така категорія у списку доступних
        const exists = categories.some(
          (c) => String(c.id) === String(predictedCategoryId)
        );

        if (exists) {
          actions.updateItem(idx, "categoryId", String(predictedCategoryId));
          setIsAutoFilled(true);
        }
      }
    }
  }, [
    predictedCategoryId,
    item.categoryId,
    idx,
    actions,
    categories,
    isAutoFilled,
  ]);

  // 3. Handlers
  const handleManualCategoryChange = (val: string) => {
    actions.updateItem(idx, "categoryId", val);
    setIsAutoFilled(false);
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

  // Calculate total for display
  const totalDisplay = (
    ((Number(item.price_per_unit) || 0) * (Number(item.quantity) || 0)) /
    100
  ).toFixed(2);

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
