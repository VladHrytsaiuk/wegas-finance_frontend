import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next"; // ⬅️ ІМПОРТ ДЛЯ ПЕРЕКЛАДУ
import {
  getCounterpartiesApi,
  createCounterpartyApi,
  updateCounterpartyApi,
  deleteCounterpartyApi,
  getCpCategoriesApi,
  createCpCategoryApi,
  updateCpCategoryApi,
  deleteCpCategoryApi,
} from "../../services/apiCounterparties";

export function useCounterpartyData() {
  const { t } = useTranslation(); // ⬅️ ВИКОРИСТАННЯ ХУКА
  const queryClient = useQueryClient();

  // --- QUERIES ---
  const { data: counterparties = [], isLoading: isLoadingCps } = useQuery({
    queryKey: ["counterparties"],
    queryFn: getCounterpartiesApi,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["counterparty-categories"],
    queryFn: getCpCategoriesApi,
  });

  // --- MUTATIONS: Categories ---
  const createCat = useMutation({
    mutationFn: createCpCategoryApi,
    onSuccess: () => {
      // ➡️ ПЕРЕКЛАД
      toast.success(t("counterparties:counterpartyDataHook.cat_create_success"));
      queryClient.invalidateQueries({ queryKey: ["counterparty-categories"] });
    },
  });

  const updateCat = useMutation({
    mutationFn: updateCpCategoryApi,
    onSuccess: () => {
      // ➡️ ПЕРЕКЛАД
      toast.success(t("counterparties:counterpartyDataHook.cat_update_success"));
      queryClient.invalidateQueries({ queryKey: ["counterparty-categories"] });
      queryClient.invalidateQueries({ queryKey: ["counterparties"] });
    },
  });

  const deleteCat = useMutation({
    mutationFn: deleteCpCategoryApi,
    onSuccess: () => {
      // ➡️ ПЕРЕКЛАД
      toast.success(t("counterparties:counterpartyDataHook.cat_delete_success"));
      queryClient.invalidateQueries({ queryKey: ["counterparty-categories"] });
      queryClient.invalidateQueries({ queryKey: ["counterparties"] });
    },
    onError: () =>
      // ➡️ ПЕРЕКЛАД
      toast.error(t("counterparties:counterpartyDataHook.cat_delete_error")),
  });

  // --- MUTATIONS: Counterparties ---
  const createCp = useMutation({
    mutationFn: createCounterpartyApi,
    onSuccess: () => {
      // ➡️ ПЕРЕКЛАД
      toast.success(t("counterparties:counterpartyDataHook.cp_create_success"));
      queryClient.invalidateQueries({ queryKey: ["counterparties"] });
    },
  });

  const updateCp = useMutation({
    mutationFn: updateCounterpartyApi,
    onSuccess: () => {
      // ➡️ ПЕРЕКЛАД
      toast.success(t("counterparties:counterpartyDataHook.cp_update_success"));
      queryClient.invalidateQueries({ queryKey: ["counterparties"] });
    },
  });

  const deleteCp = useMutation({
    mutationFn: deleteCounterpartyApi,
    onSuccess: () => {
      // ➡️ ПЕРЕКЛАД
      toast.success(t("counterparties:counterpartyDataHook.cp_delete_success"));
      queryClient.invalidateQueries({ queryKey: ["counterparties"] });
    },
  });

  return {
    counterparties,
    categories,
    isLoadingCps,
    actions: {
      createCat,
      updateCat,
      deleteCat,
      createCp,
      updateCp,
      deleteCp,
    },
  };
}
