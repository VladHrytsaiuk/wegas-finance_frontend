import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useCategoryData } from "./useCategoryData";
import { useCategoryTree } from "./useCategoryTree";
import { useUserRole } from "../useUserRole";
import type { FilterConfig } from "../../components/shared/TableToolbar/types";
import type {
  Category,
  CategoryFormData,
  FormSubmitOptions,
} from "./useCategoryForm";

export const useCategoriesPage = () => {
  const { t } = useTranslation();
  const { canManageStructure } = useUserRole();
  const { categories: flatCategories, isLoading, actions } = useCategoryData();

  // --- Local State ---
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({ type: [] as string[] });
  const [sortValue, setSortValue] = useState("default");
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // --- Computed Tree ---
  const categoryTreeRoots = useCategoryTree({
    categories: flatCategories,
    searchQuery,
    filters,
    sortValue,
  });

  // --- Handlers ---
  const handleEdit = (category: Category) => {
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
    const cat = flatCategories.find((c) => c.id === id) ?? null;
    setEditingCategory(cat);
    setTimeout(
      () => document.getElementById("trigger-delete-confirm")?.click(),
      0
    );
  };

  const handleCreateClick = () => {
    setEditingCategory(null);
  };

  const handleSave = (data: CategoryFormData, options?: FormSubmitOptions) => {
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
        label: t("categories:categoriesPage.filter_type_label"),
        type: "toggle",
        options: [
          { value: "expense", label: t("categories:categoriesPage.filter_expense") },
          { value: "income", label: t("categories:categoriesPage.filter_income") },
        ],
      },
    ],
    [t]
  );

  const sortOptions = useMemo(
    () => [
      { value: "default", label: t("categories:categoriesPage.sort_default") },
      { value: "name-asc", label: t("categories:categoriesPage.sort_name_asc") },
      { value: "name-desc", label: t("categories:categoriesPage.sort_name_desc") },
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
