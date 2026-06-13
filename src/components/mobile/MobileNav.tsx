import { useState } from "react";
import styled from "styled-components";
import { NavLink } from "react-router-dom";
import {
  HiOutlineHome,
  HiOutlineBanknotes,
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
  height: 65px;
  background-color: var(--color-bg-surface);
  border-top: 1px solid var(--color-border);
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding-bottom: env(safe-area-inset-bottom);
  z-index: 1000;
`;

const StyledNavLink = styled(NavLink)`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  color: var(--color-text-secondary);
  text-decoration: none;
  font-size: 10px;
  transition: all 0.2s;
  flex: 1;

  &.active {
    color: var(--color-brand-600);
  }

  & svg {
    width: 24px;
    height: 24px;
  }
`;

const ActionButtonWrapper = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
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
  margin-top: -30px;
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
          <span>{t("navigation:general.dashboard")}</span>
        </StyledNavLink>
        
        <StyledNavLink to="/transactions">
          <HiOutlineBanknotes />
          <span>Операції</span>
        </StyledNavLink>

        <ActionButtonWrapper>
          <ActionButton onClick={() => setIsMenuOpen(true)}>
            <HiPlus />
          </ActionButton>
        </ActionButtonWrapper>

        <StyledNavLink to="/accounts">
          <HiOutlineWallet />
          <span>{t("navigation:general.accounts")}</span>
        </StyledNavLink>

        <StyledNavLink to="/settings">
          <HiOutlineCog6Tooth />
          <span>{t("navigation:general.settings")}</span>
        </StyledNavLink>
      </Nav>

      {isMenuOpen && <MobileActionMenu onClose={() => setIsMenuOpen(false)} />}
    </>
  );
}

export default MobileNav;
