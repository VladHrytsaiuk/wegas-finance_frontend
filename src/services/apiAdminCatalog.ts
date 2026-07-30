import api from "./Axios";
import type { Category, CounterpartyCategory } from "../types";

export const getAdminStatusApi = async () => {
  const response = await api.get<{ status: string }>("/admin/status");
  return response.data;
};

export const getAdminCategoriesApi = async () => {
  const response = await api.get<Category[]>("/admin/catalog/categories");
  return response.data;
};

export type AdminCategoryInput = {
  name: string;
  type: string;
  icon: string;
  color: string;
  parent_id?: string | null;
  system_key: string;
};

export const updateAdminCategoryApi = async (id: string, input: AdminCategoryInput) =>
  (await api.put(`/admin/catalog/categories/${id}`, input)).data;
export const createAdminCategoryApi = async (input: AdminCategoryInput) =>
  (await api.post("/admin/catalog/categories", input)).data;
export const archiveAdminCategoryApi = async (id: string) => api.delete(`/admin/catalog/categories/${id}`);

export const getAdminCounterpartyCategoriesApi = async () => {
  const response = await api.get<CounterpartyCategory[]>("/admin/catalog/counterparty-categories");
  return response.data;
};

export type AdminCounterpartyCategoryInput = {
  name: string;
  type: string;
  icon: string;
  color: string;
  system_key: string;
};

export const updateAdminCounterpartyCategoryApi = async (
  id: string,
  input: AdminCounterpartyCategoryInput,
) => (await api.put(`/admin/catalog/counterparty-categories/${id}`, input)).data;
export const createAdminCounterpartyCategoryApi = async (input: AdminCounterpartyCategoryInput) =>
  (await api.post("/admin/catalog/counterparty-categories", input)).data;
export const archiveAdminCounterpartyCategoryApi = async (id: string) => api.delete(`/admin/catalog/counterparty-categories/${id}`);

export type AdminCounterparty = {
  id: string;
  name: string;
  type: string;
  icon?: string;
  logo?: string;
  system_key?: string;
  usage_count?: number;
  category_id?: string | null;
  category?: { id?: string; name: string } | null;
};

export const getAdminCounterpartiesApi = async () => {
  const response = await api.get<AdminCounterparty[]>("/admin/catalog/counterparties");
  return response.data;
};

export type AdminCounterpartyInput = {
  name: string;
  type: string;
  icon: string;
  logo: string;
  category_id?: string | null;
  system_key: string;
};

export const updateAdminCounterpartyApi = async (id: string, input: AdminCounterpartyInput) =>
  (await api.put(`/admin/catalog/counterparties/${id}`, input)).data;
export const createAdminCounterpartyApi = async (input: AdminCounterpartyInput) =>
  (await api.post("/admin/catalog/counterparties", input)).data;
export const archiveAdminCounterpartyApi = async (id: string) => api.delete(`/admin/catalog/counterparties/${id}`);
