import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "react-hot-toast";

import {
  getWishlistItemsApi,
  createWishlistItemApi,
  updateWishlistItemApi,
  deleteWishlistItemApi,
  uploadWishlistPhotoApi,
  deleteWishlistPhotoApi,
  getWishlistGroupsApi,
  createWishlistGroupApi,
  updateWishlistGroupApi,
  deleteWishlistGroupApi,
  toggleReservationApi, // <-- Import
} from "../../services/apiWishlist";

import type { WishlistItem, WishlistGroup } from "../../types";

export const useWishlist = (filters?: any) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  // --- FETCH ITEMS ---
  const { data: items = [], isLoading: isLoadingItems } = useQuery<
    WishlistItem[]
  >({
    queryKey: ["wishlist-items", filters],
    queryFn: () => getWishlistItemsApi(filters),
  });

  // --- FETCH GROUPS ---
  const { data: groups = [], isLoading: isLoadingGroups } = useQuery<
    WishlistGroup[]
  >({
    queryKey: ["wishlist-groups"],
    queryFn: getWishlistGroupsApi,
  });

  // --- GROUPS MUTATIONS ---
  const createGroup = useMutation({
    mutationFn: createWishlistGroupApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist-groups"] });
      toast.success(t("wishlist.group_created", "Групу створено"));
    },
    onError: () =>
      toast.error(t("common.error_occurred", "Помилка створення групи")),
  });

  const updateGroup = useMutation({
    mutationFn: updateWishlistGroupApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist-groups"] });
      toast.success(t("wishlist.group_updated", "Групу оновлено"));
    },
    onError: (err: any) => {
      toast.error(
        err.response?.data?.error ||
          t("wishlist.error_update_group", "Помилка оновлення"),
      );
    },
  });

  const deleteGroup = useMutation({
    mutationFn: deleteWishlistGroupApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist-groups"] });
      queryClient.invalidateQueries({ queryKey: ["wishlist-items"] });
      toast.success(t("wishlist.group_deleted", "Групу видалено"));
    },
    onError: () =>
      toast.error(t("common.error_occurred", "Помилка видалення групи")),
  });

  // --- ITEMS MUTATIONS ---
  const createItem = useMutation({
    mutationFn: async (
      data: Partial<WishlistItem> & { photoFile?: File | null },
    ) => {
      const { photoFile, ...itemData } = data;
      const createdItem = await createWishlistItemApi(itemData);

      if (photoFile && createdItem?.id) {
        await uploadWishlistPhotoApi({ id: createdItem.id, file: photoFile });
      }
      return createdItem;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist-items"] });
      toast.success(t("wishlist.item_created", "Додано у вішліст"));
    },
    onError: () => toast.error(t("common.error_occurred", "Помилка додавання")),
  });

  const updateItem = useMutation({
    mutationFn: async (
      data: Partial<WishlistItem> & {
        photoFile?: File | null;
        removePhoto?: boolean;
      },
    ) => {
      const { photoFile, removePhoto, ...itemData } = data;
      const updatedItem = await updateWishlistItemApi(itemData);

      if (photoFile && itemData.id) {
        await uploadWishlistPhotoApi({ id: itemData.id, file: photoFile });
      } else if (removePhoto && itemData.id) {
        await deleteWishlistPhotoApi(itemData.id);
      }

      return updatedItem;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist-items"] });
      toast.success(t("wishlist.item_updated", "Бажання оновлено"));
    },
    onError: () => toast.error(t("common.error_occurred", "Помилка оновлення")),
  });

  const deleteItem = useMutation({
    mutationFn: deleteWishlistItemApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist-items"] });
      toast.success(t("wishlist.item_deleted", "Видалено з вішліста"));
    },
    onError: () => toast.error(t("common.error_occurred", "Помилка видалення")),
  });

  // 🔥 НОВА МУТАЦІЯ: Резервація
  const toggleReservation = useMutation({
    mutationFn: toggleReservationApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist-items"] });
      // Можна без тоста, або короткий
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || t("common.error_occurred"));
    },
  });

  const uploadPhoto = useMutation({
    mutationFn: uploadWishlistPhotoApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist-items"] });
    },
    onError: () =>
      toast.error(t("common.error_occurred", "Помилка завантаження фото")),
  });

  const deletePhoto = useMutation({
    mutationFn: deleteWishlistPhotoApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist-items"] });
    },
    onError: () =>
      toast.error(t("common.error_occurred", "Помилка видалення фото")),
  });

  return {
    items,
    groups,
    isLoading: isLoadingItems || isLoadingGroups,
    handlers: {
      createGroup: (
        name: string,
        color: string,
        icon: string,
        visibility: "public" | "private" | "hidden",
        hiddenFrom: string,
      ) =>
        createGroup.mutate({
          name,
          color,
          icon,
          visibility,
          hidden_from: hiddenFrom,
        }),
      updateGroup: (
        id: string,
        name: string,
        color: string,
        icon: string,
        visibility: "public" | "private" | "hidden",
        hiddenFrom: string,
      ) =>
        updateGroup.mutate({
          id,
          name,
          color,
          icon,
          visibility,
          hidden_from: hiddenFrom,
        }),
      deleteGroup: (id: string) => deleteGroup.mutate(id),

      createItem: (data: Partial<WishlistItem> & { photoFile?: File | null }) =>
        createItem.mutate(data),
      updateItem: (
        data: Partial<WishlistItem> & {
          photoFile?: File | null;
          removePhoto?: boolean;
        },
      ) => updateItem.mutate(data),
      deleteItem: (id: string) => deleteItem.mutate(id),

      toggleReservation: (id: string) => toggleReservation.mutate(id), // <-- Expose

      uploadPhoto: (id: string, file: File) => uploadPhoto.mutate({ id, file }),
      deletePhoto: (id: string) => deletePhoto.mutate(id),
    },
    t,
  };
};
