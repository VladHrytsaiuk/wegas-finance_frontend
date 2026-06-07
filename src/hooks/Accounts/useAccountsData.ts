import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import {
  getAccountsApi,
  createAccountApi,
  updateAccountApi,
  deleteAccountApi,
} from "../../services/apiAccounts";
import { getUsersApi } from "../../services/apiUsers";

export function useAccountsData() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const {
    data: accounts = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["accounts"],
    queryFn: getAccountsApi,
  });

  const { data: users = [] } = useQuery({
    queryKey: ["users"],
    queryFn: getUsersApi,
  });

  const createAccount = useMutation({
    mutationFn: createAccountApi,
    onSuccess: () => {
      toast.success(t("accounts:accountsDataHook.alert_create_success"));
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
    },
    onError: () => toast.error(t("accounts:accountsDataHook.alert_create_error")),
  });

  const updateAccount = useMutation({
    mutationFn: updateAccountApi,
    onSuccess: () => {
      toast.success(t("accounts:accountsDataHook.alert_update_success"));
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
    },
    onError: (err: any) =>
      toast.error(err.message || t("accounts:accountsDataHook.alert_update_error")),
  });

  const deleteAccount = useMutation({
    mutationFn: deleteAccountApi,
    onSuccess: () => {
      toast.success(t("accounts:accountsDataHook.alert_delete_success"));
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
    },
    onError: () => toast.error(t("accounts:accountsDataHook.alert_delete_error")),
  });

  return {
    accounts,
    users,
    isLoading,
    isError,
    actions: {
      create: createAccount,
      update: updateAccount,
      delete: deleteAccount,
    },
  };
}
