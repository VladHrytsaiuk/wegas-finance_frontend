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

  padding: 6px 12px;
  font-size: 0.8rem;

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
  /* 🔥 40/60 split for large screens */
  grid-template-columns: 4fr 6fr; 
  gap: 1.5rem;
  align-items: start;

  /* Дозволяємо лівій колонці стискатись */
  grid-template-columns: minmax(300px, 4fr) 6fr;

  @media (max-width: 1100px) {
    /* Ставимо в одну колонку */
    grid-template-columns: 1fr;
  }
`;
export const ChartSection = styled.div`
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: 16px;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  height: 450px; /* 🔥 Fixed height to match Pie chart and allow scrolling */
  overflow: hidden;
`;

/* --- TABS --- */
export const TabsContainer = styled.div`
  display: flex;
  gap: 0.25rem;
  background-color: var(--color-bg-page);
  border: 1px solid var(--color-border);
  padding: 4px;
  border-radius: 12px;
  width: fit-content;
`;

export const Tab = styled.button<{ $active: boolean }>`
  background: ${(p) => (p.$active ? "var(--color-bg-surface)" : "transparent")};
  color: ${(p) =>
    p.$active ? "var(--color-brand-600)" : "var(--color-text-secondary)"};
  box-shadow: ${(p) =>
    p.$active ? "0 2px 4px rgba(0,0,0,0.05)" : "none"};
  font-weight: 600;
  padding: 8px 20px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.9rem;

  padding: 6px 14px;
  font-size: 0.8rem;
  
  &:hover {
    color: var(--color-text-main);
    background: ${(p) => (p.$active ? "var(--color-bg-surface)" : "var(--color-bg-hover)")};
  }
`;

/* --- EXTRA CONTAINERS --- */
export const TrendContainer = styled.div`
  width: 100%;
  height: 400px;
  margin-bottom: 0.5rem;
`;

export const PieContainer = styled.div`
  min-width: 0;
  display: flex;
  flex-direction: column;
  height: 450px;

  & > div {
    height: 100%;
  }
`;
