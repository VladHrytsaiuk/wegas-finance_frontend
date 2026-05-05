import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next"; // ⬅️ ІМПОРТ ДЛЯ ПЕРЕКЛАДУ
import {
  getCategoriesApi,
  createCategoryApi,
  updateCategoryApi,
  deleteCategoryApi,
} from "../../services/apiCategories";

export function useCategoryData() {
  const { t } = useTranslation(); // ⬅️ ВИКОРИСТАННЯ ХУКА
  const queryClient = useQueryClient();

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategoriesApi,
  });

  const createCategory = useMutation({
    mutationFn: createCategoryApi,
    onSuccess: () => {
      // ➡️ ПЕРЕКЛАД
      toast.success(t("categoryDataHook.alert_create_success"));
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
    // Додайте обробку помилок, якщо потрібно, хоча в оригіналі її немає
  });

  const updateCategory = useMutation({
    mutationFn: updateCategoryApi,
    onSuccess: () => {
      // ➡️ ПЕРЕКЛАД
      toast.success(t("categoryDataHook.alert_update_success"));
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
    // Додайте обробку помилок
  });

  const deleteCategory = useMutation({
    mutationFn: deleteCategoryApi,
    onSuccess: () => {
      // ➡️ ПЕРЕКЛАД
      toast.success(t("categoryDataHook.alert_delete_success"));
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
    onError: () =>
      // ➡️ ПЕРЕКЛАД
      toast.error(t("categoryDataHook.alert_delete_error")),
  });

  return {
    categories, // Flat list
    isLoading,
    actions: {
      create: createCategory,
      update: updateCategory,
      delete: deleteCategory,
    },
  };
}
