import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import {
  getMeters,
  createMeter,
  updateMeter,
  deleteMeter,
  getReadings,
  createReading,
  deleteReading,
  getMeterById, // ✅ Переконайся, що це імпортовано
  updateReadingStatus,
  payReading,
} from "../../services/apiUtility";
import type { UtilityMeter } from "../../types";

// 1. Список лічильників
export function useUtilityMeters() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const { data: meters = [], isLoading } = useQuery({
    queryKey: ["utilityMeters"],
    queryFn: getMeters,
  });

  const { mutate: create } = useMutation({
    mutationFn: createMeter,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["utilityMeters"] });
      toast.success(t("stats_utility:utility.toast_create_success"));
    },
    onError: (error: unknown) =>
      toast.error(
        axios.isAxiosError(error)
          ? error.message
          : t("common:common.error_occurred"),
      ),
  });

  const { mutate: update } = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<UtilityMeter> }) =>
      updateMeter(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["utilityMeters"] });
      toast.success(t("stats_utility:utility.toast_update_success"));
    },
  });

  const { mutate: remove } = useMutation({
    mutationFn: deleteMeter,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["utilityMeters"] });
      toast.success(t("stats_utility:utility.toast_delete_success"));
    },
  });

  return { meters, isLoading, create, update, remove };
}

// 2. Один лічильник (Деталі) - ✅ ДОДАНО ПРОПУЩЕНИЙ ЕКСПОРТ
export function useUtilityMeter(id: string) {
  const { data: meter, isLoading } = useQuery({
    queryKey: ["utilityMeter", id],
    queryFn: () => getMeterById(id),
    enabled: !!id,
  });
  return { meter, isLoading };
}

// 3. Показники
export function useUtilityReadings(meterId: string | null) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const { data: readings = [], isLoading } = useQuery({
    queryKey: ["utilityReadings", meterId],
    queryFn: () => getReadings(meterId!),
    enabled: !!meterId,
  });

  const { mutate: addReading } = useMutation({
    mutationFn: createReading,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["utilityReadings", meterId] });
      queryClient.invalidateQueries({ queryKey: ["utilityMeters"] });
      toast.success(t("stats_utility:utility.toast_reading_add_success"));
    },
    onError: (error: unknown) =>
      toast.error(
        (axios.isAxiosError(error) ? error.response?.data?.error : undefined) ||
          t("stats_utility:utility.toast_reading_add_error"),
      ),
  });

  const { mutate: removeReading } = useMutation({
    mutationFn: deleteReading,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["utilityReadings", meterId] });
      queryClient.invalidateQueries({ queryKey: ["utilityMeters"] });
      toast.success(t("stats_utility:utility.toast_reading_delete_success"));
    },
  });

  return { readings, isLoading, addReading, removeReading };
}

// 4. Дії з показниками (Оплата / Статус)
export function useUtilityReadingActions() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  // Зміна статусу "Оплачено/Борг" (використовується в UtilityDetails)
  const { mutate: togglePaid } = useMutation({
    mutationFn: ({ id, isPaid }: { id: string; isPaid: boolean }) =>
      updateReadingStatus(id, isPaid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["utilityReadings"] });
      queryClient.invalidateQueries({ queryKey: ["utilityMeters"] }); // Оновлюємо борг на картці
      toast.success(t("stats_utility:utility.toast_status_update_success"));
    },
    onError: () =>
      toast.error(t("stats_utility:utility.toast_status_update_error")),
  });

  // Оплата через гаманець (якщо раптом знадобиться прямий виклик API, а не через форму)
  const { mutate: pay } = useMutation({
    mutationFn: ({ id, accountId }: { id: string; accountId: string }) =>
      payReading(id, accountId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["utilityReadings"] });
      queryClient.invalidateQueries({ queryKey: ["utilityMeters"] });
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      toast.success(t("stats_utility:utility.toast_pay_success"));
    },
    onError: (error: unknown) =>
      toast.error(
        axios.isAxiosError(error)
          ? error.message
          : t("common:common.error_occurred"),
      ),
  });

  return { togglePaid, pay };
}
