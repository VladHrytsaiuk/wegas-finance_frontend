import styled, { css } from "styled-components";

// 1. Константа з SVG-шумом
const noisePattern = `url("data:image/svg+xml,%3Csvg viewBox='0 0 250 250' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.4' numOctaves='3' stitchTiles='stitch' result='noise'/%3E%3CfeColorMatrix in='noise' type='matrix' values='1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 15 -7' result='contrastNoise'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='1'/%3E%3C/svg%3E")`;

const PrivatNoiseEffect = css`
  &::after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image: ${noisePattern};
    mix-blend-mode: overlay;
    opacity: 0.4;
    pointer-events: none;
    z-index: 0;
  }
  & > * {
    z-index: 2;
    position: relative;
  }
`;

const CardBase = css`
  position: relative;
  width: 100%;
  border-radius: 14px;

  /* 🔥 Зменшено паддінг */
  padding: 1rem;

  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-shadow: var(--shadow-sm);
  overflow: hidden;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
  cursor: pointer;
  box-sizing: border-box;

  &:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-lg);
    z-index: 10;
  }
`;

// --- BANK CARD ---
export const CreditCardContainer = styled.div<{
  $bg: string;
  $color: string;
  $border?: string;
  $isPrivat?: boolean;
}>`
  ${CardBase}

  /* 🔥 ЗМЕНШИЛИ ВИСОТУ: Було 220px, стало 180px */
  height: 180px;

  background: ${(props) => props.$bg};
  color: ${(props) => props.$color};
  border: ${(props) => props.$border || "none"};
  ${(props) => props.$isPrivat && PrivatNoiseEffect}
`;

// --- CASH / SAVINGS CARD ---
export const CashCardStyled = styled.div<{ $color: string }>`
  ${CardBase}
  /* 🔥 Зменшено зі 150 до 130 */
  height: 130px;
  background-color: var(--color-bg-surface);
  color: var(--color-text-main);
  border: 1px solid var(--color-border);
  border-left: 6px solid ${(props) => props.$color};
`;

// --- SHARED INNER ELEMENTS ---

export const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 30px;
`;

export const HeaderLeftGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

export const CashCardHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding-right: 10px;
`;

export const SyncBadge = styled.div<{ $variant: "card" | "cash" }>`
  display: flex;
  align-items: center;
  justify-content: center;

  ${(props) =>
    props.$variant === "card"
      ? css`
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(4px);
          color: inherit;
          & svg {
            width: 12px;
            height: 12px;
          }
        `
      : css`
          color: var(--color-brand-600);
          margin-left: 4px;
          & svg {
            width: 14px;
            height: 14px;
          }
        `}
`;

export const CashName = styled.div`
  font-weight: 700;
  font-size: 0.9rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--color-text-main);
`;

export const TypeBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.7rem;
  color: var(--color-text-secondary);
  font-weight: 500;

  svg {
    opacity: 0.7;
    width: 14px;
    height: 14px;
  }
`;

export const CardChip = styled.div`
  width: 32px;
  height: 20px;
  background: linear-gradient(135deg, #e2e2e2 0%, #a5a5a5 100%);
  border-radius: 4px;
  margin-top: 0.5rem;
  margin-bottom: 6px;
  position: relative;
  opacity: 0.9;
  flex-shrink: 0;

  &::before {
    content: "";
    position: absolute;
    top: 50%;
    left: 0;
    width: 100%;
    height: 1px;
    background: rgba(0, 0, 0, 0.2);
  }
  &::after {
    content: "";
    position: absolute;
    left: 50%;
    top: 0;
    height: 100%;
    width: 1px;
    background: rgba(0, 0, 0, 0.2);
  }
`;

export const CardNumber = styled.div`
  font-family: "Courier New", Courier, monospace;
  font-size: 0.9rem;
  letter-spacing: 2px;
  display: flex;
  align-items: center;
  opacity: 0.9;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  margin-bottom: 2px;
`;

export const CardName = styled.div`
  font-size: 0.65rem;
  opacity: 0.7;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-top: 4px;
`;

export const CardOwner = styled.div`
  font-size: 0.65rem;
  opacity: 0.6;
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 2px;
  & svg {
    width: 10px;
    height: 10px;
  }
`;

export const CardFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  position: relative;
  margin-top: auto;
`;

export const CardBalance = styled.div`
  font-size: 1.2rem;
  font-weight: 700;
  font-family: "JetBrains Mono", monospace;
  letter-spacing: -0.5px;
  max-width: 80%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  font-size: 1.1rem;
`;
