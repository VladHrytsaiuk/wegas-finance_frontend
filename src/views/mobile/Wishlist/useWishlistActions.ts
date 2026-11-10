import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import toast from "react-hot-toast";

import {
  createWishlistGroupApi,
  createWishlistItemApi,
  deleteWishlistGroupApi,
  deleteWishlistItemApi,
  deleteWishlistPhotoApi,
  toggleReservationApi,
  updateWishlistGroupApi,
  updateWishlistItemApi,
  uploadWishlistPhotoApi,
} from "../../../services/apiWishlist";
import type { WishlistGroup, WishlistItem } from "../../../types";

const message = (error: unknown, fallback: string) =>
  (axios.isAxiosError(error) && error.response?.data?.error) || fallback;

export type ItemPayload = Partial<WishlistItem> & {
  photoFile?: File | null;
  removePhoto?: boolean;
};

// Дії вішлісту: ті самі запити, що в старому useWishlist, але з готовністю
// дочекатись результату (mutateAsync), щоб панелі закривались після успіху.

export function useWishlistActions() {
  const queryClient = useQueryClient();
  const refreshItems = () =>
    queryClient.invalidateQueries({ queryKey: ["wishlist-items"] });
  const refreshGroups = () =>
    queryClient.invalidateQueries({ queryKey: ["wishlist-groups"] });

  const createItem = useMutation({
    mutationFn: async ({ photoFile, ...data }: ItemPayload) => {
      const created = await createWishlistItemApi(data);
      if (photoFile && created?.id) {
        await uploadWishlistPhotoApi({ id: created.id, file: photoFile });
      }
      return created;
    },
    onSuccess: refreshItems,
    onError: (e) => toast.error(message(e, "Не вдалося додати бажання")),
  });

  const updateItem = useMutation({
    mutationFn: async ({ photoFile, removePhoto, ...data }: ItemPayload & { id: string }) => {
      const updated = await updateWishlistItemApi(data);
      if (photoFile) await uploadWishlistPhotoApi({ id: data.id, file: photoFile });
      else if (removePhoto) await deleteWishlistPhotoApi(data.id);
      return updated;
    },
    onSuccess: refreshItems,
    onError: (e) => toast.error(message(e, "Не вдалося зберегти бажання")),
  });

  const deleteItem = useMutation({
    mutationFn: deleteWishlistItemApi,
    onSuccess: refreshItems,
    onError: (e) => toast.error(message(e, "Не вдалося видалити бажання")),
  });

  const toggleReservation = useMutation({
    mutationFn: toggleReservationApi,
    onSettled: refreshItems,
    onError: (e) => toast.error(message(e, "Не вдалося змінити резерв")),
  });

  const createGroup = useMutation({
    mutationFn: (data: Partial<WishlistGroup>) => createWishlistGroupApi(data),
    onSuccess: refreshGroups,
    onError: (e) => toast.error(message(e, "Не вдалося створити групу")),
  });

  const updateGroup = useMutation({
    mutationFn: (data: Partial<WishlistGroup> & { id: string }) =>
      updateWishlistGroupApi(data),
    onSuccess: refreshGroups,
    onError: (e) => toast.error(message(e, "Не вдалося зберегти групу")),
  });

  const deleteGroup = useMutation({
    mutationFn: deleteWishlistGroupApi,
    onSuccess: () => {
      refreshGroups();
      refreshItems();
    },
    onError: (e) => toast.error(message(e, "Не вдалося видалити групу")),
  });

  return {
    createItem,
    updateItem,
    deleteItem,
    toggleReservation,
    createGroup,
    updateGroup,
    deleteGroup,
  };
}
