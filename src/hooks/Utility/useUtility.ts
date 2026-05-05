import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
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

// 1. Список лічильників
export function useUtilityMeters() {
  const queryClient = useQueryClient();

  const { data: meters = [], isLoading } = useQuery({
    queryKey: ["utilityMeters"],
    queryFn: getMeters,
  });

  const { mutate: create } = useMutation({
    mutationFn: createMeter,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["utilityMeters"] });
      toast.success("Послугу додано успішно");
    },
    onError: (err: any) => toast.error(err.message),
  });

  const { mutate: update } = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      updateMeter(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["utilityMeters"] });
      toast.success("Послугу оновлено");
    },
  });

  const { mutate: remove } = useMutation({
    mutationFn: deleteMeter,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["utilityMeters"] });
      toast.success("Послугу видалено");
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
      toast.success("Показник додано");
    },
    onError: (err: any) =>
      toast.error(err?.response?.data?.error || "Не вдалося додати показник"),
  });

  const { mutate: removeReading } = useMutation({
    mutationFn: deleteReading,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["utilityReadings", meterId] });
      queryClient.invalidateQueries({ queryKey: ["utilityMeters"] });
      toast.success("Показник видалено");
    },
  });

  return { readings, isLoading, addReading, removeReading };
}

// 4. Дії з показниками (Оплата / Статус)
export function useUtilityReadingActions() {
  const queryClient = useQueryClient();

  // Зміна статусу "Оплачено/Борг" (використовується в UtilityDetails)
  const { mutate: togglePaid } = useMutation({
    mutationFn: ({ id, isPaid }: { id: string; isPaid: boolean }) =>
      updateReadingStatus(id, isPaid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["utilityReadings"] });
      queryClient.invalidateQueries({ queryKey: ["utilityMeters"] }); // Оновлюємо борг на картці
    },
    onError: (err: any) => toast.error("Помилка оновлення статусу"),
  });

  // Оплата через гаманець (якщо раптом знадобиться прямий виклик API, а не через форму)
  const { mutate: pay } = useMutation({
    mutationFn: ({ id, accountId }: { id: string; accountId: string }) =>
      payReading(id, accountId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["utilityReadings"] });
      queryClient.invalidateQueries({ queryKey: ["utilityMeters"] });
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      toast.success("Оплату проведено успішно");
    },
    onError: (err: any) => toast.error(err.message),
  });

  return { togglePaid, pay };
}
