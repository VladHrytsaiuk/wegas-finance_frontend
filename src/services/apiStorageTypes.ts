import api from "./Axios";
import type { StorageType } from "../types";

export const getStorageTypesApi = async () => {
  const response = await api.get<StorageType[]>("/storage-types");
  return response.data;
};

export type StorageTypePayload = Pick<StorageType, "name" | "slug" | "icon">;

export const createStorageTypeApi = async (data: StorageTypePayload) => {
  const response = await api.post<StorageType>("/storage-types", data);
  return response.data;
};

export const deleteStorageTypeApi = async (id: string) => {
  const response = await api.delete(`/storage-types/${id}`);
  return response.data;
};
