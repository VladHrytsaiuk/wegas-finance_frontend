import React from "react";
import styled from "styled-components";
import { HiSquares2X2, HiListBullet } from "react-icons/hi2";
import { useTranslation } from "react-i18next"; // ⬅️ ІМПОРТ ДЛЯ ПЕРЕКЛАДУ

const ToggleContainer = styled.div`
  display: flex;
  align-items: center;
  background-color: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 4px;
  gap: 4px;
`;

const ToggleButton = styled.button<{ $active: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6px;
  border: none;
  border-radius: 6px;
  background-color: ${(props) =>
    props.$active ? "var(--color-brand-100)" : "transparent"};
  color: ${(props) =>
    props.$active ? "var(--color-brand-700)" : "var(--color-text-secondary)"};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: ${(props) =>
      props.$active ? "var(--color-brand-100)" : "rgba(0,0,0,0.05)"};
    color: var(--color-text-main);
  }

  svg {
    width: 20px;
    height: 20px;
  }
`;

interface ViewToggleProps {
  view: "grid" | "table";
  onChange: (view: "grid" | "table") => void;
}

export const ViewToggle = ({ view, onChange }: ViewToggleProps) => {
  const { t } = useTranslation(); // ⬅️ ВИКОРИСТАННЯ ХУКА

  return (
    <ToggleContainer>
      <ToggleButton
        $active={view === "grid"}
        onClick={() => onChange("grid")}
        // ➡️ ПЕРЕКЛАД ПІДКАЗКИ
        title={t("common:viewToggle.grid_view")}
      >
        <HiSquares2X2 />
      </ToggleButton>
      <ToggleButton
        $active={view === "table"}
        onClick={() => onChange("table")}
        // ➡️ ПЕРЕКЛАД ПІДКАЗКИ
        title={t("common:viewToggle.table_view")}
      >
        <HiListBullet />
      </ToggleButton>
    </ToggleContainer>
  );
};
