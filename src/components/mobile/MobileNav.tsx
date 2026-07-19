import { useState } from "react";
import styled from "styled-components";
import { NavLink } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  HiOutlineHome,
  HiOutlineInbox,
  HiOutlineWallet,
  HiOutlineCog6Tooth,
  HiPlus,
} from "react-icons/hi2";
import MobileActionMenu from "./MobileActionMenu";
import { getInboxPendingCountApi } from "../../services/apiInbox";

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
  position: relative;
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

const CountBadge = styled.span`
  position: absolute;
  top: -2px;
  right: calc(50% - 18px);
  min-width: 18px;
  height: 18px;
  padding: 0 4px;
  border-radius: 999px;
  background: var(--color-danger-500, #ef4444);
  color: #fff;
  font-size: 0.65rem;
  font-weight: 800;
  line-height: 18px;
  text-align: center;
  box-shadow: 0 0 0 2px var(--color-bg-surface);
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
  border-radius: 12px; /* Змінено з 50% на заокруглений квадрат */
  background: linear-gradient(135deg, var(--color-brand-500), var(--color-brand-600));
  color: white;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: -35px; /* Adjusted from -30px to stay proportional to new height */
  box-shadow: 0 4px 15px rgba(5, 150, 105, 0.4); /* Більш насичена тінь */
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

  &:active {
    transform: scale(0.85);
  }

  & svg {
    width: 28px;
    height: 28px;
  }
`;

function MobileNav() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { data: pendingInboxCount = 0 } = useQuery({
    queryKey: ["inbox", "pending-count"],
    queryFn: getInboxPendingCountApi,
    staleTime: 30 * 1000,
  });

  return (
    <>
      <Nav>
        <StyledNavLink to="/dashboard">
          <HiOutlineHome />
        </StyledNavLink>
        
        <StyledNavLink to="/inbox">
          <HiOutlineInbox />
          {pendingInboxCount > 0 ? (
            <CountBadge>{pendingInboxCount > 99 ? "99+" : pendingInboxCount}</CountBadge>
          ) : null}
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
