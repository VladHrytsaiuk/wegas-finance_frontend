import styled from "styled-components";

export const PageContainer = styled.div`
  width: 100%;
  max-width: 100%;
  padding: 1rem 0 3rem 0;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  box-sizing: border-box;
  flex: 1;

  @media (max-width: 768px) {
    padding: 0.8rem;
  }
`;

export const Header = styled.div`
  display: flex;
  justify-content: flex-end; /* Вирівнювання праворуч, як в оригіналі */
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
`;

export const ControlsGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
`;

export const TypeToggle = styled.div`
  display: flex;
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 4px;
  gap: 4px;
`;

export const ToggleBtn = styled.button<{
  $active: boolean;
  $type: "income" | "expense";
}>`
  padding: 8px 16px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.9rem;
  transition: all 0.2s;

  ${(p) =>
    p.$active
      ? `
      background: ${
        p.$type === "income" ? "var(--color-brand-100)" : "#fee2e2"
      };
      color: ${p.$type === "income" ? "var(--color-brand-700)" : "#dc2626"};
    `
      : `
      background: transparent;
      color: var(--color-text-secondary);
      &:hover { background: var(--color-bg-hover); }
    `}
`;

/* --- LAYOUT GRID --- */

export const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 350px 1fr;
  gap: 1.5rem;
  align-items: start;

  @media (max-width: 1200px) {
    grid-template-columns: 1fr;
  }
`;

export const ChartSection = styled.div`
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: 16px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

/* --- TABS --- */
export const TabsContainer = styled.div`
  display: flex;
  gap: 0.5rem;
  background-color: var(--color-bg-main);
  border-radius: 10px;
  margin-bottom: 0.5rem;
  width: fit-content;
`;

export const Tab = styled.button<{ $active: boolean }>`
  background: ${(p) => (p.$active ? "var(--color-bg-surface)" : "transparent")};
  color: ${(p) =>
    p.$active ? "var(--color-brand-600)" : "var(--color-text-secondary)"};
  box-shadow: ${(p) => (p.$active ? "0 1px 2px rgba(0,0,0,0.1)" : "none")};
  font-weight: 600;
  padding: 6px 16px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  &:hover {
    color: var(--color-text-main);
  }
`;

/* --- EXTRA CONTAINERS --- */
export const TrendContainer = styled.div`
  width: 100%;
  height: 300px;
  margin-bottom: 2rem;
`;

export const PieContainer = styled.div`
  min-width: 0;
`;
