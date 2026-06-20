import api from "./Axios"; // Твій налаштований axios instance

export interface ExportParams {
  from: number;
  to: number;
  accountIds?: string[];
  categoryIds?: string[];
  counterpartyIds?: string[];
  userIds?: string[];
  type?: string[]; // income, expense
}

export const getExportData = async (params: ExportParams) => {
  // Axios автоматично серіалізує масиви як accountIds[]=1&accountIds[]=2
  // Якщо твій бек чекає через кому, треба буде викориstatи paramsSerializer,
  // але твій новий бекенд підтримує обидва варіанти.
  const { data } = await api.get("/export/transactions", { params });
  return data;
};

export const getExportBackup = async (): Promise<Blob> => {
	const response = await api.get("/export/backup", {
		responseType: 'blob',
	});
	return response.data;
};
