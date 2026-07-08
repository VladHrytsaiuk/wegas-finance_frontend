import api from "./Axios";
import type { WishlistItem, WishlistGroup } from "../types";

export interface WishlistItemsQuery {
  group_id?: string;
  visibility?: WishlistItem["visibility"];
  status?: WishlistItem["status"];
}

// --- GROUPS ---
export const getWishlistGroupsApi = async () => {
  const response = await api.get<WishlistGroup[]>("/wishlist-groups");
  return response.data;
};

export const createWishlistGroupApi = async (data: Partial<WishlistGroup>) => {
  const response = await api.post<WishlistGroup>("/wishlist-groups", data);
  return response.data;
};

export const updateWishlistGroupApi = async ({
  id,
  ...data
}: Partial<WishlistGroup> & { id: string }) => {
  const response = await api.put<WishlistGroup>(`/wishlist-groups/${id}`, data);
  return response.data;
};

export const deleteWishlistGroupApi = async (id: string) => {
  const response = await api.delete(`/wishlist-groups/${id}`);
  return response.data;
};

// --- ITEMS ---
export const getWishlistItemsApi = async (params?: WishlistItemsQuery) => {
  const response = await api.get<WishlistItem[]>("/wishlist", { params });
  return response.data;
};

export const createWishlistItemApi = async (data: Partial<WishlistItem>) => {
  const response = await api.post<WishlistItem>("/wishlist", data);
  return response.data;
};

export const updateWishlistItemApi = async (
  data: Partial<WishlistItem> & { id: string },
) => {
  const { id, ...rest } = data;
  const response = await api.put<WishlistItem>(`/wishlist/${id}`, rest);
  return response.data;
};

export const deleteWishlistItemApi = async (id: string) => {
  const response = await api.delete(`/wishlist/${id}`);
  return response.data;
};

// 🔥 НОВЕ: Резервація
export const toggleReservationApi = async (id: string) => {
  const response = await api.post(`/wishlist/${id}/reserve`);
  return response.data;
};

// --- PHOTO ---
export const uploadWishlistPhotoApi = async ({
  id,
  file,
}: {
  id: string;
  file: File;
}) => {
  const formData = new FormData();
  formData.append("photo", file);

  const response = await api.post(`/wishlist/${id}/photo`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const deleteWishlistPhotoApi = async (id: string) => {
  const response = await api.delete(`/wishlist/${id}/photo`);
  return response.data;
};
