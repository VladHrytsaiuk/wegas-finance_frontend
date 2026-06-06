import { useState, useEffect } from "react";
import {
  useLocation,
  useNavigate,
  NavLink,
  type NavLinkRenderProps,
} from "react-router-dom";
import {
  HiChevronLeft,
  HiChevronRight,
  HiHome,
  HiCreditCard,
  HiArrowPath,
  HiChartBar,
  HiFlag,
  HiShoppingBag,
  HiArrowsRightLeft,
  HiChatBubbleLeftRight,
  HiCog6Tooth,
  HiSquare2Stack,
  HiPlus,
} from "react-icons/hi2";
import { useTranslation } from "react-i18next";
import styled, { css } from "styled-components";
import { isModKeyPressed } from "../utils/platform";

import Logo from "./Logo";
import Modal from "./ui/Modal";
import FeedbackModal from "./Feedback/FeedbackModal";

const SidebarContainer = styled.aside<{ $isCollapsed: boolean }>`
  background-color: var(--color-bg-surface);
  border-right: 1px solid var(--color-border);
  height: 100vh;
  width: ${(props) => (props.$isCollapsed ? "80px" : "260px")};
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  position: sticky;
  top: 0;
  left: 0;
  z-index: 100;
  flex-shrink: 0;

  @media (max-width: 1024px) {
    display: none;
  }
`;

const Header = styled.div<{ $isCollapsed: boolean }>`
  padding: 24px ${(props) => (props.$isCollapsed ? "12px" : "24px")};
  display: flex;
  align-items: center;
  justify-content: ${(props) => (props.$isCollapsed ? "center" : "flex-start")};
  gap: 12px;
  height: 80px;
  overflow: hidden;
`;

const Nav = styled.nav`
  flex: 1;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const NavItemStyle = css`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 12px;
  color: var(--color-text-secondary);
  font-weight: 500;
  transition: all 0.2s;
  text-decoration: none;
  white-space: nowrap;

  &:hover {
    background-color: var(--color-bg-hover);
    color: var(--color-text-main);
  }

  &.active {
    background-color: var(--color-brand-50);
    color: var(--color-brand-600);
    font-weight: 600;
  }
`;

const StyledNavLink = styled(NavLink)`
  ${NavItemStyle}
`;

const CollapseButton = styled.button`
  background: none;
  border: none;
  color: var(--color-text-tertiary);
  padding: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;

  &:hover {
    color: var(--color-text-main);
  }
`;

const Footer = styled.div`
  padding: 12px;
  border-top: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const IconWrapper = styled.div`
  font-size: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const Label = styled.span<{ $isCollapsed: boolean }>`
  opacity: ${(props) => (props.$isCollapsed ? 0 : 1)};
  transition: opacity 0.2s;
  font-size: 0.95rem;
`;

const QuickAddButton = styled.button<{ $isCollapsed: boolean }>`
  margin: 8px;
  padding: 12px;
  border-radius: 12px;
  background-color: var(--color-brand-600);
  color: white;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
  box-shadow: 0 4px 6px -1px rgba(16, 185, 129, 0.2);

  &:hover {
    background-color: var(--color-brand-700);
    transform: translateY(-1px);
    box-shadow: 0 10px 15px -3px rgba(16, 185, 129, 0.3);
  }

  span {
    display: ${(props) => (props.$isCollapsed ? "none" : "block")};
  }
`;

const NavGroup = styled.div`
  margin-top: 16px;
  margin-bottom: 8px;
  padding: 0 12px;

  span {
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    color: var(--color-text-tertiary);
    letter-spacing: 0.05em;
  }
`;

function Sidebar({
  isCollapsed,
  onToggle,
}: {
  isCollapsed: boolean;
  onToggle: () => void;
}) {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isModKeyPressed(e) && (e.key === "a" || e.key === "A")) {
        // --- ПЕРЕВІРКИ ---
        // 1. Якщо ми в інпуті - ігноруємо
        if (["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName || "")) return;
        
        // 2. Якщо вже відкрита якась модалка - ігноруємо
        if (document.querySelector('[role="dialog"]')) return;

        // --- ДІЯ ---
        e.preventDefault();
        e.stopPropagation();
        navigate("/transactions/new", { state: { background: location } });
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [location, navigate]);

  const toggleLabel = isCollapsed
    ? t("navigation:sidebar.expand", "Розгорнути")
    : t("navigation:sidebar.collapse", "Згорнути");

  return (
    <SidebarContainer $isCollapsed={isCollapsed}>
      <Header $isCollapsed={isCollapsed}>
        <Logo size={isCollapsed ? "small" : "medium"} />
      </Header>

      <QuickAddButton
        $isCollapsed={isCollapsed}
        onClick={() =>
          navigate("/transactions/new", { state: { background: location } })
        }
        title="Quick Add (A)"
      >
        <HiPlus size={20} />
        <span>{t("navigation:sidebar.add_transaction")}</span>
      </QuickAddButton>

      <Nav>
        <StyledNavLink to="/dashboard">
          <IconWrapper>
            <HiHome />
          </IconWrapper>
          <Label $isCollapsed={isCollapsed}>
            {t("navigation:sidebar.dashboard")}
          </Label>
        </StyledNavLink>

        <StyledNavLink to="/transactions">
          <IconWrapper>
            <HiArrowPath />
          </IconWrapper>
          <Label $isCollapsed={isCollapsed}>
            {t("navigation:sidebar.transactions")}
          </Label>
        </StyledNavLink>

        <StyledNavLink to="/accounts">
          <IconWrapper>
            <HiCreditCard />
          </IconWrapper>
          <Label $isCollapsed={isCollapsed}>
            {t("navigation:sidebar.accounts")}
          </Label>
        </StyledNavLink>

        <NavGroup>
          {!isCollapsed && <span>{t("navigation:sidebar.group_planning")}</span>}
        </NavGroup>

        <StyledNavLink to="/goals">
          <IconWrapper>
            <HiFlag />
          </IconWrapper>
          <Label $isCollapsed={isCollapsed}>
            {t("navigation:sidebar.goals")}
          </Label>
        </StyledNavLink>

        <StyledNavLink to="/wishlist">
          <IconWrapper>
            <HiShoppingBag />
          </IconWrapper>
          <Label $isCollapsed={isCollapsed}>
            {t("navigation:sidebar.wishlist")}
          </Label>
        </StyledNavLink>

        <NavGroup>
          {!isCollapsed && <span>{t("navigation:sidebar.group_analysis")}</span>}
        </NavGroup>

        <StyledNavLink to="/stats">
          <IconWrapper>
            <HiChartBar />
          </IconWrapper>
          <Label $isCollapsed={isCollapsed}>
            {t("navigation:sidebar.stats")}
          </Label>
        </StyledNavLink>

        <StyledNavLink to="/utility">
          <IconWrapper>
            <HiSquare2Stack />
          </IconWrapper>
          <Label $isCollapsed={isCollapsed}>
            {t("navigation:sidebar.utility")}
          </Label>
        </StyledNavLink>

        <StyledNavLink to="/counterparties">
          <IconWrapper>
            <HiArrowsRightLeft />
          </IconWrapper>
          <Label $isCollapsed={isCollapsed}>
            {t("navigation:sidebar.counterparties")}
          </Label>
        </StyledNavLink>
      </Nav>

      <Footer>
        <CollapseButton onClick={onToggle} title={toggleLabel}>
          {isCollapsed ? (
            <HiChevronRight size={20} />
          ) : (
            <>
              <HiChevronLeft size={20} />
              <Label $isCollapsed={isCollapsed} style={{ marginLeft: "12px" }}>
                {t("navigation:sidebar.collapse_action")}
              </Label>
            </>
          )}
        </CollapseButton>

        <StyledNavLink
          as="button"
          to="#"
          className={({ isActive }: NavLinkRenderProps) =>
            isActive ? "active" : ""
          }
          onClick={(e) => {
            e.preventDefault();
            setIsFeedbackOpen(true);
          }}
          title={t("navigation:sidebar.feedback_tooltip")}
          aria-label={t("navigation:sidebar.feedback_tooltip")}
        >
          <IconWrapper>
            <HiChatBubbleLeftRight />
          </IconWrapper>
          <Label $isCollapsed={isCollapsed}>
            {t("navigation:sidebar.feedback")}
          </Label>
        </StyledNavLink>

        <StyledNavLink to="/settings">
          <IconWrapper>
            <HiCog6Tooth />
          </IconWrapper>
          <Label $isCollapsed={isCollapsed}>
            {t("navigation:sidebar.settings")}
          </Label>
        </StyledNavLink>
      </Footer>

      {/* Feedback Modal */}
      <Modal>
        <FeedbackModal
          isOpen={isFeedbackOpen}
          onClose={() => setIsFeedbackOpen(false)}
        />
      </Modal>
    </SidebarContainer>
  );
}

export default Sidebar;
