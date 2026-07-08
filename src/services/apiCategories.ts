import api from "./Axios";
import type { Category } from "../types";

export type CategoryPayload = Pick<Category, "name" | "type" | "icon" | "color"> & {
  parent_id?: string;
};

export const getCategoriesApi = async () => {
  const response = await api.get<Category[]>("/categories");
  return response.data;
};

export const createCategoryApi = async (data: CategoryPayload) => {
  const response = await api.post<Category>("/categories", data);
  return response.data;
};

export const deleteCategoryApi = async (id: string) => {
  const response = await api.delete(`/categories/${id}`);
  return response.data;
};

export const updateCategoryApi = async ({
  id,
  ...data
}: {
  id: string;
} & Partial<CategoryPayload>) => {
  const response = await api.put<Category>(`/categories/${id}`, data);
  return response.data;
};
