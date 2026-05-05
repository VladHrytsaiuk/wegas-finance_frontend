import api from "./Axios";
import { type Counterparty, type CounterpartyCategory } from "../types/index";

// --- COUNTERPARTIES ---

export const getCounterpartiesApi = async () => {
  const response = await api.get<Counterparty[]>("/counterparties");
  return response.data;
};

// При створенні ми тепер можемо передати category_id
export const createCounterpartyApi = async (data: Partial<Counterparty>) => {
  const response = await api.post<Counterparty>("/counterparties", data);
  return response.data;
};

export const updateCounterpartyApi = async (
  data: Partial<Counterparty> & { id: string },
) => {
  const { id, ...body } = data;
  const response = await api.put<Counterparty>(`/counterparties/${id}`, body);
  return response.data;
};

export const deleteCounterpartyApi = async (id: string) => {
  const response = await api.delete(`/counterparties/${id}`);
  return response.data;
};
// --- COUNTERPARTY CATEGORIES (НОВЕ) ---

export const getCpCategoriesApi = async () => {
  const response = await api.get<CounterpartyCategory[]>(
    "/counterparty-categories",
  );
  return response.data;
};

export const createCpCategoryApi = async (
  data: Partial<CounterpartyCategory>,
) => {
  const response = await api.post<CounterpartyCategory>(
    "/counterparty-categories",
    data,
  );
  return response.data;
};

export const updateCpCategoryApi = async (
  data: Partial<CounterpartyCategory> & { id: string },
) => {
  const { id, ...body } = data;
  const response = await api.put<CounterpartyCategory>(
    `/counterparty-categories/${id}`,
    body,
  );
  return response.data;
};

export const deleteCpCategoryApi = async (id: string) => {
  const response = await api.delete(`/counterparty-categories/${id}`);
  return response.data;
};

export const getCounterpartyApi = async (id: string) => {
  const response = await api.get<Counterparty>(`/counterparties/${id}`);
  return response.data;
};
