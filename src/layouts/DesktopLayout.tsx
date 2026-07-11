import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import styled from "styled-components";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { SyncWidget } from "../components/ui/Feedback/SyncWidget";

const StyledDesktopLayout = styled.div<{ $collapsed: boolean }>`
  display: grid;
  grid-template-columns: ${(props) => (props.$collapsed ? "7rem" : "18rem")} 1fr;
  grid-template-rows: auto minmax(0, 1fr);
  height: 100vh;
  transition: grid-template-columns 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  grid-template-columns: ${(props) => (props.$collapsed ? "5.5rem" : "15rem")} 1fr;
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

  padding: 1.5rem;
  gap: 1.5rem;
`;

function DesktopLayout() {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem("sidebar-collapsed");
    return saved === "true";
  });

  useEffect(() => {
    localStorage.setItem("sidebar-collapsed", String(isCollapsed));
  }, [isCollapsed]);

  const toggleSidebar = () => setIsCollapsed((prev) => !prev);

  return (
    <StyledDesktopLayout $collapsed={isCollapsed}>
      <Sidebar isCollapsed={isCollapsed} onToggle={toggleSidebar} />
      <Header />
      <Main>
        <Container>
          <Outlet />
        </Container>
      </Main>
      <SyncWidget />
    </StyledDesktopLayout>
  );
}

export default DesktopLayout;
