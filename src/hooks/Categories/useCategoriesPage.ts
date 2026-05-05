import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useCategoryData } from "./useCategoryData";
import { useCategoryTree } from "./useCategoryTree";
import { useUserRole } from "../useUserRole";
import type { FilterConfig } from "../../components/shared/TableToolbar/types";

export const useCategoriesPage = () => {
  const { t } = useTranslation();
  const { canManageStructure } = useUserRole();
  const { categories: flatCategories, isLoading, actions } = useCategoryData();

  // --- Local State ---
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({ type: [] as string[] });
  const [sortValue, setSortValue] = useState("default");
  const [editingCategory, setEditingCategory] = useState<any>(null);

  // --- Computed Tree ---
  const categoryTreeRoots = useCategoryTree({
    categories: flatCategories,
    searchQuery,
    filters,
    // Якщо useCategoryTree не приймає sortValue, це поле буде проігнороване,
    // але для сумісності з твоїм кодом я його залишаю
    // sortValue,
  });

  // --- Handlers ---
  const handleEdit = (category: any) => {
    if (!canManageStructure) return;
    setEditingCategory(category);
    // Programmatic open trigger
    setTimeout(
      () => document.getElementById("trigger-edit-category")?.click(),
      0
    );
  };

  const handleDelete = (id: string) => {
    if (!canManageStructure) return;
    const cat = flatCategories.find((c: any) => c.id === id);
    setEditingCategory(cat);
    setTimeout(
      () => document.getElementById("trigger-delete-confirm")?.click(),
      0
    );
  };

  const handleCreateClick = () => {
    setEditingCategory(null);
  };

  const handleSave = (data: any, options: any) => {
    if (editingCategory) {
      actions.update.mutate({ ...data, id: editingCategory.id }, options);
    } else {
      actions.create.mutate(data, options);
    }
  };

  const handleDeleteConfirm = () => {
    if (editingCategory) {
      actions.delete.mutate(editingCategory.id);
    }
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setFilters({ type: [] });
  };

  // --- Configs ---
  const filtersConfig: FilterConfig[] = useMemo(
    () => [
      {
        key: "type",
        label: t("categoriesPage.filter_type_label"),
        type: "toggle",
        options: [
          { value: "expense", label: t("categoriesPage.filter_expense") },
          { value: "income", label: t("categoriesPage.filter_income") },
        ],
      },
    ],
    [t]
  );

  const sortOptions = useMemo(
    () => [
      { value: "default", label: t("categoriesPage.sort_default") },
      { value: "name-asc", label: t("categoriesPage.sort_name_asc") },
      { value: "name-desc", label: t("categoriesPage.sort_name_desc") },
    ],
    [t]
  );

  return {
    state: {
      isLoading,
      categoryTreeRoots,
      flatCategories,
      editingCategory,
      searchQuery,
      filters,
      sortValue,
      canManageStructure,
      isCreateLoading: actions.create.isPending,
      isUpdateLoading: actions.update.isPending,
      isDeleteLoading: actions.delete.isPending,
    },
    configs: {
      filtersConfig,
      sortOptions,
    },
    handlers: {
      setSearchQuery,
      setFilters,
      setSortValue,
      handleEdit,
      handleDelete,
      handleCreateClick,
      handleSave,
      handleDeleteConfirm,
      handleClearFilters,
    },
    t,
  };
};
