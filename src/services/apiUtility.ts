import api from "./Axios";
import type {
  UtilityMeter,
  UtilityReading,
  UtilityGlobalStat, // <--- Імпортуй нові типи
  UtilityMeterStat,
} from "../types";

// === METERS ===
export const getMeters = async (): Promise<UtilityMeter[]> => {
  const { data } = await api.get("/utility/meters");
  return data;
};

export const createMeter = async (meter: Partial<UtilityMeter>) => {
  const { data } = await api.post("/utility/meters", meter);
  return data;
};

export const updateMeter = async (id: string, meter: Partial<UtilityMeter>) => {
  const { data } = await api.put(`/utility/meters/${id}`, meter);
  return data;
};

export const deleteMeter = async (id: string) => {
  await api.delete(`/utility/meters/${id}`);
};

// === READINGS ===
export const getReadings = async (
  meterId: string,
): Promise<UtilityReading[]> => {
  const { data } = await api.get(`/utility/readings?meter_id=${meterId}`);
  return data;
};

export const createReading = async (reading: Partial<UtilityReading>) => {
  const { data } = await api.post("/utility/readings", reading);
  return data;
};

export const deleteReading = async (id: string) => {
  await api.delete(`/utility/readings/${id}`);
};

// src/services/apiUtility.ts
export const getMeterById = async (id: string): Promise<UtilityMeter> => {
  const { data } = await api.get(`/utility/meters/${id}`);
  return data;
};

// Додаємо метод для зміни статусу оплати (або будь-якого update)
export const updateReadingStatus = async (id: string, isPaid: boolean) => {
  const { data } = await api.put(`/utility/readings/${id}`, {
    is_paid: isPaid,
  });
  return data;
};

// Замінюємо старий updateReadingStatus на новий payReading
export const payReading = async (id: string, accountId: string) => {
  const { data } = await api.post(`/utility/readings/${id}/pay`, {
    account_id: accountId,
  });
  return data;
};

export const patchUtilityReading = async (
  id: string,
  data: Partial<UtilityReading>,
) => {
  const response = await api.patch<UtilityReading>(`/utility/readings/${id}`, data);
  return response.data;
};

export const getGlobalUtilityStats = async (): Promise<UtilityGlobalStat[]> => {
  const { data } = await api.get("/utility/stats/global");
  return data;
};

export const getMeterStats = async (
  meterId: string,
): Promise<UtilityMeterStat[]> => {
  const { data } = await api.get(`/utility/stats/meter/${meterId}`);
  return data;
};
