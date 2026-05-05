import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import styled from "styled-components";
import { HiOutlineDevicePhoneMobile } from "react-icons/hi2";
import { useTranslation } from "react-i18next";
import Sidebar from "../Sidebar";
import Header from "../Header";
import { SyncWidget } from "./Feedback/SyncWidget";

// --- Стилі для Desktop версії ---
const StyledAppLayout = styled.div<{ $collapsed: boolean }>`
  display: grid;
  grid-template-columns: ${(props) => (props.$collapsed ? "7rem" : "20rem")} 1fr;
  grid-template-rows: auto minmax(0, 1fr);
  height: 100vh;
  transition: grid-template-columns 0.3s cubic-bezier(0.4, 0, 0.2, 1);
`;

const Main = styled.main`
  background-color: var(--color-bg-page);
  padding: 3.2rem;
  overflow-y: auto;
  min-height: 0;
`;

const Container = styled.div`
  max-width: 140rem;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 2.4rem;
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
  const { t } = useTranslation(["common"]);

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
