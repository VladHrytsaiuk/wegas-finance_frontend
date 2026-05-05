import styled, { css } from "styled-components";
import { Link } from "react-router-dom";

// --- LAYOUT ---
export const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: 100%;
  padding-bottom: 2rem;
`;

export const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(450px, 1fr));
  gap: 1.5rem;
  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

// --- GOAL CARD ---

const PausedStyles = css`
  background-color: var(--color-bg-surface-secondary);
  border-style: dashed;

  & .goal-icon {
    filter: grayscale(100%);
    opacity: 0.7;
  }
`;

// 🔥 NEW: Стилі для проваленої цілі (червоний акцент)
const FailedStyles = css`
  background-color: var(--color-red-50); /* Легкий червоний фон */
  border-color: var(--color-red-200);

  &:hover {
    border-color: var(--color-red-400);
    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.15); /* Червонувата тінь */
  }

  & .goal-icon {
    background-color: var(--color-red-100);
    color: var(--color-red-600);
  }
`;

export const GoalCard = styled.div<{
  $isPaused?: boolean;
  $status?: string;
}>`
  background-color: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: 16px;
  position: relative;
  display: flex;
  flex-direction: column;
  transition: all 0.2s ease;
  overflow: hidden;

  /* Спочатку перевіряємо чи провалено, потім чи пауза */
  ${(props) => props.$status === "failed" && FailedStyles}
  ${(props) => props.$isPaused && PausedStyles}

  &:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-md);
    /* Якщо не провалено, підсвічуємо брендовим, інакше червоним (вже задано в FailedStyles) */
    ${(props) =>
      props.$status !== "failed" && `border-color: var(--color-brand-300);`}
  }
`;

// --- ACTIONS ---
export const ActionsWrapper = styled.div`
  position: absolute;
  top: 1rem;
  right: 1rem;
  display: flex;
  gap: 6px;

  opacity: 0;
  transform: translateY(-5px);
  transition: all 0.2s ease;
  z-index: 20;

  ${GoalCard}:hover & {
    opacity: 1;
    transform: translateY(0);
  }
`;

export const ActionBtn = styled.button<{
  $variant?: "edit" | "delete" | "play";
}>`
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 1px solid var(--color-border);
  background-color: var(--color-bg-surface);
  color: var(--color-text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);

  ${(props) =>
    props.$variant === "play" &&
    `
    color: var(--color-green-600);
    background-color: var(--color-green-50);
    border-color: var(--color-green-200);
    &:hover { background-color: var(--color-green-100); transform: scale(1.05); }
  `}

  &:hover {
    ${(props) =>
      !props.$variant &&
      `background-color: var(--color-bg-hover); color: var(--color-text-main);`}
    ${(props) =>
      props.$variant === "delete" &&
      `background-color: var(--color-red-50); color: var(--color-red-600); border-color: var(--color-red-200);`}
  }
`;

// --- CONTENT LINK ---
export const CardLink = styled.div<{ $isPaused?: boolean }>`
  color: inherit;
  display: flex;
  flex-direction: column;
  flex: 1;
  padding: 1.5rem;
  cursor: pointer;

  opacity: ${(props) => (props.$isPaused ? 0.8 : 1)};
`;

// --- HEADER ---
export const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.2rem;
`;

export const TitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

export const IconWrapper = styled.div<{ $color: string }>`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background-color: ${(props) =>
    `color-mix(in srgb, ${props.$color}, transparent 85%)`};
  color: ${(props) => props.$color};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  flex-shrink: 0;
`;
export const Info = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;
export const Title = styled.h3`
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--color-text-main);
  margin: 0;
  line-height: 1.3;
`;
export const Subtitle = styled.div`
  font-size: 0.85rem;
  color: var(--color-text-secondary);
  display: flex;
  align-items: center;
  gap: 6px;
`;

// --- PROGRESS ---
export const ProgressSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 1.5rem;
  margin-top: 0.5rem;
`;
export const AmountsRow = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
`;

export const BigStatusText = styled.div<{
  $mode: "normal" | "paused" | "done" | "overdue";
}>`
  font-size: 1.8rem;
  font-weight: 800;
  font-family: "JetBrains Mono", monospace;
  line-height: 1;
  letter-spacing: -1px;

  ${(props) => props.$mode === "normal" && `color: var(--color-text-main);`}
  ${(props) =>
    props.$mode === "paused" &&
    `color: var(--color-yellow-600); font-size: 1.5rem; text-transform: uppercase;`}
  ${(props) =>
    props.$mode === "done" &&
    `color: var(--color-green-600); font-size: 1.6rem; text-transform: uppercase;`}
  
  /* 🔥 Більш агресивний червоний для overdue */
  ${(props) =>
    props.$mode === "overdue" &&
    `color: var(--color-red-600); font-size: 1.5rem; font-weight: 800; text-transform: uppercase;`}
`;

export const AmountLabel = styled.div`
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 600;
  color: var(--color-text-tertiary);
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`;

export const ExtendButton = styled.button`
  appearance: none;
  background-color: var(--color-bg-surface);
  border: 1px solid var(--color-orange-300);
  color: var(--color-orange-600);
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s ease;
  position: relative;
  z-index: 10;
  box-shadow: 0 2px 4px rgba(234, 88, 12, 0.1);

  &:hover {
    background-color: var(--color-orange-50);
    border-color: var(--color-orange-500);
    color: var(--color-orange-700);
    transform: translateY(-1px);
    box-shadow: 0 4px 6px rgba(234, 88, 12, 0.15);
  }
`;

export const ProgressBarBg = styled.div`
  width: 100%;
  height: 10px;
  background-color: var(--color-bg-surface-secondary);
  border: 1px solid var(--color-border);
  border-radius: 5px;
  overflow: hidden;
  position: relative;
`;
export const ProgressBarFill = styled.div<{ $width: number; $color: string }>`
  height: 100%;
  width: ${(props) => props.$width}%;
  background-color: ${(props) => props.$color};
  border-radius: 4px;
  transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
`;
export const ProgressMetaRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--color-text-secondary);
`;
export const CollectedAmount = styled.span`
  color: var(--color-text-secondary);
  display: flex;
  align-items: center;
  gap: 4px;
  strong {
    color: var(--color-text-main);
    font-weight: 600;
  }
  .divider {
    color: var(--color-text-tertiary);
    margin: 0 2px;
  }
`;

// --- SOURCES ---
export const SourcesSection = styled.div`
  margin-top: auto;
  padding-top: 1rem;
  border-top: 1px dashed var(--color-border);
  display: flex;
  flex-direction: column;
  gap: 8px;
`;
export const SourcesLabel = styled.div`
  font-size: 0.75rem;
  text-transform: uppercase;
  color: var(--color-text-tertiary);
  font-weight: 600;
  letter-spacing: 0.05em;
`;
export const SourcesList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;
export const SourceChip = styled(Link)`
  display: flex;
  align-items: center;
  gap: 6px;
  background-color: var(--color-bg-page);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 4px 10px;
  font-size: 0.8rem;
  color: var(--color-text-secondary);
  text-decoration: none;
  transition: all 0.2s;
  &:hover {
    background-color: var(--color-bg-hover);
    border-color: var(--color-brand-300);
    color: var(--color-text-main);
  }
  svg {
    opacity: 0.7;
  }
`;

// 🔥 NEW: Оновлений EmptyState (як у Debts)
export const EmptyState = styled.div`
  padding: 3rem 1.5rem;
  text-align: center;
  background: var(--color-bg-surface);
  border-radius: 16px;
  border: 1px dashed var(--color-border);

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1.2rem;
  min-width: 500px;
  max-width: 600px;
  margin: 0.2rem auto;

  /* Адаптивність для мобільних */
  @media (max-width: 600px) {
    min-width: 100%;
    width: 100%;
  }

  h3 {
    font-size: 1.1rem;
    font-weight: 700;
    color: var(--color-text-main);
    margin: 0;
  }

  p {
    font-size: 0.9rem;
    color: var(--color-text-secondary);
    line-height: 1.5;
    max-width: 320px;
    margin: 0;
  }
`;

export const EmptyIconWrapper = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background-color: var(--color-brand-50);
  color: var(--color-brand-500);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.5rem;

  svg {
    width: 32px;
    height: 32px;
  }
`;
