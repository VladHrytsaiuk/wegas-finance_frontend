import { useState, useEffect, useCallback } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { HiOutlineDevicePhoneMobile } from "react-icons/hi2";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import Sidebar from "../Sidebar";
import Header from "../Header";
import { SyncWidget } from "./Feedback/SyncWidget";
import { useAccountsData } from "../../hooks/Accounts/useAccountsData";
import { useUserRole } from "../../hooks/useUserRole";
import { useWebSocketAuth } from "../../hooks/useWebSocketAuth";
import CenteredSpinner from "./CenteredSpinner";

// --- Стилі для Desktop версії ---
const StyledAppLayout = styled.div<{ $collapsed: boolean }>`
  display: grid;
  grid-template-columns: ${(props) => (props.$collapsed ? "7rem" : "18rem")} 1fr;
  grid-template-rows: auto minmax(0, 1fr);
  height: 100vh;
  transition: grid-template-columns 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  @media (max-width: 1300px) {
    grid-template-columns: ${(props) => (props.$collapsed ? "5.5rem" : "15rem")} 1fr;
  }
`;

const Main = styled.main`
  background-color: var(--color-bg-page);
  overflow-y: auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
`;

const Container = styled.div`
  max-width: 140rem;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 2.4rem;
  flex: 1;
  width: 100%;
  padding: 2rem;
  box-sizing: border-box;

  @media (max-width: 1300px) {
    padding: 1.5rem;
    gap: 1.5rem;
  }
`;

// --- Стилі для Mobile заглушки ---
const MobilePlaceholder = styled.div`
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: var(--color-bg-page);
  padding: 2rem;
  text-align: center;
  color: var(--color-text-primary);
`;

const MobileIcon = styled.div`
  font-size: 4.8rem;
  color: var(--color-brand-500);
  margin-bottom: 1.6rem;
`;

const MobileTitle = styled.h2`
  font-size: 2rem;
  font-weight: 600;
  margin-bottom: 0.8rem;
`;

const MobileText = styled.p`
  font-size: 1.4rem;
  color: var(--color-text-secondary);
  max-width: 30rem;
  line-height: 1.5;
`;

function AppLayout() {
  const { t } = useTranslation(["common", "accounts", "settings"]);
  const { isLoading: isAccLoading } = useAccountsData();
  const { user } = useUserRole();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

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

  // 1. Стейт для перевірки мобільного пристрою
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // 2. Стейт сайдбару
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem("sidebar-collapsed");
    return saved === "true";
  });

  // 3. Слухаємо зміну розміру вікна
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    localStorage.setItem("sidebar-collapsed", String(isCollapsed));
  }, [isCollapsed]);

  const toggleSidebar = () => setIsCollapsed((prev) => !prev);

  // 4. Якщо це мобільний - показуємо заглушку і НЕ рендеримо основний лейаут
  if (isMobile) {
    return (
      <MobilePlaceholder>
        <MobileIcon>
          <HiOutlineDevicePhoneMobile />
        </MobileIcon>
        <MobileTitle>{t("common:system.mobile_in_dev")}</MobileTitle>
        <MobileText>{t("common:system.mobile_desc")}</MobileText>
      </MobilePlaceholder>
    );
  }

  // 5. Desktop версія
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

  return (
    <StyledAppLayout $collapsed={isCollapsed}>
      <Sidebar isCollapsed={isCollapsed} onToggle={toggleSidebar} />
      <Header />
      <Main>
        <Container>
          <Outlet />
        </Container>
      </Main>

      <SyncWidget />
    </StyledAppLayout>
  );
}

export default AppLayout;
