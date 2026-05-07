import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useUtilityMeter, useUtilityReadings } from "./useUtility";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";
// 🔥 Імпортуємо новий метод API
import { patchUtilityReading } from "../../services/apiUtility";

export const useUtilityDetails = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // 1. Data Fetching
  const { meter, isLoading: loadingMeter } = useUtilityMeter(id || "");
  const {
    readings,
    isLoading: loadingReadings,
    removeReading,
  } = useUtilityReadings(id || "");

  // togglePaid нам більше не потрібен тут, ми зробимо своє оновлення
  // const { togglePaid } = useUtilityReadingActions();

  // 2. Local State
  const [readingToDelete, setReadingToDelete] = useState<string | null>(null);

  // 3. Calculations
  const totalDebt = useMemo(() => {
    return readings
      .filter((r) => !r.is_paid)
      .reduce((sum, r) => sum + r.calculated_cost, 0);
  }, [readings]);

  const lastReadingDate = readings.length > 0 ? readings[0].date : null;

  // 4. Handlers
  const handleBack = () => navigate("/utility");

  const handleDeleteConfirm = () => {
    if (readingToDelete) {
      removeReading(readingToDelete);
      setReadingToDelete(null);
    }
  };

  // 🔥 ВИПРАВЛЕНИЙ МЕТОД
  // Тепер він дійсно відправляє transaction_id на сервер
  const updateReadingStatus = async (payload: {
    id: string;
    is_paid: boolean;
    transaction_id?: string;
  }) => {
    try {
      // Викликаємо API напряму
      await patchUtilityReading(payload.id, {
        is_paid: payload.is_paid,
        transaction_id: payload.transaction_id,
      });

      // Інвалідуємо кеш, щоб оновити таблицю і борг
      await queryClient.invalidateQueries({ queryKey: ["utilityReadings"] });
      await queryClient.invalidateQueries({ queryKey: ["utilityMeters"] });
      await queryClient.invalidateQueries({ queryKey: ["counterparties"] });

      toast.success(t("stats_utility:utility.toast_status_update_success"));
    } catch (err) {
      console.error(err);
      toast.error(t("stats_utility:utility.toast_status_update_error"));
    }
  };

  // Старий метод (можна залишити для сумісності або видалити)
  const handleToggleStatus = (id: string, isPaid: boolean) =>
    updateReadingStatus({ id, is_paid: isPaid });

  return {
    data: {
      meter,
      readings,
      totalDebt,
      lastReadingDate,
    },
    state: {
      isLoading: loadingMeter || loadingReadings,
      readingToDelete,
    },
    actions: {
      setReadingToDelete,
      handleDeleteConfirm,
      handleToggleStatus,
      updateReadingStatus, // Експортуємо виправлену функцію
      handleBack,
    },
  };
};
