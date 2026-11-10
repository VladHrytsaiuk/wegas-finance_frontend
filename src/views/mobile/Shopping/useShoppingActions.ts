import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import {
  addShoppingItemApi,
  clearCompletedInListApi,
  createShoppingListApi,
  deleteShoppingItemApi,
  deleteShoppingListApi,
  toggleShoppingItemApi,
  updateShoppingItemApi,
  updateShoppingListApi,
  type ShoppingList,
} from "../../../services/apiShopping";

const KEY = ["shopping-lists"];

// Дії над списками покупок. Позначки «куплено», перейменування й видалення
// пунктів показуємо одразу (оптимістично) й відкочуємо, якщо сервер відмовив.

export function useShoppingActions() {
  const queryClient = useQueryClient();
  const refresh = () => queryClient.invalidateQueries({ queryKey: KEY });
  const fail = (message: string) => () => toast.error(message);

  const patchItems = (
    fn: (items: ShoppingList["items"]) => ShoppingList["items"],
    itemId: string,
  ) => {
    const previous = queryClient.getQueryData<ShoppingList[]>(KEY);
    queryClient.setQueryData<ShoppingList[]>(KEY, (lists = []) =>
      lists.map((list) =>
        list.items.some((i) => i.id === itemId)
          ? { ...list, items: fn(list.items) }
          : list,
      ),
    );
    return { previous };
  };
  const rollback = (ctx?: { previous?: ShoppingList[] }) => {
    if (ctx?.previous) queryClient.setQueryData(KEY, ctx.previous);
  };

  const createList = useMutation({
    mutationFn: createShoppingListApi,
    onSuccess: refresh,
    onError: fail("Не вдалося створити список"),
  });

  const updateList = useMutation({
    mutationFn: updateShoppingListApi,
    onSuccess: refresh,
    onError: fail("Не вдалося зберегти список"),
  });

  const deleteList = useMutation({
    mutationFn: deleteShoppingListApi,
    onSuccess: refresh,
    onError: fail("Не вдалося видалити список"),
  });

  const clearBought = useMutation({
    mutationFn: clearCompletedInListApi,
    onSuccess: refresh,
    onError: fail("Не вдалося очистити куплене"),
  });

  const addItem = useMutation({
    mutationFn: addShoppingItemApi,
    onSuccess: refresh,
    onError: fail("Не вдалося додати пункт"),
  });

  const toggleItem = useMutation({
    mutationFn: toggleShoppingItemApi,
    onMutate: ({ id, is_bought }) =>
      patchItems(
        (items) => items.map((i) => (i.id === id ? { ...i, is_bought } : i)),
        id,
      ),
    onError: (_e, _v, ctx) => {
      rollback(ctx);
      toast.error("Не вдалося відмітити пункт");
    },
    onSettled: refresh,
  });

  const renameItem = useMutation({
    mutationFn: updateShoppingItemApi,
    onMutate: ({ id, name }) =>
      patchItems(
        (items) =>
          items.map((i) => (i.id === id ? { ...i, name: name ?? i.name } : i)),
        id,
      ),
    onError: (_e, _v, ctx) => {
      rollback(ctx);
      toast.error("Не вдалося перейменувати пункт");
    },
    onSettled: refresh,
  });

  const deleteItem = useMutation({
    mutationFn: deleteShoppingItemApi,
    onMutate: (id) => patchItems((items) => items.filter((i) => i.id !== id), id),
    onError: (_e, _v, ctx) => {
      rollback(ctx);
      toast.error("Не вдалося видалити пункт");
    },
    onSettled: refresh,
  });

  return {
    createList,
    updateList,
    deleteList,
    clearBought,
    addItem,
    toggleItem,
    renameItem,
    deleteItem,
  };
}
