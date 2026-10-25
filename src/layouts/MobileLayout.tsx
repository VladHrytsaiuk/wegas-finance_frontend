import styled from "styled-components";
import { Outlet } from "react-router-dom";
import { MobileTokens } from "../mobile/tokens";
import { TabBar } from "../mobile/TabBar";

// Один контейнер прокрутки на всю висоту видимої області (dvh, а не vh:
// в iOS PWA 100vh більший за екран, звідси подвійний скрол і контент під меню).
const Shell = styled.div`
  height: 100dvh;
  display: flex;
  flex-direction: column;
  background: var(--m-bg);
`;

const Main = styled.main`
  flex: 1;
  overflow-y: auto;
  overscroll-behavior-y: contain;
  -webkit-overflow-scrolling: touch;
  padding-bottom: calc(var(--m-tabbar-h) + env(safe-area-inset-bottom));
`;

function MobileLayout() {
  return (
    <Shell>
      <MobileTokens />
      <Main>
        <Outlet />
      </Main>
      <TabBar />
    </Shell>
  );
}

export default MobileLayout;
