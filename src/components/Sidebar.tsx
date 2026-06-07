import { useEffect, useState } from "react";
import styled from "styled-components";
import { useLocation, Link, useNavigate } from "react-router-dom";
import {
  HiPlus,
  HiChevronLeft,
  HiChevronRight,
  HiOutlineChatBubbleLeftRight,
} from "react-icons/hi2";
import { useTranslation } from "react-i18next";
import { isModifierPressed } from "../utils/platform";

import Logo from "./ui/Logo";
import MainNav from "./MainNav";
import FeedbackWidget from "./ui/FeedbackWidget"; // 👈 НЕ ЗАБУДЬ ІМПОРТУВАТИ

// --- STYLES ---

const StyledSidebar = styled.aside<{ $collapsed: boolean }>`
  background-color: var(--color-bg-surface);
  border-right: 1px solid var(--color-border);
  grid-row: 1 / -1;
  display: flex;
  flex-direction: column;
  padding: 1rem ${(p) => (p.$collapsed ? "0.6rem" : "1.2rem")} 1.5rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
`;

const NavContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  margin: 1rem 0;
  padding-right: 4px;

  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background: var(--color-border);
    border-radius: 10px;
  }
`;

const ToggleButton = styled.button`
  position: absolute;
  top: 1.5rem;
  right: -12px;
  background-color: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  color: var(--color-text-secondary);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 1000;
  transition: all 0.2s;

  &:hover {
    color: var(--color-brand-600);
    border-color: var(--color-brand-600);
    transform: scale(1.1);
  }
`;

// 👇 ТУТ ГОЛОВНА ЗМІНА: flex-direction: column
const SidebarFooter = styled.div`
  margin-top: auto;
  width: 100%;
  display: flex;
  flex-direction: column; /* Ставить елементи вертикально */
  gap: 0.5rem; /* Відступ між кнопками */
  justify-content: center;
  position: relative; /* Важливо для позиціонування віджета */
`;

const AnimatedButton = styled(Link)<{ $collapsed: boolean }>`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  width: ${(p) => (p.$collapsed ? "38px" : "100%")};
  height: 38px;
  border-radius: 10px;
  background-color: var(--color-brand-600);
  color: white;
  transition: all 0.3s;
  overflow: hidden;
  text-decoration: none;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

  &:hover {
    background-color: var(--color-brand-700);
  }
`;

const ButtonIconBox = styled.div`
  min-width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const ButtonLabel = styled.span<{ $collapsed: boolean }>`
  opacity: ${(p) => (p.$collapsed ? 0 : 1)};
  margin-left: 0.5rem;
  transition: opacity 0.3s;
  white-space: nowrap;
  font-weight: 600;
  font-size: 0.85rem;
`;

// Стилі кнопки фідбеку
const FeedbackButton = styled.button<{ $collapsed: boolean }>`
  display: flex;
  align-items: center;
  justify-content: ${(p) =>
    p.$collapsed
      ? "center"
      : "flex-start"}; /* Центруємо іконку при згортанні */
  width: ${(p) =>
    p.$collapsed
      ? "38px"
      : "100%"}; /* Робимо ширину такою ж, як у нижньої кнопки */
  height: 38px; /* Фіксуємо висоту для краси */
  padding: 0; /* Прибираємо паддінг, щоб центрування працювало */

  background: transparent;
  border: 1px dashed var(--color-border);
  border-radius: 8px;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all 0.2s;
  overflow: hidden; /* Ховаємо текст при згортанні */

  &:hover {
    background-color: var(--color-bg-page);
    color: var(--color-brand-600);
    border-color: var(--color-brand-600);
  }

  svg {
    min-width: 38px; /* Ширина блоку під іконку */
    width: 20px;
    height: 20px;
  }
`;

const FeedbackLabel = styled.span<{ $collapsed: boolean }>`
  margin-left: 0.1rem; /* Трохи менший відступ, бо іконка вже в блоці */
  font-size: 0.85rem;
  font-weight: 500;
  white-space: nowrap;
  opacity: ${(p) => (p.$collapsed ? 0 : 1)};
  transition: opacity 0.2s;
`;

// --- COMPONENT ---

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
      if (isModifierPressed(e) && e.code === "KeyA") {
        if (
          ["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName || "")
        )
          return;
        if (document.querySelector('[role="dialog"]')) return;
        e.preventDefault();
        navigate("/transactions/new", { state: { background: location } });
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [navigate, location]);

  const toggleLabel = isCollapsed
    ? t("navigation:sidebar.expand", "Розгорнути")
    : t("navigation:sidebar.collapse", "Згорнути");

  return (
    <StyledSidebar $collapsed={isCollapsed}>
      <ToggleButton
        onClick={onToggle}
        aria-label={toggleLabel}
        title={toggleLabel}
      >
        {isCollapsed ? (
          <HiChevronRight size={14} />
        ) : (
          <HiChevronLeft size={14} />
        )}
      </ToggleButton>

      <Logo isCollapsed={isCollapsed} />

      <NavContainer>
        <MainNav isCollapsed={isCollapsed} />
      </NavContainer>

      <SidebarFooter>
        {/* 1. ВІДЖЕТ (Позиціонується абсолютно) */}
        {isFeedbackOpen && (
          <FeedbackWidget
            isCollapsed={isCollapsed}
            onClose={() => setIsFeedbackOpen(false)}
          />
        )}

        {/* 2. КНОПКА ФІДБЕКУ (Тепер вона зверху завдяки flex-direction: column) */}
        <FeedbackButton
          $collapsed={isCollapsed}
          onClick={() => setIsFeedbackOpen(!isFeedbackOpen)}
          title={t("navigation:sidebar.feedback_tooltip")}
          aria-label={t("navigation:sidebar.feedback_tooltip")}
        >
          {/* Обгортка для іконки, щоб центрувати як в нижній кнопці */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minWidth: "38px",
              height: "38px",
            }}
          >
            <HiOutlineChatBubbleLeftRight size={20} />
          </div>

          {!isCollapsed && (
            <FeedbackLabel $collapsed={isCollapsed}>
              {t("navigation:feedback")}
            </FeedbackLabel>
          )}
        </FeedbackButton>

        {/* 3. ОСНОВНА КНОПКА (Знизу) */}
        <AnimatedButton
          to="/transactions/new"
          state={{ background: location }}
          $collapsed={isCollapsed}
          title={isCollapsed ? t("navigation:sidebar.new_transaction") : ""}
          aria-label={t("navigation:sidebar.new_transaction")}
        >
          <ButtonIconBox>
            <HiPlus size={20} />
          </ButtonIconBox>
          <ButtonLabel $collapsed={isCollapsed}>
            {t("navigation:sidebar.new_transaction")}
          </ButtonLabel>
        </AnimatedButton>
      </SidebarFooter>
    </StyledSidebar>
  );
}

export default Sidebar;
