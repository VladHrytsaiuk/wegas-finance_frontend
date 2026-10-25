import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import styled from "styled-components";
import { useQuery } from "@tanstack/react-query";
import {
  HiOutlineHome,
  HiOutlineQueueList,
  HiOutlineCreditCard,
  HiOutlineEllipsisHorizontalCircle,
  HiPlus,
} from "react-icons/hi2";

import MobileActionMenu from "../components/mobile/MobileActionMenu";
import { ReceiptImportModal } from "../components/inbox/ReceiptImportModal";
import { getInboxPendingCountApi } from "../services/apiInbox";

// Розділи, які відкриваються з «Ще»: на них підсвічуємо вкладку «Ще».
const MORE_SECTIONS = [
  "/more",
  "/statistics",
  "/goals",
  "/debts",
  "/shopping",
  "/wishlist",
  "/assets",
  "/utility",
  "/settings",
  "/admin",
];

const Bar = styled.nav`
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 900;
  display: flex;
  align-items: flex-start;
  height: calc(var(--m-tabbar-h) + env(safe-area-inset-bottom));
  padding: 4px 8px env(safe-area-inset-bottom);
  box-sizing: border-box;
  background: var(--m-tabbar-bg);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-top: 0.5px solid var(--m-tabbar-border);
  font-family: var(--m-font);
`;

const Tab = styled(NavLink)<{ $forceActive?: boolean }>`
  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  min-height: 44px;
  padding-top: 2px;
  color: ${(p) => (p.$forceActive ? "var(--m-accent)" : "var(--m-label-2)")};
  text-decoration: none;
  -webkit-tap-highlight-color: transparent;

  &.active {
    color: var(--m-accent);
  }

  & svg {
    width: 25px;
    height: 25px;
  }
`;

const TabLabel = styled.span`
  font-size: 10px;
  font-weight: 600;
`;

const Badge = styled.span`
  position: absolute;
  top: 0;
  left: calc(50% + 6px);
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  box-sizing: border-box;
  border-radius: 9px;
  background: #ff3b30;
  color: #ffffff;
  font-size: 11px;
  font-weight: 600;
  line-height: 18px;
  text-align: center;
`;

const PlusSlot = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
`;

const PlusButton = styled.button`
  width: 46px;
  height: 46px;
  border: none;
  border-radius: 23px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--m-on-accent);
  background: var(--m-accent);
  box-shadow: 0 4px 12px rgba(4, 120, 87, 0.3);
  -webkit-tap-highlight-color: transparent;

  &:active {
    transform: scale(0.94);
  }

  & svg {
    width: 24px;
    height: 24px;
  }
`;

export function TabBar() {
  const { pathname } = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isReceiptImportOpen, setIsReceiptImportOpen] = useState(false);

  const { data: pendingInboxCount = 0 } = useQuery({
    queryKey: ["inbox", "pending-count"],
    queryFn: getInboxPendingCountApi,
    staleTime: 30 * 1000,
  });

  const isMoreSection = MORE_SECTIONS.some((path) => pathname.startsWith(path));
  const isOperations = pathname.startsWith("/inbox");

  return (
    <>
      <Bar aria-label="Основне меню">
        <Tab to="/dashboard">
          <HiOutlineHome aria-hidden="true" />
          <TabLabel>Огляд</TabLabel>
        </Tab>
        <Tab to="/transactions" $forceActive={isOperations}>
          <HiOutlineQueueList aria-hidden="true" />
          <TabLabel>Операції</TabLabel>
          {pendingInboxCount > 0 && (
            <Badge aria-label={`Чеків до розбору: ${pendingInboxCount}`}>
              {pendingInboxCount > 99 ? "99+" : pendingInboxCount}
            </Badge>
          )}
        </Tab>
        <PlusSlot>
          <PlusButton type="button" aria-label="Додати" onClick={() => setIsMenuOpen(true)}>
            <HiPlus aria-hidden="true" />
          </PlusButton>
        </PlusSlot>
        <Tab to="/accounts">
          <HiOutlineCreditCard aria-hidden="true" />
          <TabLabel>Рахунки</TabLabel>
        </Tab>
        <Tab to="/more" $forceActive={isMoreSection}>
          <HiOutlineEllipsisHorizontalCircle aria-hidden="true" />
          <TabLabel>Ще</TabLabel>
        </Tab>
      </Bar>

      {isMenuOpen && (
        <MobileActionMenu
          onClose={() => setIsMenuOpen(false)}
          onOpenReceiptImport={() => {
            setIsMenuOpen(false);
            setIsReceiptImportOpen(true);
          }}
        />
      )}
      {isReceiptImportOpen && (
        <ReceiptImportModal onClose={() => setIsReceiptImportOpen(false)} />
      )}
    </>
  );
}
