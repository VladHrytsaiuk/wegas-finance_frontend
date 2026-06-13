import styled from "styled-components";
import { Outlet } from "react-router-dom";
import MobileNav from "../components/mobile/MobileNav";

const StyledMobileLayout = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: var(--color-bg-page);
`;

const Main = styled.main`
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  padding-bottom: 80px; /* Space for MobileNav */
`;

function MobileLayout() {
  return (
    <StyledMobileLayout>
      <Main>
        <Outlet />
      </Main>
      <MobileNav />
    </StyledMobileLayout>
  );
}

export default MobileLayout;
