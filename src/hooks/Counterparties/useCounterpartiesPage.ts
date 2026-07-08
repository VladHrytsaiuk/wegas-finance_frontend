import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useCounterpartyData } from "./useCounterpartyData";
import { useCounterpartyTree } from "./useCounterpartyTree";
import { useUserRole } from "../useUserRole";
import type { FilterConfig } from "../../components/shared/TableToolbar/types";
import type { TreeNodeData } from "../../components/counterparties/CounterpartyTree";
import type {
  Counterparty,
  CounterpartyBalance,
  CounterpartyCategory,
} from "../../types";

type EditableTreeNode = TreeNodeData & {
  data?: Counterparty;
  raw?: Counterparty | CounterpartyCategory;
  isCategory?: boolean;
};

export const useCounterpartiesPage = () => {
  const { t } = useTranslation();
  const { canManageStructure } = useUserRole();

  // Data
  const { counterparties, categories, isLoading, actions } =
    useCounterpartyData();

  // Local State
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({ type: [] as string[] });
  const [sortValue, setSortValue] = useState("default");

  const [selectedCp, setSelectedCp] = useState<Counterparty | null>(null);
  const [selectedCat, setSelectedCat] = useState<CounterpartyCategory | null>(null);
  const [itemToDelete, setItemToDelete] = useState<{
    id: string;
    name: string;
    isCategory: boolean;
    hasDebt?: boolean;
  } | null>(null);

  // Computed Tree
  const treeRoots = useCounterpartyTree({
    counterparties,
    categories,
    searchQuery,
    filters,
    sortValue,
  });

  // Handlers
  const openModal = (name: string) => {
    setTimeout(() => document.getElementById(`trigger-${name}`)?.click(), 0);
  };

  const handleEditClick = (node: EditableTreeNode) => {
    if (!canManageStructure) return;

    // node - це об'єкт TreeNode, у нього є поле raw (оригінальні дані) або data
    const rawData = node.data || node.raw || node;

    // Перевіряємо тип вузла
    if (node.type === "subgroup" || node.type === "group" || node.isCategory) {
      // Якщо це категорія (або підгрупа, яка є категорією)
      // Треба знайти справжню категорію в масиві categories, якщо node.raw неповний
      setSelectedCat(rawData as CounterpartyCategory);
      openModal("edit-cat");
    } else {
      setSelectedCp(rawData as Counterparty);
      openModal("edit-cp");
    }
  };

  const handleDeleteClick = (id: string, isCategory: boolean = false) => {
    if (!canManageStructure) return;

    let name = "";
    let hasDebt = false;
    const categoryNameDefault =
      t("counterparties:counterpartiesPage.resource_category") || "Category";
    const counterpartyNameDefault =
      t("counterparties:counterpartiesPage.resource_counterparty") || "Counterparty";

    if (isCategory) {
      const cat = categories.find((category: CounterpartyCategory) => category.id === id);
      name = cat ? cat.name : categoryNameDefault;
    } else {
      const cp = counterparties.find((counterparty: Counterparty) => counterparty.id === id);
      name = cp ? cp.name : counterpartyNameDefault;
      hasDebt =
        cp?.balances?.some(
          (balance: CounterpartyBalance) => Math.abs(balance.balance) > 0.01,
        ) || false;
    }
    setItemToDelete({ id, name, isCategory, hasDebt });
    openModal("delete-confirm");
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setFilters({ type: [] });
  };

  const handleCloseSelection = () => {
    setSelectedCp(null);
    setSelectedCat(null);
  };

  // Configs
  const filtersConfig: FilterConfig[] = useMemo(
    () => [
      {
        key: "type",
        label: t("counterparties:counterpartiesPage.filter_type_label") || "Type",
        type: "toggle",
        options: [
          {
            value: "shop",
            label: t("counterparties:counterpartiesPage.filter_shop") || "Shop",
          },
          {
            value: "person",
            label: t("counterparties:counterpartiesPage.filter_person") || "Person",
          },
          {
            value: "other",
            label: t("counterparties:counterpartiesPage.filter_other") || "Other",
          },
        ],
      },
    ],
    [t]
  );

  const sortOptions = useMemo(
    () => [
      {
        value: "default",
        label: t("counterparties:counterpartiesPage.sort_default") || "Default",
      },
      {
        value: "name-asc",
        label: t("counterparties:counterpartiesPage.sort_name_asc") || "Name (A-Z)",
      },
      {
        value: "name-desc",
        label: t("counterparties:counterpartiesPage.sort_name_desc") || "Name (Z-A)",
      },
    ],
    [t]
  );

  return {
    state: {
      treeRoots,
      isLoading,
      searchQuery,
      filters,
      sortValue,
      selectedCp,
      selectedCat,
      itemToDelete,
      canManageStructure,
      actions,
    },
    configs: {
      filtersConfig,
      sortOptions,
    },
    handlers: {
      setSearchQuery,
      setFilters,
      setSortValue,
      handleEditClick,
      handleDeleteClick,
      handleClearFilters,
      handleCloseSelection,
    },
    t,
  };
};
