import api from "./Axios";

export const getTagsApi = async () => {
  const response = await api.get("/tags");
  return response.data;
};

export const createTagApi = async (data: { name: string; color: string }) => {
  const response = await api.post("/tags", data);
  return response.data;
};

// ... в кінці файлу
export const deleteTagApi = async (id: string) => {
  const response = await api.delete(`/tags/${id}`);
  return response.data;
};
