import api from "./Axios";

export interface StorageType {
  id: string;
  name: string;
  slug: string;
  icon: string;
  is_system: boolean;
}

export const getStorageTypesApi = async () => {
  const response = await api.get("/storage-types");
  return response.data;
};

export const createStorageTypeApi = async (data: any) => {
  const response = await api.post("/storage-types", data);
  return response.data;
};

export const deleteStorageTypeApi = async (id: string) => {
  const response = await api.delete(`/storage-types/${id}`);
  return response.data;
};
