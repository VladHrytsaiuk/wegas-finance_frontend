import React, { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useLocation } from "react-router-dom";

import { useUserRole } from "../useUserRole";
import { useAccountsData } from "./useAccountsData";
import { useAccountsFilter } from "./useAccountsFilter";
import { useHeader } from "../../context/HeaderContext";

export const useAccountsPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  // 1. Permissions & Header
  const { canManageStructure } = useUserRole();
  const { setPageTitle, resetPageTitle } = useHeader();

  useEffect(() => {
    setPageTitle(t("accounts:accountsPage.title"), t("accounts:accountsPage.subtitle"));
    return () => resetPageTitle();
  }, [t, setPageTitle, resetPageTitle]);

  // 2. Data Fetching
  const { accounts, users, isLoading, isError, actions } = useAccountsData();

  // 3. Filtering & View Logic
  const filterLogic = useAccountsFilter(accounts, users);

  // 4. Local UI State (Delete Modal)
  const [idToDelete, setIdToDelete] = useState<string | null>(null);

  // Helper: Get name for delete confirmation
  const accountToDeleteName = useMemo(() => {
    return accounts?.find((a) => a.id === idToDelete)?.name || "";
  }, [accounts, idToDelete]);

  const handleDeleteConfirm = () => {
    if (idToDelete) {
      actions.delete.mutate(idToDelete);
    }
  };

  return {
    // Data & Status
    isLoading,
    isError,
    users,

    // Logic from Filter Hook (spread directly)
    ...filterLogic,

    // UI & Navigation
    t,
    navigate,
    location,
    canManageStructure,

    // Delete Modal State
    idToDelete,
    setIdToDelete,
    accountToDeleteName,
    handleDeleteConfirm,
    isDeleting: actions.delete.isPending,
  };
};
