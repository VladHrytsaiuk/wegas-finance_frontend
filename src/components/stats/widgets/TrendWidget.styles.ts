import styled from "styled-components";

export const Container = styled.div`
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
`;

export const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-shrink: 0;
`;

export const TitleGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 1.2rem;
`;

export const Title = styled.h3`
  font-size: 1rem;
  font-weight: 700;
  color: var(--color-text-main);
  white-space: nowrap;
  margin: 0;
`;

export const TypeToggle = styled.div`
  display: flex;
  background: var(--color-bg-page);
  padding: 3px;
  border-radius: 8px;
  border: 1px solid var(--color-border);
`;

export const ToggleBtn = styled.button<{ $active: boolean; $color: string }>`
  border: none;
  background: ${(p) => (p.$active ? "var(--color-bg-surface)" : "transparent")};
  color: ${(p) => (p.$active ? p.$color : "var(--color-text-secondary)")};
  padding: 4px 12px;
  font-size: 0.75rem;
  font-weight: 600;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: ${(p) => (p.$active ? "0 2px 4px rgba(0,0,0,0.05)" : "none")};

  &:hover {
    color: ${(p) => (p.$active ? p.$color : "var(--color-text-main)")};
  }
`;

export const ChartWrapper = styled.div`
  flex: 1;
  width: 100%;
  position: relative;
  min-height: 0;
  min-width: 0;
  overflow: hidden;
`;

export const AbsoluteChartContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
`;

export const TooltipContainer = styled.div`
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  padding: 8px 12px;
  border-radius: 10px;
  box-shadow: var(--shadow-md);

  .date {
    font-size: 0.7rem;
    color: var(--color-text-secondary);
    margin-bottom: 2px;
    margin-top: 0;
  }

  .value {
    font-size: 0.95rem;
    font-weight: 800;
    margin: 0;
  }
`;
