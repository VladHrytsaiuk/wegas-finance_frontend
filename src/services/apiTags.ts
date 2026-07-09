import api from "./Axios";
import type { Tag } from "../types";

export const getTagsApi = async () => {
  const response = await api.get<Tag[]>("/tags");
  return response.data;
};

export const createTagApi = async (data: { name: string; color: string }) => {
  const response = await api.post<Tag>("/tags", data);
  return response.data;
};

// ... в кінці файлу
export const deleteTagApi = async (id: string) => {
  const response = await api.delete(`/tags/${id}`);
  return response.data;
};
