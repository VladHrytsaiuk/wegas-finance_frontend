import { useState } from "react";
import styled from "styled-components";
import { NavLink } from "react-router-dom";
import {
  HiOutlineHome,
  HiOutlineChartBar,
  HiOutlineWallet,
  HiOutlineCog6Tooth,
  HiPlus,
} from "react-icons/hi2";
import { useTranslation } from "react-i18next";
import MobileActionMenu from "./MobileActionMenu";

const Nav = styled.nav`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 75px; /* Increased height from 65px */
  background-color: var(--color-bg-surface);
  border-top: 1px solid var(--color-border);
  display: flex;
  justify-content: space-around;
  align-items: center;

  /* Added top padding for better breathing room and handle safe areas */
  padding-top: 8px;
  padding-left: max(12px, env(safe-area-inset-left));
  padding-right: max(12px, env(safe-area-inset-right));
  padding-bottom: env(safe-area-inset-bottom);

  z-index: 1000;
`;

const StyledNavLink = styled(NavLink)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--color-text-secondary);
  text-decoration: none;
  transition: all 0.2s;
  flex: 1;
  height: 48px; /* Fixed height for icons to stay centered below the top padding */

  &.active {
    color: var(--color-brand-600);
  }

  & svg {
    width: 28px;
    height: 28px;
  }
`;

const ActionButtonWrapper = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 48px;
`;

const ActionButton = styled.button`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: var(--color-brand-600);
  color: white;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: -35px; /* Adjusted from -30px to stay proportional to new height */
  box-shadow: var(--shadow-lg);
  cursor: pointer;

  & svg {
    width: 28px;
    height: 28px;
  }
`;

function MobileNav() {
  const { t } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      <Nav>
        <StyledNavLink to="/dashboard">
          <HiOutlineHome />
        </StyledNavLink>
        
        <StyledNavLink to="/statistics">
          <HiOutlineChartBar />
        </StyledNavLink>

        <ActionButtonWrapper>
          <ActionButton onClick={() => setIsMenuOpen(true)}>
            <HiPlus />
          </ActionButton>
        </ActionButtonWrapper>

        <StyledNavLink to="/accounts">
          <HiOutlineWallet />
        </StyledNavLink>

        <StyledNavLink to="/settings">
          <HiOutlineCog6Tooth />
        </StyledNavLink>
      </Nav>

      {isMenuOpen && <MobileActionMenu onClose={() => setIsMenuOpen(false)} />}
    </>
  );
}

export default MobileNav;
