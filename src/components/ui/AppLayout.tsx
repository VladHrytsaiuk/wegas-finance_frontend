import { useState, useEffect, useCallback } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { useAccountsData } from "../../hooks/Accounts/useAccountsData";
import { useUserRole } from "../../hooks/useUserRole";
import { useWebSocketAuth } from "../../hooks/useWebSocketAuth";
import CenteredSpinner from "./CenteredSpinner";
import { useIsMobile } from "../../hooks/useIsMobile";

import DesktopLayout from "../../layouts/DesktopLayout";
import MobileLayout from "../../layouts/MobileLayout";

function AppLayout() {
  const { t } = useTranslation(["common", "accounts", "settings"]);
  const { isLoading: isAccLoading } = useAccountsData();
  const { user } = useUserRole();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  // 1. WebSocket logic for global events (like being removed from family)
  const onWebSocketMessage = useCallback((data: any) => {
    if (data.type === "member_removed") {
      if (data.user_id === user?.id) {
        // This user was removed/kicked
        toast.error(t("settings:usersPage.alert_kicked", "Вас було видалено з сім'ї"), { 
          duration: 6000,
          id: "kicked-notice" 
        });

        // 1. Invalidate all cached data
        queryClient.invalidateQueries();
        
        // 2. Clear specific finance data to prevent seeing old family data
        queryClient.removeQueries({ queryKey: ["accounts"] });
        queryClient.removeQueries({ queryKey: ["transactions"] });
        queryClient.removeQueries({ queryKey: ["dashboard"] });
        
        // 3. Force re-fetch of current user to get new FamilyID
        queryClient.refetchQueries({ queryKey: ["me"] });

        // 4. Redirect to dashboard and reload to ensure clean state
        navigate("/dashboard");
        setTimeout(() => window.location.reload(), 500);
      } else {
        // Someone else was removed, just refresh the team list
        queryClient.invalidateQueries({ queryKey: ["users"] });
      }
    }
  }, [user?.id, queryClient, navigate, t]);

  useWebSocketAuth(onWebSocketMessage);

  // 5. Loading state
  if (isAccLoading) {
    return (
      <CenteredSpinner
        fullHeight
        message={t(
          "accounts:accountsPage.status_loading",
          "Завантаження фінансів...",
        )}
      />
    );
  }

  // 6. Switch Layouts
  if (isMobile) {
    return <MobileLayout />;
  }

  return <DesktopLayout />;
}

export default AppLayout;
