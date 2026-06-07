import styled from "styled-components";

export const WidgetCard = styled.div`
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  height: 100%;
  min-height: 0;

  @media (max-width: 1300px) {
    padding: 0.75rem 1rem;
    gap: 0.5rem;
  }
`;

export const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
`;

export const Title = styled.h3`
  font-size: 1rem;
  font-weight: 700;
  color: var(--color-text-main);
  margin: 0;
`;

export const ContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center; /* 🔥 Center vertically */
  flex: 1;
  min-height: 0;
  width: 100%;

  @media (max-width: 1300px) {
    gap: 0.5rem;
  }
`;

export const ChartArea = styled.div`
  width: 100%;
  height: 100%; /* 🔥 Use full available height */
  position: relative;
  flex-grow: 1;
`;

export const AbsolutePieContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
`;

export const CenterLabel = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  pointer-events: none;
  display: flex;
  flex-direction: column;

  .label {
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--color-text-tertiary);
    font-weight: 700;
  }
`;

export const CustomLegend = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px 16px;
  @media (max-width: 1400px) {
    grid-template-columns: 1fr;
  }

  @media (max-width: 1300px) {
    gap: 4px;
  }

  margin-bottom: auto;
`;

export const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;

  @media (max-width: 1300px) {
    font-size: 0.75rem;
    gap: 4px;
  }
`;

export const Dot = styled.div`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
`;

export const LegendText = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  color: var(--color-text-main);

  .name {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .percent {
  font-weight: 600;
  color: var(--color-text-secondary);
  }
`;

export const TooltipContainer = styled.div`
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  padding: 8px 12px;
  border-radius: 12px;
  box-shadow: var(--shadow-md);
  display: flex;
  align-items: center;
  gap: 10px;
  
  .info {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .name {
    font-size: 0.85rem;
    color: var(--color-text-secondary);
    font-weight: 500;
  }

  .value {
    font-size: 0.95rem;
    font-weight: 700;
    color: var(--color-text-main);
  }
`;

export const TooltipIconBox = styled.div<{ $color: string; $hasLogo?: boolean }>`
  width: 28px;
  height: 28px;
  border-radius: 8px;
  flex-shrink: 0;
  overflow: hidden;

  background: ${(p) =>
    p.$hasLogo
      ? "transparent"
      : `color-mix(in srgb, ${p.$color || "#6b7280"}, transparent 90%)`};

  border: 1px solid
    ${(p) =>
      p.$hasLogo
        ? "rgba(0, 0, 0, 0.08)"
        : `color-mix(in srgb, ${p.$color || "#6b7280"}, transparent 80%)`};

  color: ${(p) => p.$color || "#6b7280"};
  display: flex;
  align-items: center;
  justify-content: center;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    padding: 0;
  }
`;

