// src/services/apiAssets.ts

import api from "./Axios";
import { type Asset, type AssetDocument } from "../types";

export const getAssets = async (): Promise<Asset[]> => {
  const { data } = await api.get("/assets");
  return data;
};

export const createAsset = async (asset: Partial<Asset>) => {
  const { data } = await api.post<{ id: string }>("/assets", asset);
  return data;
};

export const deleteAsset = async (id: string) => {
  await api.delete(`/assets/${id}`);
};

export const uploadAssetPhoto = async ({
  id,
  file,
}: {
  id: string;
  file: File;
}) => {
  const formData = new FormData();
  formData.append("file", file);

  const { data } = await api.post(`/assets/${id}/photo`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

export const getAssetById = async (id: string): Promise<Asset> => {
  const { data } = await api.get(`/assets/${id}`);
  return data;
};

export const updateAsset = async (id: string, asset: Partial<Asset>) => {
  const { data } = await api.put(`/assets/${id}`, asset);
  return data;
};

export const updateAssetMileage = async (id: string, mileage: number) => {
  const { data } = await api.patch(`/assets/${id}/mileage`, { mileage });
  return data;
};

export const deleteAssetPhoto = async (id: string, path: string) => {
  const { data } = await api.delete(`/assets/${id}/photo`, {
    params: { path },
  });
  return data;
};

// 🔥 НОВІ МЕТОДИ ДЛЯ ДОКУМЕНТІВ
export const uploadAssetDocument = async ({
  id,
  file,
}: {
  id: string;
  file: File;
}): Promise<AssetDocument> => {
  const formData = new FormData();
  formData.append("file", file);

  const { data } = await api.post(`/assets/${id}/documents`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

export const deleteAssetDocument = async (id: string, docId: string) => {
  const { data } = await api.delete(`/assets/${id}/documents/${docId}`);
  return data;
};
