import api from "./Axios";
import type { WishlistItem, WishlistGroup } from "../types";

// --- GROUPS ---
export const getWishlistGroupsApi = async () => {
  const response = await api.get("/wishlist-groups");
  return response.data as WishlistGroup[];
};

export const createWishlistGroupApi = async (data: Partial<WishlistGroup>) => {
  const response = await api.post("/wishlist-groups", data);
  return response.data;
};

export const updateWishlistGroupApi = async ({
  id,
  ...data
}: Partial<WishlistGroup> & { id: string }) => {
  const response = await api.put(`/wishlist-groups/${id}`, data);
  return response.data;
};

export const deleteWishlistGroupApi = async (id: string) => {
  const response = await api.delete(`/wishlist-groups/${id}`);
  return response.data;
};

// --- ITEMS ---
export const getWishlistItemsApi = async (params?: any) => {
  const response = await api.get("/wishlist", { params });
  return response.data as WishlistItem[];
};

export const createWishlistItemApi = async (data: Partial<WishlistItem>) => {
  const response = await api.post("/wishlist", data);
  return response.data;
};

export const updateWishlistItemApi = async (data: Partial<WishlistItem>) => {
  const { id, ...rest } = data;
  const response = await api.put(`/wishlist/${id}`, rest);
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
