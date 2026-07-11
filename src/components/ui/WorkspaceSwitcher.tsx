import { useState } from "react";
import styled from "styled-components";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  HiOutlineBanknotes,
  HiOutlinePresentationChartLine,
} from "react-icons/hi2";
import {
  useWorkspace,
  type WorkspaceMode,
} from "../../context/WorkspaceContext";
import { useUserRole } from "../../hooks/useUserRole";
import { ModeTransition } from "./ModeTransition";

// --- STYLES ---
const Container = styled.div`
  background-color: var(--color-bg-surface);
  padding: 3px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-sm);
`;

const OptionButton = styled.button<{ $isActive: boolean }>`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: ${(p) => (p.$isActive ? "600" : "500")};
  background-color: ${(p) =>
    p.$isActive ? "var(--color-brand-100)" : "transparent"};
  color: ${(p) =>
    p.$isActive ? "var(--color-brand-700)" : "var(--color-text-secondary)"};
  transition: all 0.2s ease;

  & svg {
    width: 14px;
    height: 14px;
  }

  &:hover {
    color: var(--color-text-main);
    background-color: ${(p) => (!p.$isActive ? "rgba(0,0,0,0.03)" : "")};
  }

  /* 🔥 Змінили брейкпоінт на 1200px */
  @media (max-width: 1280px) {
    padding: 4px 8px;
    justify-content: center;
  }
`;

const ButtonText = styled.span`
  /* 🔥 Змінили брейкпоінт на 1200px */
  @media (max-width: 1280px) {
    display: none;
  }
`;

// --- COMPONENT ---
export function WorkspaceSwitcher() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { mode, setMode } = useWorkspace();
  const { isStartupper } = useUserRole();

  const [isNavigating, setIsNavigating] = useState(false);
  const [targetMode, setTargetMode] = useState<string>("");

  if (isStartupper) return null;

  const handleSwitch = async (newMode: WorkspaceMode) => {
    if (newMode === mode || isNavigating) return;

    // 1. Спочатку задаємо ціль
    setTargetMode(newMode);
    // 2. Вмикаємо анімацію
    setIsNavigating(true);

    // 3. Чекаємо трохи довше, щоб шторка точно закрила екран (500мс)
    await new Promise((resolve) => setTimeout(resolve, 550));

    // 4. Тільки ТЕПЕР змінюємо дані (екран закритий)
    setMode(newMode);

    // Навігація
    if (newMode === "investments") {
      navigate("/investments/dashboard");
    } else {
      navigate("/dashboard");
    }

    // 5. Чекаємо, поки нова сторінка відрендериться "під низом"
    await new Promise((resolve) => setTimeout(resolve, 500));

    // 6. Прибираємо шторку (вона поїде вгору)
    setIsNavigating(false);
  };

  return (
    <>
      <ModeTransition isNavigating={isNavigating} targetMode={targetMode} />

      <Container>
        <OptionButton
          $isActive={mode === "finance"}
          onClick={() => handleSwitch("finance")}
        >
          <HiOutlineBanknotes size={18} />
          <ButtonText>{t("navigation:workspaces.finance")}</ButtonText>
        </OptionButton>

        <OptionButton
          $isActive={mode === "investments"}
          onClick={() => handleSwitch("investments")}
        >
          <HiOutlinePresentationChartLine size={18} />
          <ButtonText>{t("navigation:workspaces.investments")}</ButtonText>
        </OptionButton>
      </Container>
    </>
  );
}
