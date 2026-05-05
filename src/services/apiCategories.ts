import api from "./Axios";

export const getCategoriesApi = async () => {
  const response = await api.get("/categories");
  return response.data;
};

export const createCategoryApi = async (data: any) => {
  // data: { name, type, icon, color }
  const response = await api.post("/categories", data);
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
  [key: string]: any;
}) => {
  const response = await api.put(`/categories/${id}`, data);
  return response.data;
};
