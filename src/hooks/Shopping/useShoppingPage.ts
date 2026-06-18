import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "react-hot-toast";

import {
  getShoppingListsApi,
  createShoppingListApi,
  updateShoppingListApi,
  deleteShoppingListApi,
  clearCompletedInListApi,
  addShoppingItemApi,
  toggleShoppingItemApi,
  deleteShoppingItemApi,
} from "../../services/apiShopping";

import type { ShoppingList } from "../../services/apiShopping";

export const useShopping = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  // --- FETCH ---
  const { data: lists = [], isLoading } = useQuery<ShoppingList[]>({
    queryKey: ["shopping-lists"],
    queryFn: getShoppingListsApi,
  });

  // --- LISTS MUTATIONS ---
  const createList = useMutation({
    mutationFn: createShoppingListApi,
    onSuccess: (newList) => {
      queryClient.setQueryData<ShoppingList[]>(["shopping-lists"], (oldLists) => {
        const formattedNew = { ...newList, items: newList.items || [] };
        if (!oldLists) return [formattedNew];
        return [formattedNew, ...oldLists];
      });
      queryClient.invalidateQueries({ queryKey: ["shopping-lists"] });
    },
    onError: () => toast.error(t("common:common.error_occurred", "Помилка створення")),
  });

  const updateList = useMutation({
    mutationFn: updateShoppingListApi,
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["shopping-lists"] });
    },
  });

  const deleteList = useMutation({
    mutationFn: deleteShoppingListApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shopping-lists"] });
      toast.success(t("shopping_wishlist:shopping.list_deleted", "Список видалено"));
    },
    onError: () => toast.error(t("common:common.error_occurred", "Помилка видалення")),
  });

  const clearCompleted = useMutation({
    mutationFn: clearCompletedInListApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shopping-lists"] });
      toast.success(t("shopping_wishlist:shopping.cleared", "Очищено"));
    },
  });

  // --- ITEMS MUTATIONS ---
  const addItem = useMutation({
    mutationFn: addShoppingItemApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shopping-lists"] });
    },
    onError: () =>
      toast.error(t("common:common.error_occurred", "Не вдалося додати пункт")),
  });

  const toggleItem = useMutation({
    mutationFn: toggleShoppingItemApi,
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["shopping-lists"] });
    },
  });

  const deleteItem = useMutation({
    mutationFn: deleteShoppingItemApi,
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["shopping-lists"] });
    },
  });

  return {
    lists,
    isLoading,
    handlers: {
      createList: (
        title: string,
        color: string,
        visibility: string,
        hiddenFrom: string,
      ) =>
        createList.mutateAsync({
          title,
          color,
          visibility,
          hidden_from: hiddenFrom,
        }),

      updateListColor: (id: string, color: string) =>
        updateList.mutate({ id, color }),

      updateListVisibility: (
        id: string,
        visibility: string,
        hiddenFrom: string,
      ) => updateList.mutate({ id, visibility, hidden_from: hiddenFrom }),

      // 🔥 НОВИЙ ХЕНДЛЕР ДЛЯ НАЗВИ
      updateListTitle: (id: string, title: string) =>
        updateList.mutate({ id, title }),

      deleteList: (id: string) => deleteList.mutate(id),
      clearCompleted: (listId: string) => clearCompleted.mutate(listId),
      addItem: (listId: string, name: string) =>
        addItem.mutate({ listId, name }),
      toggleItem: (id: string, is_bought: boolean) =>
        toggleItem.mutate({ id, is_bought }),
      deleteItem: (id: string) => deleteItem.mutate(id),
    },
    t,
  };
};
